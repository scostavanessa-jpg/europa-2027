import { createClient } from "@supabase/supabase-js";

// Public client credentials from the original Lovable project.
// These values are intentionally browser-visible; data security is enforced by Supabase RLS.
const ORIGINAL_SUPABASE_URL = "https://dbvtxklavdgjndgwpboo.supabase.co";
const ORIGINAL_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ML9VFIW30T8KQFCwNHM3Lg_mkQBEYqj";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ORIGINAL_SUPABASE_URL;
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ORIGINAL_SUPABASE_PUBLISHABLE_KEY;

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  global: { fetch: createSupabaseFetch(SUPABASE_KEY) },
  auth: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const supabaseProjectUrl = SUPABASE_URL;