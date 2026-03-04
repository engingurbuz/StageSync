# Maestro — Koro & Müzikal Yönetim Platformu

*Koronun Dijital Şefi*

Müzikal tiyatro ve koro grupları için kapsamlı yönetim platformu. Üye takibi, yoklama, repertuvar, seçmeler, yaratıcı görevler, duyurular ve formlar tek bir uygulamada. Next.js 16, Supabase ve Tailwind CSS ile geliştirilmiştir.

## Özellikler

### Üye & Rol Yönetimi
- **Üye yönetimi** — Korist ekleme, düzenleme, ses tipine ve duruma göre filtreleme
- **Çoklu roller** — Admin, Koro Şefi, Partisyon Şefi, Yaratıcı Ekip, Korist, Gözlemci
- **Bölüm bazlı yetkiler** — `role_permissions` ile bölüm bazında görüntüleme/oluşturma/düzenleme/silme
- **Profil** — Avatar, acil iletişim, biyografi, katılım tarihi

### Etkinlik & Yoklama
- **Etkinlik türleri** — Prova, gösteri, seçme, toplantı, atölye, sosyal
- **Yoklama takibi** — Katıldı / Gelmedi / Gecikti / İzinli; bölüm şefi ve admin yönetimi
- **Productions** — Sezonluk prodüksiyonlar, etkinliklerle ilişkilendirme

### Repertuvar
- **Şarkı kütüphanesi** — Başlık, besteci, aranjör, tür, ses partileri, süre, zorluk
- **Medya** — Nota (PDF), ses, MIDI için Supabase Storage (sheet-music, audio-files)

### Seçmeler & Kadro
- **Seçme ilanları** — Rol adı, açıklama, ses tipi, tarih, konum, durum (açık/kapalı/in_review/tamamlandı)
- **Seçme kayıtları** — Üyelerin seçmelere kaydı, not ve video linki
- **Kadro rolleri** — Prodüksiyon bazında rol ataması (lead, understudy, ensemble, swing)

### Yaratıcı Pano
- **Kanban görevleri** — Kategori (kostüm, koreografi, sahne, ışık, ses, props, pazarlama, genel), durum (todo, in_progress, review, done)
- **Toplantı notları** — Tarih, katılımcılar, etiketler, prodüksiyon ilişkisi
- **Yetki** — Yaratıcı ekip ve admin

### Duyurular
- **Sabitlenebilir duyurular** — Öncelik (normal, önemli, acil)
- **Yönetim** — Admin oluşturur ve düzenler

### Formlar
- **Dinamik formlar** — Taslak / Aktif / Kapalı; hedef kitle (tümü, üye, partisyon şefi, özel roller)
- **Soru tipleri** — Metin, textarea, select, multiselect, checkbox, radio, tarih, sayı
- **Zorunlu formlar** — Sisteme giriş öncesi doldurulması zorunlu formlar
- **Form cevapları** — Kullanıcı başına tek cevap, sonuç görüntüleme (admin/yaratıcı ekip/partisyon şefi)

### Kimlik & KVKK
- **Supabase Auth** — Giriş, kayıt, çıkış, şifremi unuttum, şifre yenileme
- **KVKK onayı** — Profilde `kvkk_consent` ve `kvkk_consent_date`; ayrı KVKK sayfası
- **RLS** — Tüm tablolarda Row Level Security ile yetki kontrolü

## Teknoloji Yığını

| Katman        | Teknoloji |
|---------------|-----------|
| **Frontend**  | Next.js 16 (App Router), React 19, TypeScript, React Compiler |
| **Stil**      | Tailwind CSS v4, Shadcn/UI (Radix), Lucide ikonlar |
| **Backend**   | Supabase (PostgreSQL, Auth, RLS, Storage) |
| **Veri & UI** | TanStack React Query, Zustand |
| **Bildirimler** | Sonner |
| **Tarih**     | date-fns |

## Proje Yapısı (Özet)

```
src/
├── app/                    # App Router sayfaları
│   ├── (dashboard)/        # Dashboard: ana-sayfa, uyeler, yoklama, repertuvar, secmeler, yaratici, duyurular, formlar, ayarlar
│   ├── giris, kayit, sifremi-unuttum, sifre-yenile, kvkk
│   └── actions/            # Server actions (örn. members davet)
├── components/
│   ├── ui/                  # Shadcn bileşenleri
│   ├── layout/              # sidebar, header
│   └── dialogs/             # Modal diyaloglar (form, üye, şarkı, duyuru, seçme, etkinlik, vb.)
├── hooks/                   # use-auth, use-members, use-events, use-songs, use-auditions, use-tasks, use-forms, use-announcements, use-permissions
├── lib/
│   ├── supabase/            # client, server, middleware
│   ├── constants.ts         # Roller, ses tipleri, bölümler, varsayılan yetkiler
│   └── utils.ts
└── types/database.ts        # Supabase tipleri
supabase/
├── schema.sql               # Ana şema (profiles, events, attendance, songs, auditions, cast_roles, creative_tasks, meeting_notes, storage)
└── migrations/              # 002 forms+KVKK, 003 observer role, 004 multi-roles, 005 admin delete profiles
scripts/
└── seed-test-user.mjs       # Test kullanıcısı oluşturma (Supabase Auth + profile)
```

## Başlangıç

### Gereksinimler
- Node.js 20+
- Supabase projesi

### Kurulum

```bash
# Bağımlılıkları kur
npm install

# Ortam değişkenlerini ayarla (aşağıdaki "Ortam Değişkenleri" bölümüne bakın)
# .env.local dosyasını oluşturup gerekli değerleri ekleyin

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

### Test kullanıcısı (isteğe bağlı)

Supabase’de ilk kullanıcıyı oluşturmak için:

```bash
node scripts/seed-test-user.mjs
```

Bu script `test@maestro.app` / `Test1234!` ile bir kullanıcı ve profil oluşturur. **Supabase Dashboard’dan bu kullanıcıya `admin` rolü atayabilirsiniz** (profiles tablosunda `role` ve `roles` alanlarını güncelleyin).

## Ortam Değişkenleri

`.env.local` dosyasına aşağıdaki değişkenleri ekleyin:

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Evet | Supabase proje URL’i |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Evet | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Sunucu aksiyonları için | Davet e-postası vb. için; **client’a koymayın** |

Örnek:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Veritabanı Kurulumu

1. Supabase projesinde **SQL Editor** ile önce `schema.sql` içeriğini çalıştırın.
2. Ardından `migrations` klasöründeki dosyaları sırayla uygulayın:  
   `002_forms_system.sql` → `003_add_observer_role.sql` → `004_multi_roles_permissions.sql` → `005_admin_delete_profiles.sql`

Storage bucket’ları şema içinde tanımlıdır: `avatars`, `sheet-music`, `audio-files`, `production-assets`.

## Scriptler

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu (localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Production sunucusunu başlat |
| `npm run lint` | ESLint |

## Deploy

Vercel ile deploy için:

1. Repoyu bağlayın, build komutu: `npm run build`, output: Next.js varsayılanı.
2. Vercel ortam değişkenlerine `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` ve (gerekirse) `SUPABASE_SERVICE_ROLE_KEY` ekleyin.

[![Vercel ile Deploy Et](https://vercel.com/button)](https://vercel.com/new)

## Lisans

Private — Maestro / Koro Yönetim Platformu.
