"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Mail, Lock, Eye, EyeOff, User, Loader2, Calendar, Phone } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [joinedDate, setJoinedDate] = useState("");
  const [kvkkConsent, setKvkkConsent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password) {
      setError("Ad soyad, e-posta ve şifre gereklidir");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      return;
    }
    if (!joinedDate) {
      setError("Üyelik başlangıç tarihi gereklidir");
      return;
    }
    if (!kvkkConsent) {
      setError("Devam etmek için KVKK aydınlatma metnini onaylamanız gerekmektedir");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, fullName, phone, joinedDate);
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Kayıt olurken hata oluştu";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="relative w-full max-w-md border-border bg-card">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <Mail className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground">E-posta Onayı Gerekli</h2>
            <p className="text-sm text-muted-foreground">
              <strong>{email}</strong> adresine bir onay bağlantısı gönderdik.
              Hesabınızı aktifleştirmek için lütfen e-postanızı kontrol edin.
            </p>
            <Link href="/giris">
              <Button variant="outline" className="mt-4 border-border text-foreground">
                Giriş Sayfasına Dön
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Spotlight gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-velvet/5 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-amber-600 shadow-lg shadow-gold/20">
            <Sparkles className="h-7 w-7 text-black" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Vokal Akademi Müzikal Korosu
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Koro Takip Sistemine Kayıt Olun
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Ad Soyad *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aylin Yılmaz"
                  className="pl-9 bg-muted/30 border-border"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">E-posta *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="pl-9 bg-muted/30 border-border"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0555 123 4567"
                  className="pl-9 bg-muted/30 border-border"
                />
              </div>
            </div>

            {/* Joined Date */}
            <div className="space-y-2">
              <Label htmlFor="joinedDate">Üyelik Başlangıç Tarihi *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="joinedDate"
                  type="date"
                  value={joinedDate}
                  onChange={(e) => setJoinedDate(e.target.value)}
                  className="pl-9 bg-muted/30 border-border"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Şifre *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-9 bg-muted/30 border-border"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">En az 6 karakter</p>
            </div>

            {/* KVKK Consent */}
            <div className="flex items-start space-x-3 rounded-lg bg-muted/30 p-3 border border-border">
              <Checkbox
                id="kvkk"
                checked={kvkkConsent}
                onCheckedChange={(checked) => setKvkkConsent(checked === true)}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <Label htmlFor="kvkk" className="text-sm font-normal cursor-pointer">
                  <Link href="/kvkk" target="_blank" className="text-gold hover:text-gold/80 underline">
                    Kişisel Verilerin Korunması Aydınlatma Metni
                  </Link>
                  &apos;ni okudum ve kabul ediyorum. *
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  6698 sayılı KVKK kapsamında kişisel verilerinizin işlenmesine onay vermiş olursunuz.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gold text-gold-foreground hover:bg-gold/90 font-semibold"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kayıt Ol
            </Button>

            <Separator className="bg-border" />

            <p className="text-center text-xs text-muted-foreground">
              Zaten hesabınız var mı?{" "}
              <Link href="/giris" className="font-medium text-gold hover:text-gold/80">
                Giriş Yap
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
