"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { useForms } from "@/hooks/use-forms";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { USER_ROLES } from "@/lib/constants";
import type { FormTarget, QuestionType, UserRole } from "@/types/database";

interface CreateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const questionTypes = [
  { value: "text", label: "Kısa Metin" },
  { value: "textarea", label: "Uzun Metin" },
  { value: "select", label: "Tekli Seçim (Dropdown)" },
  { value: "radio", label: "Tekli Seçim (Radio)" },
  { value: "multiselect", label: "Çoklu Seçim" },
  { value: "checkbox", label: "Onay Kutusu" },
  { value: "date", label: "Tarih" },
  { value: "number", label: "Sayı" },
];

const targetOptions = [
  { value: "all", label: "Tüm Üyeler" },
  { value: "member", label: "Sadece Üyeler" },
  { value: "section_leader", label: "Partisyon Şefleri" },
  { value: "specific", label: "Belirli Roller" },
];

interface QuestionDraft {
  id: string;
  question_text: string;
  question_type: QuestionType;
  options: { value: string; label: string }[];
  is_required: boolean;
}

export function CreateFormDialog({ open, onOpenChange }: CreateFormDialogProps) {
  const { user } = useAuth();
  const { createForm, addQuestion } = useForms();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState<FormTarget>("all");
  const [targetRoles, setTargetRoles] = useState<UserRole[]>([]);
  const [isRequired, setIsRequired] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [saving, setSaving] = useState(false);

  const addNewQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        question_text: "",
        question_type: "text",
        options: [],
        is_required: false,
      },
    ]);
  };

  const updateQuestion = (id: string, updates: Partial<QuestionDraft>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      const newOption = { value: `option_${question.options.length + 1}`, label: "" };
      updateQuestion(questionId, { options: [...question.options, newOption] });
    }
  };

  const updateOption = (questionId: string, optionIndex: number, label: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = { ...newOptions[optionIndex], label };
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      const newOptions = question.options.filter((_, i) => i !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const handleSubmit = async (e: React.FormEvent, status: "draft" | "active") => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Form başlığı gereklidir");
      return;
    }

    if (questions.length === 0) {
      toast.error("En az bir soru eklemelisiniz");
      return;
    }

    const emptyQuestions = questions.filter((q) => !q.question_text.trim());
    if (emptyQuestions.length > 0) {
      toast.error("Tüm soruların metni doldurulmalıdır");
      return;
    }

    setSaving(true);
    try {
      // Create form
      const form = await createForm.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        target,
        target_roles: target === "specific" ? targetRoles : [],
        is_required: isRequired,
        deadline: deadline || undefined,
        created_by: user!.id,
      });

      // Add questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await addQuestion.mutateAsync({
          form_id: form.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          is_required: q.is_required,
          order_index: i,
        });
      }

      toast.success(status === "active" ? "Form yayınlandı" : "Form taslak olarak kaydedildi");
      onOpenChange(false);
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Form oluşturulurken hata oluştu";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTarget("all");
    setTargetRoles([]);
    setIsRequired(false);
    setDeadline("");
    setQuestions([]);
  };

  const needsOptions = (type: QuestionType) =>
    ["select", "multiselect", "radio"].includes(type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Yeni Form Oluştur</DialogTitle>
        </DialogHeader>

        <form className="space-y-6">
          {/* Basic info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Form Başlığı *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Sezon Sonu Değerlendirmesi"
                className="bg-muted/30 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Form hakkında kısa bir açıklama..."
                className="bg-muted/30 border-border min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hedef Kitle</Label>
                <Select value={target} onValueChange={(v) => setTarget(v as FormTarget)}>
                  <SelectTrigger className="bg-muted/30 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {targetOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Son Tarih (Opsiyonel)</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="bg-muted/30 border-border"
                />
              </div>
            </div>

            {target === "specific" && (
              <div className="space-y-2">
                <Label>Hedef Roller</Label>
                <div className="flex flex-wrap gap-2">
                  {USER_ROLES.map((role) => (
                    <label
                      key={role.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={targetRoles.includes(role.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setTargetRoles([...targetRoles, role.value]);
                          } else {
                            setTargetRoles(targetRoles.filter((r) => r !== role.value));
                          }
                        }}
                      />
                      <span className="text-sm">{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Checkbox
                id="isRequired"
                checked={isRequired}
                onCheckedChange={(checked) => setIsRequired(checked === true)}
              />
              <Label htmlFor="isRequired" className="font-normal cursor-pointer">
                Zorunlu form (doldurmadan sistemi kullanamasınlar)
              </Label>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Sorular</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNewQuestion}
                className="border-gold/30 text-gold hover:bg-gold/10"
              >
                <Plus className="mr-1 h-4 w-4" />
                Soru Ekle
              </Button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Henüz soru eklenmedi. &quot;Soru Ekle&quot; butonuna tıklayarak başlayın.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="p-4 border border-border rounded-lg bg-muted/20 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-grab" />
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={question.question_text}
                            onChange={(e) =>
                              updateQuestion(question.id, { question_text: e.target.value })
                            }
                            placeholder={`Soru ${index + 1}`}
                            className="flex-1 bg-background border-border"
                          />
                          <Select
                            value={question.question_type}
                            onValueChange={(v) =>
                              updateQuestion(question.id, { question_type: v as QuestionType })
                            }
                          >
                            <SelectTrigger className="w-[160px] bg-background border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {questionTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQuestion(question.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Options for select/multiselect/radio */}
                        {needsOptions(question.question_type) && (
                          <div className="pl-4 space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex gap-2">
                                <Input
                                  value={option.label}
                                  onChange={(e) =>
                                    updateOption(question.id, optIndex, e.target.value)
                                  }
                                  placeholder={`Seçenek ${optIndex + 1}`}
                                  className="flex-1 bg-background border-border text-sm"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeOption(question.id, optIndex)}
                                  className="h-9 w-9"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => addOption(question.id)}
                              className="text-xs"
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Seçenek Ekle
                            </Button>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={question.is_required}
                            onCheckedChange={(checked) =>
                              updateQuestion(question.id, { is_required: checked === true })
                            }
                          />
                          <span className="text-xs text-muted-foreground">Zorunlu soru</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
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
              type="button"
              variant="outline"
              onClick={(e) => handleSubmit(e, "draft")}
              disabled={saving}
              className="border-border"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Taslak Kaydet
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, "active")}
              disabled={saving}
              className="bg-gold text-gold-foreground hover:bg-gold/90"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yayınla
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
