import { z } from "zod";
import db from "@/db";
import {
  commentInsertSchema,
  commentReactions,
  comments,
  users,
} from "@/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/trpc/init";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  isNull,
  lt,
  or,
} from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const commentsRouter = createTRPCRouter({
  remove: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [removed] = await db
        .delete(comments)
        .where(and(eq(comments.userId, ctx.user.id), eq(comments.id, input.id)))
        .returning();

      if (!removed) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      return removed;
    }),
  create: protectedProcedure
    .input(
      commentInsertSchema.pick({
        value: true,
        videoId: true,
        parentId: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existingComment] = await db
        .select()
        .from(comments)
        .where(inArray(comments.id, input.parentId ? [input.parentId] : []));

      if (!existingComment && input.parentId) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }
      if (input.parentId && existingComment?.parentId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reply can be done only on a top-level comment",
        });
      }

      const [created] = await db
        .insert(comments)
        .values({
          userId: ctx.user.id,
          ...input,
        })
        .returning();

      return created;
    }),
  getAll: publicProcedure
    .input(
      z.object({
        videoId: z.uuid(),
        parentId: z.uuid().nullish(),
        cursor: z.object({ id: z.uuid(), updatedAt: z.date() }).nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      let userId: string | null = null;

      const [user] = await db
        .select()
        .from(users)
        .where(
          inArray(users.clerkId, ctx.clerkUserId ? [ctx.clerkUserId] : []),
        );

      if (user) userId = user.id;

      const viewerReactions = db.$with("viewerReactions").as(
        db
          .select({
            commentId: commentReactions.commentId,
            type: commentReactions.type,
          })
          .from(commentReactions)
          .where(inArray(commentReactions.userId, userId ? [userId] : [])),
      );

      const replies = db.$with("replies").as(
        db
          .select({
            parentId: comments.parentId,
            count: count(comments.id).as("count"),
          })
          .from(comments)
          .where(isNotNull(comments.parentId))
          .groupBy(comments.parentId),
      );

      const total = db
        .select({
          count: count(),
        })
        .from(comments)
        .where(eq(comments.videoId, input.videoId));

      const list = db
        .with(viewerReactions, replies)
        .select({
          ...getTableColumns(comments),
          user: users,
          viewerReaction: viewerReactions.type,
          replyCount: replies.count,
          likeCount: db.$count(
            commentReactions,
            and(
              eq(commentReactions.type, "like"),
              eq(commentReactions.commentId, comments.id),
            ),
          ),
          dislikeCount: db.$count(
            commentReactions,
            and(
              eq(commentReactions.type, "dislike"),
              eq(commentReactions.commentId, comments.id),
            ),
          ),
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .leftJoin(viewerReactions, eq(viewerReactions.commentId, comments.id))
        .leftJoin(replies, eq(replies.parentId, comments.id))
        .where(
          and(
            eq(comments.videoId, input.videoId),
            input.parentId
              ? eq(comments.parentId, input.parentId)
              : isNull(comments.parentId),
            input.cursor
              ? or(
                  lt(comments.updatedAt, input.cursor.updatedAt),
                  and(
                    eq(comments.updatedAt, input.cursor.updatedAt),
                    lt(comments.id, input.cursor.id),
                  ),
                )
              : undefined,
          ),
        )
        .orderBy(desc(comments.updatedAt), desc(comments.id))
        .limit(input.limit + 1);

      const [[totalCount], commentsList] = await Promise.all([total, list]);

      const hasMore = commentsList.length > input.limit;
      const items = hasMore ? commentsList.slice(0, -1) : commentsList;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : undefined;

      return {
        count: totalCount.count,
        items,
        nextCursor,
      };
    }),
});

export type CommentsRouter = typeof commentsRouter;
