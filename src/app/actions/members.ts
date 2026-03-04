"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * Server action to add a new member.
 * Uses the service_role key to create an auth user via admin API,
 * then updates the profile with additional fields.
 */
export async function addMemberAction(member: {
  email: string;
  full_name: string;
  voice_type?: string | null;
  phone?: string | null;
  roles?: string[];
}) {
  // Verify the caller is an admin
  const serverSupabase = await createServerClient();
  const {
    data: { user: caller },
  } = await serverSupabase.auth.getUser();

  if (!caller) {
    return { error: "Oturum açmamışsınız" };
  }

  const { data: callerProfile } = await serverSupabase
    .from("profiles")
    .select("role, roles")
    .eq("id", caller.id)
    .single();

  const callerRoles: string[] =
    callerProfile?.roles && callerProfile.roles.length > 0
      ? callerProfile.roles
      : callerProfile?.role
        ? [callerProfile.role]
        : [];

  const isAdmin = callerRoles.includes("admin") || callerRoles.includes("choir_leader");
  if (!isAdmin) {
    return { error: "Bu işlem için yetkiniz yok" };
  }

  const roles = member.roles && member.roles.length > 0 ? member.roles : ["member"];

  // Use service_role key for admin operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    // Fallback: use signUp via the server client (no service role available)
    return await addMemberViaSignUp(serverSupabase, member, roles);
  }

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Create the auth user via admin API
  const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
    email: member.email,
    email_confirm: true,
    user_metadata: { full_name: member.full_name },
  });

  if (createError) {
    return { error: createError.message };
  }

  if (newUser.user) {
    // Wait briefly for the handle_new_user trigger to create the profile
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Update profile with extra fields
    const updateData: Record<string, unknown> = {
      full_name: member.full_name,
      voice_type: member.voice_type || null,
      phone: member.phone || null,
      role: roles[0] || "member",
      status: "active",
    };

    // Try with roles column, fallback without
    const { error: updateError } = await adminSupabase
      .from("profiles")
      .update({ ...updateData, roles })
      .eq("id", newUser.user.id);

    if (updateError) {
      await adminSupabase
        .from("profiles")
        .update(updateData)
        .eq("id", newUser.user.id);
    }
  }

  return { success: true };
}

/**
 * Fallback: create user via signUp when service_role key is not available.
 * Works if email confirmation is enabled (default) — caller session won't change.
 */
async function addMemberViaSignUp(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  member: { email: string; full_name: string; voice_type?: string | null; phone?: string | null },
  roles: string[]
) {
  const tempPassword = crypto.randomUUID().slice(0, 20) + "Aa1!";

  const { data, error } = await supabase.auth.signUp({
    email: member.email,
    password: tempPassword,
    options: {
      data: { full_name: member.full_name },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updateData: Record<string, unknown> = {
      full_name: member.full_name,
      voice_type: member.voice_type || null,
      phone: member.phone || null,
      role: roles[0] || "member",
      status: "active",
    };

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

  return { success: true };
}

/**
 * Server action to permanently delete a member.
 * Deletes the auth user (profile cascades via FK).
 */
export async function deleteMemberAction(memberId: string) {
  const serverSupabase = await createServerClient();
  const {
    data: { user: caller },
  } = await serverSupabase.auth.getUser();

  if (!caller) {
    return { error: "Oturum açmamışsınız" };
  }

  // Cannot delete yourself
  if (caller.id === memberId) {
    return { error: "Kendinizi silemezsiniz" };
  }

  const { data: callerProfile } = await serverSupabase
    .from("profiles")
    .select("role, roles")
    .eq("id", caller.id)
    .single();

  const callerRoles: string[] =
    callerProfile?.roles && callerProfile.roles.length > 0
      ? callerProfile.roles
      : callerProfile?.role
        ? [callerProfile.role]
        : [];

  if (!callerRoles.includes("admin")) {
    return { error: "Üye silme yetkisi sadece adminlerde bulunur" };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    // Without service_role key, try deleting just the profile
    const { error } = await serverSupabase
      .from("profiles")
      .delete()
      .eq("id", memberId);
    if (error) return { error: error.message };
    return { success: true };
  }

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Delete auth user — profile will cascade delete
  const { error } = await adminSupabase.auth.admin.deleteUser(memberId);
  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
