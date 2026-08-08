import { Student, User, Achievement, Alumni, ActivityLog, UserRole } from '../types';
import { INITIAL_STUDENTS, INITIAL_USERS, INITIAL_ACHIEVEMENTS, INITIAL_ALUMNI, INITIAL_LOGS } from '../mockData';

const KEYS = {
  STUDENTS: 'sim_kesiswaan_students_v1',
  USERS: 'sim_kesiswaan_users_v1',
  ACHIEVEMENTS: 'sim_kesiswaan_achievements_v1',
  ALUMNI: 'sim_kesiswaan_alumni_v1',
  LOGS: 'sim_kesiswaan_logs_v1',
  CURRENT_USER: 'sim_kesiswaan_current_user_v1',
};

export const getStoredStudents = (): Student[] => {
  try {
    const data = localStorage.getItem(KEYS.STUDENTS);
    return data ? JSON.parse(data) : INITIAL_STUDENTS;
  } catch {
    return INITIAL_STUDENTS;
  }
};

export const setStoredStudents = (students: Student[]) => {
  try {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students to localStorage', e);
  }
};

export const getStoredUsers = (): User[] => {
  try {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
};

export const setStoredUsers = (users: User[]) => {
  try {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
};

export const getStoredAchievements = (): Achievement[] => {
  try {
    const data = localStorage.getItem(KEYS.ACHIEVEMENTS);
    return data ? JSON.parse(data) : INITIAL_ACHIEVEMENTS;
  } catch {
    return INITIAL_ACHIEVEMENTS;
  }
};

export const setStoredAchievements = (achievements: Achievement[]) => {
  try {
    localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch (e) {
    console.error('Failed to save achievements to localStorage', e);
  }
};

export const getStoredAlumni = (): Alumni[] => {
  try {
    const data = localStorage.getItem(KEYS.ALUMNI);
    return data ? JSON.parse(data) : INITIAL_ALUMNI;
  } catch {
    return INITIAL_ALUMNI;
  }
};

export const setStoredAlumni = (alumni: Alumni[]) => {
  try {
    localStorage.setItem(KEYS.ALUMNI, JSON.stringify(alumni));
  } catch (e) {
    console.error('Failed to save alumni to localStorage', e);
  }
};

export const getStoredLogs = (): ActivityLog[] => {
  try {
    const data = localStorage.getItem(KEYS.LOGS);
    return data ? JSON.parse(data) : INITIAL_LOGS;
  } catch {
    return INITIAL_LOGS;
  }
};

export const addActivityLog = (userName: string, userRole: UserRole, action: string, details: string) => {
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
    const updated = [newLog, ...logs].slice(0, 100);
    localStorage.setItem(KEYS.LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to log activity', e);
  }
};

export const getCurrentUser = (): User => {
  try {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    if (data) return JSON.parse(data);
  } catch {
    // fallback
  }
  return INITIAL_USERS[0]; // Admin by default
};

export const setCurrentUser = (user: User) => {
  try {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to set current user', e);
  }
};

export const resetDataToDefault = () => {
  try {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(INITIAL_ACHIEVEMENTS));
    localStorage.setItem(KEYS.ALUMNI, JSON.stringify(INITIAL_ALUMNI));
    localStorage.setItem(KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
  } catch (e) {
    console.error('Failed to reset data', e);
  }
};
