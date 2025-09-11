import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type VideoGetByIdOutput = RouterOutputs["videos"]["getById"];

export type CommentGetAllOutput = RouterOutputs["comments"]["getAll"];
