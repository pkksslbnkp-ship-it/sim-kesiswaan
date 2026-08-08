export type UserRole = 'admin' | 'guru';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  nip?: string;
  role: UserRole;
  avatar?: string;
  status: 'aktif' | 'nonaktif';
  createdAt: string;
}

export type StudentStatus = 'Aktif' | 'Lulus' | 'Mutasi' | 'DO';
export type Gender = 'L' | 'P';

export type Religion = 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Khonghucu' | 'Lainnya';
export type SpecialNeeds = 
  | 'Tidak Ada' 
  | 'Tunanetra (A)' 
  | 'Tunarungu (B)' 
  | 'Tunagrahita (C)' 
  | 'Tunadaksa (D)' 
  | 'Tunalaras (E)'
  | 'Autis' 
  | 'ADHD' 
  | 'Kesulitan Belajar' 
  | 'Cerdas Istimewa' 
  | 'Lainnya';

export interface Student {
  id: string;
  nisn: string;
  nis: string;
  name: string;
  gender: Gender;
  religion?: Religion;
  specialNeeds?: SpecialNeeds;
  class: string; // e.g., '10 IPA 1', '11 TKJ 2', '12 RPL 1'
  major: string; // e.g., 'MIPA', 'IPS', 'TKJ', 'RPL', 'AKL'
  generation: string; // e.g., '2023/2024'
  entryYear: number;
  status: StudentStatus;
  birthPlace?: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  notes?: string;
  createdAt: string;
}

export type AchievementLevel = 'Sekolah' | 'Kabupaten/Kota' | 'Provinsi' | 'Nasional' | 'Internasional';
export type AchievementCategory = 'Akademik' | 'Seni' | 'Olahraga' | 'Keagamaan' | 'Teknologi' | 'Lainnya';

export interface Achievement {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  title: string; // e.g. "Juara 1 OSN Matematika"
  category: AchievementCategory;
  level: AchievementLevel;
  organizer: string; // e.g. "Dinas Pendidikan Provinsi"
  rank: string; // e.g. "Juara 1", "Harapan 2", "Gold Medal"
  eventDate: string;
  certificateUrl?: string;
  description?: string;
  createdAt: string;
}

export type AlumniCurrentStatus = 'Kuliah' | 'Bekerja' | 'Wirausaha' | 'Mencari Kerja' | 'Lainnya';

export interface Alumni {
  id: string;
  studentId: string;
  nisn: string;
  name: string;
  graduationYear: number;
  major: string;
  currentStatus: AlumniCurrentStatus;
  institutionName?: string; // PTN/PTS atau Nama Perusahaan
  positionOrMajor?: string; // Jurusan Kuliah atau Jabatan Kerja
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface FilterStudentOptions {
  search: string;
  class: string;
  major: string;
  generation: string;
  status: StudentStatus | 'All';
  gender: Gender | 'All';
  religion: Religion | 'All';
  specialNeeds: SpecialNeeds | 'All';
  addressRegion: string;
}

export interface ExcelStudentRow {
  NISN?: string | number;
  NIS?: string | number;
  'Nama Lengkap'?: string;
  Nama?: string;
  'Jenis Kelamin'?: string;
  JK?: string;
  Agama?: string;
  'Kebutuhan Khusus'?: string;
  Disabilitas?: string;
  Kelas?: string;
  Jurusan?: string;
  Angkatan?: string | number;
  'Tahun Masuk'?: string | number;
  Status?: string;
  'No HP/WA'?: string | number;
  'Nama Orang Tua'?: string;
  Alamat?: string;
  [key: string]: any;
}
