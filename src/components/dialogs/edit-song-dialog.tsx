"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileText, Music2, Trash2 } from "lucide-react";
import { useSongs } from "@/hooks/use-songs";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Song } from "@/types/database";

interface EditSongDialogProps {
  song: Song | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSongDialog({ song, open, onOpenChange }: EditSongDialogProps) {
  const { user, profile } = useAuth();
  const [form, setForm] = useState({
    title: "",
    composer: "",
    arranger: "",
    genre: "",
    difficulty: 3,
    notes: "",
    sheet_music_url: "",
    midi_url: "",
  });
  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [midiFile, setMidiFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { updateSong, deleteSong } = useSongs();

  // Sadece admin ve koro şefi şarkı düzenleyebilir
  const canEdit = profile?.role === "admin" || profile?.role === "creative_team";

  useEffect(() => {
    if (song) {
      setForm({
        title: song.title || "",
        composer: song.composer || "",
        arranger: song.arranger || "",
        genre: song.genre || "",
        difficulty: song.difficulty || 3,
        notes: song.notes || "",
        sheet_music_url: song.sheet_music_url || "",
        midi_url: song.midi_url || "",
      });
      setSheetFile(null);
      setMidiFile(null);
    }
  }, [song]);

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
    if (!song || !form.title) {
      toast.error("Şarkı adı gereklidir");
      return;
    }

    setUploading(true);
    try {
      let sheetUrl = form.sheet_music_url;
      let midiUrl = form.midi_url;

      // Yeni dosyaları yükle
      if (sheetFile) {
        const url = await uploadFile(sheetFile, "sheets");
        if (url) sheetUrl = url;
      }

      if (midiFile) {
        const url = await uploadFile(midiFile, "midis");
        if (url) midiUrl = url;
      }

      await updateSong.mutateAsync({
        id: song.id,
        title: form.title,
        composer: form.composer || null,
        arranger: form.arranger || null,
        genre: form.genre || null,
        difficulty: form.difficulty,
        notes: form.notes || null,
        sheet_music_url: sheetUrl || null,
        midi_url: midiUrl || null,
      });

      toast.success("Şarkı başarıyla güncellendi");
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Şarkı güncellenirken hata oluştu";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!song) return;
    
    if (!confirm("Bu şarkıyı silmek istediğinizden emin misiniz?")) {
      return;
    }

    setDeleting(true);
    try {
      await deleteSong.mutateAsync(song.id);
      toast.success("Şarkı silindi");
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Şarkı silinirken hata oluştu";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  if (!song) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Şarkı Düzenle</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {canEdit ? "Şarkı bilgilerini düzenleyin." : "Şarkı detayları"}
          </DialogDescription>
        </DialogHeader>

        {!canEdit ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Besteci</p>
                <p className="text-sm text-foreground">{song.composer || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Aranjör</p>
                <p className="text-sm text-foreground">{song.arranger || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tür</p>
                <p className="text-sm text-foreground">{song.genre || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Zorluk</p>
                <p className="text-sm text-foreground">{song.difficulty}/5</p>
              </div>
            </div>
            {song.notes && (
              <div>
                <p className="text-xs text-muted-foreground">Notlar</p>
                <p className="text-sm text-foreground">{song.notes}</p>
              </div>
            )}
            <div className="flex gap-2">
              {song.sheet_music_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(song.sheet_music_url!, "_blank")}
                  className="border-border"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Nota
                </Button>
              )}
              {song.midi_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(song.midi_url!, "_blank")}
                  className="border-border"
                >
                  <Music2 className="mr-2 h-4 w-4" />
                  MIDI
                </Button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-song-title">Şarkı Adı *</Label>
              <Input
                id="edit-song-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-muted/30 border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-composer">Besteci</Label>
                <Input
                  id="edit-composer"
                  value={form.composer}
                  onChange={(e) => setForm({ ...form, composer: e.target.value })}
                  className="bg-muted/30 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-arranger">Aranjör</Label>
                <Input
                  id="edit-arranger"
                  value={form.arranger}
                  onChange={(e) => setForm({ ...form, arranger: e.target.value })}
                  className="bg-muted/30 border-border"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-genre">Tür</Label>
                <Input
                  id="edit-genre"
                  value={form.genre}
                  onChange={(e) => setForm({ ...form, genre: e.target.value })}
                  className="bg-muted/30 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-difficulty">Zorluk (1-5)</Label>
                <Input
                  id="edit-difficulty"
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
              <p className="text-sm font-medium text-foreground">Dosyalar</p>
              
              {/* Mevcut Nota */}
              {form.sheet_music_url && !sheetFile && (
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gold" />
                    <span className="text-sm text-foreground">Mevcut nota dosyası</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(form.sheet_music_url, "_blank")}
                      className="text-muted-foreground"
                    >
                      Görüntüle
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setForm({ ...form, sheet_music_url: "" })}
                      className="text-destructive"
                    >
                      Kaldır
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Nota Yükleme */}
              <div className="space-y-2">
                <Label htmlFor="edit-sheet-file" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gold" />
                  {form.sheet_music_url ? "Yeni Nota Dosyası" : "Nota Dosyası (PDF, Word vb.)"}
                </Label>
                <Input
                  id="edit-sheet-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => setSheetFile(e.target.files?.[0] || null)}
                  className="bg-muted/30 border-border file:bg-gold/10 file:text-gold file:border-0 file:rounded file:mr-2"
                />
                {sheetFile && (
                  <p className="text-xs text-muted-foreground">{sheetFile.name}</p>
                )}
              </div>

              {/* Mevcut MIDI */}
              {form.midi_url && !midiFile && (
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                  <div className="flex items-center gap-2">
                    <Music2 className="h-4 w-4 text-velvet" />
                    <span className="text-sm text-foreground">Mevcut MIDI dosyası</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(form.midi_url, "_blank")}
                      className="text-muted-foreground"
                    >
                      İndir
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setForm({ ...form, midi_url: "" })}
                      className="text-destructive"
                    >
                      Kaldır
                    </Button>
                  </div>
                </div>
              )}

              {/* MIDI Yükleme */}
              <div className="space-y-2">
                <Label htmlFor="edit-midi-file" className="flex items-center gap-2">
                  <Music2 className="h-4 w-4 text-velvet" />
                  {form.midi_url ? "Yeni MIDI Dosyası" : "MIDI Dosyası"}
                </Label>
                <Input
                  id="edit-midi-file"
                  type="file"
                  accept=".mid,.midi"
                  onChange={(e) => setMidiFile(e.target.files?.[0] || null)}
                  className="bg-muted/30 border-border file:bg-velvet/10 file:text-velvet file:border-0 file:rounded file:mr-2"
                />
                {midiFile && (
                  <p className="text-xs text-muted-foreground">{midiFile.name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-song-notes">Notlar</Label>
              <Textarea
                id="edit-song-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="bg-muted/30 border-border"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting || uploading}
                className="mr-auto"
              >
                {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Sil
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-border"
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="bg-gold text-gold-foreground hover:bg-gold/90"
                disabled={updateSong.isPending || uploading}
              >
                {(updateSong.isPending || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kaydet
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
