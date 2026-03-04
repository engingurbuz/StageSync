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
import { useAttendance } from "@/hooks/use-events";
import { useMembers } from "@/hooks/use-members";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { Event } from "@/types/database";
import type { AttendanceStatus } from "@/types/database";

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: "present", label: "Katıldı" },
  { value: "absent", label: "Gelmedi" },
  { value: "late", label: "Gecikti" },
  { value: "excused", label: "İzinli" },
];

interface AttendanceEntryDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttendanceEntryDialog({
  event,
  open,
  onOpenChange,
}: AttendanceEntryDialogProps) {
  const { user } = useAuth();
  const { members } = useMembers();
  const activeMembers = members.filter((m) => m.status === "active");
  const { attendance, markAttendance, isLoading } = useAttendance(
    event?.id ?? undefined
  );
  const [localStatus, setLocalStatus] = useState<Record<string, AttendanceStatus>>({});

  useEffect(() => {
    const map: Record<string, AttendanceStatus> = {};
    activeMembers.forEach((m) => {
      const rec = attendance?.find((a) => a.member_id === m.id);
      map[m.id] = rec?.status ?? "absent";
    });
    setLocalStatus(map);
  }, [event?.id, activeMembers, attendance]);

  const handleSave = async () => {
    if (!event || !user) return;
    try {
      await Promise.all(
        activeMembers.map((m) =>
          markAttendance.mutateAsync({
            event_id: event.id,
            member_id: m.id,
            status: localStatus[m.id] ?? "absent",
            notes: null,
            marked_by: user.id,
          })
        )
      );
      toast.success("Yoklama kaydedildi");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Yoklama kaydedilemedi");
    }
  };

  const pending = markAttendance.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Yoklama girişi — {event?.title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gold" />
            </div>
          ) : (
            activeMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 p-2"
              >
                <span className="text-sm font-medium text-foreground truncate">
                  {member.full_name}
                </span>
                <Select
                  value={localStatus[member.id] ?? "absent"}
                  onValueChange={(v) =>
                    setLocalStatus((prev) => ({
                      ...prev,
                      [member.id]: v as AttendanceStatus,
                    }))
                  }
                >
                  <SelectTrigger className="w-[140px] bg-muted/30 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            className="bg-gold text-gold-foreground hover:bg-gold/90"
            onClick={handleSave}
            disabled={pending || isLoading}
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kaydet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
