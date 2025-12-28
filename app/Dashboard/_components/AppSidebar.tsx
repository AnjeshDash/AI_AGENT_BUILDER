"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import {
  Database,
  Headphones,
  LayoutDashboard,
  WalletCards,
  User,
  User2Icon,
} from "lucide-react";
import { UserAvatar } from "@clerk/nextjs";

const MenuOptions = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "AI Agents",
    url: "#",
    icon: Headphones,
  },
  {
    title: "Data",
    url: "#",
    icon: Database,
  },
  {
    title: "Pricing",
    url: "#",
    icon: WalletCards,
  },
  {
    title: "Profile",
    url: "#",
    icon: User2Icon 
  },
];

function Appsidebar() {
  const {open}=useSidebar();
  return (
    <div>
      <Sidebar collapsible='icon'>
        <SidebarHeader>
          <div className="flex gap-2 items-center">
            <Image src="/logo.svg" alt="Logo" width={35} height={35} />
            {open&& <h2 className="font-bold text-lg">Agentify</h2>}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Applications</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {MenuOptions.map((menu, index) => (
                  <SidebarMenuButton key={index} asChild>
                    <Link href={menu.url} className="flex gap-2 items-center">
                      <menu.icon />
                      <span>{menu.title}</span>
                    </Link>
                  </SidebarMenuButton>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <UserAvatar />
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}

export default Appsidebar;
