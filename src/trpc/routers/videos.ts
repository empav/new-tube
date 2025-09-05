import z from "zod";
import db from "@/db";
import { videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { mux } from "@/utils/mux";
import { eq } from "drizzle-orm";
import { AssetOptions } from "@mux/mux-node/resources/video/assets.mjs";

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
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        ...CREATE_UPLOAD_CONFIG,
        passthrough: ctx.user.id,
      },
      cors_origin: process.env.MUX_CORS_ORIGIN!,
    });

    const video = await db
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
    .mutation(async ({ input }) => {
      const video = await db
        .delete(videos)
        .where(eq(videos.id, input.id))
        .returning();
      return video;
    }),
});

export type VideosRouter = typeof videosRouter;
