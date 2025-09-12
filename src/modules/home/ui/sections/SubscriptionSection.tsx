"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import VideoGridCard from "@/modules/videos/ui/components/video-grid-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const SubscriptionSectionSkeleton = () => <div>Loading...</div>;

const SubscriptionSectionSuspense = () => {
  const [videos, query] = trpc.videos.getAllSubs.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  return (
    <div>
      <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoGridCard key={video.id} data={video} />
          ))}
      </div>
      <InfiniteScroll
        isFetchingNextPage={query.isFetchingNextPage}
        hasNextPage={query.hasNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  );
};

const SubscriptionSection = () => {
  return (
    <Suspense fallback={<SubscriptionSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Failed to load Videos.</div>}>
        <SubscriptionSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

export default SubscriptionSection;
