"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import { addMemberAction } from "@/app/actions/members";

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
      roles?: string[];
    }) => {
      const result = await addMemberAction({
        email: member.email,
        full_name: member.full_name,
        voice_type: member.voice_type || null,
        phone: member.phone || null,
        roles: member.roles,
      });

      if (result.error) {
        throw new Error(result.error);
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
      if (error) {
        // If 'roles' column doesn't exist yet, retry without it
        if (error.message?.includes("roles") || error.code === "PGRST204" || error.code === "42703") {
          const { roles, ...rest } = updates;
          if (Object.keys(rest).length > 0) {
            const { error: retryError } = await supabase
              .from("profiles")
              .update(rest)
              .eq("id", id);
            if (retryError) throw retryError;
            return;
          }
        }
        throw error;
      }
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
