"use client";

import ResponsiveModal from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { StudioUploader } from "./StudioUploader";

const StudioUploadModal = () => {
  const utils = trpc.useUtils();

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

  const onSuccess = () => {
    toast.success("Video uploaded successfully");
  };

  const onError = (event: CustomEvent<unknown>) => {
    toast.error("Video upload failed");
    console.error(event);

    if (createVideo.data?.video[0].id) {
      deleteVideo.mutate({ id: createVideo.data?.video[0].id });
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
