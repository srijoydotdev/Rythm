// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseServer = createClient(
  process.env.SUPABASE_URL!, // Non-public, server-only
  process.env.SUPABASE_SERVICE_KEY!, // Service key, never expose
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);