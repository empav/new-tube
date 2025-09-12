import { DEFAULT_LIMIT } from "@/constants";
import { SearchView } from "@/modules/search/ui/views/search-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    query: string | undefined;
    categoryId: string | undefined;
  }>;
};

const Page = async ({ searchParams }: Props) => {
  const { categoryId, query } = await searchParams;

  void trpc.categories.getAll.prefetch();
  void trpc.search.getAll.prefetchInfinite({
    query,
    categoryId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <SearchView categoryId={categoryId} query={query} />
    </HydrateClient>
  );
};

export default Page;
