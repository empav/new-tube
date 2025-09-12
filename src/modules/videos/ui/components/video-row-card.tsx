import { SuggestionGetAllOutput } from "@/trpc/routers/types";
import { cva, VariantProps } from "class-variance-authority";
import Link from "next/link";
import VideoThumbnail from "./video-thumbnail";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/user-avatar";
import UserInfo from "@/modules/users/ui/components/UserInfo";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import VideoMenu from "./video-menu";
import { useMemo } from "react";

const videoRowCardVariants = cva("group flex min-w-0", {
  variants: {
    size: {
      default: "gap-4",
      compact: "gap-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const thumbnailVariants = cva("relative flex-none", {
  variants: {
    size: {
      default: "w-[38%]",
      compact: "w-[168px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface VideoRowCardProps extends VariantProps<typeof videoRowCardVariants> {
  data: SuggestionGetAllOutput["items"][number];
  onRemove?: () => void;
}

// const VideoRowCardSkeleton = () => <div>Skeleton</div>;

const VideoRowCard = ({ data, size, onRemove }: VideoRowCardProps) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", { notation: "compact" }).format(
      data.viewCount,
    );
  }, [data.viewCount]);
  const compactLikes = useMemo(() => {
    return Intl.NumberFormat("en", { notation: "compact" }).format(
      data.likeCount,
    );
  }, [data.likeCount]);
  return (
    <div className={videoRowCardVariants({ size })}>
      <Link href={`/videos/${data.id}`} className={thumbnailVariants({ size })}>
        <VideoThumbnail
          thumbnailUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration ?? 0}
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-x-2">
          <Link href={`/videos/${data.id}`} className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-medium line-clamp-2",
                size === "compact" ? "text-sm" : "text-base",
              )}
            >
              {data.title}
            </h3>
            {size === "default" ? (
              <>
                <p className="mt-1 text-xs text-muted-foreground">
                  {compactViews} views | {compactLikes} likes
                </p>
                <div className="flex items-center gap-2 my-3">
                  <UserAvatar
                    size={"sm"}
                    imageUrl={data.user.image_url}
                    name={data.user.name}
                  />
                  <UserInfo name={data.user.name} size={"sm"} />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground w-fit line-clamp-2">
                      {data.description ?? "No description."}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="center"
                    className="bg-black/70"
                  >
                    <p>From video description</p>
                  </TooltipContent>
                </Tooltip>
              </>
            ) : null}
            {size === "compact" ? (
              <>
                <UserInfo name={data.user.name} size={"sm"} />
                <p className="mt-1 text-xs text-muted-foreground">
                  {compactViews} views | {compactLikes} likes
                </p>
              </>
            ) : null}
          </Link>
          <div className="flex-none">
            <VideoMenu videoId={data.id} onRemove={onRemove} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default VideoRowCard;
