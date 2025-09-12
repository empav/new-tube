import { createTRPCRouter } from "../init";
import { categoriesRouter } from "./categories";
import { commentReactionsRouter } from "./comment-reactions";
import { commentsRouter } from "./comments";
import { studioRouter } from "./studio";
import { subsRouter } from "./subscriptions";
import { suggestionsRouter } from "./suggestions";
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
  commentReactions: commentReactionsRouter,
  suggestions: suggestionsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
