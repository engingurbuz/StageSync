import type { VoiceType, UserRole, SystemSection, PermissionAction, RolePermission } from "@/types/database";

// Ses tipleri ve Türkçe etiketleri
export const VOICE_TYPES: { value: VoiceType; label: string }[] = [
  { value: "soprano", label: "Soprano" },
  { value: "soprano_1", label: "Soprano 1" },
  { value: "soprano_2", label: "Soprano 2" },
  { value: "alto", label: "Alto" },
  { value: "alto_1", label: "Alto 1" },
  { value: "alto_2", label: "Alto 2" },
  { value: "tenor", label: "Tenor" },
  { value: "tenor_1", label: "Tenor 1" },
  { value: "tenor_2", label: "Tenor 2" },
  { value: "bass", label: "Bas" },
  { value: "bass_1", label: "Bas 1" },
  { value: "bass_2", label: "Bas 2" },
];

export const VOICE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  VOICE_TYPES.map((v) => [v.value, v.label])
);

// Kullanıcı rolleri ve Türkçe etiketleri
export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "choir_leader", label: "Koro Şefi" },
  { value: "section_leader", label: "Partisyon Şefi" },
  { value: "creative_team", label: "Yaratıcı Ekip" },
  { value: "member", label: "Korist" },
  { value: "observer", label: "Gözlemci" },
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

// Etkinlik türleri (Konser dahil)
export const EVENT_TYPES = [
  { value: "rehearsal", label: "Prova" },
  { value: "performance", label: "Gösteri" },
  { value: "concert", label: "Konser" },
  { value: "audition", label: "Seçme" },
  { value: "meeting", label: "Toplantı" },
  { value: "workshop", label: "Çalıştay" },
  { value: "social", label: "Sosyal" },
] as const;

export const EVENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.map((e) => [e.value, e.label])
);

// ── Sistem Bölümleri ──────────────────────────────────────────────────────────

export const SYSTEM_SECTIONS: { value: SystemSection; label: string }[] = [
  { value: "ana-sayfa", label: "Ana Sayfa" },
  { value: "uyeler", label: "Üyeler" },
  { value: "etkinlikler", label: "Etkinlikler" },
  { value: "yoklama", label: "Yoklama" },
  { value: "repertuvar", label: "Repertuvar" },
  { value: "secmeler", label: "Seçmeler & Kadro" },
  { value: "yaratici", label: "Yaratıcı Pano" },
  { value: "duyurular", label: "Duyurular" },
  { value: "formlar", label: "Formlar" },
  { value: "ayarlar", label: "Ayarlar" },
];

export const SECTION_LABELS: Record<string, string> = Object.fromEntries(
  SYSTEM_SECTIONS.map((s) => [s.value, s.label])
);

// ── Varsayılan Yetki Matrisi ──────────────────────────────────────────────────

type PermSet = { can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean };
const all: PermSet = { can_view: true, can_create: true, can_edit: true, can_delete: true };
const viewOnly: PermSet = { can_view: true, can_create: false, can_edit: false, can_delete: false };
const none: PermSet = { can_view: false, can_create: false, can_edit: false, can_delete: false };
const viewCreate: PermSet = { can_view: true, can_create: true, can_edit: false, can_delete: false };
const viewCreateEdit: PermSet = { can_view: true, can_create: true, can_edit: true, can_delete: false };

