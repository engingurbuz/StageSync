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
import { Loader2 } from "lucide-react";
import { useMembers } from "@/hooks/use-members";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { Profile } from "@/types/database";
import {
  VOICE_TYPES,
  USER_ROLES,
  MEMBER_STATUSES,
  canEditVoiceType,
  canEditRole,
  canEditMemberStatus,
  VOICE_TYPE_LABELS,
  ROLE_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";

interface EditMemberDialogProps {
  member: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMemberDialog({ member, open, onOpenChange }: EditMemberDialogProps) {
  const { profile: currentUser } = useAuth();
  const { updateMember } = useMembers();
  
  const [voiceType, setVoiceType] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Yetki kontrolleri
  const canEditVoice = canEditVoiceType(currentUser?.role);
  const canEditUserRole = canEditRole(currentUser?.role);
  const canEditStatus = canEditMemberStatus(currentUser?.role);

  useEffect(() => {
    if (member) {
      setVoiceType(member.voice_type || "");
      setRole(member.role || "member");
      setStatus(member.status || "active");
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setSaving(true);
    try {
      const updates: Partial<Profile> = {};
      
      if (canEditVoice && voiceType !== (member.voice_type || "")) {
        updates.voice_type = voiceType as Profile["voice_type"] || null;
      }
      if (canEditUserRole && role !== member.role) {
        updates.role = role as Profile["role"];
      }
      if (canEditStatus && status !== member.status) {
        updates.status = status as Profile["status"];
      }

      if (Object.keys(updates).length === 0) {
        toast.info("Değişiklik yapılmadı");
        onOpenChange(false);
        return;
      }

      await updateMember.mutateAsync({ id: member.id, ...updates });
      toast.success("Üye bilgileri güncellendi");
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Güncelleme sırasında hata oluştu";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (!member) return null;

  const hasAnyPermission = canEditVoice || canEditUserRole || canEditStatus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {member.full_name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{member.email}</p>
        </DialogHeader>

        {!hasAnyPermission ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Bu üyeyi düzenleme yetkiniz bulunmuyor.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ses Tipi */}
            <div className="space-y-2">
              <Label>Ses Tipi</Label>
              {canEditVoice ? (
                <Select value={voiceType} onValueChange={setVoiceType}>
                  <SelectTrigger className="bg-muted/30 border-border">
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Belirlenmemiş</SelectItem>
                    {VOICE_TYPES.map((vt) => (
                      <SelectItem key={vt.value} value={vt.value}>
                        {vt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="px-3 py-2 bg-muted/30 border border-border rounded-md text-sm text-muted-foreground">
                  {VOICE_TYPE_LABELS[member.voice_type || ""] || "Belirlenmemiş"}
                </div>
              )}
              {!canEditVoice && (
                <p className="text-xs text-muted-foreground">
                  Ses tipini sadece admin, koro şefi ve partisyon şefleri değiştirebilir.
                </p>
              )}
            </div>

            {/* Rol */}
            <div className="space-y-2">
              <Label>Rol</Label>
              {canEditUserRole ? (
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-muted/30 border-border">
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="px-3 py-2 bg-muted/30 border border-border rounded-md text-sm text-muted-foreground">
                  {ROLE_LABELS[member.role] || member.role}
                </div>
              )}
              {!canEditUserRole && (
                <p className="text-xs text-muted-foreground">
                  Rolü sadece admin ve koro şefi değiştirebilir.
                </p>
              )}
            </div>

            {/* Durum */}
            <div className="space-y-2">
              <Label>Durum</Label>
              {canEditStatus ? (
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-muted/30 border-border">
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBER_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="px-3 py-2 bg-muted/30 border border-border rounded-md text-sm text-muted-foreground">
                  {STATUS_LABELS[member.status] || member.status}
                </div>
              )}
            </div>

            {/* Kaydet butonu */}
            <div className="flex justify-end gap-2 pt-2">
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
                disabled={saving}
                className="bg-gold text-gold-foreground hover:bg-gold/90"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kaydet
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
