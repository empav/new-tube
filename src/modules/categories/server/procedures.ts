import db from "@/db";
import { categories } from "@/db/schema";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";

export const categoriesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return await db.select().from(categories);
  }),
});

export type CategoriesRouter = typeof categoriesRouter;
