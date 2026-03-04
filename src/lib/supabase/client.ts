import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build/prerendering env vars may be absent — use placeholders
  // so the client can be instantiated without crashing.
  return createBrowserClient(
    url || "https://placeholder.supabase.co",
    key || "placeholder-anon-key"
  );
}
