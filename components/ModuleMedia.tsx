import VideoPlayer from "./VideoPlayer";
import PdfViewer from "./PdfViewer";
import ImageViewer from "./ImageViewer";

interface MediaItem {
  type: "video" | "pdf" | "image";
  src: string;
  title: string;
  moduleId: string;
}

interface ModuleMediaProps {
  media: MediaItem[];
  moduleId: string;
}

const mediaLabels: Record<string, { icon: string; title: string }> = {
  image: { icon: "🖼️", title: "Схема и инфографика" },
  video: { icon: "🎬", title: "Видео-лекция" },
  pdf: { icon: "📄", title: "Дополнительные материалы (PDF)" },
};

function groupMedia(media: MediaItem[]) {
  const groups: Record<string, MediaItem[]> = {};
  for (const item of media) {
    if (!groups[item.type]) groups[item.type] = [];
    groups[item.type].push(item);
  }
  return groups;
}

export default function ModuleMedia({ media, moduleId }: ModuleMediaProps) {
  if (!media || media.length === 0) return null;

  const groups = groupMedia(media);

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        📚 Материалы модуля
      </h2>

      <div className="space-y-8">
        {Object.entries(groups).map(([type, items]) => {
          const label = mediaLabels[type] || { icon: "📎", title: type };
          return (
            <div key={type}>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {label.icon} {label.title}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {items.map((item, i) => {
                  const key = `${type}-${i}`;
                  switch (type) {
                    case "video":
                      return <VideoPlayer key={key} src={item.src} title={item.title} />;
                    case "pdf":
                      return <PdfViewer key={key} src={item.src} title={item.title} />;
                    case "image":
                      return <ImageViewer key={key} src={item.src} alt={item.title} />;
                    default:
                      return null;
                  }
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
