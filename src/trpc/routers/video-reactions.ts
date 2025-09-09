import z from "zod";
import db from "@/db";
import { videoReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";

export const videoReactionsRouter = createTRPCRouter({
  likeDislike: protectedProcedure
    .input(z.object({ videoId: z.uuid(), type: z.enum(["like", "dislike"]) }))
    .mutation(async ({ ctx, input }) => {
      const [existingReaction] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, input.videoId),
            eq(videoReactions.userId, ctx.user.id),
            eq(videoReactions.type, input.type),
          ),
        );

      if (existingReaction) {
        const [deleted] = await db
          .delete(videoReactions)
          .where(
            and(
              eq(videoReactions.userId, ctx.user.id),
              eq(videoReactions.videoId, input.videoId),
            ),
          )
          .returning();
        return deleted;
      }

      const [created] = await db
        .insert(videoReactions)
        .values({
          userId: ctx.user.id,
          videoId: input.videoId,
          type: input.type,
        })
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: {
            type: input.type,
          },
        })
        .returning();

      return created;
    }),
});

export type VideoReactionsRouter = typeof videoReactionsRouter;
