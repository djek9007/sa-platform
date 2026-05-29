import { prisma } from "@/lib/prisma";

export async function getProgress(userId: string) {
  const [lessons, submissions] = await Promise.all([
    prisma.lessonProgress.findMany({ where: { userId } }),
    prisma.assignmentSubmission.findMany({ where: { userId } }),
  ]);

  return {
    completedLessons: lessons.filter((l) => l.completed).map((l) => l.lessonId),
    completedModules: submissions.map((s) => s.moduleId),
    totalCompleted: lessons.filter((l) => l.completed).length,
    totalSubmissions: submissions.length,
  };
}

export async function markLessonComplete(userId: string, lessonId: string) {
  return prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { completed: true },
    create: { userId, lessonId, completed: true },
  });
}

export async function submitAssignment(
  userId: string,
  moduleId: string,
  content: string
) {
  return prisma.assignmentSubmission.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    update: { content },
    create: { userId, moduleId, content },
  });
}
