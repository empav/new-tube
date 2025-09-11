import { VideoView } from "@/modules/videos/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";

type Props = {
  params: Promise<{
    videoId: string;
  }>;
};

const Page = async ({ params }: Props) => {
  const { videoId } = await params;

  void trpc.videos.getById.prefetch({ id: videoId });
  void trpc.comments.getAll.prefetch({ videoId });

  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default Page;
