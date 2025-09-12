import CategoriesSection from "../sections/CategorySection";
import VideoSection from "../sections/VideoSection";

export const HomeView = ({ categoryId }: { categoryId?: string }) => {
  return (
    <div className="mx-auto mb-10 flex max-w-[2400px] flex-col gap-y-6 px-4 pt-2.5">
      <CategoriesSection categoryId={categoryId} />
      <VideoSection categoryId={categoryId} />
    </div>
  );
};
