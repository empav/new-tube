"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import VideoGridCard from "@/modules/videos/ui/components/video-grid-card";
import VideoRowCard from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const ResultsSkeleton = () => <div>Loading...</div>;

const ResultsSectionSuspense = ({
  query,
  categoryId,
}: {
  query: string | undefined;
  categoryId: string | undefined;
}) => {
  const isMobile = useIsMobile();
  const [videos, vQuery] = trpc.search.getAll.useSuspenseInfiniteQuery(
    {
      query,
      categoryId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  return (
    <>
      {isMobile ? (
        <div className="flex flex-col gap-4 gap-y-10">
          {videos?.pages
            .flatMap((page) => page.items)
            .map((video) => (
              <VideoGridCard key={video.id} data={video} />
            ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {videos?.pages
            .flatMap((page) => page.items)
            .map((video) => (
              <VideoRowCard key={video.id} data={video} />
            ))}
        </div>
      )}
      <InfiniteScroll
        fetchNextPage={vQuery?.fetchNextPage}
        hasNextPage={vQuery?.hasNextPage}
        isFetchingNextPage={vQuery?.isFetchingNextPage}
      />
    </>
  );
};

const ResultsSection = ({
  query,
  categoryId,
}: {
  query: string | undefined;
  categoryId: string | undefined;
}) => {
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <ErrorBoundary fallback={<div>Failed to load videos.</div>}>
        <ResultsSectionSuspense categoryId={categoryId} query={query} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default ResultsSection;
