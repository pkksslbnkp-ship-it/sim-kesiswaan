import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Student, User, Achievement, Alumni } from '../types';

// Retrieve stored credentials or environment variables
export const getSupabaseConfig = () => {
  const storedUrl = localStorage.getItem('sim_kesiswaan_supabase_url');
  const storedKey = localStorage.getItem('sim_kesiswaan_supabase_key');

  const url = storedUrl || import.meta.env.VITE_SUPABASE_URL || '';
  const key = storedKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  return { url, key };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('sim_kesiswaan_supabase_url', url.trim());
  localStorage.setItem('sim_kesiswaan_supabase_key', key.trim());
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('sim_kesiswaan_supabase_url');
  localStorage.removeItem('sim_kesiswaan_supabase_key');
};

let cachedClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  try {
    if (!cachedClient) {
      cachedClient = createClient(url, key);
    }
    return cachedClient;
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
    return null;
  }
};

export const resetSupabaseClient = () => {
  cachedClient = null;
};

// Check connection status
export const checkSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'URL & Anon Key Supabase belum dikonfigurasi.' };
  }

  try {
    // Try querying a dummy table or auth
    const { error } = await client.from('students').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's still connected!
      if (error.message.includes('relation "public.students" does not exist')) {
        return { success: fontSuccess(true), message: 'Terhubung ke Supabase! (Tabel belum dibuat, silakan jalankan SQL Schema)' };
      }
      return { success: false, message: `Gagal query: ${error.message}` };
    }
    return { success: true, message: 'Koneksi ke database Supabase BERHASIL!' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Koneksi ke Supabase gagal.' };
  }
};

function fontSuccess(connected: boolean): boolean {
  return connected;
}

// SQL DDL Generator for easy Supabase SQL Editor setup
export const getSupabaseTableSQL = () => {
  return `-- SQL Schema Setup untuk SIM-KESISWAAN
-- Jalankan kode ini di SQL Editor dashboard Supabase Anda

-- 1. Tabel Siswa (students)
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  nisn TEXT NOT NULL,
  nis TEXT,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  major TEXT NOT NULL,
  gender TEXT,
  status TEXT DEFAULT 'Aktif',
  violation_points INT DEFAULT 0,
  phone TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  address TEXT,
  birth_place TEXT,
  birth_date TEXT,
  photo TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Prestasi (achievements)
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  rank TEXT NOT NULL,
  year INT NOT NULL,
  organizer TEXT,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Alumni (alumni)
CREATE TABLE IF NOT EXISTS public.alumni (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  nisn TEXT NOT NULL,
  name TEXT NOT NULL,
  graduation_year INT NOT NULL,
  major TEXT NOT NULL,
  current_status TEXT NOT NULL,
  institution_name TEXT,
  position_or_major TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) & Public Policies (Optional / Recommended)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for achievements" ON public.achievements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for alumni" ON public.alumni FOR ALL USING (true) WITH CHECK (true);
`;
};

// Sync Students
export const syncStudentsToSupabase = async (students: Student[]): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const formatted = students.map((s) => ({
      id: s.id,
      nisn: s.nisn,
      nis: s.nis || '',
      name: s.name,
      class: s.class,
      major: s.major,
      gender: s.gender || 'L',
      status: s.status || 'Aktif',
      violation_points: s.violationPoints || 0,
      phone: s.phone || '',
      parent_name: s.parentName || '',
      parent_phone: s.parentPhone || '',
      address: s.address || '',
      birth_place: s.birthPlace || '',
      birth_date: s.birthDate || '',
      photo: s.photo || '',
      notes: s.notes || '',
    }));

    const { error } = await client.from('students').upsert(formatted, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase students upsert warning:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Failed to sync students to Supabase:', e);
    return false;
  }
};

export const fetchStudentsFromSupabase = async (): Promise<Student[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('students').select('*').order('name', { ascending: true });
    if (error || !data) return null;

    return data.map((row: any) => ({
      id: String(row.id),
      nisn: row.nisn,
      nis: row.nis,
      name: row.name || row.nama_lengkap || '',
      class: row.class || row.kelas || '',
      major: row.major || row.jurusan || '',
      gender: row.gender || row.jenis_kelamin || 'L',
      status: row.status || 'Aktif',
      violationPoints: row.violation_points || 0,
      phone: row.phone,
      parentName: row.parent_name,
      parentPhone: row.parent_phone,
      address: row.address,
      birthPlace: row.birth_place,
      birthDate: row.birth_date,
      photo: row.photo,
      notes: row.notes,
    }));
  } catch (e) {
    console.error('Failed to fetch students from Supabase:', e);
    return null;
  }
};

