import FormSection from "../sections/FormSection";

export const VideoView = ({ videoId }: { videoId: string }) => {
  return (
    <div className="max-w-screen-lg px-4 pt-2.5">
      <FormSection videoId={videoId} />
    </div>
  );
};
