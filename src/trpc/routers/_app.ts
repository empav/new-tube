import { createTRPCRouter } from "../init";
import { categoriesRouter } from "./categories";
import { commentsRouter } from "./comments";
import { studioRouter } from "./studio";
import { subsRouter } from "./subscriptions";
import { videoReactionsRouter } from "./video-reactions";
import { videoViewsRouter } from "./video-views";
import { videosRouter } from "./videos";

export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  studio: studioRouter,
  videos: videosRouter,
  videoViews: videoViewsRouter,
  videoReactions: videoReactionsRouter,
  subscriptions: subsRouter,
  comments: commentsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
