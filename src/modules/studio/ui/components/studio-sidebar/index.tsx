"use client";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LogOutIcon, VideoIcon } from "lucide-react";
import Link from "next/link";
import StudioSidebarHeader from "./StudioSidebarHeader";

export const StudioSidebar = () => {
  return (
    <Sidebar className="z-40 pt-16" collapsible="icon">
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <StudioSidebarHeader />
              <Separator />
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Content" asChild>
                  <Link href="/studio">
                    <VideoIcon className="size-4" />
                    <span className="text-sm">Content</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Separator />
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Exit Studio" asChild>
                  <Link href="/">
                    <LogOutIcon className="size-4" />
                    <span className="text-sm">Exit Studio</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
