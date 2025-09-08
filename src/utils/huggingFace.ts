import { InferenceClient } from "@huggingface/inference";

export const HFClient = new InferenceClient(process.env.HF_TOKEN);
