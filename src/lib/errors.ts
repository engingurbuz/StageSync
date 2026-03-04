/**
 * Supabase / RLS hatalarını kullanıcı dostu Türkçe yetki mesajlarına çevirir.
 * Tüm create/edit/delete mutasyonlarında kullanılmalı.
 */
export function getFriendlyErrorMessage(
  err: unknown,
  context?: { create?: string; edit?: string; delete?: string; action?: string }
): string {
  const action = context?.action ?? context?.create ?? context?.edit ?? context?.delete ?? "bu işlem";
  const fallback = `Bu işlem için yetkiniz yok. Sadece yetkili kullanıcılar ${action} yapabilir.`;

  if (!err || typeof err !== "object") return fallback;

  const msg = "message" in err ? String((err as { message?: string }).message) : "";
  const code = "code" in err ? (err as { code?: string }).code : "";

  // Postgrest RLS / izin hataları
  if (code === "42501" || code === "PGRST301" || msg.includes("policy") || msg.includes("permission") || msg.includes("row-level security")) {
    return `Bu işlem için yetkiniz yok. Sadece yetkili kullanıcılar ${action} yapabilir.`;
  }
  // JWT / auth
  if (code === "PGRST301" || msg.includes("JWT") || msg.includes("unauthorized")) {
    return "Oturum süreniz dolmuş veya yetkiniz yok. Lütfen tekrar giriş yapın.";
  }
  // Zaten var / conflict
  if (code === "23505" || msg.includes("duplicate") || msg.includes("unique")) {
    return "Bu kayıt zaten mevcut. Tekrar denemeyin.";
  }
  // Foreign key
  if (code === "23503" || msg.includes("foreign key")) {
    return "İlişkili bir kayıt eksik veya silinmiş. İşlem iptal edildi.";
  }

  return msg || fallback;
}
