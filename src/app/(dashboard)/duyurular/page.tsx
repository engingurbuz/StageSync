"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Star, Pin, Loader2 } from "lucide-react";
import { useAnnouncements } from "@/hooks/use-announcements";
import { NewAnnouncementDialog } from "@/components/dialogs/new-announcement-dialog";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const priorityStyles: Record<number, string> = {
  0: "border-border",
  1: "border-gold/30",
  2: "border-velvet/50",
};

export default function AnnouncementsPage() {
  const { announcements, isLoading } = useAnnouncements();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Duyurular</h1>
          <p className="text-sm text-muted-foreground">
            Koronuzdan en son haberleri takip edin.
          </p>
        </div>
        <NewAnnouncementDialog />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : announcements.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-6 text-center">
            <Megaphone className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">
              Henüz duyuru yok. İlk duyurunuzu oluşturun.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <Card
              key={item.id}
              className={`border bg-card transition-colors hover:bg-muted/30 ${priorityStyles[item.priority ?? 0] || priorityStyles[0]}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {(item.priority ?? 0) >= 2 && (
                      <Star className="mt-0.5 h-4 w-4 shrink-0 fill-gold text-gold" />
                    )}
                    {item.is_pinned && (item.priority ?? 0) < 2 && (
                      <Pin className="mt-0.5 h-4 w-4 shrink-0 text-velvet" />
                    )}
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{item.content}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {item.profiles?.full_name || "Bilinmeyen"}
                        </span>
                        <span className="text-xs text-muted-foreground/50">·</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(item.created_at), "d MMM yyyy", { locale: tr })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {item.is_pinned && (
                    <Badge variant="outline" className="shrink-0 border-gold/30 text-gold text-[10px]">
                      Sabit
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
