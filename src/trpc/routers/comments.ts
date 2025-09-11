import db from "@/db";
import { commentInsertSchema, comments, users } from "@/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/trpc/init";
import { eq, getTableColumns } from "drizzle-orm";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      commentInsertSchema.pick({
        value: true,
        videoId: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [created] = await db
        .insert(comments)
        .values({
          userId: ctx.user.id,
          videoId: input.videoId,
          value: input.value,
        })
        .returning();

      return created;
    }),
  getAll: publicProcedure
    .input(
      commentInsertSchema.pick({
        videoId: true,
      }),
    )
    .query(async ({ input }) => {
      const commentsList = await db
        .select({
          ...getTableColumns(comments),
          user: users,
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.videoId, input.videoId));

      return commentsList;
    }),
});

export type CommentsRouter = typeof commentsRouter;
