import z from "zod";
import db from "@/db";
import { commentReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";

export const commentReactionsRouter = createTRPCRouter({
  likeDislike: protectedProcedure
    .input(z.object({ commentId: z.uuid(), type: z.enum(["like", "dislike"]) }))
    .mutation(async ({ ctx, input }) => {
      const [existingReaction] = await db
        .select()
        .from(commentReactions)
        .where(
          and(
            eq(commentReactions.commentId, input.commentId),
            eq(commentReactions.userId, ctx.user.id),
            eq(commentReactions.type, input.type),
          ),
        );

      if (existingReaction) {
        const [deleted] = await db
          .delete(commentReactions)
          .where(
            and(
              eq(commentReactions.userId, ctx.user.id),
              eq(commentReactions.commentId, input.commentId),
            ),
          )
          .returning();
        return deleted;
      }

      const [created] = await db
        .insert(commentReactions)
        .values({
          userId: ctx.user.id,
          commentId: input.commentId,
          type: input.type,
        })
        .onConflictDoUpdate({
          target: [commentReactions.userId, commentReactions.commentId],
          set: {
            type: input.type,
          },
        })
        .returning();

      return created;
    }),
});

export type CommentReactionsRouter = typeof commentReactionsRouter;
