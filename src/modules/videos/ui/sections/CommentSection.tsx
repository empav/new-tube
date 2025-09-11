"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { CommentForm } from "@/modules/comments/ui/components/CommentForm";
import CommentItem from "@/modules/comments/ui/components/CommentItem";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const CommentSectionSkeleton = () => {
  return <div>Loading comments...</div>;
};

const CommentSection = ({ videoId }: { videoId: string }) => {
  return (
    <Suspense fallback={<CommentSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <CommentSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CommentSectionSuspense = ({ videoId }: { videoId: string }) => {
  const [comments, query] = trpc.comments.getAll.useSuspenseInfiniteQuery(
    {
      videoId: videoId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold">
          {comments.pages[0].count} comments
        </h1>
        <CommentForm videoId={videoId} />
      </div>
      <div className="flex flex-col gap-4 mt-2">
        {comments.pages.flatMap((page) =>
          page.items.map((comment) => (
            <CommentItem comment={comment} key={comment.id} />
          )),
        )}
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
        isManual
      />
    </div>
  );
};

export default CommentSection;
