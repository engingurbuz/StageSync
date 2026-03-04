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
      roles?: string[];
    }) => {
      // Admin invite: create auth user then profile updates via trigger
      const { data, error } = await supabase.auth.admin.createUser({
        email: member.email,
        email_confirm: true,
        user_metadata: { full_name: member.full_name },
      });
      if (error) {
        // Fallback: insert directly into profiles (for demo/dev)
        const roles = member.roles && member.roles.length > 0 ? member.roles : ["member"];
        const insertData: Record<string, unknown> = {
          id: crypto.randomUUID(),
          email: member.email,
          full_name: member.full_name,
          voice_type: member.voice_type || null,
          phone: member.phone || null,
          role: roles[0] || "member",
          status: "active",
        };
        // Try with roles column first, fallback without
        const { error: insertError } = await supabase.from("profiles").insert({ ...insertData, roles });
        if (insertError) {
          const { error: insertError2 } = await supabase.from("profiles").insert(insertData);
          if (insertError2) throw insertError2;
        }
        return;
      }
      // Update the profile with extra info
      if (data.user) {
        const roles = member.roles && member.roles.length > 0 ? member.roles : ["member"];
        const updateData: Record<string, unknown> = {
          voice_type: member.voice_type || null,
          phone: member.phone || null,
          role: (roles[0] as Profile["role"]) || "member",
        };
        // Try with roles column first, fallback without
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ ...updateData, roles })
          .eq("id", data.user.id);
        if (updateError) {
          await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", data.user.id);
        }
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
