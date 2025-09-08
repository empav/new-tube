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

const GENERATE_TITLE_PROMPT =
  "Could you generate a title for my video on planet earth? Be creative and concise. Could be a funny one!! Don't give me options, just pick one for me please. No more than 4 words.";

export const { POST } = serve(async (context) => {
  const { userId, videoId } = context.requestPayload as InputType;

  await context.run("generate-video-title", async () => {
    const out = await HFClient.chatCompletion({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: GENERATE_TITLE_PROMPT,
          provider: PROVIDERS.cerebras,
        },
      ],
    });

    if (!out.choices?.[0]?.message?.content) {
      throw new Error("No video title generated");
    }

    await db
      .update(videos)
      .set({ title: out.choices[0].message.content })
      .where(and(eq(videos.userId, userId), eq(videos.id, videoId)));
  });
});
