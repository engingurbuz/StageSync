"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Song } from "@/types/database";

export function useSongs() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const {
    data: songs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("title");
      if (error) throw error;
      return data as Song[];
    },
  });

  const addSong = useMutation({
    mutationFn: async (
      song: Omit<Song, "id" | "created_at" | "updated_at">
    ) => {
      const { error } = await supabase.from("songs").insert(song);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });

  const updateSong = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Song> & { id: string }) => {
      const { error } = await supabase
        .from("songs")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });

  const deleteSong = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("songs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });

  return { songs, isLoading, error, addSong, updateSong, deleteSong };
}
