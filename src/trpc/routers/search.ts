import z from "zod";
import db from "@/db";
import { users, videoReactions, videos, videoViews } from "@/db/schema";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { and, desc, eq, getTableColumns, ilike, lt, or } from "drizzle-orm";

export const searchRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        query: z.string().nullish(),
        categoryId: z.uuid().nullish(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ input }) => {
      const data = await db
        .select({
          ...getTableColumns(videos),
          user: users,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like"),
            ),
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike"),
            ),
          ),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            input.query ? ilike(videos.title, `%${input.query}%`) : undefined,
            input.categoryId
              ? eq(videos.categoryId, input.categoryId)
              : undefined,
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

export type SearchRouter = typeof searchRouter;
