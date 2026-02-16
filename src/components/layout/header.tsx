"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { MobileSidebar } from "./sidebar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAnnouncements } from "@/hooks/use-announcements";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export function Header() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { announcements } = useAnnouncements();
  const recent = useMemo(() => (announcements || []).slice(0, 5), [announcements]);
  const count = recent.length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6">
      {/* Mobile menu trigger */}
      <MobileSidebar />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right-side actions */}
      <div className="flex items-center gap-2" ref={ref}>
        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(!open)}
        >
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center bg-velvet border-0"
            >
              {count}
            </Badge>
          )}
          <span className="sr-only">Bildirimler</span>
        </Button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-4 top-12 w-80 rounded-lg border border-border bg-card shadow-lg z-50">
            <div className="p-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Bildirimler</h3>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {recent.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">Bildirim yok</p>
              ) : (
                recent.map((a) => (
                  <div key={a.id} className="p-3 border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.content}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: tr })}
                    </p>
                  </div>
                ))
              )}
            </div>
            {recent.length > 0 && (
              <div className="p-2 border-t border-border">
                <a href="/duyurular" className="block text-center text-xs text-gold hover:underline">
                  Tüm duyuruları gör
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
