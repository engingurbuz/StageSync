"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Theater, Star, Loader2, Pencil, Trash2 } from "lucide-react";
import { useAuditions, useCastRoles } from "@/hooks/use-auditions";
import { CreateAuditionDialog } from "@/components/dialogs/create-audition-dialog";
import { AuditionCard } from "@/components/audition-card";
import { EditCastRoleDialog } from "@/components/dialogs/edit-cast-role-dialog";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { checkPermission } from "@/lib/constants";
import type { CastRole } from "@/types/database";

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
  const [editingCastRole, setEditingCastRole] = useState<(CastRole & { profiles?: { full_name: string; voice_type: string | null } | null }) | null>(null);
  const [editCastOpen, setEditCastOpen] = useState(false);
  const canEditCast = checkPermission(profile, "secmeler", "edit", permissions);

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
            <div className="space-y-3">
              {auditions.map((audition) => (
                <AuditionCard key={audition.id} audition={audition} />
              ))}
            </div>
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
                <div className="space-y-2">
                  {castRoles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {role.role_type === "lead" && <Star className="h-4 w-4 text-gold fill-gold shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{role.role_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {role.profiles?.full_name || "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={typeStyles[role.role_type] || ""}>
                          {typeLabels[role.role_type] || role.role_type}
                        </Badge>
                        {canEditCast && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-gold"
                              onClick={() => {
                                setEditingCastRole(role);
                                setEditCastOpen(true);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                if (typeof window !== "undefined" && window.confirm("Bu kadro kaydını silmek istediğinize emin misiniz?")) {
                                  deleteCastRole.mutate(role.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
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
