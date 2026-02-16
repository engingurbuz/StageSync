"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Play, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddSongDialog } from "@/components/dialogs/add-song-dialog";
import { useSongs } from "@/hooks/use-songs";

const voiceLabels: Record<string, string> = {
  soprano: "Soprano",
  mezzo_soprano: "Mezzo Soprano",
  alto: "Alto",
  tenor: "Tenor",
  baritone: "Bariton",
  bass: "Bas",
};

export default function RepertoirePage() {
  const { songs, isLoading } = useSongs();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Repertuvar & Kütüphane</h1>
          <p className="text-sm text-muted-foreground">
            Şarkılara, notalara ve çalışma kayıtlarına göz atın.
          </p>
        </div>
        <AddSongDialog />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-12">
          <Music className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">
            Henüz şarkı eklenmemiş. İlk şarkıyı ekleyin!
          </p>
        </div>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Başlık</TableHead>
                  <TableHead className="text-muted-foreground">Besteci</TableHead>
                  <TableHead className="text-muted-foreground hidden md:table-cell">Ses Grupları</TableHead>
                  <TableHead className="text-muted-foreground hidden sm:table-cell">Zorluk</TableHead>
                  <TableHead className="text-muted-foreground text-right">Dosyalar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {songs.map((song) => (
                  <TableRow key={song.id} className="border-border hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-gold" />
                        {song.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{song.composer || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(song.voice_parts || []).map((part) => (
                          <Badge key={part} variant="outline" className="border-gold/20 text-gold text-[10px]">
                            {voiceLabels[part] || part}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-2 rounded-full ${
                              i < (song.difficulty || 0) ? "bg-gold" : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {song.sheet_music_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-gold"
                            onClick={() => window.open(song.sheet_music_url!, "_blank")}
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {song.audio_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-gold"
                            onClick={() => window.open(song.audio_url!, "_blank")}
                          >
                            <Play className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {!song.sheet_music_url && !song.audio_url && (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/30" disabled>
                              <FileText className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/30" disabled>
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
