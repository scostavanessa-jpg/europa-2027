import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createNeonClient, SupabaseAuthAdapter } from "@neondatabase/neon-js";

const NEON_AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL as string | undefined;
const NEON_DATA_API_URL = import.meta.env.VITE_NEON_DATA_API_URL as string | undefined;

// Temporary fallback while Neon is being provisioned in Vercel.
// Once both Neon URLs exist, the application automatically stops using Supabase.
const FALLBACK_SUPABASE_URL = "https://dbvtxklavdgjndgwpboo.supabase.co";
const FALLBACK_SUPABASE_KEY = "sb_publishable_ML9VFIW30T8KQFCwNHM3Lg_mkQBEYqj";

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    if (headers.get("Authorization") === `Bearer ${supabaseKey}`) headers.delete("Authorization");
    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

const neonConfigured = Boolean(NEON_AUTH_URL && NEON_DATA_API_URL);

const neonClient = neonConfigured
  ? createNeonClient({
      auth: {
        adapter: SupabaseAuthAdapter(),
        url: NEON_AUTH_URL!,
      },
      dataApi: {
        url: NEON_DATA_API_URL!,
      },
    })
  : null;

const fallbackSupabaseClient = !neonConfigured
  ? createSupabaseClient(FALLBACK_SUPABASE_URL, FALLBACK_SUPABASE_KEY, {
      global: { fetch: createSupabaseFetch(FALLBACK_SUPABASE_KEY) },
      auth: {
        storage: typeof window !== "undefined" ? localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Compatibility name retained so the rest of the app does not need to change at once.
export const supabase: any = neonClient ?? fallbackSupabaseClient;
export const backendProvider = neonConfigured ? "neon" : "supabase-fallback";
export const isNeonConfigured = neonConfigured;
export const supabaseProjectUrl = neonConfigured ? NEON_DATA_API_URL! : FALLBACK_SUPABASE_URL;
