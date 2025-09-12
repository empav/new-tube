import z from "zod";
import db from "@/db";
import {
  subscriptions,
  users,
  videoReactions,
  videos,
  videoUpdateSchema,
  videoViews,
} from "@/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/trpc/init";
import { mux } from "@/utils/mux";
import {
  and,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  lt,
  or,
} from "drizzle-orm";
import { AssetOptions } from "@mux/mux-node/resources/video/assets.mjs";
import { TRPCError } from "@trpc/server";
import { UploadThingApi } from "@/app/api/uploadthing/core";
import { upstashWorkflowClient } from "@/utils/upstash";

const CREATE_UPLOAD_CONFIG: AssetOptions = {
  passthrough: "userId",
  playback_policies: ["public"],
  input: [
    {
      generated_subtitles: [
        {
          language_code: "en",
          name: "English",
        },
      ],
    },
  ],
};

export const videosRouter = createTRPCRouter({
  getAllTrending: publicProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            viewCount: z.number(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ input }) => {
      const viewCountSubquery = db.$count(
        videoViews,
        eq(videoViews.videoId, videos.id),
      );

      const data = await db
        .select({
          ...getTableColumns(videos),
          user: users,
          viewCount: viewCountSubquery,
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
            eq(videos.visibility, "public"),
            input.cursor
              ? or(
                  lt(viewCountSubquery, input.cursor.viewCount),
                  and(
                    eq(viewCountSubquery, input.cursor.viewCount),
                    lt(videos.id, input.cursor.id),
                  ),
                )
              : undefined,
          ),
        )
        .orderBy(desc(viewCountSubquery), desc(videos.id))
        // We fetch one more item than the limit to determine if there's a next page
        .limit(input.limit + 1);

      const hasMore = data.length > input.limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            viewCount: lastItem.viewCount,
          }
        : undefined;

      return {
        items,
        nextCursor,
      };
    }),
  getAll: publicProcedure
    .input(
      z.object({
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
            eq(videos.visibility, "public"),
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
  getById: publicProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      let userId;

      const [user] = await db
        .select()
        .from(users)
        .where(
          inArray(users.clerkId, ctx.clerkUserId ? [ctx.clerkUserId] : []),
        );

      if (user) {
        userId = user.id;
      }

      const reactions = db.$with("reactions").as(
        db
          .select({
            videoId: videoReactions.videoId,
            type: videoReactions.type,
          })
          .from(videoReactions)
          .where(inArray(videoReactions.userId, userId ? [userId] : [])),
      );
      const viewerSubscriptions = db.$with("subscriptions").as(
        db
          .select()
          .from(subscriptions)
          .where(inArray(subscriptions.viewerId, userId ? [userId] : [])),
      );

      const [video] = await db
        .with(reactions, viewerSubscriptions)
        .select({
          ...getTableColumns(videos),
          user: {
            ...getTableColumns(users),
            subscriberCount: db.$count(
              subscriptions,
              eq(subscriptions.creatorId, users.id),
            ),
            viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(
              Boolean,
            ),
          },
          views: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likes: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like"),
            ),
          ),
          dislikes: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike"),
            ),
          ),
          reactions: reactions.type,
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .leftJoin(reactions, eq(reactions.videoId, videos.id))
        .leftJoin(
          viewerSubscriptions,
          eq(viewerSubscriptions.creatorId, videos.id),
        )
        .where(eq(videos.id, input.id));

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

      return video;
    }),
  generateTitle: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { workflowRunId } = await upstashWorkflowClient.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
        body: {
          userId: ctx.user.id,
          videoId: input.videoId,
        },
      });
      return { workflowRunId };
    }),
  generateDescription: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { workflowRunId } = await upstashWorkflowClient.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/description`,
        body: {
          userId: ctx.user.id,
          videoId: input.videoId,
        },
      });
      return { workflowRunId };
    }),
  restoreThumbnail: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, ctx.user.id)));

      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found or you do not have permission to update it",
        });
      }

      if (existingVideo.thumbnailKey) {
        await UploadThingApi.deleteFiles([existingVideo.thumbnailKey]);
        await db
          .update(videos)
          .set({ thumbnailKey: null })
          .where(and(eq(videos.id, input.id), eq(videos.userId, ctx.user.id)));
      }

      if (!existingVideo.muxPlaybackId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Video does not have a playback ID",
        });
      }

      const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;

      const uploadedThumbnail =
        await UploadThingApi.uploadFilesFromUrl(tempThumbnailUrl);

      if (!uploadedThumbnail.data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload thumbnail",
        });
      }

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } =
        uploadedThumbnail.data;

      const [updatedVideo] = await db
        .update(videos)
        .set({ thumbnailUrl, thumbnailKey })
        .where(and(eq(videos.id, input.id), eq(videos.userId, ctx.user.id)))
        .returning();

      if (!updatedVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found or you do not have permission to update it",
        });
      }

      return updatedVideo;
    }),
  update: protectedProcedure
    // Enforce that id is required by extending the schema
    .input(videoUpdateSchema.extend({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [video] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, ctx.user.id)))
        .returning();

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found or you do not have permission to update it",
        });
      }
      return video;
    }),
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        ...CREATE_UPLOAD_CONFIG,
        passthrough: ctx.user.id,
      },
      cors_origin: process.env.MUX_CORS_ORIGIN!,
    });

    const [video] = await db
      .insert(videos)
      .values({
        userId: ctx.user.id,
        title: "Untitled",
        muxStatus: "waiting",
        muxUploadId: upload.id,
      })
      .returning();
    return { video, uploadUrl: upload.url };
  }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
        assetId: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const promises = [];

      promises.push(
        db
          .delete(videos)
          .where(and(eq(videos.id, input.id), eq(videos.userId, ctx.user.id)))
          .returning(),
      );

      if (input.assetId) promises.push(mux.video.assets.delete(input.assetId));

      try {
        const [video] = await Promise.all(promises);
        if (Array.isArray(video) && video.length) {
          return video[0];
        }
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Something went wrong with deleting either the video or the mux asset",
        });
      }
    }),
});

export type VideosRouter = typeof videosRouter;
