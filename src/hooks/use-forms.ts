"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Form, FormQuestion, FormResponse, FormWithQuestions, FormStatus, FormTarget, QuestionType, UserRole } from "@/types/database";

export function useForms() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  // Fetch all forms
  const {
    data: forms = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["forms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Form[];
    },
  });

  // Fetch a single form with questions
  const useForm = (formId: string | null) => {
    return useQuery({
      queryKey: ["form", formId],
      queryFn: async () => {
        if (!formId) return null;
        const { data: form, error: formError } = await supabase
          .from("forms")
          .select("*")
          .eq("id", formId)
          .single();
        if (formError) throw formError;

        const { data: questions, error: questionsError } = await supabase
          .from("form_questions")
          .select("*")
          .eq("form_id", formId)
          .order("order_index");
        if (questionsError) throw questionsError;

        return { ...form, questions: questions || [] } as FormWithQuestions;
      },
      enabled: !!formId,
    });
  };

  // Fetch user's pending required forms
  const usePendingForms = (userId: string | null, userRole: UserRole | undefined) => {
    return useQuery({
      queryKey: ["pending-forms", userId, userRole],
      queryFn: async () => {
        if (!userId || !userRole) return [];

        // Get active, required forms
        const { data: requiredForms, error: formsError } = await supabase
          .from("forms")
          .select("*")
          .eq("status", "active")
          .eq("is_required", true);
        if (formsError) throw formsError;

        // Get user's responses
        const { data: responses, error: responsesError } = await supabase
          .from("form_responses")
          .select("form_id")
          .eq("user_id", userId);
        if (responsesError) throw responsesError;

        const completedFormIds = new Set(responses?.map((r) => r.form_id) || []);

        // Filter forms that user needs to complete
        const pendingForms = (requiredForms || []).filter((form) => {
          if (completedFormIds.has(form.id)) return false;

          // Check if form targets this user's role
          if (form.target === "all") return true;
          if (form.target === "member" && userRole === "member") return true;
          if (form.target === "section_leader" && userRole === "section_leader") return true;
          if (form.target === "specific" && form.target_roles?.includes(userRole)) return true;

          return false;
        });

        return pendingForms as Form[];
      },
      enabled: !!userId && !!userRole,
    });
  };

  // Create form
  const createForm = useMutation({
    mutationFn: async (form: {
      title: string;
      description?: string;
      status?: FormStatus;
      target?: FormTarget;
      target_roles?: UserRole[];
      is_required?: boolean;
      deadline?: string;
      created_by: string;
    }) => {
      const { data, error } = await supabase
        .from("forms")
        .insert(form)
        .select()
        .single();
      if (error) throw error;
      return data as Form;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });

  // Update form
  const updateForm = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Form> & { id: string }) => {
      const { error } = await supabase
        .from("forms")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });

  // Delete form
  const deleteForm = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("forms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });

  // Add question to form
  const addQuestion = useMutation({
    mutationFn: async (question: {
      form_id: string;
      question_text: string;
      question_type?: QuestionType;
      options?: { value: string; label: string }[];
      is_required?: boolean;
      order_index?: number;
    }) => {
      const { data, error } = await supabase
        .from("form_questions")
        .insert(question)
        .select()
        .single();
      if (error) throw error;
      return data as FormQuestion;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["form", variables.form_id] });
    },
  });

  // Update question
  const updateQuestion = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FormQuestion> & { id: string }) => {
      const { error } = await supabase
        .from("form_questions")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form"] });
    },
  });

  // Delete question
  const deleteQuestion = useMutation({
    mutationFn: async ({ id, formId }: { id: string; formId: string }) => {
      const { error } = await supabase
        .from("form_questions")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return formId;
    },
    onSuccess: (formId) => {
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
    },
  });

  // Submit form response
  const submitResponse = useMutation({
    mutationFn: async (response: {
      form_id: string;
      user_id: string;
      answers: Record<string, string | string[] | boolean | number>;
    }) => {
      const { data, error } = await supabase
        .from("form_responses")
        .upsert(response, { onConflict: "form_id,user_id" })
        .select()
        .single();
      if (error) throw error;
      return data as FormResponse;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pending-forms"] });
      queryClient.invalidateQueries({ queryKey: ["form-responses", variables.form_id] });
    },
  });

  // Get form responses (for admin/stats view)
  const useFormResponses = (formId: string | null) => {
    return useQuery({
      queryKey: ["form-responses", formId],
      queryFn: async () => {
        if (!formId) return [];
        const { data, error } = await supabase
          .from("form_responses")
          .select("*, profiles(full_name, email, voice_type, role)")
          .eq("form_id", formId);
        if (error) throw error;
        return data as (FormResponse & { profiles: { full_name: string; email: string; voice_type: string | null; role: string } })[];
      },
      enabled: !!formId,
    });
  };

  return {
    forms,
    isLoading,
    error,
    useForm,
    usePendingForms,
    useFormResponses,
    createForm,
    updateForm,
    deleteForm,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    submitResponse,
  };
}
