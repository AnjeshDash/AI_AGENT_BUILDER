"use client";

import React, { useContext } from "react";
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
  User2Icon,
  Gem,
} from "lucide-react";
import { UserDetailContext } from "@/app/context/UserDetailContext";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const MenuOptions = [
  { title: "Dashboard", url: "/Dashboard", icon: LayoutDashboard },
  { title: "AI Agents", url: "/Dashboard", icon: Headphones },
  { title: "Data", url: "/Dashboard/data", icon: Database },
  { title: "Pricing", url: "/Dashboard/pricing", icon: WalletCards },
  { title: "Profile", url: "/Dashboard/profile", icon: User2Icon },
];

function Appsidebar() {
  const { open } = useSidebar();
  const { userDetail } = useContext(UserDetailContext);
  const path = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex gap-2 items-center">
          <Image src="/logo.svg" alt="Logo" width={35} height={35} />
          {open && <h2 className="font-bold text-lg">Agentify</h2>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Applications</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MenuOptions.map((menu, index) => (
                <SidebarMenuButton
                  key={index}
                  asChild
                  size={open ? "lg" : "default"}
                  isActive={path === menu.url}   // ✅ FIXED
                >
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

      <SidebarFooter className="mb-10">
        <div className="flex gap-2 items-center">
          <Gem />
          {open && (
            <h2 className="text-sm font-medium">
              Remaining Credits:
              <span className="font-bold"> {userDetail?.token}</span>
            </h2>
          )}
        </div>
        {open && <Button>Upgrade to Unlimited</Button>}
      </SidebarFooter>
    </Sidebar>
  );
}

export default Appsidebar;
