"use client";
import UserAvatar from "@/components/user-avatar";
import {
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonHeader = () => (
  <SidebarHeader className="flex items-center justify-center pb-4">
    <Skeleton className="size-[112px] rounded-full" />
    <div className="mt-2 flex flex-col items-center gap-y-3">
      <Skeleton className="h-4 w-20 rounded" />
      <Skeleton className="h-3 w-28 rounded" />
    </div>
  </SidebarHeader>
);

const StudioSidebarHeader = () => {
  const { user } = useUser();
  const { state } = useSidebar();

  if (!user) return <SkeletonHeader />;

  if (state === "collapsed") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Your profile" asChild>
          <Link href="/users/current">
            <UserAvatar
              imageUrl={user?.imageUrl}
              name={user.fullName ?? "User"}
              size="xs"
              className="transition-opacity hover:opacity-60"
            />
            <span className="text-sm">Your Profile</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarHeader className="flex items-center justify-center pb-4">
      <Link href="/users/current">
        <UserAvatar
          imageUrl={user?.imageUrl}
          name={user.fullName ?? "User"}
          className="size-[112px] transition-opacity hover:opacity-60"
        />
      </Link>
      <div className="mt-2 flex flex-col items-center gap-y-1">
        <p className="text-sm font-medium">Your profile</p>
        <p className="text-xs text-muted-foreground">{user.fullName}</p>
      </div>
    </SidebarHeader>
  );
};

export default StudioSidebarHeader;
