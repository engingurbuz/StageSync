"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Audition, AuditionSignup, CastRole } from "@/types/database";

export function useAuditions() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const {
    data: auditions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auditions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auditions")
        .select("*, productions(title)")
        .order("audition_date", { ascending: false });
      if (error) throw error;
      return data as (Audition & { productions: { title: string } | null })[];
    },
  });

  const addAudition = useMutation({
    mutationFn: async (
      audition: Omit<Audition, "id" | "created_at" | "updated_at">
    ) => {
      const { error } = await supabase.from("auditions").insert(audition);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditions"] });
    },
  });

  return { auditions, isLoading, error, addAudition };
}

export function useCastRoles(productionId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const {
    data: castRoles = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cast_roles", productionId],
    queryFn: async () => {
      let query = supabase
        .from("cast_roles")
        .select("*, profiles(full_name, voice_type)")
        .order("role_type");
      if (productionId) {
        query = query.eq("production_id", productionId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as (CastRole & { profiles: { full_name: string; voice_type: string | null } | null })[];
    },
  });

  const addCastRole = useMutation({
    mutationFn: async (
      role: Omit<CastRole, "id" | "created_at" | "updated_at">
    ) => {
      const { error } = await supabase.from("cast_roles").insert(role);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cast_roles"] });
    },
  });

  return { castRoles, isLoading, error, addCastRole };
}

export function useAuditionSignups(auditionId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const {
    data: signups = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["audition_signups", auditionId],
    queryFn: async () => {
      let query = supabase
        .from("audition_signups")
        .select("*, profiles(full_name, voice_type)")
        .order("created_at");
      if (auditionId) {
        query = query.eq("audition_id", auditionId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!auditionId,
  });

  const addSignup = useMutation({
    mutationFn: async (
      signup: Omit<AuditionSignup, "id" | "created_at">
    ) => {
      const { error } = await supabase.from("audition_signups").insert(signup);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audition_signups"] });
    },
  });

  return { signups, isLoading, error, addSignup };
}
