import db from "@/db";
import { videos } from "@/db/schema";
import { HFClient } from "@/utils/huggingFace";
import { PROVIDERS } from "@huggingface/inference";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";

interface InputType {
  userId: string;
  videoId: string;
}

const MODEL = "meta-llama/Llama-3.1-8B-Instruct";
const PROMPT =
  "Could you generate a description for my video on planet earth? Be creative and concise. Don't give me options, just pick one for me please.";

export const { POST } = serve(async (context) => {
  const { userId, videoId } = context.requestPayload as InputType;

  await context.run("generate-video-description", async () => {
    const out = await HFClient.chatCompletion({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: PROMPT,
          provider: PROVIDERS.cerebras,
        },
      ],
    });

    if (!out.choices?.[0]?.message?.content) {
      throw new Error("No video title generated");
    }

    await db
      .update(videos)
      .set({ description: out.choices[0].message.content })
      .where(and(eq(videos.userId, userId), eq(videos.id, videoId)));
  });
});
