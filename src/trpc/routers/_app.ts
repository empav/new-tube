import { createTRPCRouter } from "../init";
import { categoriesRouter } from "./categories";
import { studioRouter } from "./studio";
import { videosRouter } from "./videos";

export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  studio: studioRouter,
  videos: videosRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
