"use client";

import { Button } from "@/components/ui/button";
import { SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const url = new URL("/search", process.env.NEXT_PUBLIC_APP_URL);

export const SearchInput = () => {
  const [query, setQuery] = useState<string>("");
  const router = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newQuery = query.trim();
    url.searchParams.set("query", encodeURIComponent(newQuery));

    if (newQuery === "") {
      url.searchParams.delete("query");
    }

    setQuery(newQuery);

    router.push(url.toString());
  };

  const onXClick = () => {
    setQuery("");
    url.searchParams.delete("query");
    router.push(url.toString());
  };

  const onChangeQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (!q) onXClick();
  };

  return (
    <form className="flex w-full max-w-[600px]" onSubmit={onSubmit}>
      <div className="relative flex w-full items-center">
        <input
          type="text"
          placeholder="Search..."
          className="w-full border py-2 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={query}
          onChange={onChangeQuery}
        />
        {query ? (
          <Button
            type="button"
            variant={"ghost"}
            onClick={onXClick}
            className="absolute right-14 top-1/2 -translate-y-1/2 rounded-full"
          >
            <XIcon className="text-gray-500" />
          </Button>
        ) : null}
        <Button
          disabled={!query.trim()}
          type="submit"
          className="absolute right-1 border-0 bg-transparent shadow-none transition-transform duration-200 hover:scale-125 hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-5"
        >
          <SearchIcon className="text-gray-600" />
        </Button>
      </div>
    </form>
  );
};
