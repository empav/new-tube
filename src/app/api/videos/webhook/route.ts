import db from "@/db";
import { videos } from "@/db/schema";
import { mux } from "@/utils/mux";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetDeletedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks.mjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetDeletedWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetErroredWebhookEvent;

export async function POST(req: NextRequest) {
  if (!process.env.MUX_WEBHOOK_SECRET) {
    throw new Error("Missing MUX webhook secret");
  }

  const reqHeaders = await headers();
  const muxSignature = reqHeaders.get("mux-signature");

  if (!muxSignature) {
    return new Response("Missing MUX signature", { status: 401 });
  }

  const payload = (await req.json()) as WebhookEvent;
  const body = JSON.stringify(payload);

  mux.webhooks.verifySignature(body, {
    "mux-signature": muxSignature,
    secret: process.env.MUX_WEBHOOK_SECRET,
  });

  switch (payload.type) {
    case "video.asset.created":
      const createdData = payload.data as VideoAssetCreatedWebhookEvent["data"];
      if (!createdData.upload_id) {
        return new Response("Missing upload_id", { status: 400 });
      }
      await db
        .update(videos)
        .set({
          muxStatus: "processing",
          muxAssetId: createdData.id,
        })
        .where(eq(videos.muxUploadId, createdData.upload_id));
      break;
    case "video.asset.ready":
      const readyData = payload.data as VideoAssetReadyWebhookEvent["data"];
      if (!readyData.upload_id) {
        return new Response("Missing upload_id", { status: 400 });
      }
      const playbackId = readyData.playback_ids?.[0]?.id;
      if (!playbackId) {
        return new Response("Missing playback_id", { status: 400 });
      }
      const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
      const previewUrl = `https://image.mux.com/${playbackId}/animated.gif`;
      const duration = readyData.duration
        ? Math.round(readyData.duration * 1000)
        : 0;
      await db
        .update(videos)
        .set({
          muxStatus: "ready",
          muxPlaybackId: playbackId,
          muxAssetId: readyData.id,
          thumbnailUrl,
          previewUrl,
          duration,
        })
        .where(eq(videos.muxUploadId, readyData.upload_id));
      // Handle video asset ready
      break;
    case "video.asset.deleted":
      // Handle video asset deleted
      const deletedData = payload.data as VideoAssetDeletedWebhookEvent["data"];
      if (!deletedData.upload_id) {
        return new Response("Missing upload_id", { status: 400 });
      }
      await db
        .delete(videos)
        .where(eq(videos.muxUploadId, deletedData.upload_id));
      break;
    case "video.asset.errored":
      // Handle video asset errored
      const errorData = payload.data as VideoAssetErroredWebhookEvent["data"];
      if (!errorData.upload_id) {
        return new Response("Missing upload_id", { status: 400 });
      }
      await db
        .update(videos)
        .set({
          muxStatus: errorData.status,
        })
        .where(eq(videos.muxUploadId, errorData.upload_id));
      break;
    case "video.asset.track.ready":
      const trackReadyData =
        payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
          asset_id: string;
        };
      if (!trackReadyData.asset_id) {
        return new Response("Missing asset_id", { status: 400 });
      }
      await db
        .update(videos)
        .set({
          muxTrackId: trackReadyData.id,
          muxTrackStatus: trackReadyData.status,
        })
        .where(eq(videos.muxAssetId, trackReadyData.asset_id));
    default:
      return new Response("Unknown webhook event", { status: 400 });
  }

  return new Response("Webhook processed", { status: 200 });
}
