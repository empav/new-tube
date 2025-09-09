import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { VideoGetByIdOutput } from "@/trpc/routers/types";
import { useClerk } from "@clerk/nextjs";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";

const VideoReactions = ({ video }: { video: VideoGetByIdOutput }) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();
  const likeDislike = trpc.videoReactions.likeDislike.useMutation({
    onSuccess: () => {
      utils.videos.getById.invalidate({ id: video.id });
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });
  return (
    <div className="flex items-center flex-none">
      <Button
        className="rounded-l-full rounded-r-none gap-2 pr-4"
        variant={"secondary"}
        onClick={() => likeDislike.mutate({ videoId: video.id, type: "like" })}
        disabled={likeDislike.isPending}
      >
        <ThumbsUpIcon
          className={cn("size-5", video.reactions === "like" && "fill-black")}
        />
        {video.likes}
      </Button>
      <Separator orientation="vertical" className="h-7" />
      <Button
        className="rounded-l-none rounded-r-full pl-3"
        variant={"secondary"}
        onClick={() =>
          likeDislike.mutate({ videoId: video.id, type: "dislike" })
        }
        disabled={likeDislike.isPending}
      >
        <ThumbsDownIcon
          className={cn(
            "size-5",
            video.reactions === "dislike" && "fill-black",
          )}
        />
        {video.dislikes}
      </Button>
    </div>
  );
};

export default VideoReactions;
