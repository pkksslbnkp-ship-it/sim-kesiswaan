import { Student, User, Achievement, Alumni, ActivityLog } from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'sim_kesiswaan_students_v1',
  USERS: 'sim_kesiswaan_users_v1',
  ACHIEVEMENTS: 'sim_kesiswaan_achievements_v1',
  ALUMNI: 'sim_kesiswaan_alumni_v1',
  LOGS: 'sim_kesiswaan_logs_v1',
  CURRENT_USER: 'sim_kesiswaan_current_user_v1',
  IS_LOGGED_IN: 'sim_kesiswaan_is_logged_in_v1',
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    username: 'admin',
    password: 'password',
    name: 'Siti Rahmawati, M.Pd.',
    role: 'ADMIN',
    nip: '198503152010012001',
    status: 'aktif',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-2',
    username: 'guru',
    password: 'password',
    name: 'Budi Santoso, S.Pd.',
    role: 'GURU',
    nip: '199008202015031002',
    status: 'aktif',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    nisn: '0051234567',
    nis: '23241001',
    name: 'Ahmad Rizky Pratama',
    gender: 'L',
    class: '10 MIPA 1',
    major: 'MIPA',
    generation: '2023/2024',
    entryYear: 2023,
    status: 'Aktif',
    birthPlace: 'Jakarta',
    birthDate: '2007-05-12',
    address: 'Jl. Merdeka No. 45, Jakarta',
    phone: '081234567890',
    parentName: 'Hambali',
    parentPhone: '081298765432',
    notes: 'Ketua OSIS Periode 2024',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-2',
    nisn: '0057654321',
    nis: '23241002',
    name: 'Siti Nurhaliza',
    gender: 'P',
    class: '11 IPS 2',
    major: 'IPS',
    generation: '2022/2023',
    entryYear: 2022,
    status: 'Aktif',
    birthPlace: 'Bandung',
    birthDate: '2006-11-20',
    address: 'Jl. Mawar No. 12, Bandung',
    phone: '085712345678',
    parentName: 'Suryana',
    parentPhone: '085787654321',
    notes: 'Anggota Paskibra',
    createdAt: new Date().toISOString(),
  },
];

export function getStoredStudents(): Student[] {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!item) {
      setStoredStudents(INITIAL_STUDENTS);
      return INITIAL_STUDENTS;
    }
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_STUDENTS;
  } catch {
    return INITIAL_STUDENTS;
  }
}

export function setStoredStudents(data: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredUsers(): User[] {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!item) {
      setStoredUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
}

export function setStoredUsers(data: User[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredAchievements(): Achievement[] {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

export function setStoredAchievements(data: Achievement[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredAlumni(): Alumni[] {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.ALUMNI);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

export function setStoredAlumni(data: Alumni[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ALUMNI, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredLogs(): ActivityLog[] {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.LOGS);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

export function addActivityLog(user: string, role: string, action: string, details: string): void {
  try {
    const logs = getStoredLogs();
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user,
      role,
      action,
      details,
    };
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([newLog, ...logs].slice(0, 100)));
  } catch (e) {
    console.error(e);
  }
}

export function getCurrentUser(): User {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (item) return JSON.parse(item);
  } catch {}
  return INITIAL_USERS[0];
}

export function setCurrentUser(user: User): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } catch (e) {
    console.error(e);
  }
}

export function resetDataToDefault(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ALUMNI, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
  } catch (e) {
    console.error(e);
  }
}