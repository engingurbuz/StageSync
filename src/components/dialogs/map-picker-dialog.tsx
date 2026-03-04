"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

const MapPicker = dynamic(
  () => import("@/components/map-picker").then((m) => ({ default: m.MapPicker })),
  { ssr: false, loading: () => <div className="h-[280px] flex items-center justify-center bg-muted/30 rounded-lg"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div> }
);

function isDisplayableAddress(name: string): boolean {
  if (!name || name.length < 2) return false;
  const cyrillic = /\p{Script=Cyrillic}/u;
  const greek = /\p{Script=Greek}/u;
  const arabic = /\p{Script=Arabic}/u;
  return !cyrillic.test(name) && !greek.test(name) && !arabic.test(name);
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "tr" } }
    );
    const data = await res.json();
    const name = data?.display_name ?? null;
    if (name && !isDisplayableAddress(name)) return null;
    return name;
  } catch {
    return null;
  }
}

interface MapPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLat?: number | null;
  initialLng?: number | null;
  onSelect: (lat: number, lng: number, address?: string | null) => void;
}

export function MapPickerDialog({
  open,
  onOpenChange,
  initialLat,
  initialLng,
  onSelect,
}: MapPickerDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSelect = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true);
      try {
        const address = await reverseGeocode(lat, lng);
        onSelect(lat, lng, address);
        onOpenChange(false);
      } finally {
        setLoading(false);
      }
    },
    [onSelect, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Haritadan konum seçin
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Haritada bir noktaya tıklayarak pin ekleyin, ardından &quot;Bu konumu kullan&quot; ile seçin.
        </p>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : (
          <MapPicker
            initialLat={initialLat}
            initialLng={initialLng}
            onSelect={handleSelect}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
