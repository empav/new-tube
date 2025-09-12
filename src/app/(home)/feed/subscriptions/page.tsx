import { DEFAULT_LIMIT } from "@/constants";
import { SubscriptionView } from "@/modules/home/ui/views/subscription-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  void trpc.videos.getAllSubs.prefetchInfinite({ limit: DEFAULT_LIMIT });
  return (
    <HydrateClient>
      <SubscriptionView />
    </HydrateClient>
  );
}
