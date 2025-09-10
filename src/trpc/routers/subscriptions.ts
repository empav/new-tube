import z from "zod";
import db from "@/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { subscriptions } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const subsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ userId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      const [created] = await db
        .insert(subscriptions)
        .values({
          viewerId: ctx.user.id,
          creatorId: input.userId,
        })
        .returning();

      return created;
    }),
  remove: protectedProcedure
    .input(z.object({ userId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      const [removed] = await db
        .delete(subscriptions)
        .where(
          and(
            eq(subscriptions.viewerId, ctx.user.id),
            eq(subscriptions.creatorId, input.userId),
          ),
        )
        .returning();

      return removed;
    }),
});

export type VideoSubscriptionsRouter = typeof subsRouter;