export const DEFAULT_PERMISSIONS: Record<UserRole, Record<SystemSection, PermSet>> = {
  admin: {
    "ana-sayfa": all, uyeler: all, etkinlikler: all, yoklama: all, repertuvar: all,
    secmeler: all, yaratici: all, duyurular: all, formlar: all, ayarlar: all,
  },
  choir_leader: {
    "ana-sayfa": all, uyeler: all, etkinlikler: all, yoklama: all, repertuvar: all,
    secmeler: all, yaratici: all, duyurular: all, formlar: all, ayarlar: viewCreateEdit,
  },
  section_leader: {
    "ana-sayfa": viewOnly, uyeler: viewCreateEdit, etkinlikler: all, yoklama: all,
    repertuvar: viewCreateEdit, secmeler: viewCreateEdit, yaratici: viewOnly,
    duyurular: viewCreate, formlar: viewCreate, ayarlar: viewOnly,
  },
  creative_team: {
    "ana-sayfa": viewOnly, uyeler: viewOnly, etkinlikler: viewOnly, yoklama: viewOnly,
    repertuvar: all, secmeler: all, yaratici: all,
    duyurular: viewCreate, formlar: viewCreate, ayarlar: viewOnly,
  },
  member: {
    "ana-sayfa": viewOnly, uyeler: viewOnly, etkinlikler: viewOnly, yoklama: viewOnly,
    repertuvar: viewOnly, secmeler: viewOnly, yaratici: none,
    duyurular: viewOnly, formlar: viewOnly, ayarlar: viewOnly,
  },
  observer: {
    "ana-sayfa": viewOnly, uyeler: viewOnly, etkinlikler: viewOnly, yoklama: none,
    repertuvar: viewOnly, secmeler: viewOnly, yaratici: none,
    duyurular: viewOnly, formlar: none, ayarlar: viewOnly,
  },
};

// ── Yetki Yardımcı Fonksiyonları ────────────────────────────────────────────

/** Kullanıcının rolleri dizisini döndürür (geriye uyumlu) */
export function getUserRoles(profile: { role?: UserRole; roles?: UserRole[] } | null | undefined): UserRole[] {
  if (!profile) return [];
  if (profile.roles && profile.roles.length > 0) return profile.roles;
  if (profile.role) return [profile.role];
  return ["member"];
}

/** Kullanıcının belirli bir role sahip olup olmadığını kontrol eder */
export function hasRole(profile: { role?: UserRole; roles?: UserRole[] } | null | undefined, role: UserRole): boolean {
  return getUserRoles(profile).includes(role);
}

/** Kullanıcının belirli bir bölüm+aksiyon için yetkisi olup olmadığını kontrol eder */
export function checkPermission(
  profile: { role?: UserRole; roles?: UserRole[] } | null | undefined,
  section: SystemSection,
  action: PermissionAction,
  customPermissions?: RolePermission[]
): boolean {
  const userRoles = getUserRoles(profile);
  if (userRoles.length === 0) return false;
  if (userRoles.includes("admin")) return true;

  const permKey = `can_${action}` as keyof PermSet;

  return userRoles.some((role) => {
    // Önce özel (DB'den gelen) izinleri kontrol et
    if (customPermissions) {
      const custom = customPermissions.find((p) => p.role === role && p.section === section);
      if (custom) return custom[permKey];
    }
    // Sonra varsayılan izinlere bak
    return DEFAULT_PERMISSIONS[role]?.[section]?.[permKey] ?? false;
  });
}

// Geriye uyumlu yetki fonksiyonları
export const canEditVoiceType = (role: UserRole | undefined, roles?: UserRole[]): boolean => {
  const r = roles && roles.length > 0 ? roles : role ? [role] : [];
  return r.some((ro) => ro === "admin" || ro === "choir_leader" || ro === "section_leader" || ro === "creative_team");
};

export const canEditRole = (role: UserRole | undefined, roles?: UserRole[]): boolean => {
  const r = roles && roles.length > 0 ? roles : role ? [role] : [];
  return r.some((ro) => ro === "admin" || ro === "choir_leader" || ro === "creative_team");
};

export const canEditMemberStatus = (role: UserRole | undefined, roles?: UserRole[]): boolean => {
  const r = roles && roles.length > 0 ? roles : role ? [role] : [];
  return r.some((ro) => ro === "admin" || ro === "choir_leader" || ro === "creative_team");
};
