import z from "zod";
import db from "@/db";
import { videos, videoUpdateSchema } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { mux } from "@/utils/mux";
import { and, eq } from "drizzle-orm";
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
