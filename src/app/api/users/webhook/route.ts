import db from "@/db";
import { users } from "@/db/schema";
import { UserJSON } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    // Do something with payload
    const eventData = evt.data as UserJSON;
    const eventType = evt.type;

    const name = `${eventData.first_name} ${eventData.last_name}`;
    const email = eventData.email_addresses?.[0]?.email_address;
    const image_url = eventData.image_url;

    if (eventType === "user.created") {
      console.log("Webhook user created:", eventData);
      await db.insert(users).values({
        clerkId: eventData.id,
        email,
        name,
        image_url,
      });
      // Handle user creation logic here
    } else if (eventType === "user.updated") {
      console.log("Webhook user updated:", eventData);
      await db
        .update(users)
        .set({
          name,
          email,
          image_url,
        })
        .where(eq(users.clerkId, eventData.id));
      // Handle user update logic here
    } else if (eventType === "user.deleted") {
      console.log("Webhook user deleted:", eventData);
      await db.delete(users).where(eq(users.clerkId, eventData.id));
      // Handle user deletion logic here
    } else {
      return new Response("Unknown Webhook event type", { status: 400 });
    }
    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error(
      "Error verifying webhook or synchronizing local db with clerk stuff:",
      err,
    );
    return new Response(
      "Error verifying webhook or synchronizing local db with clerk stuff",
      { status: 400 },
    );
  }
}
