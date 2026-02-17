"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email) {
      setError("E-posta adresi gereklidir");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bir hata oluştu";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Subtle spotlight gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-velvet/5 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-4 text-center">
          {/* Brand */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-amber-600 shadow-lg shadow-gold/20">
            <Sparkles className="h-7 w-7 text-black" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Şifremi Unuttum
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              E-posta adresinizi girin, şifre sıfırlama bağlantısı göndereceğiz
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Şifre sıfırlama bağlantısı e-posta adresinize gönderildi!
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Lütfen gelen kutunuzu kontrol edin. E-posta birkaç dakika içinde ulaşacaktır.
                </p>
              </div>
              <Link href="/giris">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Giriş Sayfasına Dön
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gold text-gold-foreground hover:bg-gold/90 font-semibold"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Şifre Sıfırlama Bağlantısı Gönder
              </Button>

              <Link href="/giris">
                <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Giriş Sayfasına Dön
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
