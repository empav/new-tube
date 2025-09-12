import { SuggestionGetAllOutput } from "@/trpc/routers/types";
import Link from "next/link";
import VideoThumbnail from "./video-thumbnail";
import VideoInfo from "./video-info";

interface VideoGridCardProps {
  data: SuggestionGetAllOutput["items"][number];
  onRemove?: () => void;
}

// const VideoGridCardSkeleton = () => <div>Skeleton</div>;

const VideoGridCard = ({ data, onRemove }: VideoGridCardProps) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <Link href={`/videos/${data.id}`}>
        <VideoThumbnail
          thumbnailUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration ?? 0}
        />
      </Link>
      <VideoInfo data={data} onRemove={onRemove} />
    </div>
  );
};
export default VideoGridCard;
