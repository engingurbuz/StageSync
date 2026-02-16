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
import { useTasks } from "@/hooks/use-tasks";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const categories = [
  { value: "costume", label: "Kostüm" },
  { value: "choreography", label: "Koreografi" },
  { value: "staging", label: "Sahneleme" },
  { value: "lighting", label: "Işık" },
  { value: "sound", label: "Ses" },
  { value: "props", label: "Aksesuar" },
  { value: "marketing", label: "Pazarlama" },
  { value: "general", label: "Genel" },
];

const priorities = [
  { value: "0", label: "Düşük" },
  { value: "1", label: "Orta" },
  { value: "2", label: "Yüksek" },
];

export function NewTaskDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "general",
    priority: "1",
    due_date: "",
  });
  const { addTask, tasks } = useTasks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) {
      toast.error("Görev başlığı gereklidir");
      return;
    }
    try {
      await addTask.mutateAsync({
        title: form.title,
        description: form.description || null,
        category: form.category as "costume" | "choreography" | "staging" | "lighting" | "sound" | "props" | "marketing" | "general",
        status: "todo",
        priority: parseInt(form.priority),
        position: tasks.length,
        production_id: null,
        assigned_to: null,
        due_date: form.due_date || null,
        created_by: user?.id || "",
      });
      toast.success("Görev başarıyla oluşturuldu");
      setOpen(false);
      setForm({ title: "", description: "", category: "general", priority: "1", due_date: "" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Görev oluşturulurken hata oluştu";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gold text-gold-foreground hover:bg-gold/90">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Görev
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Yeni Görev Oluştur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Görev Başlığı *</Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Örn: Kostüm eskizleri çiz"
              className="bg-muted/30 border-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="bg-muted/30 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="due-date">Son Tarih</Label>
            <Input
              id="due-date"
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="bg-muted/30 border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc">Açıklama</Label>
            <Textarea
              id="task-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Görev detayları..."
              className="bg-muted/30 border-border"
              rows={3}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
            disabled={addTask.isPending}
          >
            {addTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Görev Oluştur
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
