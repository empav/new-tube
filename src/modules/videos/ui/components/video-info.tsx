import UserAvatar from "@/components/user-avatar";
import UserInfo from "@/modules/users/ui/components/UserInfo";
import { SuggestionGetAllOutput } from "@/trpc/routers/types";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";
import VideoMenu from "./video-menu";

interface VideoInfoProps {
  data: SuggestionGetAllOutput["items"][number];
  onRemove?: () => void;
}

// const VideoInfoSkeleton = () => <div>Skeleton</div>;

const VideoInfo = ({ data, onRemove }: VideoInfoProps) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", { notation: "compact" }).format(
      data.viewCount,
    );
  }, [data.viewCount]);
  const compactDate = useMemo(() => {
    return formatDistanceToNow(new Date(data.createdAt), { addSuffix: true });
  }, [data.createdAt]);

  return (
    <div className="flex gap-3">
      <Link href={`/users/${data.user.id}`} className="flex-shrink-0">
        <UserAvatar imageUrl={data.user.image_url} name={data.user.name} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/videos/${data.id}`} className="font-medium line-clamp-2">
          <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-base break-words">
            {data.title}
          </h3>
        </Link>
        <Link href={`/users/${data.user.id}`}>
          <UserInfo name={data.user.name} />
        </Link>
        <Link href={`/videos/${data.id}`}>
          <p className="text-sm text-gray-600 line-clamp-1">
            {compactViews} views | {compactDate}
          </p>
        </Link>
      </div>
      <div className="shrink-0">
        <VideoMenu videoId={data.id} onRemove={onRemove} />
      </div>
    </div>
  );
};
export default VideoInfo;
