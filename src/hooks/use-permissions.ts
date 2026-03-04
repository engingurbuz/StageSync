"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { RolePermission, UserRole, SystemSection } from "@/types/database";
import { DEFAULT_PERMISSIONS, SYSTEM_SECTIONS } from "@/lib/constants";

export function usePermissions() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  // Fetch all custom role permissions from DB
  const {
    data: permissions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["role-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*")
        .order("role");
      if (error) {
        // Table might not exist yet, return empty
        console.warn("role_permissions table not available:", error.message);
        return [];
      }
      return data as RolePermission[];
    },
  });

  // Get the effective permissions (DB overrides + defaults)
  const effectivePermissions = useMemo(() => {
    const result: Record<string, Record<string, { can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean }>> = {};

    // Start with defaults
    for (const [role, sections] of Object.entries(DEFAULT_PERMISSIONS)) {
      result[role] = { ...sections };
    }

    // Override with custom permissions from DB
    for (const perm of permissions) {
      if (!result[perm.role]) {
        result[perm.role] = {};
      }
      result[perm.role][perm.section] = {
        can_view: perm.can_view,
        can_create: perm.can_create,
        can_edit: perm.can_edit,
        can_delete: perm.can_delete,
      };
    }

    return result;
  }, [permissions]);

  // Upsert a permission for a role+section
  const updatePermission = useMutation({
    mutationFn: async (perm: {
      role: UserRole;
      section: SystemSection;
      can_view: boolean;
      can_create: boolean;
      can_edit: boolean;
      can_delete: boolean;
      updated_by: string;
    }) => {
      const { error } = await supabase
        .from("role_permissions")
        .upsert(
          {
            role: perm.role,
            section: perm.section,
            can_view: perm.can_view,
            can_create: perm.can_create,
            can_edit: perm.can_edit,
            can_delete: perm.can_delete,
            updated_by: perm.updated_by,
          },
          { onConflict: "role,section" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
    },
  });

  // Batch update all permissions for a role
  const updateRolePermissions = useMutation({
    mutationFn: async (data: {
      role: UserRole;
      permissions: Record<SystemSection, { can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean }>;
      updated_by: string;
    }) => {
      const upserts = SYSTEM_SECTIONS.map((s) => ({
        role: data.role,
        section: s.value,
        ...data.permissions[s.value],
        updated_by: data.updated_by,
      }));
      const { error } = await supabase
        .from("role_permissions")
        .upsert(upserts, { onConflict: "role,section" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
    },
  });

  return {
    permissions,
    effectivePermissions,
    isLoading,
    error,
    updatePermission,
    updateRolePermissions,
  };
}
