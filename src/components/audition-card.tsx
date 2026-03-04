"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useAuditions, useAuditionSignups, useAuditionSongs, useCastRoles } from "@/hooks/use-auditions";
import { checkPermission, hasRole } from "@/lib/constants";
import { usePermissions } from "@/hooks/use-permissions";
import type { Audition } from "@/types/database";
import type { SignupSelection } from "@/types/database";
import { UserPlus, Loader2, Music, Users, Star, Calendar, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const statusLabels: Record<string, string> = {
  open: "Açık",
  closed: "Kapalı",
  in_review: "Değerlendirmede",
  completed: "Tamamlandı",
};

const selectionLabels: Record<string, string> = {
  lead: "Asil",
  understudy: "Yedek",
  not_selected: "Seçilmedi",
};

export function AuditionCard({
  audition,
  onEdit,
}: {
  audition: Audition & { productions?: { title: string } | null };
  onEdit?: (audition: Audition) => void;
}) {
  const { user, profile } = useAuth();
  const { permissions } = usePermissions();
  const { signups, isLoading: signupsLoading, addSignup, updateSignupSelection } = useAuditionSignups(audition.id);
  const { auditionSongs, isLoading: songsLoading } = useAuditionSongs(audition.id);
  const { addCastRole } = useCastRoles();
  const { deleteAudition } = useAuditions();
  const [transferring, setTransferring] = useState(false);

  const canApply = hasRole(profile, "member") || profile?.role === "member" || (profile?.roles?.includes("member") ?? false);
  const canManage = checkPermission(profile, "secmeler", "edit", permissions) ?? false;
  const hasApplied = user && signups.some((s) => s.member_id === user.id);

  const handleApply = async () => {
    if (!user) return;
    try {
      await addSignup.mutateAsync({
        audition_id: audition.id,
        member_id: user.id,
        notes: null,
        video_url: null,
        selected_role_type: null,
      });
      toast.success("Başvurunuz alındı");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Başvuru yapılamadı");
    }
  };

  const handleTransferToCast = async () => {
    const toTransfer = signups.filter(
      (s) => s.selected_role_type === "lead" || s.selected_role_type === "understudy"
    );
    if (toTransfer.length === 0) {
      toast.error("En az bir başvuru için Asil veya Yedek seçin.");
      return;
    }
    const firstSongId = auditionSongs.length > 0 ? (auditionSongs[0] as { song_id: string }).song_id : null;
    setTransferring(true);
    try {
      for (const s of toTransfer) {
        await addCastRole.mutateAsync({
          production_id: audition.production_id ?? null,
          song_id: firstSongId,
          member_id: s.member_id,
          role_name: audition.role_name,
          role_type: s.selected_role_type === "lead" ? "lead" : "understudy",
          notes: null,
        });
      }
      toast.success("Kadroya aktarıldı");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kadroya aktarılamadı");
    } finally {
      setTransferring(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{audition.role_name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{audition.description}</p>
            {audition.audition_date && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Seçme tarihi: {format(new Date(audition.audition_date), "d MMMM yyyy", { locale: tr })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-[10px]">
              {statusLabels[audition.status] || audition.status}
            </Badge>
            {canManage && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-gold"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(audition);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof window !== "undefined" && window.confirm("Bu seçmeyi silmek istediğinize emin misiniz? Başvurular da silinecektir.")) {
                      deleteAudition.mutate(audition.id);
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {auditionSongs.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Music className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Şarkılar:</span>
            {auditionSongs.map((as) => (
              <Badge key={as.id} variant="secondary" className="text-[10px]">
                {(as as { songs?: { title: string } }).songs?.title ?? as.song_id}
              </Badge>
            ))}
          </div>
        )}

        {signupsLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Başvurular yükleniyor...
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                Başvuranlar ({signups.length})
              </span>
              {audition.status === "open" && canApply && !hasApplied && (
                <Button
                  size="sm"
                  variant="default"
                  className="bg-gold text-gold-foreground hover:bg-gold/90"
                  onClick={handleApply}
                  disabled={addSignup.isPending}
                >
                  {addSignup.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5 mr-1" />}
                  Başvur
                </Button>
              )}
            </div>

            {signups.length > 0 && (
              <ul className="space-y-2">
                {signups.map((signup) => (
                  <li
                    key={signup.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-foreground truncate">
                      {(signup as { profiles?: { full_name: string } }).profiles?.full_name ?? signup.member_id}
                    </span>
                    {canManage && (
                      <Select
                        value={signup.selected_role_type ?? "not_selected"}
                        onValueChange={(v) =>
                          updateSignupSelection.mutateAsync({
                            id: signup.id,
                            selected_role_type: v === "not_selected" ? null : (v as SignupSelection),
                          })
                        }
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="lead">
                            <span className="flex items-center gap-1"><Star className="h-3 w-3" /> Asil</span>
                          </SelectItem>
                          <SelectItem value="understudy">Yedek</SelectItem>
                          <SelectItem value="not_selected">Seçilmedi</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {canManage && signups.some((s) => s.selected_role_type === "lead" || s.selected_role_type === "understudy") && (
              <Button
                size="sm"
                variant="outline"
                className="w-full border-gold/30 hover:bg-gold/10"
                onClick={handleTransferToCast}
                disabled={transferring}
              >
                {transferring ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Kadroya aktar
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
