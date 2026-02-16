"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Event, Attendance } from "@/types/database";

export function useEvents() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data as Event[];
    },
  });

  const upcomingEvents = events.filter(
    (e) => new Date(e.start_time) >= new Date()
  );

  const pastEvents = events.filter(
    (e) => new Date(e.start_time) < new Date()
  );

  const addEvent = useMutation({
    mutationFn: async (
      event: Omit<Event, "id" | "created_at" | "updated_at">
    ) => {
      const { error } = await supabase.from("events").insert(event);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  return { events, upcomingEvents, pastEvents, isLoading, error, addEvent, deleteEvent };
}

export function useAttendance(eventId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const {
    data: attendance = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["attendance", eventId],
    queryFn: async () => {
      let query = supabase
        .from("attendance")
        .select("*, profiles(full_name, voice_type)");
      if (eventId) {
        query = query.eq("event_id", eventId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  const markAttendance = useMutation({
    mutationFn: async (
      record: Omit<Attendance, "id" | "created_at" | "updated_at">
    ) => {
      const { error } = await supabase.from("attendance").upsert(record, {
        onConflict: "event_id,member_id",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });

  return { attendance, isLoading, error, markAttendance };
}
