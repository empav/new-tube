"use client";

import UserAvatar from "@/components/user-avatar";
import { CommentGetAllOutput } from "@/trpc/routers/types";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const CommentItem = ({ comment }: { comment: CommentGetAllOutput[number] }) => {
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
      </div>
    </div>
  );
};
export default CommentItem;
