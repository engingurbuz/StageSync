"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Bell, Shield, Loader2, Save, CheckCircle, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Profile, UserRole, SystemSection } from "@/types/database";
import {
  VOICE_TYPES,
  ROLE_LABELS,
  USER_ROLES,
  SYSTEM_SECTIONS,
  SECTION_LABELS,
  DEFAULT_PERMISSIONS,
  hasRole,
} from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SettingsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { effectivePermissions, updatePermission, isLoading: permsLoading } = usePermissions();
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [voiceType, setVoiceType] = useState("");
  const [bio, setBio] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Email change
  const [newEmail, setNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Permission management
  const [selectedPermRole, setSelectedPermRole] = useState<UserRole>("section_leader");
  const isAdmin = hasRole(profile, "admin");

  // Editable roles for permission management (exclude admin - always has full access)
  const editableRoles = USER_ROLES.filter((r) => r.value !== "admin");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setDisplayName(profile.display_name || "");
      setPhone(profile.phone || "");
      setVoiceType(profile.voice_type || "");
      setBio(profile.bio || "");
      setEmergencyName(profile.emergency_contact_name || "");
      setEmergencyPhone(profile.emergency_contact_phone || "");
    }
    if (user?.email) {
      setNewEmail(user.email);
    }
  }, [profile, user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const updates = {
        full_name: fullName,
        display_name: displayName || null,
        phone: phone || null,
        voice_type: (voiceType as Profile["voice_type"]) || null,
        bio: bio || null,
        emergency_contact_name: emergencyName || null,
        emergency_contact_phone: emergencyPhone || null,
      };
      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
      if (error) throw error;
      toast.success("Profil başarıyla güncellendi");
    } catch {
      toast.error("Profil güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor");
      return;
    }
    setChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Şifre başarıyla değiştirildi");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Şifre değiştirilirken hata oluştu");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || newEmail === user?.email) {
      toast.info("E-posta adresi değişmedi");
      return;
    }
    if (!newEmail.includes("@")) {
      toast.error("Geçerli bir e-posta adresi girin");
      return;
    }
    setChangingEmail(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success("E-posta değişiklik onayı gönderildi. Lütfen yeni e-postanızı kontrol edin.");
    } catch {
      toast.error("E-posta değiştirilirken hata oluştu");
    } finally {
      setChangingEmail(false);
    }
  };

  const handleTogglePermission = async (
    role: UserRole,
    section: SystemSection,
    action: "can_view" | "can_create" | "can_edit" | "can_delete"
  ) => {
    if (!user) return;
    const currentPerms = effectivePermissions[role]?.[section] || DEFAULT_PERMISSIONS[role]?.[section] || {
      can_view: false,
      can_create: false,
      can_edit: false,
      can_delete: false,
    };
    const newValue = !currentPerms[action];

    // If disabling view, also disable create/edit/delete
    let updatedPerms = { ...currentPerms, [action]: newValue };
    if (action === "can_view" && !newValue) {
      updatedPerms = { ...updatedPerms, can_create: false, can_edit: false, can_delete: false };
    }
    // If enabling create/edit/delete, also enable view
    if (action !== "can_view" && newValue) {
      updatedPerms = { ...updatedPerms, can_view: true };
    }

    try {
      await updatePermission.mutateAsync({
        role,
        section,
        ...updatedPerms,
        updated_by: user.id,
      });
      toast.success("Yetki güncellendi");
    } catch {
      toast.error("Yetki güncellenirken hata oluştu");
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Ayarlar</h1>
        <p className="text-sm text-muted-foreground">
          Profilinizi ve uygulama tercihlerinizi yönetin.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-muted/50 border border-border">
          <TabsTrigger value="profile" className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
            <User className="mr-2 h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
            <Bell className="mr-2 h-4 w-4" />
            Bildirimler
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
            <Shield className="mr-2 h-4 w-4" />
            Güvenlik
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="permissions" className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
              <Lock className="mr-2 h-4 w-4" />
              Yetki Yönetimi
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Profil Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Ad Soyad</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-muted/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Görüntü Adı</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Opsiyonel"
                    className="bg-muted/50 border-border"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="bg-muted/50 border-border flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleChangeEmail}
                      disabled={changingEmail || newEmail === user?.email}
                      className="border-border"
                    >
                      {changingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : "Güncelle"}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+90 5XX XXX XX XX"
                    className="bg-muted/50 border-border"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="voiceType">Ses Tipi</Label>
                  <Select value={voiceType || "unassigned"} onValueChange={(val) => setVoiceType(val === "unassigned" ? "" : val)}>
                    <SelectTrigger className="bg-muted/50 border-border">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Belirlenmemiş</SelectItem>
                      {VOICE_TYPES.map((vt) => (
                        <SelectItem key={vt.value} value={vt.value}>
                          {vt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Roller</Label>
                  <Input
                    value={(profile?.roles?.length ? profile.roles : [profile?.role || "member"]).map((r) => ROLE_LABELS[r] || r).join(", ")}
                    disabled
                    className="bg-muted/30 border-border text-muted-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Hakkında</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Kendinizden bahsedin..."
                  className="bg-muted/50 border-border min-h-[80px]"
                />
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Acil Durum İletişim</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">Ad Soyad</Label>
                    <Input
                      id="emergencyName"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="bg-muted/50 border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Telefon</Label>
                    <Input
                      id="emergencyPhone"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="bg-muted/50 border-border"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-gold text-gold-foreground hover:bg-gold/90"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Kaydet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Bildirim Tercihleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">E-posta Bildirimleri</p>
                    <p className="text-xs text-muted-foreground">Yeni duyurular ve etkinlik hatırlatmaları</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Prova Hatırlatmaları</p>
                    <p className="text-xs text-muted-foreground">Provadan 24 saat önce bildirim</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Şifre Değiştir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="bg-muted/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-muted/50 border-border"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={changingPassword || !newPassword}
                className="bg-gold text-gold-foreground hover:bg-gold/90"
              >
                {changingPassword ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="mr-2 h-4 w-4" />
                )}
                Şifreyi Değiştir
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permission Management - Admin Only */}
        {isAdmin && (
          <TabsContent value="permissions">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Yetki Yönetimi</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Her rol için hangi bölümlerde hangi işlemlere izin verildiğini yapılandırın.
                  Admin rolü her zaman tam yetkiye sahiptir.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Role selector */}
                <div className="space-y-2">
                  <Label>Rol Seçin</Label>
                  <Select
                    value={selectedPermRole}
                    onValueChange={(val) => setSelectedPermRole(val as UserRole)}
                  >
                    <SelectTrigger className="bg-muted/50 border-border w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {editableRoles.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Permission table */}
                {permsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gold" />
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableHead className="text-foreground font-semibold w-[200px]">
                            Bölüm
                          </TableHead>
                          <TableHead className="text-foreground font-semibold text-center w-[100px]">
                            Görüntüleme
                          </TableHead>
                          <TableHead className="text-foreground font-semibold text-center w-[100px]">
                            Oluşturma
                          </TableHead>
                          <TableHead className="text-foreground font-semibold text-center w-[100px]">
                            Düzenleme
                          </TableHead>
                          <TableHead className="text-foreground font-semibold text-center w-[100px]">
                            Silme
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {SYSTEM_SECTIONS.map((section) => {
                          const perms = effectivePermissions[selectedPermRole]?.[section.value] ||
                            DEFAULT_PERMISSIONS[selectedPermRole]?.[section.value] || {
                              can_view: false,
                              can_create: false,
                              can_edit: false,
                              can_delete: false,
                            };
                          return (
                            <TableRow key={section.value} className="hover:bg-muted/20">
                              <TableCell className="font-medium text-foreground">
                                {section.label}
                              </TableCell>
                              {(["can_view", "can_create", "can_edit", "can_delete"] as const).map(
                                (action) => (
                                  <TableCell key={action} className="text-center">
                                    <div className="flex justify-center">
                                      <Checkbox
                                        checked={perms[action]}
                                        onCheckedChange={() =>
                                          handleTogglePermission(
                                            selectedPermRole,
                                            section.value,
                                            action
                                          )
                                        }
                                        disabled={updatePermission.isPending}
                                        className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                                      />
                                    </div>
                                  </TableCell>
                                )
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="rounded-lg bg-muted/30 border border-border p-4">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Not:</strong> Görüntüleme yetkisi
                    kaldırıldığında, o bölüm için diğer tüm yetkiler de otomatik olarak kaldırılır.
                    Oluşturma, düzenleme veya silme yetkisi verildiğinde görüntüleme yetkisi otomatik
                    olarak etkinleştirilir.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
