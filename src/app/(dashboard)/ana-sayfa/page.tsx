"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  Users,
  Music,
  Theater,
  TrendingUp,
  Clock,
  Megaphone,
  Star,
  Loader2,
} from "lucide-react";
import { useMembers } from "@/hooks/use-members";
import { useEvents } from "@/hooks/use-events";
import { useAnnouncements } from "@/hooks/use-announcements";
import { useSongs } from "@/hooks/use-songs";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// ── Stat Card ────────────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: string;
}) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gold" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center gap-1 mt-1">
          {trend && (
            <TrendingUp className="h-3 w-3 text-green-500" />
          )}
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Dashboard Page ───────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { members, isLoading: membersLoading } = useMembers();
  const { upcomingEvents, isLoading: eventsLoading } = useEvents();
  const { announcements, isLoading: announcementsLoading } = useAnnouncements();
  const { songs, isLoading: songsLoading } = useSongs();

  const isLoading = membersLoading || eventsLoading || announcementsLoading || songsLoading;

  const activeMembers = members.filter((m) => m.status === "active");

  const typeLabels: Record<string, string> = {
    rehearsal: "Prova",
    performance: "Gösteri",
    audition: "Seçme",
    meeting: "Toplantı",
    workshop: "Çalıştay",
    social: "Sosyal",
  };

  const typeColors: Record<string, string> = {
    rehearsal: "bg-gold/10 text-gold border-gold/30",
    performance: "bg-velvet/10 text-velvet border-velvet/30",
    audition: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    meeting: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    workshop: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    social: "bg-green-500/10 text-green-400 border-green-500/30",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Ana Sayfa
        </h1>
        <p className="text-sm text-muted-foreground">
          Vokal Akademi Koro Takip Sistemine hoş geldiniz. İşte koronuzun genel görünümü.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Üye"
          value={String(activeMembers.length)}
          description={`${members.length} kayıtlı üye`}
          icon={Users}
        />
        <StatCard
          title="Yaklaşan Etkinlik"
          value={String(upcomingEvents.length)}
          description="Planlanmış etkinlik"
          icon={CalendarCheck}
        />
        <StatCard
          title="Kütüphanedeki Şarkılar"
          value={String(songs.length)}
          description="Repertuvar"
          icon={Music}
        />
        <StatCard
          title="Son Duyurular"
          value={String(announcements.length)}
          description="Toplam duyuru"
          icon={Megaphone}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CalendarCheck className="h-5 w-5 text-gold" />
              Yaklaşan Etkinlikler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Yaklaşan etkinlik yok.</p>
            ) : (
              upcomingEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-gold/10 text-gold">
                    <span className="text-xs font-medium uppercase">
                      {format(new Date(event.start_time), "MMM", { locale: tr })}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {format(new Date(event.start_time), "d")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{event.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(event.start_time), "HH:mm")}
                        {event.end_time && ` – ${format(new Date(event.end_time), "HH:mm")}`}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className={typeColors[event.event_type] || typeColors.rehearsal}>
                    {typeLabels[event.event_type] || event.event_type}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Megaphone className="h-5 w-5 text-gold" />
              Son Duyurular
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henüz duyuru yok.</p>
            ) : (
              announcements.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="group rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {(item.priority ?? 0) >= 2 && <Star className="h-4 w-4 fill-gold text-gold" />}
                      <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {format(new Date(item.created_at), "d MMM", { locale: tr })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
