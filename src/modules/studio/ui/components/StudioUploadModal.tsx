"use client";

import ResponsiveModal from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { StudioUploader } from "./StudioUploader";
import { useRouter } from "next/navigation";

const StudioUploadModal = () => {
  const utils = trpc.useUtils();
  const router = useRouter();

  const createVideo = trpc.videos.create.useMutation({
    onSuccess: () => {
      utils.studio.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const deleteVideo = trpc.videos.delete.useMutation({
    onSuccess: () => {
      utils.studio.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createdVideoId = createVideo.data?.video.id;

  const onSuccess = () => {
    toast.success("Video uploaded successfully");
    createVideo.reset();

    if (createdVideoId) {
      router.push(`/studio/videos/${createdVideoId}`);
    }
  };

  const onError = (event: CustomEvent<unknown>) => {
    toast.error("Video upload failed");
    console.error(event);

    if (createdVideoId) {
      deleteVideo.mutate({ id: createdVideoId });
    }
  };

  return (
    <>
      {createVideo.data?.uploadUrl ? (
        <ResponsiveModal
          title="Upload a video"
          open={!!createVideo.data?.uploadUrl}
          onOpenChange={() => createVideo.reset()}
        >
          <StudioUploader
            endpoint={createVideo.data?.uploadUrl}
            onSuccess={onSuccess}
            onError={onError}
          />
        </ResponsiveModal>
      ) : null}
      <Button
        variant="secondary"
        onClick={() => createVideo.mutate()}
        disabled={createVideo.isPending}
      >
        {createVideo.isPending ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <PlusIcon />
        )}
        Create
      </Button>
    </>
  );
};

export default StudioUploadModal;
