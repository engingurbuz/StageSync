"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Announcement } from "@/types/database";

export function useAnnouncements() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const {
    data: announcements = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*, profiles:author_id(full_name)")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as (Announcement & {
        profiles: { full_name: string } | null;
      })[];
    },
  });

  const addAnnouncement = useMutation({
    mutationFn: async (
      announcement: Omit<Announcement, "id" | "created_at" | "updated_at">
    ) => {
      const { error } = await supabase
        .from("announcements")
        .insert(announcement);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const updateAnnouncement = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Announcement> & { id: string }) => {
      const { error } = await supabase
        .from("announcements")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  return {
    announcements,
    isLoading,
    error,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
}
