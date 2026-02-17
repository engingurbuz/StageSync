"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Theater, Star, Loader2 } from "lucide-react";
import { useAuditions, useCastRoles } from "@/hooks/use-auditions";
import { CreateAuditionDialog } from "@/components/dialogs/create-audition-dialog";

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
  const { castRoles, isLoading: castLoading } = useCastRoles();

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

      <Tabs defaultValue="cast" className="space-y-4">
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
                <Card key={audition.id} className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{audition.role_name}</p>
                        <p className="text-xs text-muted-foreground">{audition.description}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {statusLabels[audition.status] || audition.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
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
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {role.role_type === "lead" && <Star className="h-4 w-4 text-gold fill-gold" />}
                        <div>
                          <p className="text-sm font-semibold text-foreground">{role.role_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {role.profiles?.full_name || "—"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={typeStyles[role.role_type] || ""}>
                        {typeLabels[role.role_type] || role.role_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
