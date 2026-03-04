"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Loader2, MapPin, Clock, ClipboardCheck } from "lucide-react";
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { checkPermission } from "@/lib/constants";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { AttendanceEntryDialog } from "@/components/dialogs/attendance-entry-dialog";
import { format } from "date-fns";
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

export default function AttendancePage() {
  const { profile } = useAuth();
  const { permissions } = usePermissions();
  const { upcomingEvents, pastEvents, isLoading } = useEvents();
  const [attendanceEvent, setAttendanceEvent] = useState<Event | null>(null);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const canEditAttendance = checkPermission(profile, "yoklama", "edit", permissions);

  const openAttendanceFor = (event: Event) => {
    setAttendanceEvent(event);
    setAttendanceDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Yoklama</h1>
          <p className="text-sm text-muted-foreground">
            Etkinliklere ait yoklama girişlerini görüntüleyin ve (yetkiniz varsa) girin. Etkinlik oluşturmak için Etkinlikler sayfasını kullanın.
          </p>
        </div>
      </div>

      <AttendanceEntryDialog
        event={attendanceEvent}
        open={attendanceDialogOpen}
        onOpenChange={(open) => {
          setAttendanceDialogOpen(open);
          if (!open) setAttendanceEvent(null);
        }}
      />

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
                  Yaklaşan etkinlik yok. Etkinlikler sayfasından yeni etkinlik ekleyebilirsiniz.
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
                        {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                      </Badge>
                      {canEditAttendance && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          onClick={() => openAttendanceFor(event)}
                        >
                          <ClipboardCheck className="h-4 w-4 mr-1" />
                          Yoklama girişi
                        </Button>
                      )}
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
                        {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
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
