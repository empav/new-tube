import { HydrateClient, trpc } from "@/trpc/server";
import Test from "./Test";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default async function Home() {
  void trpc.hello.prefetch({ text: "from client" });

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Test />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
