"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, FileText, Calendar } from "lucide-react";
import { useForms } from "@/hooks/use-forms";
import { useAuth } from "@/hooks/use-auth";
import { FillFormDialog } from "./fill-form-dialog";
import type { Form } from "@/types/database";

export function PendingFormsCheck() {
  const { user, profile } = useAuth();
  const { usePendingForms } = useForms();
  const { data: pendingForms = [], isLoading } = usePendingForms(user?.id || null, profile?.role);
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [fillFormOpen, setFillFormOpen] = useState(false);

  // Show dialog when there are pending required forms
  useEffect(() => {
    if (!isLoading && pendingForms.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [pendingForms, isLoading]);

  const handleFillForm = (form: Form) => {
    setSelectedForm(form);
    setFillFormOpen(true);
  };

  // Don't render anything if loading or no pending forms
  if (isLoading || pendingForms.length === 0) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent 
          className="bg-card border-border sm:max-w-lg"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <DialogTitle className="text-foreground">Zorunlu Form(lar) Bekliyor</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Devam etmeden önce aşağıdaki formları doldurmalısınız.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {pendingForms.map((form) => (
              <Card key={form.id} className="border-border bg-muted/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gold" />
                        <h4 className="text-sm font-semibold text-foreground">{form.title}</h4>
                      </div>
                      {form.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {form.description}
                        </p>
                      )}
                      {form.deadline && (
                        <div className="flex items-center gap-1 mt-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">
                            Son tarih: {new Date(form.deadline).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="bg-gold text-gold-foreground hover:bg-gold/90"
                      onClick={() => handleFillForm(form)}
                    >
                      Doldur
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Bu formları doldurmadan sistemi kullanamazsınız.
          </p>
        </DialogContent>
      </Dialog>

      <FillFormDialog
        form={selectedForm}
        open={fillFormOpen}
        onOpenChange={setFillFormOpen}
      />
    </>
  );
}
