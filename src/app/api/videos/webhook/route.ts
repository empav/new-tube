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
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];
      if (!data.upload_id) {
        return new Response("Missing upload_id", { status: 400 });
      }
      await db
        .update(videos)
        .set({
          muxStatus: "processing",
          muxAssetId: data.id,
        })
        .where(eq(videos.muxUploadId, data.upload_id));
      break;
    case "video.asset.deleted":
      // Handle video asset deleted
      break;
    case "video.asset.ready":
      // Handle video asset ready
      break;
    case "video.asset.track.ready":
      // Handle video asset track ready
      break;
    case "video.asset.errored":
      // Handle video asset errored
      break;
    default:
      return new Response("Unknown webhook event", { status: 400 });
  }

  return new Response("Webhook processed", { status: 200 });
}
