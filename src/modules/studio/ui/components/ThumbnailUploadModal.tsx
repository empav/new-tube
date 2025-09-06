"use client";

import ResponsiveModal from "@/components/responsive-modal";
import { trpc } from "@/trpc/client";
import { UploadDropzone } from "@/utils/uploadthing";

type ThumbnailUploadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
};

export const ThumbnailUploadModal = ({
  open,
  onOpenChange,
  videoId,
}: ThumbnailUploadModalProps) => {
  const utils = trpc.useUtils();

  const onUploadComplete = async () => {
    // Invalidate the video query to refetch the updated video data
    utils.studio.getAll.invalidate();
    utils.studio.getById.invalidate({ id: videoId });
    onOpenChange(false);
  };

  return (
    <ResponsiveModal
      title="Upload Thumbnail"
      open={open}
      onOpenChange={onOpenChange}
    >
      <UploadDropzone
        appearance={{
          button:
            "ut-ready:bg-blue-500 ut-uploading:cursor-not-allowed rounded-r-none bg-red-500 bg-none after:bg-orange-400",
          container: "border-none",
          allowedContent:
            "flex h-8 flex-col items-center justify-center px-2 text-white",
        }}
        endpoint="thumbnailUploader"
        input={{ videoId }}
        onClientUploadComplete={onUploadComplete}
      />
    </ResponsiveModal>
  );
};
