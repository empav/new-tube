import TrendingSection from "../sections/TrendingSection";

export const TrendingView = () => {
  return (
    <div className="mx-auto mb-10 flex max-w-[2400px] flex-col gap-y-6 px-4 pt-2.5">
      <div>
        <h1 className="text-2xl font-bold">
          <p className="text-xs text-muted-foreground">
            Most popular videos at the moment
          </p>
        </h1>
      </div>
      <TrendingSection />
    </div>
  );
};
