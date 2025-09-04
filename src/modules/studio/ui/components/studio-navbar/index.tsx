import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "@/modules/auth/ui/components/AuthButton";
import StudioUploadModal from "../StudioUploadModal";

export const StudioNavbar = () => {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center bg-white px-2 pr-5 shadow-md">
      <div className="flex w-full items-center gap-4">
        <div className="flex flex-shrink-0 items-center">
          <SidebarTrigger className="m-1 [&_svg]:size-6" />
          <Link href={"/studio"}>
            <div className="flex items-center pl-4">
              <h1 className="text-lg font-semibold">Studio</h1>
              <Image src={"/logo.svg"} alt="Logo" width={150} height={150} />
            </div>
          </Link>
        </div>
        <div className="flex-1"></div>
        <div className="flex flex-shrink-0 items-center gap-4">
          <StudioUploadModal />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};
