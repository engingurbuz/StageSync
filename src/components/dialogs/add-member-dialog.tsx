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
import { Users, Loader2 } from "lucide-react";
import { useMembers } from "@/hooks/use-members";
import { toast } from "sonner";

const voiceTypes = [
  { value: "soprano", label: "Soprano" },
  { value: "mezzo_soprano", label: "Mezzo Soprano" },
  { value: "alto", label: "Alto" },
  { value: "tenor", label: "Tenor" },
  { value: "baritone", label: "Bariton" },
  { value: "bass", label: "Bas" },
];

const roles = [
  { value: "member", label: "Üye" },
  { value: "section_leader", label: "Grup Lideri" },
  { value: "creative_team", label: "Yaratıcı Ekip" },
  { value: "admin", label: "Yönetici" },
];

export function AddMemberDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    voice_type: "",
    role: "member",
  });
  const { addMember } = useMembers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email) {
      toast.error("Ad ve e-posta gereklidir");
      return;
    }
    try {
      await addMember.mutateAsync({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || undefined,
        voice_type: form.voice_type || undefined,
        role: form.role,
      });
      toast.success("Üye başarıyla eklendi");
      setOpen(false);
      setForm({ full_name: "", email: "", phone: "", voice_type: "", role: "member" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Üye eklenirken hata oluştu";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gold text-gold-foreground hover:bg-gold/90">
          <Users className="mr-2 h-4 w-4" />
          Üye Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Yeni Üye Ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Ad Soyad *</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Örn: Aylin Yılmaz"
              className="bg-muted/30 border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-posta *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="ornek@email.com"
              className="bg-muted/30 border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0555 123 4567"
              className="bg-muted/30 border-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Ses Grubu</Label>
              <Select
                value={form.voice_type}
                onValueChange={(v) => setForm({ ...form, voice_type: v })}
              >
                <SelectTrigger className="bg-muted/30 border-border">
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {voiceTypes.map((vt) => (
                    <SelectItem key={vt.value} value={vt.value}>
                      {vt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v })}
              >
                <SelectTrigger className="bg-muted/30 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
            disabled={addMember.isPending}
          >
            {addMember.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Üye Ekle
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
