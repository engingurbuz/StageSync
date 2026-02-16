"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { CreativeTask, MeetingNote } from "@/types/database";

export function useTasks() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["creative_tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creative_tasks")
        .select("*, profiles:assigned_to(full_name)")
        .order("position");
      if (error) throw error;
      return data as (CreativeTask & {
        profiles: { full_name: string } | null;
      })[];
    },
  });

  const addTask = useMutation({
    mutationFn: async (
      task: Omit<CreativeTask, "id" | "created_at" | "updated_at">
    ) => {
      const { error } = await supabase.from("creative_tasks").insert(task);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creative_tasks"] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<CreativeTask> & { id: string }) => {
      const { error } = await supabase
        .from("creative_tasks")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creative_tasks"] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("creative_tasks")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creative_tasks"] });
    },
  });

  // Group by status for kanban
  const columns = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    review: tasks.filter((t) => t.status === "review"),
    done: tasks.filter((t) => t.status === "done"),
  };

  return {
    tasks,
    columns,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
  };
}

export function useMeetingNotes() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const {
    data: notes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["meeting_notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meeting_notes")
        .select("*")
        .order("meeting_date", { ascending: false });
      if (error) throw error;
      return data as MeetingNote[];
    },
  });

  const addNote = useMutation({
    mutationFn: async (
      note: Omit<MeetingNote, "id" | "created_at" | "updated_at">
    ) => {
      const { error } = await supabase.from("meeting_notes").insert(note);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting_notes"] });
    },
  });

  return { notes, isLoading, error, addNote };
}
