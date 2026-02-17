"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Loader2, 
  FileText, 
  Users, 
  Calendar,
  BarChart3,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { useForms } from "@/hooks/use-forms";
import { useAuth } from "@/hooks/use-auth";
import { CreateFormDialog } from "@/components/dialogs/create-form-dialog";
import { FormResultsDialog } from "@/components/dialogs/form-results-dialog";
import { FillFormDialog } from "@/components/dialogs/fill-form-dialog";
import { canEditRole } from "@/lib/constants";
import type { Form } from "@/types/database";

const statusLabels: Record<string, string> = {
  draft: "Taslak",
  active: "Aktif",
  closed: "Kapatıldı",
};

const statusColors: Record<string, string> = {
  draft: "border-yellow-500/30 text-yellow-500",
  active: "border-green-500/30 text-green-500",
  closed: "border-muted-foreground/30 text-muted-foreground",
};

const targetLabels: Record<string, string> = {
  all: "Tüm Üyeler",
  member: "Sadece Üyeler",
  section_leader: "Partisyon Şefleri",
  specific: "Belirli Roller",
};

export default function FormsPage() {
  const { profile } = useAuth();
  const { forms, isLoading } = useForms();
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [fillFormDialogOpen, setFillFormDialogOpen] = useState(false);

  const isAdmin = canEditRole(profile?.role);

  const filtered = forms.filter((f) =>
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewResults = (form: Form) => {
    setSelectedForm(form);
    setResultsDialogOpen(true);
  };

  const handleFillForm = (form: Form) => {
    setSelectedForm(form);
    setFillFormDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Formlar</h1>
          <p className="text-sm text-muted-foreground">
            Koro formlarını görüntüleyin ve doldurun.
          </p>
        </div>
        {isAdmin && (
          <Button
            className="bg-gold text-gold-foreground hover:bg-gold/90"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Yeni Form
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Form ara..."
          className="pl-9 bg-muted/30 border-border"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Forms list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">
            {search ? "Aramanızla eşleşen form bulunamadı." : "Henüz form oluşturulmamış."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((form) => (
            <Card key={form.id} className="border-border bg-card hover:border-gold/30 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold text-foreground line-clamp-1">
                      {form.title}
                    </CardTitle>
                    {form.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {form.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className={statusColors[form.status]}>
                    {statusLabels[form.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Info badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-border text-muted-foreground text-[10px]">
                    <Users className="mr-1 h-3 w-3" />
                    {targetLabels[form.target]}
                  </Badge>
                  {form.is_required && (
                    <Badge variant="outline" className="border-velvet/30 text-velvet text-[10px]">
                      Zorunlu
                    </Badge>
                  )}
                  {form.deadline && (
                    <Badge variant="outline" className="border-border text-muted-foreground text-[10px]">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(form.deadline).toLocaleDateString("tr-TR")}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {form.status === "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-gold/30 text-gold hover:bg-gold/10"
                      onClick={() => handleFillForm(form)}
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      Doldur
                    </Button>
                  )}
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border"
                      onClick={() => handleViewResults(form)}
                    >
                      <BarChart3 className="mr-1 h-3 w-3" />
                      Sonuçlar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <FormResultsDialog
        form={selectedForm}
        open={resultsDialogOpen}
        onOpenChange={setResultsDialogOpen}
      />
      <FillFormDialog
        form={selectedForm}
        open={fillFormDialogOpen}
        onOpenChange={setFillFormDialogOpen}
      />
    </div>
  );
}
