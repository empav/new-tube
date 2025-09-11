"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { CornerDownRightIcon, Loader2Icon } from "lucide-react";
import CommentItem from "./CommentItem";
import { Button } from "@/components/ui/button";

const CommentReply = ({
  videoId,
  parentId,
}: {
  videoId: string;
  parentId: string;
}) => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.comments.getAll.useInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
        videoId,
        parentId,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );
  return (
    <div className="pl-14">
      <div className="flex flex-col gap-4 mt-2">
        {isLoading ? (
          <div className="flex justify-center items-center">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : null}
        {!isLoading
          ? data?.pages
              .flatMap((page) => page.items)
              .map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  variant="reply"
                />
              ))
          : null}
      </div>
      {hasNextPage ? (
        <Button
          variant={"tertiary"}
          size={"sm"}
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          <CornerDownRightIcon />
          Show more
        </Button>
      ) : null}
    </div>
  );
};

export default CommentReply;
