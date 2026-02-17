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
import { Plus, Loader2, Calendar } from "lucide-react";
import { useAuditions } from "@/hooks/use-auditions";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function CreateAuditionDialog() {
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();
  const { addAudition } = useAuditions();
  const [form, setForm] = useState({
    role_name: "",
    description: "",
    location: "",
    deadline: "",
  });

  // Sadece admin ve koro şefi seçme oluşturabilir
  const canCreate = profile?.role === "admin" || profile?.role === "creative_team";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role_name) {
      toast.error("Rol adı gereklidir");
      return;
    }

    try {
      await addAudition.mutateAsync({
        role_name: form.role_name,
        description: form.description || null,
        location: form.location || null,
        audition_date: form.deadline || null,
        status: "open",
        production_id: null,
        voice_required: null,
        max_slots: null,
        created_by: null,
      });
      toast.success("Seçme başarıyla oluşturuldu");
      setOpen(false);
      setForm({ role_name: "", description: "", location: "", deadline: "" });
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
