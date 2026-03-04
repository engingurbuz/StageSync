"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Theater, Star, Loader2, Pencil, Trash2, Music2 } from "lucide-react";
import { useAuditions, useCastRoles } from "@/hooks/use-auditions";
import { CreateAuditionDialog } from "@/components/dialogs/create-audition-dialog";
import { AuditionCard } from "@/components/audition-card";
import { EditAuditionDialog } from "@/components/dialogs/edit-audition-dialog";
import { EditCastRoleDialog } from "@/components/dialogs/edit-cast-role-dialog";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { checkPermission } from "@/lib/constants";
import type { Audition, CastRole, CastRoleType } from "@/types/database";

const typeLabels: Record<string, string> = {
  lead: "Başrol",
  understudy: "Yedek",
  ensemble: "Topluluk",
  swing: "Swing",
};

const typeStyles: Record<string, string> = {
  lead: "bg-gold/10 text-gold border-gold/30",
  understudy: "bg-velvet/10 text-velvet border-velvet/30",
  ensemble: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  swing: "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

type CastRoleWithProfile = CastRole & {
  profiles?: { full_name: string; voice_type: string | null } | null;
  songs?: { title: string } | null;
};

type RoleGroup = {
  lead: CastRoleWithProfile[];
  understudy: CastRoleWithProfile[];
  ensemble: CastRoleWithProfile[];
  swing: CastRoleWithProfile[];
};

function groupCastBySongAndRole(roles: CastRoleWithProfile[]): { songTitle: string; roleName: string; group: RoleGroup }[] {
  const bySongAndRole = new Map<string, RoleGroup>();
  const keys: { songTitle: string; roleName: string }[] = [];
  for (const r of roles) {
    const songTitle = (r as { songs?: { title: string } }).songs?.title?.trim() || "Şarkı belirtilmemiş";
    const roleName = r.role_name || "—";
    const key = `${songTitle}\n${roleName}`;
    if (!bySongAndRole.has(key)) {
      bySongAndRole.set(key, { lead: [], understudy: [], ensemble: [], swing: [] });
      keys.push({ songTitle, roleName });
    }
    const group = bySongAndRole.get(key)!;
    if (r.role_type === "lead") group.lead.push(r);
    else if (r.role_type === "understudy") group.understudy.push(r);
    else if (r.role_type === "ensemble") group.ensemble.push(r);
    else if (r.role_type === "swing") group.swing.push(r);
  }
  keys.sort((a, b) => {
    const c = a.songTitle.localeCompare(b.songTitle, "tr");
    return c !== 0 ? c : a.roleName.localeCompare(b.roleName, "tr");
  });
  return keys.map(({ songTitle, roleName }) => ({
    songTitle,
    roleName,
    group: bySongAndRole.get(`${songTitle}\n${roleName}`)!,
  }));
}

const ROLE_TYPE_SECTIONS: { key: CastRoleType; label: string }[] = [
  { key: "lead", label: "Asiller" },
  { key: "understudy", label: "Yedekler" },
  { key: "ensemble", label: "Topluluk" },
  { key: "swing", label: "Swing" },
];

const statusLabels: Record<string, string> = {
  open: "Açık",
  closed: "Kapalı",
  in_review: "Değerlendirmede",
  completed: "Tamamlandı",
};

export default function AuditionsPage() {
  const { auditions, isLoading: auditionsLoading } = useAuditions();
  const { castRoles, isLoading: castLoading, deleteCastRole } = useCastRoles();
  const { profile } = useAuth();
  const { permissions } = usePermissions();
  const [editingAudition, setEditingAudition] = useState<Audition | null>(null);
  const [editingCastRole, setEditingCastRole] = useState<(CastRole & { profiles?: { full_name: string; voice_type: string | null } | null }) | null>(null);
  const [editCastOpen, setEditCastOpen] = useState(false);
  const canEditCast = checkPermission(profile, "secmeler", "edit", permissions);
  const castGroupedBySongAndRole = useMemo(
    () => groupCastBySongAndRole(castRoles as CastRoleWithProfile[]),
    [castRoles]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Seçmeler & Kadro</h1>
          <p className="text-sm text-muted-foreground">
            Seçme zamanlarını yönetin ve kadro atamalarını görüntüleyin.
          </p>
        </div>
        <CreateAuditionDialog />
      </div>

      <Tabs defaultValue="auditions" className="space-y-4">
        <TabsList className="bg-muted/50 border border-border">
          <TabsTrigger value="auditions" className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
            Açık Seçmeler
            {auditions.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-gold/10 text-gold text-[10px]">
                {auditions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cast" className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
            Kadro Listesi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auditions">
          {auditionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : auditions.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">
                  Şu anda açık seçme bulunmuyor. Başlamak için yeni bir seçme oluşturun.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {auditions.map((audition) => (
                  <AuditionCard
                    key={audition.id}
                    audition={audition}
                    onEdit={(a) => setEditingAudition(a)}
                  />
                ))}
              </div>
              <EditAuditionDialog
                audition={editingAudition}
                open={!!editingAudition}
                onOpenChange={(open) => !open && setEditingAudition(null)}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="cast">
          {castLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : castRoles.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-6 text-center">
                <Theater className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Henüz kadro ataması yapılmamış.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Theater className="h-5 w-5 text-gold" />
                  Kadro Listesi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {castGroupedBySongAndRole.map(({ songTitle, roleName, group }) => (
                    <div key={`${songTitle}-${roleName}`} className="rounded-xl border border-border bg-muted/20 overflow-hidden">
                      <div className="px-4 py-3 bg-muted/40 border-b border-border space-y-1">
                        <div className="flex items-center gap-2">
                          <Music2 className="h-4 w-4 text-gold" />
                          <span className="text-sm font-medium text-muted-foreground">{songTitle}</span>
                        </div>
                        <h3 className="font-semibold text-foreground pl-6">{roleName}</h3>
                      </div>
                      <div className="p-3 space-y-4">
                        {ROLE_TYPE_SECTIONS.map(({ key, label }) => {
                          const list = group[key as keyof RoleGroup];
                          if (!list?.length) return null;
                          return (
                            <div key={key}>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                {label}
                              </p>
                              <ul className="space-y-1.5">
                                {list.map((role) => (
                                  <li
                                    key={role.id}
                                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 hover:bg-muted/30 transition-colors"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      {role.role_type === "lead" && (
                                        <Star className="h-3.5 w-3.5 text-gold fill-gold shrink-0" />
                                      )}
                                      <span className="text-sm text-foreground truncate">
                                        {role.profiles?.full_name || "—"}
                                      </span>
                                    </div>
                                    {canEditCast && (
                                      <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 text-muted-foreground hover:text-gold"
                                          onClick={() => {
                                            setEditingCastRole(role);
                                            setEditCastOpen(true);
                                          }}
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                          onClick={() => {
                                            if (typeof window !== "undefined" && window.confirm("Bu kadro kaydını silmek istediğinize emin misiniz?")) {
                                              deleteCastRole.mutate(role.id);
                                            }
                                          }}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <EditCastRoleDialog
              role={editingCastRole}
              open={editCastOpen}
              onOpenChange={(open) => {
                setEditCastOpen(open);
                if (!open) setEditingCastRole(null);
              }}
            />
          </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
