import z from "zod";
import db from "@/db";
import { comments, videoReactions, videos, videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const studioRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, ctx.user.id)))
        .limit(1);

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

      return video;
    }),
  getAll: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await db
        .select({
          ...getTableColumns(videos),
          views: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          comments: db.$count(comments, eq(comments.videoId, videos.id)),
          likes: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like"),
            ),
          ),
        })
        .from(videos)
        .where(
          and(
            eq(videos.userId, ctx.user.id),
            input.cursor
              ? or(
                  lt(videos.updatedAt, input.cursor.updatedAt),
                  and(
                    eq(videos.updatedAt, input.cursor.updatedAt),
                    lt(videos.id, input.cursor.id),
                  ),
                )
              : undefined,
          ),
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        // We fetch one more item than the limit to determine if there's a next page
        .limit(input.limit + 1);

      const hasMore = data.length > input.limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : undefined;

      return {
        items,
        nextCursor,
      };
    }),
});

export type StudioRouter = typeof studioRouter;
