import MuxUploader from "@mux/mux-uploader-react";

interface StudioUploaderProps {
  endpoint?: string | null;
  onSuccess: () => void;
  onError: (event: CustomEvent<unknown>) => void;
}

export const StudioUploader = ({
  endpoint,
  onSuccess,
  onError,
}: StudioUploaderProps) => {
  return (
    <div>
      <MuxUploader
        endpoint={endpoint}
        onSuccess={onSuccess}
        onUploadError={onError}
      />
    </div>
  );
};
