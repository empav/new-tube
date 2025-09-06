import { THUMBNAIL_FALLBACK } from "@/constants";
import { formatDuration } from "@/lib/utils";
import Image from "next/image";

type Props = {
  thumbnailUrl?: string | null;
  previewUrl?: string | null;
  title: string;
  duration: number;
};

const VideoThumbnail = ({
  thumbnailUrl,
  previewUrl,
  title,
  duration,
}: Props) => {
  return (
    <div className="group relative">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
        <Image
          src={thumbnailUrl ?? THUMBNAIL_FALLBACK}
          alt={title}
          fill
          className="h-full w-full object-cover group-hover:opacity-0"
        />
        <Image
          unoptimized={!!previewUrl}
          src={previewUrl ?? THUMBNAIL_FALLBACK}
          alt={title}
          fill
          className="h-full w-full object-cover opacity-0 group-hover:opacity-100"
        />
      </div>
      <div className="absolute bottom-2 left-2 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
        {formatDuration(duration)}
      </div>
    </div>
  );
};

export default VideoThumbnail;
