import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const isTestEnv = Boolean(import.meta.env.VITEST) || import.meta.env.MODE === "test";

const resolvedSupabaseUrl =
  supabaseUrl || (isTestEnv ? "https://example.supabase.co" : undefined);
const resolvedSupabasePublishableKey =
  supabasePublishableKey || (isTestEnv ? "test-publishable-key" : undefined);

if (!resolvedSupabaseUrl) {
  throw new Error(
    "Missing environment variable: VITE_SUPABASE_URL. Please set it in your .env file."
  );
}

if (!resolvedSupabasePublishableKey) {
  throw new Error(
    "Missing environment variable: VITE_SUPABASE_PUBLISHABLE_KEY. Please set it in your .env file. This is the publishable key from Supabase Dashboard → Settings → API."
  );
}

export const supabase = createClient(
  resolvedSupabaseUrl,
  resolvedSupabasePublishableKey,
);
