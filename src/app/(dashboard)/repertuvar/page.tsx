"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Play, FileText, Loader2, Music2 } from "lucide-react";
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
import { EditSongDialog } from "@/components/dialogs/edit-song-dialog";
import { useSongs } from "@/hooks/use-songs";
import type { Song } from "@/types/database";

type RowItem = { song: Song; isMedleyPart: boolean };

function buildOrderedRows(songs: Song[]): RowItem[] {
  const roots = songs
    .filter((s) => !s.parent_song_id)
    .sort((a, b) => a.title.localeCompare(b.title, "tr"));
  const byParent = new Map<string, Song[]>();
  for (const s of songs) {
    if (s.parent_song_id) {
      const list = byParent.get(s.parent_song_id) ?? [];
      list.push(s);
      byParent.set(s.parent_song_id, list);
    }
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => (a.medley_position ?? 0) - (b.medley_position ?? 0));
  }
  const rows: RowItem[] = [];
  for (const root of roots) {
    rows.push({ song: root, isMedleyPart: false });
    const children = byParent.get(root.id);
    if (children?.length) {
      for (const child of children) {
        rows.push({ song: child, isMedleyPart: true });
      }
    }
  }
  return rows;
}

export default function RepertoirePage() {
  const { songs, isLoading } = useSongs();
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const orderedRows = useMemo(() => buildOrderedRows(songs), [songs]);

  const handleSongClick = (song: Song) => {
    setSelectedSong(song);
    setEditDialogOpen(true);
  };

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
                  <TableHead className="text-muted-foreground text-right">Dosyalar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderedRows.map(({ song, isMedleyPart }) => (
                  <TableRow
                    key={song.id}
                    className={`border-border cursor-pointer ${
                      isMedleyPart
                        ? "bg-muted/40 hover:bg-muted/60 border-l-2 border-l-gold/30"
                        : "hover:bg-muted/30"
                    }`}
                    onClick={() => handleSongClick(song)}
                  >
                    <TableCell className={`font-medium text-foreground ${isMedleyPart ? "pl-10" : ""}`}>
                      <div className="flex items-center gap-2">
                        <Music className={`h-4 w-4 shrink-0 ${isMedleyPart ? "text-gold/70" : "text-gold"}`} />
                        {isMedleyPart && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {song.medley_position}.{" "}
                          </span>
                        )}
                        {song.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {song.sheet_music_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-gold"
                            onClick={(e) => { e.stopPropagation(); window.open(song.sheet_music_url!, "_blank"); }}
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {song.midi_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-velvet"
                            onClick={(e) => { e.stopPropagation(); window.open(song.midi_url!, "_blank"); }}
                          >
                            <Music2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {song.audio_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-gold"
                            onClick={(e) => { e.stopPropagation(); window.open(song.audio_url!, "_blank"); }}
                          >
                            <Play className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {!song.sheet_music_url && !song.midi_url && !song.audio_url && (
                          <span className="text-[10px] text-muted-foreground">Dosya yok</span>
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

      {/* Şarkı düzenleme dialogu */}
      <EditSongDialog
        song={selectedSong}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
}
