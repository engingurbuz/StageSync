"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, Upload, FileText, Music2 } from "lucide-react";
import { useSongs } from "@/hooks/use-songs";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function AddSongDialog() {
  const [open, setOpen] = useState(false);
  const { user, profile } = useAuth();
  const [form, setForm] = useState({
    title: "",
    composer: "",
    arranger: "",
    genre: "Müzikal Tiyatro",
    difficulty: 3,
    notes: "",
  });
  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [midiFile, setMidiFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { addSong } = useSongs();

  // Sadece admin ve koro şefi şarkı ekleyebilir
  const canAddSong = profile?.role === "admin" || profile?.role === "creative_team";

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from("songs")
      .upload(filePath, file);

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("songs")
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) {
      toast.error("Şarkı adı gereklidir");
      return;
    }

    setUploading(true);
    try {
      let sheetUrl: string | null = null;
      let midiUrl: string | null = null;

      // Dosyaları yükle
      if (sheetFile) {
        sheetUrl = await uploadFile(sheetFile, "sheets");
        if (!sheetUrl) {
          toast.error("Nota dosyası yüklenemedi");
          setUploading(false);
          return;
        }
      }

      if (midiFile) {
        midiUrl = await uploadFile(midiFile, "midis");
        if (!midiUrl) {
          toast.error("MIDI dosyası yüklenemedi");
          setUploading(false);
          return;
        }
      }

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
        sheet_music_url: sheetUrl,
        audio_url: null,
        midi_url: midiUrl,
        production_id: null,
        created_by: user?.id || "",
      });

      toast.success("Şarkı başarıyla eklendi");
      setOpen(false);
      setForm({ title: "", composer: "", arranger: "", genre: "Müzikal Tiyatro", difficulty: 3, notes: "" });
      setSheetFile(null);
      setMidiFile(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Şarkı eklenirken hata oluştu";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  if (!canAddSong) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gold text-gold-foreground hover:bg-gold/90">
          <Plus className="mr-2 h-4 w-4" />
          Şarkı Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Yeni Şarkı Ekle</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Şarkı bilgilerini girin. Dosyalar opsiyoneldir.
          </DialogDescription>
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

          {/* Dosya Yükleme Alanları */}
          <div className="space-y-4 pt-2 border-t border-border">
            <p className="text-sm font-medium text-foreground">Dosyalar (Opsiyonel)</p>
            
            {/* Nota/Sheet Dosyası */}
            <div className="space-y-2">
              <Label htmlFor="sheet-file" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gold" />
                Nota Dosyası (PDF, Word vb.)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="sheet-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => setSheetFile(e.target.files?.[0] || null)}
                  className="bg-muted/30 border-border file:bg-gold/10 file:text-gold file:border-0 file:rounded file:mr-2"
                />
                {sheetFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSheetFile(null)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Kaldır
                  </Button>
                )}
              </div>
              {sheetFile && (
                <p className="text-xs text-muted-foreground">{sheetFile.name}</p>
              )}
            </div>

            {/* MIDI Dosyası */}
            <div className="space-y-2">
              <Label htmlFor="midi-file" className="flex items-center gap-2">
                <Music2 className="h-4 w-4 text-velvet" />
                MIDI Dosyası
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="midi-file"
                  type="file"
                  accept=".mid,.midi"
                  onChange={(e) => setMidiFile(e.target.files?.[0] || null)}
                  className="bg-muted/30 border-border file:bg-velvet/10 file:text-velvet file:border-0 file:rounded file:mr-2"
                />
                {midiFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMidiFile(null)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Kaldır
                  </Button>
                )}
              </div>
              {midiFile && (
                <p className="text-xs text-muted-foreground">{midiFile.name}</p>
              )}
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
            disabled={addSong.isPending || uploading}
          >
            {(addSong.isPending || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {uploading ? "Yükleniyor..." : "Şarkı Ekle"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
