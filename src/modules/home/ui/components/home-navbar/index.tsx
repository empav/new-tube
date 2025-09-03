import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { SearchInput } from "./SearchInput";
import { AuthButton } from "@/modules/auth/ui/components/AuthButton";

export const HomeNavbar = () => {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center bg-white px-2 pr-5">
      <div className="flex w-full items-center gap-4">
        <div className="flex flex-shrink-0 items-center">
          <SidebarTrigger />
          <Link href={"/"}>
            <div className="pl-4">
              <Image src={"/logo.svg"} alt="Logo" width={150} height={150} />
            </div>
          </Link>
        </div>
        {/* Search bar */}
        <div className="mx-auto flex max-w-[720px] flex-1 justify-center">
          <SearchInput />
        </div>
        <div className="flex flex-shrink-0 items-center gap-4">
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};
