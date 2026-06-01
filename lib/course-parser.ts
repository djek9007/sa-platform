/**
 * Course content parser for the SA learning platform.
 *
 * Scans the sa-course/ directory (sibling to sa-platform/) and returns
 * structured CourseData from the markdown course content.
 *
 * All functions are async and error-safe — missing files return null
 * rather than throwing.
 *
 * @module course-parser
 */

import { readdir, readFile } from 'fs/promises';
import path from 'path';
import type { CourseData, Module, Lesson, Assignment, MediaItem } from './types';

// ─── Constants ───────────────────────────────────────────────────────────────

// ─── Course Root Resolution ─────────────────────────────────────────────────

/**
 * Resolves the path to the sa-course/ directory.
 *
 * Priority:
 *   1. COURSE_PATH env var (explicit override)
 *   2. ../sa-course  (dev: cwd = project root)
 *   3. ../../sa-course  (standalone: cwd = .next/standalone)
 *   4. ./sa-course  (docker: cwd = /app, course bundled beside)
 *
 * Returns the first existing directory; falls back to option 2 as default.
 */
async function resolveCourseRoot(): Promise<string> {
  if (process.env.COURSE_PATH) {
    return path.resolve(process.env.COURSE_PATH);
  }

  const candidates = [
    path.resolve(process.cwd(), '..', 'sa-course'),           // dev: cwd = project root
    path.resolve(process.cwd(), '..', '..', 'sa-course'),      // docker: cwd = /app
    path.resolve(process.cwd(), 'sa-course'),                  // docker: cwd = /app, course at /app/sa-course
    path.resolve(process.cwd(), '..', '..', '..', 'sa-course'), // standalone: cwd = .next/standalone
  ];

  for (const candidate of candidates) {
    try {
      const stat = await import('fs/promises').then(m => m.stat(candidate));
      if (stat.isDirectory()) return candidate;
    } catch {
      // not found — try next
    }
  }

  return candidates[0];
}

let courseRootPromise: Promise<string> | null = null;

/** Lazily resolves COURSE_ROOT (once) and caches the result. */
function getCourseRoot(): Promise<string> {
  if (!courseRootPromise) {
    courseRootPromise = resolveCourseRoot();
  }
  return courseRootPromise;
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** Matches module directory names: "01-introduction-to-sa" → groups: ["01", "introduction-to-sa"] */
const MODULE_DIR_PATTERN = /^(\d{2})-(.+)$/;

/** Matches lesson filenames: "01-01-what-is-system-analysis.md" → groups: ["01", "01", "what-is-system-analysis"] */
const LESSON_FILE_PATTERN = /^(\d{2})-(\d{2})-(.+)\.md$/;

/** Matches the first level-1 heading in markdown */
const H1_HEADING_PATTERN = /^#\s+(.+)$/m;

/** Strips the "Урок X.Y: " prefix from a lesson heading to get the clean title */
const LESSON_HEADING_PREFIX_PATTERN = /^Урок \d+\.\d+:\s*(.+)$/;

/** Extracts module titles from the syllabus: "### Модуль 01: Введение в системный анализ" */
const SYLLABUS_MODULE_PATTERN = /### Модуль (\d{2}):\s*(.+)/g;

// ─── Syllabus Parsing ────────────────────────────────────────────────────────

/**
 * Reads syllabus.md and builds a map of module ID → Russian title.
 *
 * Example syllabus line:
 *   ### Модуль 01: Введение в системный анализ
 *   → map.set("01", "Введение в системный анализ")
 *
 * Returns an empty map if the syllabus is missing or unreadable.
 */
async function buildModuleTitleMap(): Promise<Map<string, string>> {
  const titles = new Map<string, string>();
  try {
    const courseRoot = await getCourseRoot();
    const syllabusPath = path.join(courseRoot, 'syllabus.md');
    const content = await readFile(syllabusPath, 'utf-8');

    let match: RegExpExecArray | null;
    const regex = new RegExp(SYLLABUS_MODULE_PATTERN.source, 'g');
    while ((match = regex.exec(content)) !== null) {
      titles.set(match[1], match[2].trim());
    }
  } catch {
    // Syllabus unavailable — fall back to README-based titles
  }
  return titles;
}

// ─── Directory Introspection ─────────────────────────────────────────────────

/**
 * Lists all module directories in the course root, sorted by order.
 *
 * A module directory matches the pattern "01-introduction-to-sa".
 * Skips non-matching directories (e.g., "template", hidden folders).
 */
async function scanModuleDirectories(): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(await getCourseRoot(), { withFileTypes: true });
  } catch {
    return [];
  }

  return entries
    .filter(e => e.isDirectory() && MODULE_DIR_PATTERN.test(e.name))
    .map(e => e.name)
    .sort();
}