export interface SupabaseInsertResult {
  success: boolean;
  message: string;
  insertedCount?: number;
  errorDetail?: any;
}

// Directly insert parsed Excel students into Supabase table 'students'
export const insertExcelStudentsToSupabase = async (
  extractedStudents: Array<{
    nisn: string;
    nis: string;
    name: string;
    gender: 'L' | 'P';
    class: string;
    major: string;
    generation?: string;
    status?: string;
    phone?: string;
    parentName?: string;
    address?: string;
  }>
): Promise<SupabaseInsertResult> => {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase belum dikonfigurasi. Silakan isi URL & Anon Key di menu Supabase DB di bagian atas.',
    };
  }

  if (!extractedStudents || extractedStudents.length === 0) {
    return {
      success: false,
      message: 'Tidak ada data siswa dari Excel untuk dikirim ke Supabase.',
    };
  }

  // Format 1: Standard Schema (without id property so Supabase auto-generates auto-increment ID)
  const standardRows = extractedStudents.map((s) => ({
    nisn: s.nisn,
    nis: s.nis || '',
    name: s.name,
    class: s.class,
    major: s.major,
    gender: s.gender || 'L',
    status: s.status || 'Aktif',
    phone: s.phone || '',
    parent_name: s.parentName || '',
    address: s.address || '',
    notes: 'Diimpor dari Excel',
  }));

  try {
    // Attempt 1: Insert standard rows using supabase.from('students').insert()
    const { data, error } = await client.from('students').insert(standardRows).select();

    if (!error) {
      return {
        success: true,
        message: `BERHASIL! ${standardRows.length} data siswa dari file Excel telah disimpan langsung ke tabel 'students' di Supabase.`,
        insertedCount: standardRows.length,
      };
    }

    console.warn('Supabase standard insert error:', error);

    // If error indicates missing columns, attempt Indonesian column mapping fallback
    if (
      error.message.includes('column') ||
      error.message.includes('schema') ||
      error.message.includes('Could not find')
    ) {
      const indonesianRows = extractedStudents.map((s) => ({
        nisn: s.nisn,
        nis: s.nis || '',
        nama_lengkap: s.name,
        kelas: s.class,
        jurusan: s.major,
        jenis_kelamin: s.gender || 'L',
        angkatan: s.generation || '',
        status: s.status || 'Aktif',
      }));

      const { error: error2 } = await client.from('students').insert(indonesianRows).select();

      if (!error2) {
        return {
          success: true,
          message: `BERHASIL! ${indonesianRows.length} data siswa telah disimpan ke Supabase (pemetaan kolom bahasa Indonesia).`,
          insertedCount: indonesianRows.length,
        };
      }

      return {
        success: false,
        message: `Gagal menyimpan ke Supabase: ${error2.message} (${error2.code ? 'Kode: ' + error2.code : ''})`,
        errorDetail: error2,
      };
    }

    // Friendly error messages for common issues
    let userMsg = error.message;
    if (error.message.includes('relation "public.students" does not exist') || error.code === '42P01') {
      userMsg = 'Tabel "students" belum ada di Supabase. Silakan buka menu "Supabase DB" dan jalankan Script SQL Schema terlebih dahulu.';
    } else if (error.message.includes('row-level security') || error.code === '42501') {
      userMsg = 'Row Level Security (RLS) di Supabase memblokir penambahan data. Silakan jalankan policy RLS di menu "Supabase DB" -> Script SQL.';
    } else if (error.code === '23505') {
      userMsg = `Terdapat NISN/ID duplikat di Supabase: ${error.details || error.message}`;
    }

    return {
      success: false,
      message: `Gagal menyimpan ke Supabase: ${userMsg}`,
      errorDetail: error,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Terjadi kesalahan saat menghubungi Supabase: ${err.message || 'Unknown network error'}`,
      errorDetail: err,
    };
  }
};
