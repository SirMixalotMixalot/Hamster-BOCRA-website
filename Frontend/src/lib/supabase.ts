import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing environment variable: VITE_SUPABASE_URL. Please set it in your .env file."
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "Missing environment variable: VITE_SUPABASE_PUBLISHABLE_KEY. Please set it in your .env file. This is the publishable key from Supabase Dashboard → Settings → API."
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
