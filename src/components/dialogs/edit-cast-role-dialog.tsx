"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMembers } from "@/hooks/use-members";
import { useCastRoles } from "@/hooks/use-auditions";
import type { CastRole } from "@/types/database";
import type { CastRoleType } from "@/types/database";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const ROLE_TYPES: { value: CastRoleType; label: string }[] = [
  { value: "lead", label: "Asil / Başrol" },
  { value: "understudy", label: "Yedek" },
  { value: "ensemble", label: "Topluluk" },
  { value: "swing", label: "Swing" },
];

type CastRoleWithProfile = CastRole & {
  profiles?: { full_name: string; voice_type: string | null } | null;
};

export function EditCastRoleDialog({
  role,
  open,
  onOpenChange,
}: {
  role: CastRoleWithProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [memberId, setMemberId] = useState<string>("");
  const [roleType, setRoleType] = useState<CastRoleType>("lead");
  const { members } = useMembers();
  const { updateCastRole } = useCastRoles();

  useEffect(() => {
    if (role) {
      setMemberId(role.member_id);
      setRoleType(role.role_type);
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    try {
      await updateCastRole.mutateAsync({
        id: role.id,
        updates: { member_id: memberId, role_type: roleType },
      });
      toast.success("Kadro güncellendi");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Güncellenemedi");
    }
  };

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Kadro Düzenle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Rol</Label>
            <p className="text-sm font-medium text-foreground">{role.role_name}</p>
          </div>
          <div className="space-y-2">
            <Label>Üye</Label>
            <Select value={memberId} onValueChange={setMemberId}>
              <SelectTrigger className="bg-muted/30 border-border">
                <SelectValue placeholder="Üye seçin" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.full_name || m.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tip (Asil / Yedek / …)</Label>
            <Select value={roleType} onValueChange={(v) => setRoleType(v as CastRoleType)}>
              <SelectTrigger className="bg-muted/30 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {ROLE_TYPES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" className="bg-gold text-gold-foreground hover:bg-gold/90" disabled={updateCastRole.isPending}>
              {updateCastRole.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Kaydet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
