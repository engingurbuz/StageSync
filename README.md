# StageSync — Koro Yönetim Platformu

Müzikal tiyatro ve koro grupları için kapsamlı yönetim platformu. Next.js 16, Supabase ve Tailwind CSS ile geliştirilmiştir.

## Özellikler

- **Üye Yönetimi** — Koro üyelerini ekle, düzenle, ses tiplerine göre filtrele
- **Yoklama Takibi** — Etkinlik oluştur, katılım durumunu işaretle
- **Repertuvar Kütüphanesi** — Şarkılar, besteciler, nota dosyaları
- **Seçmeler & Kadro** — Seçme ilanları, kadro listesi, rol atamaları
- **Yaratıcı Pano** — Kanban tarzı görev yönetimi, toplantı notları
- **Duyurular** — Sabitlenebilir, öncelikli duyuru sistemi
- **Kimlik Doğrulama** — Supabase Auth ile giriş/kayıt/çıkış

## Teknoloji Yığını

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Stil:** Tailwind CSS v4, Shadcn/UI
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Durum Yönetimi:** TanStack React Query
- **Bildirimler:** Sonner

## Başlangıç

```bash
# Bağımlılıkları kur
npm install

# .env.local dosyasını oluştur (.env.local.example'dan kopyala)
cp .env.local.example .env.local

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## Ortam Değişkenleri

`.env.local` dosyasına aşağıdaki değişkenleri ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Deploy

Vercel üzerinden kolayca deploy edebilirsiniz:

[![Vercel ile Deploy Et](https://vercel.com/button)](https://vercel.com/new)

