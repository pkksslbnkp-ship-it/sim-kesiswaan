// File: src/lib/supabaseConfig.ts

// Kredensial Default Supabase Sekolah
export const DEFAULT_SUPABASE_URL = 'https://pbsqkgigxvuwyfqogfcb.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBic3FrZ2lneHZ1d3lmcW9nZmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxNTE2MDYsImV4cCI6MjEwMTcyNzYwNn0.PtqSPh61Y8MX4jxhUrqi-AyamuKX1DkkDlJH4uXhseo'; 

// Helper untuk mengambil kredensial (mengutamakan LocalStorage, jika kosong pakai Default)
export const getSupabaseCredentials = () => {
  const url = localStorage.getItem('sim_kesiswaan_supabase_url') || DEFAULT_SUPABASE_URL;
  const key = localStorage.getItem('sim_kesiswaan_supabase_key') || DEFAULT_SUPABASE_KEY;
  return { url, key };
};