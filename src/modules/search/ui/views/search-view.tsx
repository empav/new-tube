"use client";
import CategoriesSection from "@/modules/search/ui/sections/CategoriesSection";
import ResultsSection from "../sections/ResultsSection";

export const SearchView = ({
  categoryId,
  query,
}: {
  categoryId: string | undefined;
  query: string | undefined;
}) => {
  return (
    <div className="max-w-[1300px] mx-auto flex flex-col gap-y-6 px-4 pt-2.5">
      <CategoriesSection categoryId={categoryId} />
      <ResultsSection query={query} categoryId={categoryId} />
    </div>
  );
};
