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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Music } from "lucide-react";
import { useAuditions } from "@/hooks/use-auditions";
import { useSongs } from "@/hooks/use-songs";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { checkPermission } from "@/lib/constants";
import { toast } from "sonner";

export function CreateAuditionDialog() {
  const [open, setOpen] = useState(false);
  const { user, profile } = useAuth();
  const { permissions } = usePermissions();
  const { addAudition } = useAuditions();
  const [form, setForm] = useState({
    role_name: "",
    description: "",
    location: "",
    deadline: "",
    song_ids: [] as string[],
  });
  const { songs } = useSongs();

  // Yetki kontrolü: seçmeler bölümünde oluşturma yetkisi
  const canCreate = checkPermission(profile, "secmeler", "create", permissions);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role_name) {
      toast.error("Rol adı gereklidir");
      return;
    }

    try {
      await addAudition.mutateAsync({
        audition: {
          role_name: form.role_name,
          description: form.description || null,
          location: form.location || null,
          audition_date: form.deadline || null,
          status: "open",
          production_id: null,
          voice_required: null,
          max_slots: null,
          created_by: user?.id ?? null,
        },
        song_ids: form.song_ids.length ? form.song_ids : undefined,
      });
      toast.success("Seçme başarıyla oluşturuldu");
      setOpen(false);
      setForm({ role_name: "", description: "", location: "", deadline: "", song_ids: [] });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Seçme oluşturulurken hata oluştu";
      toast.error(message);
    }
  };

  if (!canCreate) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gold text-gold-foreground hover:bg-gold/90">
          <Plus className="mr-2 h-4 w-4" />
          Seçme Oluştur
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Yeni Seçme Oluştur</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Yeni bir seçme/deneme açın.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Rol Adı *</Label>
            <Input
              id="role-name"
              value={form.role_name}
              onChange={(e) => setForm({ ...form, role_name: e.target.value })}
              placeholder="Örn: Solo Vokal, Başrol vb."
              className="bg-muted/30 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Seçme hakkında detaylı bilgi..."
              className="bg-muted/30 border-border"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Konum</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Seçme yapılacak yer..."
              className="bg-muted/30 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Seçme Tarihi</Label>
            <Input
              id="deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="bg-muted/30 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Music className="h-4 w-4 text-gold" />
              Repertuvardan şarkılar (bu seçme hangi şarkılar için?)
            </Label>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-muted/20 p-2 space-y-1">
              {songs.length === 0 ? (
                <p className="text-xs text-muted-foreground">Repertuvarda şarkı yok.</p>
              ) : (
                songs.map((song) => (
                  <label
                    key={song.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-2 py-1 text-sm"
                  >
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
                    <span className="truncate">{song.title}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
            disabled={addAudition.isPending}
          >
            {addAudition.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Seçme Oluştur
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
