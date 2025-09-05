import { VideoView } from "@/modules/studio/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";

type Props = {
  params: Promise<{
    videoId: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { videoId } = await params;
  void trpc.studio.getById.prefetch({ id: videoId });
  void trpc.categories.getAll.prefetch();
  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
}
