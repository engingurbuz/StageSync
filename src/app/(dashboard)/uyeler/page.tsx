"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddMemberDialog } from "@/components/dialogs/add-member-dialog";
import { EditMemberDialog } from "@/components/dialogs/edit-member-dialog";
import { useMembers } from "@/hooks/use-members";
import { VOICE_TYPES, VOICE_TYPE_LABELS, STATUS_LABELS, ROLE_LABELS } from "@/lib/constants";
import type { Profile } from "@/types/database";

export default function MembersPage() {
  const { members, isLoading } = useMembers();
  const [search, setSearch] = useState("");
  const [voiceFilter, setVoiceFilter] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<Profile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  const handleMemberClick = (member: Profile) => {
    setEditingMember(member);
    setEditDialogOpen(true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("tr-TR");
  };

  // Dinamik alanları topla (custom_fields varsa)
  const dynamicColumns = new Set<string>();
  members.forEach((m) => {
    if (m.custom_fields && typeof m.custom_fields === "object") {
      Object.keys(m.custom_fields).forEach((key) => dynamicColumns.add(key));
    }
  });
  const dynamicColumnList = Array.from(dynamicColumns);

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
          {voiceFilter ? VOICE_TYPE_LABELS[voiceFilter] || voiceFilter : "Tümü"}
        </Button>
      </div>

      {/* Voice filter chips */}
      <div className="flex flex-wrap gap-2">
        {VOICE_TYPES.map((vt) => (
          <Badge
            key={vt.value}
            variant="outline"
            className={`cursor-pointer transition-colors ${
              voiceFilter === vt.value
                ? "border-gold text-gold bg-gold/10"
                : "border-border text-muted-foreground hover:border-gold/50"
            }`}
            onClick={() => setVoiceFilter(voiceFilter === vt.value ? null : vt.value)}
          >
            {vt.label}
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
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground w-[250px]">Üye</TableHead>
                    <TableHead className="text-muted-foreground">Ses Tipi</TableHead>
                    <TableHead className="text-muted-foreground">Rol</TableHead>
                    <TableHead className="text-muted-foreground">Durum</TableHead>
                    <TableHead className="text-muted-foreground">Telefon</TableHead>
                    <TableHead className="text-muted-foreground">Üyelik Tarihi</TableHead>
                    {dynamicColumnList.map((col) => (
                      <TableHead key={col} className="text-muted-foreground capitalize">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((member) => (
                    <TableRow
                      key={member.id}
                      className="border-border hover:bg-muted/30 cursor-pointer"
                      onClick={() => handleMemberClick(member)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-gold/20">
                            <AvatarImage src={member.avatar_url || ""} />
                            <AvatarFallback className="bg-velvet text-velvet-foreground text-xs font-bold">
                              {getInitials(member.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {member.full_name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.voice_type ? (
                          <Badge variant="outline" className="border-gold/30 text-gold text-[10px]">
                            {VOICE_TYPE_LABELS[member.voice_type] || member.voice_type}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-velvet/30 text-velvet text-[10px]">
                          {ROLE_LABELS[member.role] || member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            member.status === "active"
                              ? "border-green-500/30 text-green-500 text-[10px]"
                              : "border-muted-foreground/30 text-muted-foreground text-[10px]"
                          }
                        >
                          {STATUS_LABELS[member.status] || member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {member.phone || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(member.joined_date)}
                      </TableCell>
                      {dynamicColumnList.map((col) => (
                        <TableCell key={col} className="text-sm text-muted-foreground">
                          {member.custom_fields?.[col] || "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Üye düzenleme dialogu */}
      <EditMemberDialog
        member={editingMember}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
}
