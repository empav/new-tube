"use client";
import { trpc as trpcClient } from "@/trpc/client";
import { useEffect } from "react";

const Test = () => {
  "use client";
  const [data] = trpcClient.hello.useSuspenseQuery({ text: "from client" });

  useEffect(() => {
    console.log("data", data);
  }, [data]);

  return <div>Client says {data}</div>;
};

export default Test;
