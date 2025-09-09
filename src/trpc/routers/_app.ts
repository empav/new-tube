import { createTRPCRouter } from "../init";
import { categoriesRouter } from "./categories";
import { studioRouter } from "./studio";
import { videoReactionsRouter } from "./video-reactions";
import { videoViewsRouter } from "./video-views";
import { videosRouter } from "./videos";

export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  studio: studioRouter,
  videos: videosRouter,
  videoViews: videoViewsRouter,
  videoReactions: videoReactionsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
