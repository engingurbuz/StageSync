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
import { Plus, Loader2 } from "lucide-react";
import { useAnnouncements } from "@/hooks/use-announcements";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const priorityOptions = [
  { value: "0", label: "Normal" },
  { value: "1", label: "Önemli" },
  { value: "2", label: "Acil" },
];

export function NewAnnouncementDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "0",
    is_pinned: false,
  });
  const { addAnnouncement } = useAnnouncements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error("Başlık ve içerik gereklidir");
      return;
    }
    try {
      await addAnnouncement.mutateAsync({
        title: form.title,
        content: form.content,
        priority: parseInt(form.priority),
        is_pinned: form.is_pinned,
        author_id: user?.id || "",
      });
      toast.success("Duyuru başarıyla yayınlandı");
      setOpen(false);
      setForm({ title: "", content: "", priority: "0", is_pinned: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Duyuru yayınlanırken hata oluştu";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gold text-gold-foreground hover:bg-gold/90">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Duyuru
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Yeni Duyuru Yayınla</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ann-title">Başlık *</Label>
            <Input
              id="ann-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Duyuru başlığı"
              className="bg-muted/30 border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ann-content">İçerik *</Label>
            <Textarea
              id="ann-content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Duyuru detayları..."
              className="bg-muted/30 border-border"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Öncelik</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v })}
              >
                <SelectTrigger className="bg-muted/30 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {priorityOptions.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <input
                type="checkbox"
                id="pinned"
                checked={form.is_pinned}
                onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
                className="accent-gold"
              />
              <Label htmlFor="pinned" className="cursor-pointer">Sabitle</Label>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
            disabled={addAnnouncement.isPending}
          >
            {addAnnouncement.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Duyuru Yayınla
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
