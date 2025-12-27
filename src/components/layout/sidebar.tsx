
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Receipt,
  Goal,
  Settings,
  Lightbulb,
  Landmark,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/goals", label: "Goals", icon: Goal },
  { href: "/investments", label: "Investments", icon: Landmark },
  { href: "/advice", label: "AI Advice", icon: Lightbulb },
  { href: "/settings", label: "Settings", icon: Settings },
];

type SidebarProps = {
  isMobile?: boolean;
  onLinkClick?: () => void;
}

export function Sidebar({ isMobile = false, onLinkClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "flex-col border-r bg-background",
      isMobile ? "flex h-full" : "hidden md:flex"
    )}>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Image src="https://i.ibb.co/wHk5fgy/Chat-GPT-Image-Dec-24-2025-03-48-49-PM.png" alt="Salary Guider Logo" width={32} height={32} className="h-8 w-8" />
          <span className="">Salary Guider</span>
        </Link>
      </div>
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Button
              key={item.label}
              asChild
              variant={isActive ? "secondary" : "ghost"}
              className="justify-start"
              onClick={onLinkClick}
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
