"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GripVertical, Calendar, Loader2 } from "lucide-react";
import { useTasks, useMeetingNotes } from "@/hooks/use-tasks";
import { NewTaskDialog } from "@/components/dialogs/new-task-dialog";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const columnConfig = [
  { id: "todo" as const, title: "Yapılacak", color: "border-muted-foreground/30" },
  { id: "in_progress" as const, title: "Devam Eden", color: "border-gold/50" },
  { id: "review" as const, title: "İnceleme", color: "border-purple-500/50" },
  { id: "done" as const, title: "Tamamlandı", color: "border-green-500/50" },
];

const categoryColors: Record<string, string> = {
  costume: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  choreography: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  staging: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  lighting: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  sound: "bg-green-500/10 text-green-400 border-green-500/30",
  props: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  marketing: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  general: "bg-muted text-muted-foreground border-muted-foreground/30",
};

const categoryLabels: Record<string, string> = {
  costume: "Kostüm",
  choreography: "Koreografi",
  staging: "Sahneleme",
  lighting: "Işık",
  sound: "Ses",
  props: "Aksesuar",
  marketing: "Pazarlama",
  general: "Genel",
};

const priorityLabels: Record<number, string> = {
  0: "Düşük",
  1: "Orta",
  2: "Yüksek",
};

export default function CreativePage() {
  const { columns, isLoading: tasksLoading } = useTasks();
  const { notes, isLoading: notesLoading } = useMeetingNotes();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Yaratıcı Çalışma Alanı</h1>
          <p className="text-sm text-muted-foreground">
            Yaratıcı görevleri ve toplantı notlarını yönetin.
          </p>
        </div>
        <NewTaskDialog />
      </div>

      <Tabs defaultValue="board" className="space-y-4">
        <TabsList className="bg-muted/50 border border-border">
          <TabsTrigger value="board" className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
            Görev Panosu
          </TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
            Toplantı Notları
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          {tasksLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {columnConfig.map((col) => {
                const tasks = columns[col.id] || [];
                return (
                  <div key={col.id} className="space-y-3">
                    <div className={`flex items-center justify-between rounded-lg border-l-4 ${col.color} bg-muted/30 px-4 py-2`}>
                      <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px]">
                        {tasks.length}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {tasks.length === 0 ? (
                        <p className="text-xs text-muted-foreground/50 text-center py-4">Görev yok</p>
                      ) : (
                        tasks.map((task) => (
                          <Card key={task.id} className="border-border bg-card hover:border-gold/30 transition-colors cursor-pointer">
                            <CardContent className="p-3 space-y-2">
                              <div className="flex items-start gap-2">
                                <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
                                <p className="text-sm font-medium text-foreground">{task.title}</p>
                              </div>
                              <div className="flex items-center justify-between pl-6">
                                <div className="flex gap-1.5">
                                  {task.category && (
                                    <Badge variant="outline" className={(categoryColors[task.category] || categoryColors.general) + " text-[10px]"}>
                                      {categoryLabels[task.category] || task.category}
                                    </Badge>
                                  )}
                                  {(task.priority ?? 0) >= 2 && (
                                    <Badge variant="outline" className="border-red-500/30 text-red-400 text-[10px]">
                                      Yüksek
                                    </Badge>
                                  )}
                                </div>
                                {task.profiles?.full_name && (
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-velvet text-[10px] font-bold text-velvet-foreground" title={task.profiles.full_name}>
                                    {task.profiles.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes">
          {notesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : notes.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-6 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Henüz toplantı notu yok.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <Card key={note.id} className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-foreground">
                      <span className="text-sm font-semibold">{note.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(note.meeting_date), "d MMMM yyyy", { locale: tr })}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
