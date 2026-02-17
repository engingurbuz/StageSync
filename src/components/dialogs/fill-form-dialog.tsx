"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useForms } from "@/hooks/use-forms";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { Form, FormQuestion } from "@/types/database";

interface FillFormDialogProps {
  form: Form | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FillFormDialog({ form, open, onOpenChange }: FillFormDialogProps) {
  const { user } = useAuth();
  const { useForm, submitResponse } = useForms();
  const { data: formWithQuestions, isLoading } = useForm(form?.id || null);
  
  const [answers, setAnswers] = useState<Record<string, string | string[] | boolean | number>>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset answers when form changes
  useEffect(() => {
    setAnswers({});
  }, [form?.id]);

  const updateAnswer = (questionId: string, value: string | string[] | boolean | number) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form || !user || !formWithQuestions) return;

    // Validate required questions
    const requiredQuestions = formWithQuestions.questions.filter((q) => q.is_required);
    const missingRequired = requiredQuestions.filter((q) => {
      const answer = answers[q.id];
      if (answer === undefined || answer === null || answer === "") return true;
      if (Array.isArray(answer) && answer.length === 0) return true;
      return false;
    });

    if (missingRequired.length > 0) {
      toast.error("Zorunlu soruları yanıtlayın");
      return;
    }

    setSubmitting(true);
    try {
      await submitResponse.mutateAsync({
        form_id: form.id,
        user_id: user.id,
        answers,
      });
      toast.success("Form başarıyla gönderildi");
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Form gönderilirken hata oluştu";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: FormQuestion) => {
    const value = answers[question.id];

    switch (question.question_type) {
      case "text":
        return (
          <Input
            value={(value as string) || ""}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className="bg-muted/30 border-border"
          />
        );

      case "textarea":
        return (
          <Textarea
            value={(value as string) || ""}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className="bg-muted/30 border-border min-h-[80px]"
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={(value as number) || ""}
            onChange={(e) => updateAnswer(question.id, Number(e.target.value))}
            className="bg-muted/30 border-border"
          />
        );

      case "date":
        return (
          <Input
            type="date"
            value={(value as string) || ""}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className="bg-muted/30 border-border"
          />
        );

      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={(value as boolean) || false}
              onCheckedChange={(checked) => updateAnswer(question.id, checked === true)}
            />
            <span className="text-sm text-muted-foreground">Evet</span>
          </div>
        );

      case "select":
        return (
          <Select
            value={(value as string) || ""}
            onValueChange={(v) => updateAnswer(question.id, v)}
          >
            <SelectTrigger className="bg-muted/30 border-border">
              <SelectValue placeholder="Seçin" />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <RadioGroup
            value={(value as string) || ""}
            onValueChange={(v) => updateAnswer(question.id, v)}
            className="space-y-2"
          >
            {question.options.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <RadioGroupItem value={opt.value} id={`${question.id}-${opt.value}`} />
                <Label htmlFor={`${question.id}-${opt.value}`} className="font-normal cursor-pointer">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "multiselect":
        const selectedValues = (value as string[]) || [];
        return (
          <div className="space-y-2">
            {question.options.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedValues.includes(opt.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateAnswer(question.id, [...selectedValues, opt.value]);
                    } else {
                      updateAnswer(question.id, selectedValues.filter((v) => v !== opt.value));
                    }
                  }}
                />
                <span className="text-sm">{opt.label}</span>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{form.title}</DialogTitle>
          {form.description && (
            <p className="text-sm text-muted-foreground">{form.description}</p>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {formWithQuestions?.questions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <Label className="flex items-center gap-1">
                  <span className="text-gold font-bold mr-1">{index + 1}.</span>
                  {question.question_text}
                  {question.is_required && <span className="text-destructive">*</span>}
                </Label>
                {renderQuestion(question)}
              </div>
            ))}

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-border"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gold text-gold-foreground hover:bg-gold/90"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gönder
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
