"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Loader2, MapPin, Clock } from "lucide-react";
import { CreateEventDialog } from "@/components/dialogs/create-event-dialog";
import { useEvents } from "@/hooks/use-events";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const eventTypeLabels: Record<string, string> = {
  rehearsal: "Prova",
  performance: "Gösteri",
  audition: "Seçme",
  meeting: "Toplantı",
  workshop: "Çalıştay",
  social: "Sosyal",
};

const eventTypeColors: Record<string, string> = {
  rehearsal: "bg-gold/10 text-gold border-gold/30",
  performance: "bg-velvet/10 text-velvet border-velvet/30",
  audition: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  meeting: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  workshop: "bg-green-500/10 text-green-400 border-green-500/30",
  social: "bg-pink-500/10 text-pink-400 border-pink-500/30",
};

export default function AttendancePage() {
  const { upcomingEvents, pastEvents, isLoading } = useEvents();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Yoklama</h1>
          <p className="text-sm text-muted-foreground">
            Prova yoklamalarını takip edin ve etkinlikleri yönetin.
          </p>
        </div>
        <CreateEventDialog />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : (
        <>
          {/* Yaklaşan Etkinlikler */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CalendarCheck className="h-5 w-5 text-gold" />
                Yaklaşan Etkinlikler
                {upcomingEvents.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-gold/10 text-gold text-[10px]">
                    {upcomingEvents.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Yaklaşan etkinlik yok. Yeni bir etkinlik oluşturun.
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-gold/10 text-gold">
                        <span className="text-xs font-medium uppercase">
                          {format(new Date(event.start_time), "MMM", { locale: tr })}
                        </span>
                        <span className="text-lg font-bold leading-none">
                          {format(new Date(event.start_time), "dd")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{event.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(event.start_time), "HH:mm")} – {format(new Date(event.end_time), "HH:mm")}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className={eventTypeColors[event.event_type] || ""}>
                        {eventTypeLabels[event.event_type] || event.event_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Geçmiş Etkinlikler */}
          {pastEvents.length > 0 && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  Geçmiş Etkinlikler
                  <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground text-[10px]">
                    {pastEvents.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pastEvents.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(event.start_time), "dd MMM yyyy", { locale: tr })}
                        </span>
                        <span className="text-foreground">{event.title}</span>
                      </div>
                      <Badge variant="outline" className={eventTypeColors[event.event_type] || ""}>
                        {eventTypeLabels[event.event_type] || event.event_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
