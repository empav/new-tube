import { VideoGetByIdOutput } from "@/trpc/routers/types";
import VideoOwner from "./video-owner";
import VideoReactions from "./video-reactions";
import VideoMenu from "./video-menu";
import VideoDescription from "./video-description";
import { useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";

const VideoTopRow = ({ video }: { video: VideoGetByIdOutput }) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", { notation: "compact" }).format(123345);
  }, []);
  const expandedViews = useMemo(() => {
    return Intl.NumberFormat("en", { notation: "standard" }).format(123345);
  }, []);
  const compactDate = useMemo(() => {
    return formatDistanceToNow(video.createdAt, { addSuffix: true });
  }, [video.createdAt]);
  const expandedDate = useMemo(() => {
    return format(video.createdAt, "dd MMM yyyy");
  }, [video.createdAt]);
  return (
    <div className="mt-2 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{video.title}</h1>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <VideoOwner user={video.user} videoId={video.id} />
        <div className="flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 sm:mb-0 gap-2">
          <VideoReactions />
          <VideoMenu videoId={video.id} variant="secondary" />
        </div>
      </div>
      <VideoDescription
        compactViews={compactViews}
        expandedViews={expandedViews}
        compactDate={compactDate}
        expandedDate={expandedDate}
        description={video.description}
      />
    </div>
  );
};

export default VideoTopRow;
