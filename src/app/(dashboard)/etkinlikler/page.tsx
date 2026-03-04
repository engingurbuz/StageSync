"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  List,
  Loader2,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CreateEventDialog } from "@/components/dialogs/create-event-dialog";
import { EventDetailDialog } from "@/components/dialogs/event-detail-dialog";
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { checkPermission } from "@/lib/constants";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { getLocationDisplayText } from "@/lib/utils";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  addDays,
} from "date-fns";
import { tr } from "date-fns/locale";
import type { Event } from "@/types/database";

const eventTypeColors: Record<string, string> = {
  rehearsal: "bg-gold/10 text-gold border-gold/30",
  performance: "bg-velvet/10 text-velvet border-velvet/30",
  concert: "bg-velvet/10 text-velvet border-velvet/30",
  audition: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  meeting: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  workshop: "bg-green-500/10 text-green-400 border-green-500/30",
  social: "bg-pink-500/10 text-pink-400 border-pink-500/30",
};

function CalendarView({
  events,
  onEventClick,
}: {
  events: Event[];
  onEventClick?: (event: Event) => void;
}) {
  const [month, setMonth] = useState(() => new Date());
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days: Date[] = [];
  let d = calendarStart;
  while (d <= calendarEnd) {
    days.push(d);
    d = addDays(d, 1);
  }
  const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  const eventsOnDay = (day: Date) =>
    events.filter((e) => {
      const start = new Date(e.start_time);
      return isSameDay(start, day) || isWithinInterval(day, { start: start, end: new Date(e.end_time) });
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl border-gold/30 hover:bg-gold/10 hover:border-gold/50 hover:text-gold transition-colors"
          onClick={() => setMonth((m) => subMonths(m, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-foreground capitalize tabular-nums">
          {format(month, "MMMM yyyy", { locale: tr })}
        </h3>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl border-gold/30 hover:bg-gold/10 hover:border-gold/50 hover:text-gold transition-colors"
          onClick={() => setMonth((m) => addMonths(m, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="rounded-xl border border-border overflow-hidden shadow-sm bg-card">
        <div className="grid grid-cols-7 bg-gradient-to-r from-muted/40 to-muted/20 border-b border-border">
          {weekDays.map((w) => (
            <div
              key={w}
              className="p-2.5 text-center text-xs font-semibold text-muted-foreground"
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dayEvents = eventsOnDay(day);
            const isCurrentMonth = isSameMonth(day, month);
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[88px] border-b border-r border-border/60 p-2 transition-colors hover:bg-muted/20 ${
                  !isCurrentMonth ? "bg-muted/10" : ""
                } ${isToday ? "bg-amber-500/5 ring-inset" : ""}`}
              >
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                    isCurrentMonth
                      ? isToday
                        ? "bg-gold text-gold-foreground font-bold"
                        : "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1.5 space-y-1">
                  {dayEvents.slice(0, 2).map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      className="w-full text-left truncate rounded-lg px-2 py-1 text-[11px] font-medium bg-gradient-to-r from-amber-500/15 to-gold/10 text-gold border border-gold/20 shadow-sm hover:from-amber-500/25 hover:to-gold/20 transition-colors cursor-pointer"
                      title={e.title}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onEventClick?.(e);
                      }}
                    >
                      {e.title}
                    </button>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[10px] text-muted-foreground font-medium">
                      +{dayEvents.length - 2} etkinlik
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { profile } = useAuth();
  const { permissions } = usePermissions();
  const { events, upcomingEvents, pastEvents, isLoading } = useEvents();
  const canCreate = checkPermission(profile, "etkinlikler", "create", permissions);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openEventDetail = (event: Event) => {
    setSelectedEvent(event);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <EventDetailDialog
        event={selectedEvent}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedEvent(null);
        }}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Etkinlikler
          </h1>
          <p className="text-sm text-muted-foreground">
            Provalar, konserler ve diğer etkinlikleri oluşturun; takvimde görüntüleyin. Yoklama girişleri Yoklama sayfasından yapılır.
          </p>
        </div>
        {canCreate && <CreateEventDialog />}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : (
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="bg-muted/50 rounded-xl p-1">
            <TabsTrigger value="list" className="gap-2 rounded-lg data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-sm">
              <List className="h-4 w-4" />
              Liste
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2 rounded-lg data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-sm">
              <Calendar className="h-4 w-4" />
              Takvim
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-6 space-y-6">
            <Card className="border-border bg-card shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-muted/30 to-transparent border-b border-border/50">
                <CardTitle className="text-foreground flex items-center gap-2">
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
                    Yaklaşan etkinlik yok. Yeni etkinlik ekleyebilirsiniz.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => {
                      const locationText = getLocationDisplayText(event.location);
                      const hasLocation = locationText || (event.location_lat != null && event.location_lng != null);
                      return (
                        <button
                          key={event.id}
                          type="button"
                          className="w-full text-left group flex items-center gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-all duration-200 hover:border-gold/30 hover:shadow-md cursor-pointer"
                          onClick={() => openEventDetail(event)}
                        >
                          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-gold/20 text-gold shadow-inner">
                            <span className="text-xs font-semibold uppercase tracking-wider">
                              {format(new Date(event.start_time), "MMM", { locale: tr })}
                            </span>
                            <span className="text-xl font-bold leading-none mt-0.5">
                              {format(new Date(event.start_time), "dd")}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {event.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 text-gold/80" />
                                <span className="text-xs">
                                  {format(new Date(event.start_time), "HH:mm")} –{" "}
                                  {format(new Date(event.end_time), "HH:mm")}
                                </span>
                              </div>
                              {hasLocation && (
                                <div className="flex items-center gap-1.5 text-muted-foreground" title={locationText || undefined}>
                                  <MapPin className="h-3.5 w-3.5 text-gold/80" />
                                  <span className="text-xs truncate max-w-[220px]">
                                    {locationText ?? "Konum girildi"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`shrink-0 ${eventTypeColors[event.event_type] || ""} font-medium`}
                          >
                            {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            {pastEvents.length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground text-base">
                    Geçmiş Etkinlikler
                    <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground text-[10px]">
                      {pastEvents.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pastEvents.slice(0, 10).map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        className="w-full text-left flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 p-2.5 text-sm transition-colors hover:bg-muted/30 cursor-pointer"
                        onClick={() => openEventDetail(event)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(event.start_time), "dd MMM yyyy", {
                              locale: tr,
                            })}
                          </span>
                          <span className="text-foreground">{event.title}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={eventTypeColors[event.event_type] || ""}
                        >
                          {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                        </Badge>
                      </button>
                    ))}
                    {pastEvents.length > 10 && (
                      <p className="text-xs text-muted-foreground pt-2">
                        Son 10 etkinlik gösteriliyor.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="calendar" className="mt-6">
            <Card className="border-border bg-card shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-muted/30 to-transparent border-b border-border/50">
                <CardTitle className="text-foreground">Takvim görünümü</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <CalendarView events={events} onEventClick={openEventDetail} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
