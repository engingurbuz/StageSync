"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-background p-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/kayit">
          <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kayıt Sayfasına Dön
          </Button>
        </Link>

        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-amber-600 shadow-lg mb-4">
              <Shield className="h-7 w-7 text-black" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Kişisel Verilerin Korunması Aydınlatma Metni
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Vokal Akademi Müzikal Korosu - Koro Takip Sistemi
            </p>
          </CardHeader>

          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-foreground">1. Veri Sorumlusu</h3>
              <p className="text-muted-foreground">
                6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında, kişisel verileriniz 
                Vokal Akademi Müzikal Korosu (&quot;Koro&quot;) tarafından aşağıda açıklanan amaçlar doğrultusunda 
                ve bu amaçlarla sınırlı olarak işlenmektedir.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">2. İşlenen Kişisel Veriler</h3>
              <p className="text-muted-foreground">Koro Takip Sistemi üzerinden aşağıdaki kişisel verileriniz işlenmektedir:</p>
              <ul className="text-muted-foreground list-disc pl-6 space-y-1">
                <li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
                <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası</li>
                <li><strong>Üyelik Bilgileri:</strong> Üyelik başlangıç tarihi, ses tipi, rol</li>
                <li><strong>Acil Durum İletişim Bilgileri:</strong> Acil durumda aranacak kişinin adı ve telefon numarası</li>
                <li><strong>Yoklama ve Katılım Verileri:</strong> Prova ve etkinlik katılım kayıtları</li>
                <li><strong>Form Yanıtları:</strong> Koro tarafından oluşturulan formlara verilen yanıtlar</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">3. Kişisel Verilerin İşlenme Amaçları</h3>
              <p className="text-muted-foreground">Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
              <ul className="text-muted-foreground list-disc pl-6 space-y-1">
                <li>Koro üyelik işlemlerinin yürütülmesi</li>
                <li>Prova ve etkinlik organizasyonunun yapılması</li>
                <li>Yoklama ve katılım takibinin sağlanması</li>
                <li>Üyeler arası iletişimin koordinasyonu</li>
                <li>Acil durumlarda iletişim sağlanması</li>
                <li>Koro faaliyetlerine ilişkin duyuruların yapılması</li>
                <li>Ses grubu ve kadro planlamasının yapılması</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">4. Kişisel Verilerin Aktarımı</h3>
              <p className="text-muted-foreground">
                Kişisel verileriniz, koro yönetimi ve yetkili kişiler dışında üçüncü taraflarla paylaşılmamaktadır. 
                Verileriniz yurt içinde Supabase altyapısı üzerinde güvenli bir şekilde saklanmaktadır.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">5. Kişisel Veri Saklama Süresi</h3>
              <p className="text-muted-foreground">
                Kişisel verileriniz, koro üyeliğiniz süresince ve üyeliğinizin sona ermesinden itibaren 
                yasal zorunluluklar çerçevesinde gerekli süre boyunca saklanacaktır.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">6. KVKK Kapsamındaki Haklarınız</h3>
              <p className="text-muted-foreground">KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
              <ul className="text-muted-foreground list-disc pl-6 space-y-1">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                <li>KVKK&apos;da öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                <li>Kişisel verilerinizin düzeltilmesi, silinmesi veya yok edilmesine ilişkin işlemlerin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">7. İletişim</h3>
              <p className="text-muted-foreground">
                KVKK kapsamındaki haklarınızı kullanmak için koro yönetimi ile iletişime geçebilirsiniz.
              </p>
            </section>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
