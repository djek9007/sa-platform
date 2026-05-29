import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProgress, markLessonComplete } from "@/lib/progress-service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const progress = await getProgress(session.user.id);
  return NextResponse.json(progress);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { lessonId } = await request.json();
  if (!lessonId) {
    return NextResponse.json(
      { error: "lessonId обязателен" },
      { status: 400 }
    );
  }

  await markLessonComplete(session.user.id, lessonId);
  return NextResponse.json({ success: true });
}
