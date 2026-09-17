import { Student, User, Achievement, Alumni, ActivityLog } from '../types';

// Key Storage Constant (Diperbarui ke v2 agar otomatis me-refresh LocalStorage di browser)
const KEYS = {
  STUDENTS: 'sim_kesiswaan_students',
  USERS: 'sim_kesiswaan_users_v2', // <--- Key diperbarui ke v2
  ACHIEVEMENTS: 'sim_kesiswaan_achievements',
  ALUMNI: 'sim_kesiswaan_alumni',
  LOGS: 'sim_kesiswaan_logs',
  CURRENT_USER: 'sim_kesiswaan_current_user',
};

// Data Default (Initial Demo Data)
const DEFAULT_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Waka Kesiswaan (Admin)',
    email: 'admin@sekolah.sch.id',
    username: 'admin',
    password: 'password',
    role: 'ADMIN',
    status: 'aktif',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-2',
    name: 'Guru Pembina',
    email: 'guru@sekolah.sch.id',
    username: 'guru',
    password: 'password',
    role: 'GURU',
    status: 'aktif',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'std-1',
    nisn: '106599182',
    nis: '23241001',
    name: 'Kinaura Vidya Aulia',
    gender: 'P',
    class: '10B',
    major: 'Tunagrahita',
    generation: '2025/2026',
    entryYear: 2025,
    status: 'Aktif',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-2',
    nisn: '93355828',
    nis: '23241002',
    name: 'Moreno Aprin Kurniawan',
    gender: 'L',
    class: '10B',
    major: 'Tunagrahita',
    generation: '2025/2026',
    entryYear: 2025,
    status: 'Aktif',
    createdAt: new Date().toISOString(),
  },
];

// Helper Safe Storage Reads & Writes
export const getStoredStudents = (): Student[] => {
  try {
    const data = localStorage.getItem(KEYS.STUDENTS);
    return data ? JSON.parse(data) : DEFAULT_STUDENTS;
  } catch (error) {
    console.error('Error reading students:', error);
    return DEFAULT_STUDENTS;
  }
};

export const setStoredStudents = (students: Student[]): void => {
  try {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  } catch (error) {
    console.error('Error saving students:', error);
  }
};

export const getStoredUsers = (): User[] => {
  try {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
};

export const setStoredUsers = (users: User[]): void => {
  try {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error(e);
  }
};

export const getStoredAchievements = (): Achievement[] => {
  try {
    const data = localStorage.getItem(KEYS.ACHIEVEMENTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const setStoredAchievements = (achievements: Achievement[]): void => {
  try {
    localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch (e) {
    console.error(e);
  }
};

export const getStoredAlumni = (): Alumni[] => {
  try {
    const data = localStorage.getItem(KEYS.ALUMNI);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const setStoredAlumni = (alumni: Alumni[]): void => {
  try {
    localStorage.setItem(KEYS.ALUMNI, JSON.stringify(alumni));
  } catch (e) {
    console.error(e);
  }
};

export const getStoredLogs = (): ActivityLog[] => {
  try {
    const data = localStorage.getItem(KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addActivityLog = (
  userName: string,
  userRole: string,
  action: string,
  details: string
): void => {
  try {
    const logs = getStoredLogs();
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userName,
      userRole,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(KEYS.LOGS, JSON.stringify([newLog, ...logs].slice(0, 50)));
  } catch (e) {
    console.error(e);
  }
};

export const getCurrentUser = (): User => {
  try {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : DEFAULT_USERS[0];
  } catch {
    return DEFAULT_USERS[0];
  }
};

export const setCurrentUser = (user: User): void => {
  try {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } catch (e) {
    console.error(e);
  }
};

export const resetDataToDefault = (): void => {
  try {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    localStorage.setItem(KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify([]));
    localStorage.setItem(KEYS.ALUMNI, JSON.stringify([]));
    localStorage.setItem(KEYS.LOGS, JSON.stringify([]));
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS[0]));
  } catch (e) {
    console.error('Failed to reset data:', e);
  }
};