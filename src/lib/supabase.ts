import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "Missing Supabase environment variables. Check .env.local has " +
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set."
    );
}

// Client-side / browser-safe client: uses the anon key, respects RLS.
// Safe to import in client components ("use client").
export const supabase = createClient(supabaseUrl, supabaseAnonKey);