"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Audition, AuditionSignup, CastRole, AuditionSong, SignupSelection } from "@/types/database";

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
    mutationFn: async (payload: {
      audition: Omit<Audition, "id" | "created_at" | "updated_at">;
      song_ids?: string[];
    }) => {
      const { data: newAudition, error: err } = await supabase
        .from("auditions")
        .insert(payload.audition)
        .select("id")
        .single();
      if (err) throw err;
      if (payload.song_ids?.length && newAudition?.id) {
        const rows = payload.song_ids.map((song_id, i) => ({
          audition_id: newAudition.id,
          song_id,
          order_index: i,
        }));
        const { error: err2 } = await supabase.from("audition_songs").insert(rows);
        if (err2) throw err2;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditions"] });
      queryClient.invalidateQueries({ queryKey: ["audition_songs"] });
    },
  });

  const updateAudition = useMutation({
    mutationFn: async (payload: {
      id: string;
      updates: Partial<Pick<Audition, "role_name" | "description" | "audition_date" | "location" | "status" | "voice_required" | "max_slots">>;
      song_ids?: string[];
    }) => {
      const { id, updates, song_ids } = payload;
      const { error: err } = await supabase.from("auditions").update(updates).eq("id", id);
      if (err) throw err;
      await supabase.from("audition_songs").delete().eq("audition_id", id);
      if (song_ids?.length) {
        const rows = song_ids.map((song_id, i) => ({ audition_id: id, song_id, order_index: i }));
        const { error: err2 } = await supabase.from("audition_songs").insert(rows);
        if (err2) throw err2;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditions"] });
      queryClient.invalidateQueries({ queryKey: ["audition_songs"] });
    },
  });

  const deleteAudition = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("auditions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditions"] });
      queryClient.invalidateQueries({ queryKey: ["audition_songs"] });
      queryClient.invalidateQueries({ queryKey: ["audition_signups"] });
    },
  });

  return { auditions, isLoading, error, addAudition, updateAudition, deleteAudition };
}

export function useAuditionSongs(auditionId: string | null) {
  const supabase = useMemo(() => createClient(), []);
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["audition_songs", auditionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audition_songs")
        .select("*, songs(title)")
        .eq("audition_id", auditionId!)
        .order("order_index");
      if (error) throw error;
      return data as (AuditionSong & { songs: { title: string } | null })[];
    },
    enabled: !!auditionId,
  });
  return { auditionSongs: rows, isLoading };
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

  const updateCastRole = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Pick<CastRole, "member_id" | "role_name" | "role_type" | "notes">>;
    }) => {
      const { error } = await supabase
        .from("cast_roles")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cast_roles"] });
    },
  });

  const deleteCastRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cast_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cast_roles"] });
    },
  });

  return { castRoles, isLoading, error, addCastRole, updateCastRole, deleteCastRole };
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

  const updateSignupSelection = useMutation({
    mutationFn: async ({
      id,
      selected_role_type,
    }: {
      id: string;
      selected_role_type: SignupSelection | null;
    }) => {
      const { error } = await supabase
        .from("audition_signups")
        .update({ selected_role_type })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audition_signups"] });
    },
  });

  return { signups, isLoading, error, addSignup, updateSignupSelection };
}
