"use client";

interface VideoPlayerProps {
  src: string;
  title: string;
}

export default function VideoPlayer({ src, title }: VideoPlayerProps) {
  return (
    <div className="rounded-xl overflow-hidden bg-black shadow-lg">
      <video
        controls
        className="w-full aspect-video"
        title={title}
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        Ваш браузер не поддерживает видео.
      </video>
      <div className="px-4 py-2 bg-gray-900 text-gray-300 text-sm">
        🎬 {title}
      </div>
    </div>
  );
}
