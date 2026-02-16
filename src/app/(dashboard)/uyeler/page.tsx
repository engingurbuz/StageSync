"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddMemberDialog } from "@/components/dialogs/add-member-dialog";
import { useMembers } from "@/hooks/use-members";

const voiceLabels: Record<string, string> = {
  soprano_1: "Soprano 1",
  soprano_2: "Soprano 2",
  alto: "Alto",
  tenor_1: "Tenor 1",
  tenor_2: "Tenor 2",
  baritone: "Bariton",
  bass: "Bas",
};

const statusLabels: Record<string, string> = {
  active: "Aktif",
  inactive: "Pasif",
  alumni: "Mezun",
  pending: "Beklemede",
};

export default function MembersPage() {
  const { members, isLoading } = useMembers();
  const [search, setSearch] = useState("");
  const [voiceFilter, setVoiceFilter] = useState<string | null>(null);

  const filtered = members.filter((m) => {
    const matchesSearch = m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchesVoice = !voiceFilter || m.voice_type === voiceFilter;
    return matchesSearch && matchesVoice;
  });

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Üyeler</h1>
          <p className="text-sm text-muted-foreground">
            Koro üyelerinizi ve ses gruplarını yönetin.
          </p>
        </div>
        <AddMemberDialog />
      </div>

      {/* Arama & Filtre */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Üye ara..."
            className="pl-9 bg-muted/30 border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant={voiceFilter ? "default" : "outline"}
          className={voiceFilter ? "bg-gold text-gold-foreground" : "border-border text-muted-foreground"}
          onClick={() => setVoiceFilter(null)}
        >
          <Filter className="mr-2 h-4 w-4" />
          {voiceFilter ? voiceLabels[voiceFilter] || voiceFilter : "Tümü"}
        </Button>
      </div>

      {/* Voice filter chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(voiceLabels).map(([key, label]) => (
          <Badge
            key={key}
            variant="outline"
            className={`cursor-pointer transition-colors ${
              voiceFilter === key
                ? "border-gold text-gold bg-gold/10"
                : "border-border text-muted-foreground hover:border-gold/50"
            }`}
            onClick={() => setVoiceFilter(voiceFilter === key ? null : key)}
          >
            {label}
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">
            {search ? "Aramanızla eşleşen üye bulunamadı." : "Henüz üye eklenmemiş. İlk üyeyi ekleyin!"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((member) => (
            <Card key={member.id} className="border-border bg-card transition-colors hover:border-gold/30">
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="h-12 w-12 border-2 border-gold/20">
                  <AvatarImage src={member.avatar_url || ""} />
                  <AvatarFallback className="bg-velvet text-velvet-foreground text-sm font-bold">
                    {getInitials(member.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{member.full_name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {member.voice_type && (
                      <Badge variant="outline" className="border-gold/30 text-gold text-[10px]">
                        {voiceLabels[member.voice_type] || member.voice_type}
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={
                        member.status === "active"
                          ? "border-green-500/30 text-green-500 text-[10px]"
                          : "border-muted-foreground/30 text-muted-foreground text-[10px]"
                      }
                    >
                      {statusLabels[member.status] || member.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
