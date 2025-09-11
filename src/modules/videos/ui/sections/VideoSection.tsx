"use client";
import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import VideoPlayer from "../components/video-player";
import VideoBanner from "../components/video-banner";
import VideoTopRow from "../components/video-top-row";
import { useAuth } from "@clerk/nextjs";

interface VideoSectionProps {
  videoId: string;
}

const VideoSectionSkeleton = () => (
  <div className="animate-pulse bg-gray-200 h-60 rounded-md">
    <div className="h-60 bg-gray-300 rounded-md" />
    <div className="mt-4 h-6 bg-gray-300 rounded w-3/4" />
    <div className="mt-2 h-4 bg-gray-300 rounded w-1/2" />
    <div className="mt-2 h-4 bg-gray-300 rounded w-1/3" />
  </div>
);

const VideoSectionSuspense = ({ videoId }: VideoSectionProps) => {
  const { isSignedIn } = useAuth();
  const [video] = trpc.videos.getById.useSuspenseQuery({ id: videoId });
  const utils = trpc.useUtils();

  const createView = trpc.videoViews.create.useMutation({
    onSuccess: () => {
      utils.videos.getById.invalidate({ id: videoId });
    },
  });

  const onPlay = () => {
    if (!isSignedIn) return;
    createView.mutate({ videoId });
  };

  return (
    <>
      <div
        className={cn(
          "relative aspect-video overflow-hidden rounded-xl bg-black",
          video.muxStatus !== "ready" && "rounded-b-none",
        )}
      >
        <VideoPlayer
          autoPlay
          onPlay={onPlay}
          playbackId={video.muxPlaybackId}
          thumbnail={video.thumbnailUrl}
        />
      </div>
      <VideoBanner status={video.muxStatus} />
      <VideoTopRow video={video} />
    </>
  );
};

const VideoSection = ({ videoId }: VideoSectionProps) => {
  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Failed to load Video.</div>}>
        <VideoSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default VideoSection;
