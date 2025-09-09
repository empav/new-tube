import z from "zod";
import db from "@/db";
import { videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";

export const videoViewsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ videoId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existingView] = await db
        .select()
        .from(videoViews)
        .where(
          and(
            eq(videoViews.videoId, input.videoId),
            eq(videoViews.userId, ctx.user.id),
          ),
        );

      if (existingView) {
        return existingView;
      }

      const [created] = await db
        .insert(videoViews)
        .values({
          userId: ctx.user.id,
          videoId: input.videoId,
        })
        .returning();

      return created;
    }),
});

export type VideoViewsRouter = typeof videoViewsRouter;
