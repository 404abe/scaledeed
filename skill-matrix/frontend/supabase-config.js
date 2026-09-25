/**
 * Ten10 Skills Matrix — Supabase Connection Config
 * ------------------------------------------------------------
 * Fill these two values from your Supabase project:
 *   Supabase Dashboard → Project Settings → API
 *     • Project URL      → SUPABASE_URL
 *     • Project API keys → anon / public → SUPABASE_ANON_KEY
 *
 * The anon key is safe to expose in client-side code (that is its
 * purpose). Table access is governed by the RLS policies created in
 * supabase_setup.sql. For this hackathon demo those policies are
 * permissive (anon can read/write), so DO NOT store real secrets here.
 */

const SUPABASE_URL = "https://pcfotpnerdgknvamwwcn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZm90cG5lcmRna252YW13d2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMjMzMzYsImV4cCI6MjEwNTg5OTMzNn0.dDMyW9Lk96Ya2M7uWWyynHyZ3YfamjSlKaOBN7Dfj-8";
