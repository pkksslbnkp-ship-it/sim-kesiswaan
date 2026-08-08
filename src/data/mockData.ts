export interface UserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  password?: string;
  lastLogin?: string;
}

export const INITIAL_USERS: UserAccount[] = [
  {
    id: '1',
    name: 'Administrator Utama',
    username: 'admin',
    email: 'admin@sekolah.sch.id',
    role: 'Admin (Waka Kesiswaan)',
    status: 'Aktif',
    password: 'admin123',
    lastLogin: '2026-08-08 12:30',
  },
  {
    id: '2',
    name: 'Tim Kesiswaan',
    username: 'kesiswaan',
    email: 'kesiswaan@sekolah.sch.id',
    role: 'Guru (Read-only)',
    status: 'Aktif',
    password: 'guru123',
    lastLogin: '2026-08-07 09:15',
  },
  {
    id: '3',
    name: 'Wali Kelas X IPA 1',
    username: 'walikelas10',
    email: 'walikelas@sekolah.sch.id',
    role: 'Guru (Read-only)',
    status: 'Aktif',
    password: 'guru123',
    lastLogin: '2026-08-06 14:20',
  },
];