/**
 * Extracts { id, slug, order } from a module directory name.
 *
 * "01-introduction-to-sa" → { id: "01", slug: "introduction-to-sa", order: 1 }
 */
function parseModuleDirname(dirname: string): { id: string; slug: string; order: number } | null {
  const match = dirname.match(MODULE_DIR_PATTERN);
  if (!match) return null;
  return {
    id: match[1],
    slug: match[2],
    order: parseInt(match[1], 10),
  };
}

// ─── Lesson Parsing ──────────────────────────────────────────────────────────

/**
 * Extracts { order, slug } from a lesson filename.
 *
 * "01-01-what-is-system-analysis.md" → { order: 1, slug: "what-is-system-analysis" }
 */
function parseLessonFilename(filename: string): { order: number; slug: string } | null {
  const match = filename.match(LESSON_FILE_PATTERN);
  if (!match) return null;
  return {
    order: parseInt(match[2], 10),
    slug: match[3],
  };
}

/**
 * Extracts the clean lesson title from the first `# ` heading.
 *
 * "Урок 01.01: Что такое системный анализ" → "Что такое системный анализ"
 * Falls back to the raw heading text if the prefix pattern doesn't match.
 */
function extractLessonTitle(content: string): string {
  const headingMatch = content.match(H1_HEADING_PATTERN);
  if (!headingMatch) return 'Untitled';
  const rawTitle = headingMatch[1].trim();
  const cleanMatch = rawTitle.match(LESSON_HEADING_PREFIX_PATTERN);
  return cleanMatch ? cleanMatch[1].trim() : rawTitle;
}

/**
 * Reads and parses a single lesson markdown file.
 * Returns null if the file is missing, unreadable, or doesn't match the
 * expected filename pattern.
 */
async function readLessonFile(filePath: string, moduleId: string): Promise<Lesson | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const filename = path.basename(filePath);
    const meta = parseLessonFilename(filename);
    if (!meta) return null;

    return {
      slug: meta.slug,
      title: extractLessonTitle(content),
      order: meta.order,
      content,
      moduleId,
    };
  } catch {
    return null;
  }
}

// ─── Assignment Parsing ──────────────────────────────────────────────────────

/**
 * Extracts the assignment title from the first `# ` heading.
 *
 * "# Задание к модулю 01: Введение в системный анализ" → "Задание к модулю 01: Введение в системный анализ"
 */
function extractAssignmentTitle(content: string): string {
  const headingMatch = content.match(H1_HEADING_PATTERN);
  return headingMatch ? headingMatch[1].trim() : 'Задание';
}

/**
 * Reads and parses assignment.md for a given module.
 * Returns null if the file doesn't exist or can't be read.
 */
async function readAssignmentFile(filePath: string, moduleId: string): Promise<Assignment | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return {
      slug: 'assignment',
      title: extractAssignmentTitle(content),
      content,
      moduleId,
    };
  } catch {
    return null;
  }
}

// ─── Module Description ──────────────────────────────────────────────────────

/**
 * Extracts the first paragraph of text after the first `# ` heading in a README.
 *
 * Handles:
 *   # Модуль 01: Введение в системный анализ
 *
 *   **Статус:** 🟡 В работе
 *
 *   ## Содержание модуля
 *   ...
 *
 * Returns the paragraph "**Статус:** 🟡 В работе" (stripped of markdown formatting
 * is preserved as-is — the caller may render it).
 */
