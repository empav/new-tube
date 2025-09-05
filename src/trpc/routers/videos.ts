import z from "zod";
import db from "@/db";
import { videos, videoUpdateSchema } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { mux } from "@/utils/mux";
import { and, eq } from "drizzle-orm";
import { AssetOptions } from "@mux/mux-node/resources/video/assets.mjs";
import { TRPCError } from "@trpc/server";

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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [video] = await db
        .delete(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, ctx.user.id)))
        .returning();
      return video;
    }),
});

export type VideosRouter = typeof videosRouter;
