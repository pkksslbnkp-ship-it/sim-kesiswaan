import { createClient } from '@supabase/supabase-js';
import { Student } from '../types';

// Ambil konfigurasi dari Environment Variables atau LocalStorage
export const getSupabaseConfig = () => {
  const url =
    import.meta.env.VITE_SUPABASE_URL ||
    localStorage.getItem('supabase_url') ||
    '';
  const key =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    localStorage.getItem('supabase_anon_key') ||
    '';

  return {
    url,
    key,
    isConfigured: Boolean(url && key && url !== 'https://placeholder.supabase.co'),
  };
};

const config = getSupabaseConfig();

export const supabase = createClient(
  config.url || 'https://placeholder.supabase.co',
  config.key || 'placeholder'
);

export const setSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_anon_key', key);
};

// Fungsi untuk menyimpan data siswa dari Excel ke Supabase
export const insertExcelStudentsToSupabase = async (
  students: Partial<Student>[]
) => {
  const currentConfig = getSupabaseConfig();
  if (!currentConfig.isConfigured) {
    throw new Error('Supabase belum dikonfigurasi. Silakan atur URL dan Key.');
  }

  const formattedStudents = students.map((s) => ({
    nisn: s.nisn || '',
    nis: s.nis || '',
    name: s.name || '',
    gender: s.gender || 'L',
    class: s.class || '',
    major: s.major || '',
    status: s.status || 'Aktif',
    phone: s.phone || '',
    parent_name: s.parentName || '',
    parent_phone: s.parentPhone || '',
    address: s.address || '',
    violation_points: s.violationPoints || 0,
  }));

  const { data, error } = await supabase
    .from('students')
    .insert(formattedStudents)
    .select();

  if (error) {
    throw error;
  }

  return data;
};