function extractModuleDescription(content: string): string {
  const lines = content.split('\n');
  let foundHeading = false;
  const paragraphParts: string[] = [];

  for (const line of lines) {
    if (!foundHeading) {
      if (line.startsWith('# ')) {
        foundHeading = true;
      }
      continue;
    }

    // Stop at any subsequent heading
    if (line.startsWith('#')) {
      break;
    }

    const trimmed = line.trim();
    if (trimmed === '') {
      // Empty line — end of the first paragraph (if we have content)
      if (paragraphParts.length > 0) break;
      continue;
    }

    paragraphParts.push(trimmed);
  }

  return paragraphParts.join(' ');
}

/**
 * Generates a human-readable title from a module slug when the syllabus
 * and README headings are unavailable.
 *
 * "introduction-to-sa" → "Introduction To Sa"
 * (best-effort fallback — not expected to be used in normal operation)
 */
function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ─── Module Title from README ────────────────────────────────────────────────

/**
 * Attempts to extract the module title from the README.md `# ` heading.
 *
 * "# Модуль 01: Введение в системный анализ" → "Введение в системный анализ"
 * Falls back to slugToTitle() if the heading can't be parsed.
 */
function extractModuleTitleFromReadme(content: string, slug: string): string {
  const headingMatch = content.match(H1_HEADING_PATTERN);
  if (!headingMatch) return slugToTitle(slug);

  const rawTitle = headingMatch[1].trim();
  // Strip "Модуль NN: " prefix if present
  const modulePrefixMatch = rawTitle.match(/^Модуль \d{2}:\s*(.+)$/);
  return modulePrefixMatch ? modulePrefixMatch[1].trim() : rawTitle;
}

// ─── Media Parsing ───────────────────────────────────────────────────────────

const MEDIA_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".mp4", ".webm", ".pdf"]);

const MEDIA_TYPE_MAP: Record<string, "video" | "pdf" | "image"> = {
  mp4: "video",
  webm: "video",
  pdf: "pdf",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  svg: "image",
  webp: "image",
};

/**
 * Maps a filename to a human-readable title by removing the extension
 * and replacing underscores/special chars.
 * "Основы_системного_анализа.png" → "Основы системного анализа"
 */
function mediaFilenameToTitle(filename: string): string {
  const withoutExt = filename.replace(/\.[^.]+$/, "");
  return withoutExt
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Scans a module directory for media files (images, videos, PDFs).
 */
function scanMediaFiles(files: string[], moduleDir: string, moduleId: string): MediaItem[] {
  const media: MediaItem[] = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!MEDIA_EXTENSIONS.has(ext)) continue;

    const type = MEDIA_TYPE_MAP[ext.replace(".", "")];
    if (!type) continue;

    media.push({
      type,
      src: `/api/media?moduleId=${moduleId}&file=${encodeURIComponent(file)}`,
      title: mediaFilenameToTitle(file),
      moduleId,
      filename: file,
    });
  }

  // Sort: images first, then videos, then PDFs
  const sortOrder = { image: 0, video: 1, pdf: 2 };
  media.sort((a, b) => (sortOrder[a.type] ?? 9) - (sortOrder[b.type] ?? 9));

  return media;
}

// ─── Module Parsing ──────────────────────────────────────────────────────────

/**
 * Parses a single module directory into a Module object.
 *
 * Reads:
 *   - All lesson files (XX-YY-<slug>.md)
 *   - assignment.md (if present)
 *   - README.md (for description)
 *
 * Returns null if the directory name doesn't match the expected pattern.
 */
