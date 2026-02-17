"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Music,
  Theater,
  Palette,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Settings,
  Sparkles,
  Loader2,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// ── Navigation Items ────────────────────────────────────────────────────────────
const navItems = [
  {
    title: "Ana Sayfa",
    href: "/ana-sayfa",
    icon: LayoutDashboard,
    roles: ["admin", "section_leader", "creative_team", "member"],
  },
  {
    title: "Üyeler",
    href: "/uyeler",
    icon: Users,
    roles: ["admin", "section_leader", "creative_team", "member"],
  },
  {
    title: "Yoklama",
    href: "/yoklama",
    icon: CalendarCheck,
    roles: ["admin", "section_leader"],
  },
  {
    title: "Repertuvar",
    href: "/repertuvar",
    icon: Music,
    roles: ["admin", "section_leader", "creative_team", "member"],
  },
  {
    title: "Seçmeler & Kadro",
    href: "/secmeler",
    icon: Theater,
    roles: ["admin", "section_leader", "creative_team", "member"],
  },
  {
    title: "Yaratıcı Pano",
    href: "/yaratici",
    icon: Palette,
    roles: ["admin", "creative_team"],
  },
  {
    title: "Duyurular",
    href: "/duyurular",
    icon: Megaphone,
    roles: ["admin", "section_leader", "creative_team", "member"],
  },
  {
    title: "Formlar",
    href: "/formlar",
    icon: ClipboardList,
    roles: ["admin", "section_leader", "creative_team", "member"],
  },
];

const bottomNavItems = [
  {
    title: "Ayarlar",
    href: "/ayarlar",
    icon: Settings,
  },
];

// ── Sidebar Logo / Brand ────────────────────────────────────────────────────────
function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link href="/ana-sayfa" className="flex items-center gap-3 px-3 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-amber-600 shadow-lg shadow-gold/20">
        <Sparkles className="h-5 w-5 text-black" />
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-wide text-foreground">
            Vokal Akademi
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-gold/70">
            Koro Takip Sistemi
          </span>
        </div>
      )}
    </Link>
  );
}

// ── Nav Link ────────────────────────────────────────────────────────────────────
function NavLink({
  item,
  collapsed,
  onClick,
}: {
  item: (typeof navItems)[0];
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  const linkContent = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-gold/10 text-gold shadow-sm border border-gold/20"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 shrink-0 transition-colors",
          isActive ? "text-gold" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      {!collapsed && <span>{item.title}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="bg-card border-border">
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

// ── Desktop Sidebar ─────────────────────────────────────────────────────────────
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { profile, signOut } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const roleLabels: Record<string, string> = {
    admin: "Yönetici",
    section_leader: "Bölüm Lideri",
    creative_team: "Yaratıcı Ekip",
    member: "Üye",
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Brand */}
      <SidebarBrand collapsed={collapsed} />

      <Separator className="bg-sidebar-border" />

      {/* Main nav */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom section */}
      <div className="mt-auto px-3 pb-3">
        <Separator className="mb-3 bg-sidebar-border" />

        {/* Bottom nav items */}
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={{ ...item, roles: [] }}
            collapsed={collapsed}
          />
        ))}

        {/* User profile */}
        <div
          className={cn(
            "mt-3 flex items-center gap-3 rounded-lg bg-muted/50 p-2",
            collapsed && "justify-center"
          )}
        >
          <Avatar className="h-8 w-8 border border-gold/30">
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
            <AvatarFallback className="bg-velvet text-xs font-bold text-velvet-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-xs font-semibold text-foreground">
                {profile?.full_name || "Yükleniyor..."}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                {roleLabels[profile?.role || "member"] || profile?.role}
              </span>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="mt-2 w-full justify-center text-muted-foreground hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-xs">Daralt</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

// ── Mobile Sidebar (Sheet) ──────────────────────────────────────────────────────
export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-foreground"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menüyü aç/kapat</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-64 bg-sidebar border-sidebar-border p-0"
      >
        <SidebarBrand collapsed={false} />
        <Separator className="bg-sidebar-border" />
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                collapsed={false}
                onClick={() => setOpen(false)}
              />
            ))}
          </nav>
          <Separator className="my-4 bg-sidebar-border" />
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={{ ...item, roles: [] }}
              collapsed={false}
              onClick={() => setOpen(false)}
            />
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
