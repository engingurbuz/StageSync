"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Calendar, FileText, Map, MapOff } from "lucide-react";
import { getLocationDisplayText } from "@/lib/utils";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type { Event } from "@/types/database";

const EventLocationMap = dynamic(
  () => import("@/components/event-location-map").then((m) => ({ default: m.EventLocationMap })),
  { ssr: false, loading: () => <div className="h-[220px] rounded-lg bg-muted/30 animate-pulse flex items-center justify-center text-muted-foreground text-sm">Harita yükleniyor...</div> }
);

const eventTypeColors: Record<string, string> = {
  rehearsal: "bg-gold/10 text-gold border-gold/30",
  performance: "bg-velvet/10 text-velvet border-velvet/30",
  concert: "bg-velvet/10 text-velvet border-velvet/30",
  audition: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  meeting: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  workshop: "bg-green-500/10 text-green-400 border-green-500/30",
  social: "bg-pink-500/10 text-pink-400 border-pink-500/30",
};

interface EventDetailDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailDialog({
  event,
  open,
  onOpenChange,
}: EventDetailDialogProps) {
  if (!event) return null;

  const locationText = getLocationDisplayText(event.location);
  const hasCoords =
    event.location_lat != null &&
    event.location_lng != null &&
    !Number.isNaN(event.location_lat) &&
    !Number.isNaN(event.location_lng);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (!open) setShowMap(false);
  }, [open]);
  useEffect(() => {
    setShowMap(false);
  }, [event?.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pr-8">
          <DialogTitle className="text-foreground text-lg">
            {event.title}
          </DialogTitle>
          <Badge
            variant="outline"
            className={`w-fit ${eventTypeColors[event.event_type] || ""}`}
          >
            {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
          </Badge>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-gold/80 shrink-0" />
            <span>
              {format(new Date(event.start_time), "d MMMM yyyy, EEEE", {
                locale: tr,
              })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-gold/80 shrink-0" />
            <span>
              {format(new Date(event.start_time), "HH:mm")} –{" "}
              {format(new Date(event.end_time), "HH:mm")}
            </span>
          </div>
          {(locationText || hasCoords) && (
            <div className="space-y-2">
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-gold/80 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground">
                    {locationText ?? "Konum girildi"}
                  </p>
                  {hasCoords && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 mt-1.5 text-gold hover:text-gold/80 hover:bg-gold/10"
                      onClick={() => setShowMap((v) => !v)}
                    >
                      {showMap ? (
                        <>
                          <MapOff className="h-3.5 w-3.5 mr-1.5 inline" />
                          Haritayı kapat
                        </>
                      ) : (
                        <>
                          <Map className="h-3.5 w-3.5 mr-1.5 inline" />
                          Haritada aç
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              {showMap && hasCoords && event.location_lat != null && event.location_lng != null && (
                <EventLocationMap
                  lat={event.location_lat}
                  lng={event.location_lng}
                />
              )}
            </div>
          )}
          {event.description && event.description.trim() && (
            <div className="space-y-1.5">
              <div className="flex items-start gap-3 text-sm">
                <FileText className="h-4 w-4 text-gold/80 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground font-medium mb-1">
                    Açıklama
                  </p>
                  <p className="text-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              </div>
            </div>
          )}
          {event.is_mandatory && (
            <p className="text-xs text-muted-foreground">
              Zorunlu katılım
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
