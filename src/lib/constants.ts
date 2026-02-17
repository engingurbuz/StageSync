import type { VoiceType, UserRole } from "@/types/database";

// Ses tipleri ve Türkçe etiketleri
export const VOICE_TYPES: { value: VoiceType; label: string }[] = [
  { value: "soprano", label: "Soprano" },
  { value: "soprano_1", label: "Soprano 1" },
  { value: "soprano_2", label: "Soprano 2" },
  { value: "mezzo_soprano", label: "Mezzo-Soprano" },
  { value: "alto", label: "Alto" },
  { value: "tenor", label: "Tenor" },
  { value: "tenor_1", label: "Tenor 1" },
  { value: "tenor_2", label: "Tenor 2" },
  { value: "baritone", label: "Bariton" },
  { value: "bass", label: "Bas" },
];

export const VOICE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  VOICE_TYPES.map((v) => [v.value, v.label])
);

// Kullanıcı rolleri ve Türkçe etiketleri
export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "section_leader", label: "Partisyon Şefi" },
  { value: "creative_team", label: "Koro Şefi" },
  { value: "member", label: "Üye" },
];

export const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  USER_ROLES.map((r) => [r.value, r.label])
);

// Üye durumları
export const MEMBER_STATUSES = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Pasif" },
  { value: "alumni", label: "Mezun" },
  { value: "pending", label: "Beklemede" },
] as const;

export const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  MEMBER_STATUSES.map((s) => [s.value, s.label])
);

// Yetki kontrolleri
export const canEditVoiceType = (role: UserRole | undefined): boolean => {
  return role === "admin" || role === "section_leader" || role === "creative_team";
};

export const canEditRole = (role: UserRole | undefined): boolean => {
  return role === "admin" || role === "creative_team";
};

export const canEditMemberStatus = (role: UserRole | undefined): boolean => {
  return role === "admin" || role === "creative_team";
};
