"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export function useMembers() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const {
    data: members = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");
      if (error) throw error;
      return data as Profile[];
    },
  });

  const addMember = useMutation({
    mutationFn: async (member: {
      email: string;
      full_name: string;
      voice_type?: string;
      phone?: string;
      role?: string;
    }) => {
      // Admin invite: create auth user then profile updates via trigger
      const { data, error } = await supabase.auth.admin.createUser({
        email: member.email,
        email_confirm: true,
        user_metadata: { full_name: member.full_name },
      });
      if (error) {
        // Fallback: insert directly into profiles (for demo/dev)
        const { error: insertError } = await supabase.from("profiles").insert({
          id: crypto.randomUUID(),
          email: member.email,
          full_name: member.full_name,
          voice_type: member.voice_type || null,
          phone: member.phone || null,
          role: member.role || "member",
          status: "active",
        });
        if (insertError) throw insertError;
        return;
      }
      // Update the profile with extra info
      if (data.user) {
        await supabase
          .from("profiles")
          .update({
            voice_type: member.voice_type || null,
            phone: member.phone || null,
            role: (member.role as Profile["role"]) || "member",
          })
          .eq("id", data.user.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  const updateMember = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Profile> & { id: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "inactive" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  return { members, isLoading, error, addMember, updateMember, deleteMember };
}
