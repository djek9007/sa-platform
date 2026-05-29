import { NextRequest, NextResponse } from "next/server";
import { readFile, readdir } from "fs/promises";
import path from "path";

const COURSE_ROOT = path.join(process.cwd(), "..", "sa-course");

const MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  pdf: "application/pdf",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get("moduleId");
    const filename = searchParams.get("file");

    if (!moduleId || !filename) {
      return NextResponse.json(
        { error: "Missing moduleId or file parameter" },
        { status: 400 }
      );
    }

    // Security: prevent path traversal
    if (moduleId.includes("..") || filename.includes("..") || filename.includes("/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find the module directory by prefix
    let moduleDir: string | null = null;
    try {
      const entries = await readdir(COURSE_ROOT, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith(moduleId)) {
          moduleDir = path.join(COURSE_ROOT, entry.name);
          break;
        }
      }
    } catch {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (!moduleDir) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const filePath = path.join(moduleDir, filename);

    // Security: ensure file is within course root
    if (!filePath.startsWith(COURSE_ROOT)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let buffer;
    try {
      buffer = await readFile(filePath);
    } catch {
      return NextResponse.json(
        { error: `File not found: ${filename}` },
        { status: 404 }
      );
    }

    const ext = path.extname(filename).toLowerCase().replace(".", "");
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Media serve error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
