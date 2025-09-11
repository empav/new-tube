import CommentSection from "../sections/CommentSection";
import SuggestionSection from "../sections/SuggestionSection";
import VideoSection from "../sections/VideoSection";

export const VideoView = ({ videoId }: { videoId: string }) => {
  return (
    <div className="flex flex-col mx-auto max-w-[1700px] mb-10 px-4 pt-2.5">
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <VideoSection videoId={videoId} />
          <div className="xl:hidden block mt-4">
            <SuggestionSection />
          </div>
          <CommentSection videoId={videoId} />
        </div>
        <div className="hidden xl:block w-full xl:w-[380px] 2xl:w-[460px] shrink-1">
          <SuggestionSection />
        </div>
      </div>
    </div>
  );
};
