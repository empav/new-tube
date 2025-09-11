"use client";

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
  const [comments] = trpc.comments.getAll.useSuspenseQuery({
    videoId: videoId,
  });
  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6">
        <h1> 0 comments</h1>
        <CommentForm videoId={videoId} />
      </div>
      <div className="flex flex-col gap-4 mt-2">
        {comments.map((comment) => (
          <CommentItem comment={comment} key={comment.id} />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
