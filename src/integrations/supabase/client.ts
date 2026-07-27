import { createClient } from "@supabase/supabase-js";

// During the Lovable -> GitHub/Vercel migration, production is intentionally
// pinned to the original Lovable Supabase project so stale Vercel variables
// cannot point authentication at a different backend.
const SUPABASE_URL = "https://dbvtxklavdgjndgwpboo.supabase.co";
const SUPABASE_KEY = "sb_publishable_ML9VFIW30T8KQFCwNHM3Lg_mkQBEYqj";

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    // Supabase's new publishable keys are opaque API keys, not bearer JWTs.
    if (headers.get("Authorization") === `Bearer ${supabaseKey}`) {
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