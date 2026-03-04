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
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { checkPermission } from "@/lib/constants";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
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

function CalendarView({ events }: { events: Event[] }) {
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
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMonth((m) => subMonths(m, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-foreground capitalize">
          {format(month, "MMMM yyyy", { locale: tr })}
        </h3>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMonth((m) => addMonths(m, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-7 bg-muted/50 border-b border-border">
          {weekDays.map((w) => (
            <div
              key={w}
              className="p-2 text-center text-xs font-medium text-muted-foreground"
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 bg-card">
          {days.map((day) => {
            const dayEvents = eventsOnDay(day);
            const isCurrentMonth = isSameMonth(day, month);
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[80px] border-b border-r border-border p-1 ${
                  !isCurrentMonth ? "bg-muted/20" : ""
                }`}
              >
                <span
                  className={`text-xs font-medium ${
                    isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 2).map((e) => (
                    <div
                      key={e.id}
                      className="truncate rounded px-1 py-0.5 text-[10px] border border-transparent bg-gold/10 text-gold"
                      title={e.title}
                    >
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{dayEvents.length - 2}
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

  return (
    <div className="space-y-6">
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
          <TabsList className="bg-muted/50">
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              Liste
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Takvim
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-6 space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">
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
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-3"
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
                          <p className="text-sm font-semibold text-foreground truncate">
                            {event.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(event.start_time), "HH:mm")} –{" "}
                                {format(new Date(event.end_time), "HH:mm")}
                              </span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {event.location}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={eventTypeColors[event.event_type] || ""}
                        >
                          {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                        </Badge>
                      </div>
                    ))}
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
                      <div
                        key={event.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2 text-sm"
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
                      </div>
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
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Takvim görünümü</CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarView events={events} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
