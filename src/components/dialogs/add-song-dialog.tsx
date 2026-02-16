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
import { Plus, Loader2 } from "lucide-react";
import { useSongs } from "@/hooks/use-songs";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function AddSongDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    composer: "",
    arranger: "",
    genre: "Müzikal Tiyatro",
    difficulty: 3,
    notes: "",
  });
  const { addSong } = useSongs();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) {
      toast.error("Şarkı adı gereklidir");
      return;
    }
    try {
      await addSong.mutateAsync({
        title: form.title,
        composer: form.composer || null,
        arranger: form.arranger || null,
        genre: form.genre || null,
        difficulty: form.difficulty,
        voice_parts: [],
        duration_seconds: null,
        lyrics: null,
        notes: form.notes || null,
        sheet_music_url: null,
        audio_url: null,
        midi_url: null,
        production_id: null,
        created_by: user?.id || "",
      });
      toast.success("Şarkı başarıyla eklendi");
      setOpen(false);
      setForm({ title: "", composer: "", arranger: "", genre: "Müzikal Tiyatro", difficulty: 3, notes: "" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Şarkı eklenirken hata oluştu";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gold text-gold-foreground hover:bg-gold/90">
          <Plus className="mr-2 h-4 w-4" />
          Şarkı Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Yeni Şarkı Ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="song-title">Şarkı Adı *</Label>
            <Input
              id="song-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Örn: Defying Gravity"
              className="bg-muted/30 border-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="composer">Besteci</Label>
              <Input
                id="composer"
                value={form.composer}
                onChange={(e) => setForm({ ...form, composer: e.target.value })}
                placeholder="Besteci adı"
                className="bg-muted/30 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arranger">Aranjör</Label>
              <Input
                id="arranger"
                value={form.arranger}
                onChange={(e) => setForm({ ...form, arranger: e.target.value })}
                placeholder="Aranjör adı"
                className="bg-muted/30 border-border"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="genre">Tür</Label>
              <Input
                id="genre"
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
                className="bg-muted/30 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Zorluk (1-5)</Label>
              <Input
                id="difficulty"
                type="number"
                min={1}
                max={5}
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: parseInt(e.target.value) || 3 })}
                className="bg-muted/30 border-border"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="song-notes">Notlar</Label>
            <Textarea
              id="song-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Ek bilgiler..."
              className="bg-muted/30 border-border"
              rows={3}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
            disabled={addSong.isPending}
          >
            {addSong.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Şarkı Ekle
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
