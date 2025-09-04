"use client";
import { trpc as trpcClient } from "@/trpc/client";

const Test = () => {
  const [data] = trpcClient.hello.useSuspenseQuery({ text: "from client" });

  return <div>Client says {data.greeting}</div>;
};

export default Test;
