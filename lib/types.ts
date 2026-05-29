/** Types for the SA Course Platform */

export interface Lesson {
  slug: string;
  title: string;
  order: number;
  content: string;
  moduleId: string;
}

export interface Assignment {
  slug: string;
  title: string;
  content: string;
  moduleId: string;
  maxScore?: number;
}

export interface MediaItem {
  type: "video" | "pdf" | "image";
  src: string;
  title: string;
  moduleId: string;
  filename: string;
}

export interface Module {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  assignment: Assignment | null;
  lessonCount: number;
  media: MediaItem[];
}

export interface CourseData {
  modules: Module[];
  totalLessons: number;
  totalModules: number;
}

export interface UserProgress {
  completedLessons: string[]; // lesson slugs
  completedModules: string[]; // module slugs
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
