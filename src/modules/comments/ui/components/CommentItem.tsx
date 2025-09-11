"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { CommentGetAllOutput } from "@/trpc/routers/types";
import { useAuth, useClerk } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MessageSquareIcon,
  MoreVerticalIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CommentForm } from "./CommentForm";
import CommentReply from "./CommentReply";

const CommentItem = ({
  comment,
  variant = "comment",
}: {
  comment: CommentGetAllOutput["items"][number];
  variant?: "comment" | "reply";
}) => {
  const utils = trpc.useUtils();
  const clerk = useClerk();
  const { userId } = useAuth();

  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);

  const removeComment = trpc.comments.remove.useMutation({
    onSuccess: () => {
      // Invalidate and refetch
      utils.comments.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
      if (error.data?.code === "UNAUTHORIZED") clerk.openSignIn();
    },
  });

  const likeDislike = trpc.commentReactions.likeDislike.useMutation({
    onSuccess: () => {
      utils.comments.getAll.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  return (
    <div>
      <div className="flex gap-4">
        <Link href={`/profile/${comment.userId}`}>
          <UserAvatar
            size={variant === "reply" ? "sm" : "lg"}
            imageUrl={comment.user.image_url}
            name={comment.user.name}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/videos/${comment.videoId}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-sm pb-0.5">
                {comment.user.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </span>
            </div>
          </Link>
          <p className="text-sm">{comment.value}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              <Button
                size={"icon"}
                variant={"ghost"}
                className="size-6"
                disabled={likeDislike.isPending}
                onClick={() =>
                  likeDislike.mutate({ commentId: comment.id, type: "like" })
                }
              >
                <ThumbsUpIcon
                  className={cn(
                    comment.viewerReaction === "like" && "fill-black",
                  )}
                />
              </Button>
              <span className="text-xs text-muted-foreground">
                {comment.likeCount}
              </span>
              <Button
                size={"icon"}
                variant={"ghost"}
                className="size-6"
                disabled={likeDislike.isPending}
                onClick={() =>
                  likeDislike.mutate({ commentId: comment.id, type: "dislike" })
                }
              >
                <ThumbsDownIcon
                  className={cn(
                    comment.viewerReaction === "dislike" && "fill-black",
                  )}
                />
              </Button>
              <span className="text-xs text-muted-foreground">
                {comment.dislikeCount}
              </span>
            </div>
            {variant === "comment" ? (
              <Button
                size={"sm"}
                variant={"ghost"}
                className="size-8 px-1"
                onClick={() => setIsReplyOpen(true)}
              >
                Reply
              </Button>
            ) : null}
          </div>
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button className="size-8" size={"icon"} variant={"ghost"}>
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {variant === "comment" ? (
              <DropdownMenuItem onClick={() => setIsReplyOpen(true)}>
                <MessageSquareIcon className="size-4" />
                Reply
              </DropdownMenuItem>
            ) : null}
            {comment.user.clerkId === userId ? (
              <DropdownMenuItem
                onClick={() => removeComment.mutate({ id: comment.id })}
              >
                <Trash2Icon className="size-4" />
                Delete
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isReplyOpen && variant === "comment" ? (
        <div className="mt-4 pl-14">
          <CommentForm
            variant="reply"
            parentId={comment.id}
            videoId={comment.videoId}
            onCancel={() => setIsReplyOpen(false)}
            onSuccess={() => {
              setIsReplyOpen(false);
              setIsRepliesOpen(true);
            }}
          />
        </div>
      ) : null}
      {comment.replyCount > 0 && variant === "comment" && isRepliesOpen ? (
        <CommentReply videoId={comment.videoId} parentId={comment.id} />
      ) : null}
      {comment.replyCount > 0 && variant === "comment" ? (
        <div className="pl-14">
          <Button
            size={"sm"}
            variant={"tertiary"}
            onClick={() => setIsRepliesOpen((v) => !v)}
          >
            {isRepliesOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            {comment.replyCount} replies
          </Button>
        </div>
      ) : null}
    </div>
  );
};
export default CommentItem;
