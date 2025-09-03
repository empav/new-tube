import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";

export const SearchInput = () => {
  return (
    <form className="flex w-full max-w-[600px]">
      <div className="relative flex w-full items-center">
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-l-full border py-2 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          type="submit"
          className="absolute right-1 border-0 bg-transparent shadow-none transition-transform duration-200 hover:scale-125 hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-5"
        >
          <SearchIcon color="black" />
        </Button>
      </div>
    </form>
  );
};
