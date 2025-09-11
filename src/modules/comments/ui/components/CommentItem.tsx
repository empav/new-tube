"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "@/components/user-avatar";
import { trpc } from "@/trpc/client";
import { CommentGetAllOutput } from "@/trpc/routers/types";
import { useAuth, useClerk } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { MessageSquareIcon, MoreVerticalIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const CommentItem = ({
  comment,
}: {
  comment: CommentGetAllOutput["items"][number];
}) => {
  const utils = trpc.useUtils();
  const clerk = useClerk();
  const { userId } = useAuth();

  const removeComment = trpc.comments.remove.useMutation({
    onSuccess: () => {
      // Invalidate and refetch
      toast.success("Comment removed");
      utils.comments.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
      if (error.data?.code === "UNAUTHORIZED") clerk.openSignIn();
    },
  });

  return (
    <div>
      <div className="flex gap-4">
        <Link href={`/profile/${comment.userId}`}>
          <UserAvatar
            size={"lg"}
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
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button className="size-8" size={"icon"} variant={"ghost"}>
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <MessageSquareIcon className="size-4" />
              Reply
            </DropdownMenuItem>
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
    </div>
  );
};
export default CommentItem;
