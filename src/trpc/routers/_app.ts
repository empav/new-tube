import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { TRPCError } from "@trpc/server";
export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query(() => {
      // return {
      //   greeting: `hello ${opts.input.text}`,
      // };
      throw new TRPCError({ code: "BAD_REQUEST" });
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
