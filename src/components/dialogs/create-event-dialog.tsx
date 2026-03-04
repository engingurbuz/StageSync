"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, MapPin } from "lucide-react";
import { MapPickerDialog } from "@/components/dialogs/map-picker-dialog";
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { EVENT_TYPES } from "@/lib/constants";
import { toast } from "sonner";
import type { EventType } from "@/types/database";

export function CreateEventDialog() {
  const [open, setOpen] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_type: "rehearsal" as EventType,
    location: "",
    location_lat: "" as string | number,
    location_lng: "" as string | number,
    start_time: "",
    end_time: "",
    is_mandatory: true,
  });
  const { addEvent } = useEvents();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.start_time || !form.end_time) {
      toast.error("BaÅŸlÄ±k, baÅŸlangÄ±Ã§ ve bitiÅŸ zamanÄ± gereklidir");
      return;
    }
    try {
      const lat = form.location_lat === "" ? null : Number(form.location_lat);
      const lng = form.location_lng === "" ? null : Number(form.location_lng);
      await addEvent.mutateAsync({
        title: form.title,
        description: form.description || null,
        event_type: form.event_type,
        location: form.location || null,
        location_lat: lat !== null && !Number.isNaN(lat) ? lat : null,
        location_lng: lng !== null && !Number.isNaN(lng) ? lng : null,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        is_mandatory: form.is_mandatory,
        production_id: null,
        created_by: user?.id || "",
      });
      toast.success("Etkinlik baÅŸarÄ±yla oluÅŸturuldu");
      setOpen(false);
      setForm({
        title: "",
        description: "",
        event_type: "rehearsal",
        location: "",
        location_lat: "",
        location_lng: "",
        start_time: "",
        end_time: "",
        is_mandatory: true,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Etkinlik oluÅŸturulurken hata oluÅŸtu";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gold text-gold-foreground hover:bg-gold/90">
          <Plus className="mr-2 h-4 w-4" />
          Etkinlik OluÅŸtur
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Yeni Etkinlik OluÅŸtur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">Etkinlik AdÄ± *</Label>
            <Input
              id="event-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ã–rn: Tam Kadro Prova"
              className="bg-muted/30 border-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Etkinlik TÃ¼rÃ¼</Label>
              <Select
                value={form.event_type}
                onValueChange={(v) => setForm({ ...form, event_type: v as EventType })}
              >
                <SelectTrigger className="bg-muted/30 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Etkinlik yeri</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ana salon veya adres"
                className="bg-muted/30 border-border"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={() => setMapPickerOpen(true)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Haritadan konum seÃ§
              </Button>
            </div>
          </div>
          <MapPickerDialog
            open={mapPickerOpen}
            onOpenChange={setMapPickerOpen}
            initialLat={form.location_lat !== "" ? Number(form.location_lat) : null}
            initialLng={form.location_lng !== "" ? Number(form.location_lng) : null}
            onSelect={(lat, lng, address) => {
              setForm((prev) => ({
                ...prev,
                location_lat: lat,
                location_lng: lng,
                location: address ?? prev.location,
              }));
            }}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start">Başlangıç *</Label>
              <Input
                id="start"
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="bg-muted/30 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Bitiş *</Label>
              <Input
                id="end"
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="bg-muted/30 border-border"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-desc">Açıklama</Label>
            <Textarea
              id="event-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Etkinlik detayları..."
              className="bg-muted/30 border-border"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="mandatory"
              checked={form.is_mandatory}
              onChange={(e) => setForm({ ...form, is_mandatory: e.target.checked })}
              className="accent-gold"
            />
            <Label htmlFor="mandatory" className="cursor-pointer">Zorunlu katılım</Label>
          </div>
          <Button
            type="submit"
            className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
            disabled={addEvent.isPending}
          >
            {addEvent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Etkinlik OluÅŸtur
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
