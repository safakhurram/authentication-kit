import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client =
  url && key
    ? createClient(url, key, {
        auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
      })
    : null;

/** Already have a Supabase client in your app? Call setSupabaseClient(yourClient) once, before rendering. */
export function setSupabaseClient(c) {
  client = c;
}

export function getSupabase() {
  return client;
}

export function getConfigError() {
  return client
    ? null
    : 'Supabase credentials are missing. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.';
}

export function getAppOrigin() {
  return import.meta.env.VITE_APP_URL || window.location.origin;
}

/**
 * While true, auth state changes are ignored by AuthProvider. Used during the
 * "password check -> email code" login so the app never sees a half-signed-in user.
 */
export const authGuard = { hold: false };