async function parseModule(
  dirPath: string,
  dirName: string,
  titleMap: Map<string, string>,
): Promise<Module | null> {
  const meta = parseModuleDirname(dirName);
  if (!meta) return null;

  let files: string[];
  try {
    files = await readdir(dirPath);
  } catch {
    return null;
  }

  // Resolve the module title from (in order of precedence):
  //   1. Syllabus map
  //   2. README.md heading
  //   3. Auto-generated from slug
  let moduleTitle: string;
  let description = '';

  const readmePath = path.join(dirPath, 'README.md');

  if (titleMap.has(meta.id)) {
    moduleTitle = titleMap.get(meta.id)!;
    // Still read README for description
    try {
      const readmeContent = await readFile(readmePath, 'utf-8');
      description = extractModuleDescription(readmeContent);
    } catch {
      description = moduleTitle;
    }
  } else {
    // Try README as fallback for both title and description
    try {
      const readmeContent = await readFile(readmePath, 'utf-8');
      moduleTitle = extractModuleTitleFromReadme(readmeContent, meta.slug);
      description = extractModuleDescription(readmeContent);
    } catch {
      moduleTitle = slugToTitle(meta.slug);
      description = moduleTitle;
    }
  }

  // Parse lessons
  const lessonFiles = files
    .filter(f => LESSON_FILE_PATTERN.test(f))
    .sort();

  const lessons: Lesson[] = [];
  for (const file of lessonFiles) {
    const lesson = await readLessonFile(path.join(dirPath, file), meta.id);
    if (lesson) {
      lessons.push(lesson);
    }
  }

  // Parse assignment
  let assignment: Assignment | null = null;
  if (files.includes('assignment.md')) {
    assignment = await readAssignmentFile(path.join(dirPath, 'assignment.md'), meta.id);
  }

  // Scan media files
  const media = scanMediaFiles(files, dirPath, meta.id);

  return {
    id: meta.id,
    slug: meta.slug,
    title: moduleTitle,
    description,
    order: meta.order,
    lessons,
    assignment,
    lessonCount: lessons.length,
    media,
  };
}

// ─── Module Title from Syllabus (lean helper) ────────────────────────────────

/**
 * Returns just the module title from the syllabus map — a lighter alternative
 * to building the full Module object when only metadata is needed.
 */
async function getModuleTitleFromSyllabus(moduleId: string): Promise<string | null> {
  const titleMap = await buildModuleTitleMap();
  return titleMap.get(moduleId) ?? null;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Scans the entire sa-course/ directory and returns structured CourseData
 * containing all modules, their lessons, and assignments.
 *
 * @returns A promise resolving to the complete CourseData object.
 */
export async function getCourseData(): Promise<CourseData> {
  const [titleMap, moduleDirs] = await Promise.all([
    buildModuleTitleMap(),
    scanModuleDirectories(),
  ]);

  const courseRoot = await getCourseRoot();
  const modules: Module[] = [];
  for (const dirName of moduleDirs) {
    const dirPath = path.join(courseRoot, dirName);
    const mod = await parseModule(dirPath, dirName, titleMap);
    if (mod) {
      modules.push(mod);
    }
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return {
    modules,
    totalLessons,
    totalModules: modules.length,
  };
}

/**
 * Retrieves a single module by its numeric ID.
 *
 * @param moduleId - Two-digit module ID (e.g., "01", "02", …, "09").
 * @returns The Module object, or null if not found or an error occurs.
 */
export async function getModule(moduleId: string): Promise<Module | null> {
  if (!/^\d{2}$/.test(moduleId)) return null;

  const [titleMap, moduleDirs] = await Promise.all([
    buildModuleTitleMap(),
    scanModuleDirectories(),
  ]);

  const dirName = moduleDirs.find(d => d.startsWith(moduleId));
  if (!dirName) return null;

  const courseRoot = await getCourseRoot();
  const dirPath = path.join(courseRoot, dirName);
  return parseModule(dirPath, dirName, titleMap);
}

/**
 * Retrieves a specific lesson within a module by the lesson slug.
 *
 * @param moduleId   - Two-digit module ID (e.g., "01").
 * @param lessonSlug - The slug portion of the lesson filename (e.g., "what-is-system-analysis").
 * @returns The Lesson object, or null if not found.
 */
export async function getLesson(moduleId: string, lessonSlug: string): Promise<Lesson | null> {
  const mod = await getModule(moduleId);
  if (!mod) return null;
  return mod.lessons.find(l => l.slug === lessonSlug) ?? null;
}

/**
 * Retrieves the assignment for a given module.
 *
 * @param moduleId - Two-digit module ID (e.g., "01").
 * @returns The Assignment object, or null if the module has no assignment or doesn't exist.
 */
export async function getAssignment(moduleId: string): Promise<Assignment | null> {
  const mod = await getModule(moduleId);
  if (!mod) return null;
  return mod.assignment;
}
