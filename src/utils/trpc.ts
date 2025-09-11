import { httpBatchLink, httpSubscriptionLink, splitLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { ssrPrepass } from "@trpc/next/ssrPrepass";
import type { AppRouter } from "@/trpc/routers/_app";
/**
 * If you need to add transformers for special data types like `Temporal.Instant` or `Temporal.Date`, `Decimal.js`, etc you can do so here.
 * Make sure to import this file rather than `superjson` directly.
 * @see https://github.com/blitz-js/superjson#recipes
 */
import superjson from "superjson";

export const transformer = superjson;

export const TRPC_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/trpc`;

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        splitLink({
          condition: (op) => op.type === "subscription",
          true: httpSubscriptionLink({
            url: TRPC_URL,
            transformer,
          }),
          false: httpBatchLink({
            url: TRPC_URL,
            transformer,
          }),
        }),
      ],
    };
  },
  ssr: true,
  ssrPrepass,
  transformer,
});
