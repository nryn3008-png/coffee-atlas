import { createBrowserClient } from "@supabase/ssr";

// Browser client — uses the public anon key. RLS enforces access:
// reference tables are world-readable; tastings/profiles are per-user.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
