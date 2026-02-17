"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Users, CheckCircle, Clock, BarChart3 } from "lucide-react";
import { useForms } from "@/hooks/use-forms";
import { useMembers } from "@/hooks/use-members";
import { VOICE_TYPE_LABELS, ROLE_LABELS } from "@/lib/constants";
import type { Form, FormResponse } from "@/types/database";

interface FormResultsDialogProps {
  form: Form | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormResultsDialog({ form, open, onOpenChange }: FormResultsDialogProps) {
  const { useForm, useFormResponses } = useForms();
  const { members } = useMembers();
  const { data: formWithQuestions, isLoading: loadingForm } = useForm(form?.id || null);
  const { data: responses, isLoading: loadingResponses } = useFormResponses(form?.id || null);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!form || !responses || !members) return null;

    // Determine target users based on form target
    let targetUsers = members;
    if (form.target === "member") {
      targetUsers = members.filter((m) => m.role === "member");
    } else if (form.target === "section_leader") {
      targetUsers = members.filter((m) => m.role === "section_leader");
    } else if (form.target === "specific" && form.target_roles?.length) {
      targetUsers = members.filter((m) => form.target_roles.includes(m.role));
    }

    const totalTarget = targetUsers.length;
    const totalResponses = responses.length;
    const completionRate = totalTarget > 0 ? (totalResponses / totalTarget) * 100 : 0;

    // Users who haven't responded
    const respondedUserIds = new Set(responses.map((r) => r.user_id));
    const pendingUsers = targetUsers.filter((u) => !respondedUserIds.has(u.id));

    return {
      totalTarget,
      totalResponses,
      completionRate,
      pendingUsers,
      respondedUsers: responses.map((r) => r.profiles),
    };
  }, [form, responses, members]);

  // Calculate question statistics
  const questionStats = useMemo(() => {
    if (!formWithQuestions?.questions || !responses) return {};

    const stats: Record<string, { counts: Record<string, number>; total: number }> = {};

    formWithQuestions.questions.forEach((question) => {
      const counts: Record<string, number> = {};
      let total = 0;

      responses.forEach((response) => {
        const answer = response.answers[question.id];
        if (answer !== undefined && answer !== null && answer !== "") {
          total++;
          
          if (Array.isArray(answer)) {
            // Multiselect
            answer.forEach((val) => {
              counts[val] = (counts[val] || 0) + 1;
            });
          } else if (typeof answer === "boolean") {
            const key = answer ? "Evet" : "Hayır";
            counts[key] = (counts[key] || 0) + 1;
          } else {
            // For select/radio, count each option
            if (question.question_type === "select" || question.question_type === "radio") {
              counts[String(answer)] = (counts[String(answer)] || 0) + 1;
            }
          }
        }
      });

      stats[question.id] = { counts, total };
    });

    return stats;
  }, [formWithQuestions, responses]);

  if (!form) return null;

  const isLoading = loadingForm || loadingResponses;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-foreground">{form.title} - Sonuçlar</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="bg-muted/50 border border-border">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
                <BarChart3 className="mr-2 h-4 w-4" />
                Genel Bakış
              </TabsTrigger>
              <TabsTrigger value="responses" className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
                <CheckCircle className="mr-2 h-4 w-4" />
                Yanıtlar
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
                <Clock className="mr-2 h-4 w-4" />
                Bekleyenler
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="overview" className="m-0 space-y-4">
                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-border bg-muted/20">
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-gold">{stats?.totalResponses || 0}</div>
                      <p className="text-xs text-muted-foreground">Yanıt Sayısı</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border bg-muted/20">
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-foreground">{stats?.totalTarget || 0}</div>
                      <p className="text-xs text-muted-foreground">Hedef Kişi</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border bg-muted/20">
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-green-500">
                        %{stats?.completionRate.toFixed(0) || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Tamamlanma</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Doldurma Oranı</span>
                    <span className="text-foreground font-medium">
                      {stats?.totalResponses || 0} / {stats?.totalTarget || 0}
                    </span>
                  </div>
                  <Progress value={stats?.completionRate || 0} className="h-2" />
                </div>

                {/* Question statistics */}
                {formWithQuestions?.questions.map((question) => {
                  const qStats = questionStats[question.id];
                  const hasStats = qStats && Object.keys(qStats.counts).length > 0;
                  const isCountable = ["select", "radio", "multiselect", "checkbox"].includes(
                    question.question_type
                  );

                  if (!isCountable) return null;

                  return (
                    <Card key={question.id} className="border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                          {question.question_text}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {hasStats ? (
                          <div className="space-y-2">
                            {Object.entries(qStats.counts)
                              .sort((a, b) => b[1] - a[1])
                              .map(([value, count]) => {
                                const label =
                                  question.options.find((o) => o.value === value)?.label || value;
                                const percentage = qStats.total > 0 ? (count / qStats.total) * 100 : 0;

                                return (
                                  <div key={value} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">{label}</span>
                                      <span className="text-foreground">
                                        {count} (%{percentage.toFixed(0)})
                                      </span>
                                    </div>
                                    <Progress value={percentage} className="h-1.5" />
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Henüz yanıt yok</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="responses" className="m-0 space-y-2">
                {responses?.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground/30" />
                    <p className="mt-3 text-sm text-muted-foreground">Henüz yanıt yok</p>
                  </div>
                ) : (
                  responses?.map((response) => (
                    <Card key={response.id} className="border-border">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {response.profiles?.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{response.profiles?.email}</p>
                          </div>
                          <div className="flex gap-2">
                            {response.profiles?.voice_type && (
                              <Badge variant="outline" className="border-gold/30 text-gold text-[10px]">
                                {VOICE_TYPE_LABELS[response.profiles.voice_type]}
                              </Badge>
                            )}
                            <Badge variant="outline" className="border-border text-[10px]">
                              {ROLE_LABELS[response.profiles?.role || "member"]}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(response.submitted_at).toLocaleString("tr-TR")}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="pending" className="m-0 space-y-2">
                {stats?.pendingUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500/30" />
                    <p className="mt-3 text-sm text-muted-foreground">Herkes formu doldurmuş!</p>
                  </div>
                ) : (
                  stats?.pendingUsers.map((user) => (
                    <Card key={user.id} className="border-border">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          <div className="flex gap-2">
                            {user.voice_type && (
                              <Badge variant="outline" className="border-gold/30 text-gold text-[10px]">
                                {VOICE_TYPE_LABELS[user.voice_type]}
                              </Badge>
                            )}
                            <Badge variant="outline" className="border-border text-[10px]">
                              {ROLE_LABELS[user.role]}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
