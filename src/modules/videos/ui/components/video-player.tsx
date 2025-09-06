"use client";

import { THUMBNAIL_FALLBACK } from "@/constants";
import MuxPlayer from "@mux/mux-player-react";

type VideoPlayerProps = {
  playbackId?: string | null;
  thumbnail?: string | null;
  autoPlay?: boolean;
  onPlay?: () => void;
};

const VideoPlayer = ({
  playbackId,
  thumbnail,
  autoPlay,
  onPlay,
}: VideoPlayerProps) => {
  return (
    <MuxPlayer
      playbackId={playbackId ?? ""}
      poster={thumbnail ?? THUMBNAIL_FALLBACK}
      playerInitTime={0}
      autoPlay={autoPlay}
      thumbnailTime={0}
      className="aspect-video h-full w-full object-contain"
      accentColor="#FF2056"
      onPlay={onPlay}
    />
  );
};
export default VideoPlayer;
