"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Music } from "lucide-react";
import { useAuditionSongs, useAuditions } from "@/hooks/use-auditions";
import { useSongs } from "@/hooks/use-songs";
import type { Audition } from "@/types/database";
import { toast } from "sonner";

function formatDateForInput(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toISOString().slice(0, 10);
}

export function EditAuditionDialog({
  audition,
  open,
  onOpenChange,
}: {
  audition: Audition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { updateAudition } = useAuditions();
  const { auditionSongs } = useAuditionSongs(open && audition ? audition.id : null);
  const { songs } = useSongs();
  const [form, setForm] = useState({
    role_name: "",
    description: "",
    location: "",
    deadline: "",
    song_ids: [] as string[],
  });

  const roots = useMemo(
    () => songs.filter((s) => !s.parent_song_id).sort((a, b) => a.title.localeCompare(b.title, "tr")),
    [songs]
  );
  const childrenByParent = useMemo(() => {
    const map = new Map<string, typeof songs>();
    for (const s of songs) {
      if (s.parent_song_id) {
        const list = map.get(s.parent_song_id) ?? [];
        list.push(s);
        map.set(s.parent_song_id, list);
      }
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.medley_position ?? 0) - (b.medley_position ?? 0));
    }
    return map;
  }, [songs]);

  useEffect(() => {
    if (!open || !audition) return;
    setForm({
      role_name: audition.role_name ?? "",
      description: audition.description ?? "",
      location: audition.location ?? "",
      deadline: formatDateForInput(audition.audition_date),
      song_ids: auditionSongs.map((as) => as.song_id),
    });
  }, [open, audition?.id, audition?.role_name, audition?.description, audition?.location, audition?.audition_date, auditionSongs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audition || !form.role_name) {
      toast.error("Rol adı gereklidir");
      return;
    }
    try {
      await updateAudition.mutateAsync({
        id: audition.id,
        updates: {
          role_name: form.role_name,
          description: form.description || null,
          location: form.location || null,
          audition_date: form.deadline || null,
        },
        song_ids: form.song_ids.length ? form.song_ids : undefined,
      });
      toast.success("Seçme güncellendi");
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Güncellenirken hata oluştu");
    }
  };

  if (!audition) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Seçmeyi Düzenle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-role-name">Rol Adı *</Label>
            <Input
              id="edit-role-name"
              value={form.role_name}
              onChange={(e) => setForm({ ...form, role_name: e.target.value })}
              placeholder="Örn: Solo Vokal, Başrol vb."
              className="bg-muted/30 border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Açıklama</Label>
            <Textarea
              id="edit-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Seçme hakkında detaylı bilgi..."
              className="bg-muted/30 border-border"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-location">Konum</Label>
            <Input
              id="edit-location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Seçme yapılacak yer..."
              className="bg-muted/30 border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-deadline">Seçme Tarihi</Label>
            <Input
              id="edit-deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="bg-muted/30 border-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Music className="h-4 w-4 text-gold" />
              Repertuvardan şarkılar
            </Label>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-muted/20 p-2 space-y-0.5">
              {roots.length === 0 ? (
                <p className="text-xs text-muted-foreground">Repertuvarda ana şarkı yok.</p>
              ) : (
                roots.map((song) => {
                  const children = childrenByParent.get(song.id);
                  const hasMedley = (children?.length ?? 0) > 0;
                  return (
                    <div key={song.id}>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-2 py-1.5 text-sm">
                        <input
                          type="checkbox"
                          checked={form.song_ids.includes(song.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({ ...form, song_ids: [...form.song_ids, song.id] });
                            } else {
                              setForm({ ...form, song_ids: form.song_ids.filter((id) => id !== song.id) });
                            }
                          }}
                          className="accent-gold"
                        />
                        <span className="truncate flex-1">{song.title}</span>
                      </label>
                      {hasMedley && (
                        <div className="pl-6 pr-2 pb-1 space-y-0.5">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1 mb-0.5">
                            Medley parçaları (opsiyonel)
                          </p>
                          {children!.map((child) => (
                            <label
                              key={child.id}
                              className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-2 py-1 text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={form.song_ids.includes(child.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setForm({ ...form, song_ids: [...form.song_ids, child.id] });
                                  } else {
                                    setForm({ ...form, song_ids: form.song_ids.filter((id) => id !== child.id) });
                                  }
                                }}
                                className="accent-gold"
                              />
                              <span className="truncate text-muted-foreground">
                                {child.medley_position}. {child.title}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button
              type="submit"
              className="bg-gold text-gold-foreground hover:bg-gold/90"
              disabled={updateAudition.isPending}
            >
              {updateAudition.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Kaydet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
