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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [created] = await db
        .insert(comments)
        .values({
          userId: ctx.user.id,
          videoId: input.videoId,
          value: input.value,
        })
        .returning();

      return created;
    }),
  getAll: publicProcedure
    .input(
      z.object({
        videoId: z.uuid(),
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

      const total = db
        .select({
          count: count(),
        })
        .from(comments)
        .where(eq(comments.videoId, input.videoId));

      const list = db
        .with(viewerReactions)
        .select({
          ...getTableColumns(comments),
          user: users,
          viewerReaction: viewerReactions.type,
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
        .where(
          and(
            eq(comments.videoId, input.videoId),
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
