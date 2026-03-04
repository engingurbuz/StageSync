import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local manually
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    const vars = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      // Remove surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      vars[key] = value;
    }
    return vars;
  } catch {
    return {};
  }
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY bulunamadı.");
  console.error("   .env.local dosyasında SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_EMAIL = "test@maestro.app";
const TEST_PASSWORD = "Test1234!";
const TEST_NAME = "Test Kullanıcı";

async function seed() {
  console.log("🔄 Test kullanıcısı oluşturuluyor...");
  console.log(`   Email: ${TEST_EMAIL}`);
  console.log(`   Şifre: ${TEST_PASSWORD}`);

  // Check if user already exists - try to list with email filter
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === TEST_EMAIL);

  if (existing) {
    console.log("⚠️  Bu email ile kullanıcı zaten var. Şifre güncelleniyor...");
    const { error } = await supabase.auth.admin.updateUser(existing.id, {
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (error) {
      console.error("❌ Şifre güncellenemedi:", error.message);
      process.exit(1);
    }
    // Update profile
    await supabase
      .from("profiles")
      .update({ full_name: TEST_NAME, status: "active", role: "member" })
      .eq("id", existing.id);
    console.log("✅ Mevcut kullanıcının şifresi güncellendi!");
  } else {
    // Create new user
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: TEST_NAME },
    });

    if (error) {
      console.error("❌ Kullanıcı oluşturulamadı:", error.message);
      process.exit(1);
    }

    if (data.user) {
      // Wait for trigger
      await new Promise((r) => setTimeout(r, 500));
      
      // Update profile
      await supabase
        .from("profiles")
        .update({ full_name: TEST_NAME, status: "active", role: "member" })
        .eq("id", data.user.id);

      console.log("✅ Test kullanıcısı başarıyla oluşturuldu!");
    }
  }

  console.log("\n📋 Giriş bilgileri:");
  console.log(`   Email: ${TEST_EMAIL}`);
  console.log(`   Şifre: ${TEST_PASSWORD}`);
}

seed().catch((err) => {
  console.error("❌ Hata:", err);
  process.exit(1);
});
