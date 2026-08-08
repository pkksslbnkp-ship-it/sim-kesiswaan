import React, { useState, useEffect } from 'react';
import { 
  User, 
  Student, 
  Achievement, 
  Alumni, 
  ActivityLog 
} from './types';
import { 
  getStoredStudents, 
  setStoredStudents, 
  getStoredUsers, 
  setStoredUsers, 
  getStoredAchievements, 
  setStoredAchievements, 
  getStoredAlumni, 
  setStoredAlumni, 
  getStoredLogs, 
  addActivityLog, 
  getCurrentUser, 
  setCurrentUser, 
  resetDataToDefault 
} from './lib/storage';

import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { StudentModal } from './components/StudentModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { ExcelUpload } from './components/ExcelUpload';
import { AchievementList } from './components/AchievementList';
import { AlumniList } from './components/AlumniList';
import { UserManagement } from './components/UserManagement';
import { TechnicalDoc } from './components/TechnicalDoc';
import { LoginPage } from './components/LoginPage';
import { SchoolLogoModal } from './components/SchoolLogoModal';
import { SupabaseModal } from './components/SupabaseModal';

import { ConfirmModal } from './components/ConfirmModal';

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // School Logo state
  const [schoolLogo, setSchoolLogo] = useState<string | null>(() => {
    try {
      return localStorage.getItem('sim_kesiswaan_school_logo');
    } catch {
      return null;
    }
  });

  // Modal open states
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Application login state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const auth = localStorage.getItem('sim_kesiswaan_is_logged_in_v1');
      return auth ? JSON.parse(auth) : false;
    } catch {
      return false;
    }
  });

  // Application core data state
  const [currentUser, setCurrentUserRule] = useState<User>(getCurrentUser());
  const [users, setUsers] = useState<User[]>(getStoredUsers());
  const [students, setStudents] = useState<Student[]>(getStoredStudents());
  const [achievements, setAchievements] = useState<Achievement[]>(getStoredAchievements());
  const [alumni, setAlumni] = useState<Alumni[]>(getStoredAlumni());
  const [logs, setLogs] = useState<ActivityLog[]>(getStoredLogs());

  // Modal controls
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);

  // Reusable Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const askConfirmation = (config: {
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }) => {
    setConfirmModal({
      isOpen: true,
      title: config.title,
      message: config.message,
      confirmText: config.confirmText,
      variant: config.variant || 'danger',
      onConfirm: () => {
        config.onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Sync state to localStorage whenever modified
  useEffect(() => {
    setStoredStudents(students);
  }, [students]);

  useEffect(() => {
    setStoredUsers(users);
  }, [users]);

  useEffect(() => {
    setStoredAchievements(achievements);
  }, [achievements]);

  useEffect(() => {
    setStoredAlumni(alumni);
  }, [alumni]);

  useEffect(() => {
    try {
      localStorage.setItem('sim_kesiswaan_is_logged_in_v1', JSON.stringify(isLoggedIn));
    } catch (e) {
      console.error('Failed to save login state', e);
    }
  }, [isLoggedIn]);

  // Handle Login & Logout
  const handleLoginSuccess = (user: User) => {
    setCurrentUserRule(user);
    setCurrentUser(user);
    setIsLoggedIn(true);
    addActivityLog(user.name, user.role, 'LOGIN', `Berhasil login ke sistem sebagai ${user.name} (${user.role})`);
    setLogs(getStoredLogs());
  };

  const handleLogout = () => {
    addActivityLog(currentUser.name, currentUser.role, 'LOGOUT', `Pengguna ${currentUser.name} keluar dari sistem`);
    setIsLoggedIn(false);
    localStorage.setItem('sim_kesiswaan_is_logged_in_v1', 'false');
    setLogs(getStoredLogs());
  };

  // Handle Switch Active User (Role Switcher for testing Admin vs Guru)
  const handleSwitchUser = (user: User) => {
    setCurrentUserRule(user);
    setCurrentUser(user);
    addActivityLog(user.name, user.role, 'SWITCH_USER', `Beralih peran sebagai ${user.name} (${user.role})`);
    setLogs(getStoredLogs());
  };

  // Handle Reset Demo Data
  const handleResetData = () => {
    askConfirmation({
      title: 'Reset Data Demo',
      message: 'Apakah Anda yakin ingin mereset seluruh data kesiswaan kembali ke set awal demo?',
      confirmText: 'Reset Sekarang',
      variant: 'warning',
      onConfirm: () => {
        resetDataToDefault();
        setStudents(getStoredStudents());
        setUsers(getStoredUsers());
        setAchievements(getStoredAchievements());
        setAlumni(getStoredAlumni());
        setCurrentUserRule(getCurrentUser());
        setLogs(getStoredLogs());
      },
    });
  };

  // Student CRUD Operations
  const handleSaveStudent = (data: Partial<Student>) => {
    if (editingStudent) {
      // Update
      const updated = students.map((s) => (s.id === editingStudent.id ? ({ ...s, ...data } as Student) : s));
      setStudents(updated);
      addActivityLog(currentUser.name, currentUser.role, 'UPDATE_STUDENT', `Memperbarui data siswa: ${data.name}`);
    } else {
      // Create
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        nisn: data.nisn || `00${Date.now()}`,
        nis: data.nis || `${23241000 + students.length}`,
        name: data.name || 'Siswa Baru',
        gender: data.gender || 'L',
        class: data.class || '10 MIPA 1',
        major: data.major || 'MIPA',
        generation: data.generation || '2025/2026',
        entryYear: data.entryYear || 2025,
        status: data.status || 'Aktif',
        birthPlace: data.birthPlace || '',
        birthDate: data.birthDate || '',
        address: data.address || '',
        phone: data.phone || '',
        parentName: data.parentName || '',
        parentPhone: data.parentPhone || '',
        notes: data.notes || '',
        createdAt: new Date().toISOString(),
      };
      setStudents([newStudent, ...students]);
      addActivityLog(currentUser.name, currentUser.role, 'ADD_STUDENT', `Menambahkan siswa baru: ${newStudent.name}`);
    }
    setEditingStudent(null);
    setLogs(getStoredLogs());
  };

  const handleDeleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    const targetName = target ? target.name : 'Siswa';
    askConfirmation({
      title: 'Hapus Data Siswa',
      message: `Apakah Anda yakin ingin menghapus data siswa "${targetName}"? Data yang dihapus tidak dapat dikembalikan.`,
      confirmText: 'Hapus Siswa',
      variant: 'danger',
      onConfirm: () => {
        setStudents((prev) => prev.filter((s) => s.id !== id));
        addActivityLog(currentUser.name, currentUser.role, 'DELETE_STUDENT', `Menghapus data siswa: ${targetName}`);
        setLogs(getStoredLogs());
      },
    });
  };

  const handleGraduateStudent = (student: Student) => {
    askConfirmation({
      title: 'Luluskan Siswa ke Alumni',
      message: `Ubah status "${student.name}" menjadi Lulus dan tambahkan data ini ke Rekap Alumni?`,
      confirmText: 'Luluskan Siswa',
      variant: 'info',
      onConfirm: () => {
        const updatedStudents = students.map((s) =>
          s.id === student.id ? { ...s, status: 'Lulus' as const } : s
        );
        setStudents(updatedStudents);

        const newAlumniRecord: Alumni = {
          id: `alm-${Date.now()}`,
          studentId: student.id,
          nisn: student.nisn,
          name: student.name,
          graduationYear: new Date().getFullYear(),
          major: student.major,
          currentStatus: 'Kuliah',
          institutionName: 'Perguruan Tinggi (Perlu Diperbarui)',
          positionOrMajor: student.major,
          phone: student.phone || '08123456789',
          address: student.address || '-',
          notes: 'Dialihkan otomatis dari Data Siswa Aktif',
          updatedAt: new Date().toISOString(),
        };
        setAlumni((prev) => [newAlumniRecord, ...prev]);
        addActivityLog(currentUser.name, currentUser.role, 'GRADUATE_STUDENT', `Meluluskan siswa "${student.name}" ke data Alumni`);
        setLogs(getStoredLogs());
      },
    });
  };

  // Batch Excel Commit
  const handleCommitExcelImport = (newStudentsBatch: Student[]) => {
    setStudents((prev) => [...newStudentsBatch, ...prev]);
    addActivityLog(currentUser.name, currentUser.role, 'IMPORT_EXCEL', `Mengimpor ${newStudentsBatch.length} siswa via Excel File`);
    setLogs(getStoredLogs());
  };

  // Achievement Operations
  const handleAddAchievement = (newAchData: Omit<Achievement, 'id' | 'createdAt'>) => {
    const newAch: Achievement = {
      ...newAchData,
      id: `ach-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAchievements((prev) => [newAch, ...prev]);
    addActivityLog(currentUser.name, currentUser.role, 'ADD_ACHIEVEMENT', `Menambahkan prestasi: ${newAch.title}`);
    setLogs(getStoredLogs());
  };

  const handleDeleteAchievement = (id: string) => {
    const target = achievements.find((a) => a.id === id);
    askConfirmation({
      title: 'Hapus Prestasi',
      message: `Apakah Anda yakin ingin menghapus catatan prestasi "${target?.title || 'ini'}"?`,
      confirmText: 'Hapus Prestasi',
      variant: 'danger',
      onConfirm: () => {
        setAchievements((prev) => prev.filter((a) => a.id !== id));
        addActivityLog(currentUser.name, currentUser.role, 'DELETE_ACHIEVEMENT', `Menghapus prestasi ID: ${id}`);
        setLogs(getStoredLogs());
      },
    });
  };

  // Alumni Operations
  const handleAddAlumni = (newAlumniData: Omit<Alumni, 'id' | 'updatedAt'>) => {
    const newAlm: Alumni = {
      ...newAlumniData,
      id: `alm-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setAlumni((prev) => [newAlm, ...prev]);
    addActivityLog(currentUser.name, currentUser.role, 'ADD_ALUMNI', `Menambahkan data alumni: ${newAlm.name}`);
    setLogs(getStoredLogs());
  };

  const handleDeleteAlumni = (id: string) => {
    const target = alumni.find((a) => a.id === id);
    askConfirmation({
      title: 'Hapus Data Alumni',
      message: `Apakah Anda yakin ingin menghapus data alumni "${target?.name || 'ini'}"?`,
      confirmText: 'Hapus Alumni',
      variant: 'danger',
      onConfirm: () => {
        setAlumni((prev) => prev.filter((a) => a.id !== id));
        addActivityLog(currentUser.name, currentUser.role, 'DELETE_ALUMNI', `Menghapus alumni ID: ${id}`);
        setLogs(getStoredLogs());
      },
    });
  };

  // User Management
  const handleAddUser = (newUserData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...newUserData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers([...users, newUser]);
    addActivityLog(currentUser.name, currentUser.role, 'ADD_USER', `Membuat akun baru: ${newUser.name} (${newUser.role})`);
    setLogs(getStoredLogs());
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'aktif' ? 'nonaktif' : 'aktif' } : u
      )
    );
  };

  const handleDeleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    askConfirmation({
      title: 'Hapus Akun Pengguna',
      message: `Apakah Anda yakin ingin menghapus akun pengguna "${target.name}"? Pengguna tidak akan dapat mengakses sistem lagi.`,
      confirmText: 'Hapus Pengguna',
      variant: 'danger',
      onConfirm: () => {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        addActivityLog(currentUser.name, currentUser.role, 'DELETE_USER', `Menghapus akun pengguna: ${target.name}`);
        setLogs(getStoredLogs());
      },
    });
  };

  const handleSaveLogo = (logoDataUrl: string | null) => {
    setSchoolLogo(logoDataUrl);
    if (logoDataUrl) {
      localStorage.setItem('sim_kesiswaan_school_logo', logoDataUrl);
    } else {
      localStorage.removeItem('sim_kesiswaan_school_logo');
    }
  };

  if (!isLoggedIn) {
    return (
      <LoginPage
        allUsers={users}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Application Header */}
      <Header
        currentUser={currentUser}
        allUsers={users}
        schoolLogo={schoolLogo}
        onSwitchUser={handleSwitchUser}
        onResetData={handleResetData}
        onOpenDoc={() => setActiveTab('technical-doc')}
        onLogout={handleLogout}
        onOpenSchoolLogoModal={() => setIsLogoModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={currentUser.role}
          schoolLogo={schoolLogo}
          counts={{
            students: students.length,
            achievements: achievements.length,
            alumni: alumni.length,
            users: users.length,
          }}
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          
          {activeTab === 'dashboard' && (
            <Dashboard
              students={students}
              achievements={achievements}
              alumni={alumni}
              logs={logs}
              userRole={currentUser.role}
              schoolLogo={schoolLogo}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'students' && (
            <StudentList
              students={students}
              userRole={currentUser.role}
              schoolLogo={schoolLogo}
              onAddStudent={() => {
                setEditingStudent(null);
                setIsStudentModalOpen(true);
              }}
              onEditStudent={(std) => {
                setEditingStudent(std);
                setIsStudentModalOpen(true);
              }}
              onDeleteStudent={handleDeleteStudent}
              onViewStudentDetail={(std) => {
                setSelectedStudentDetail(std);
                setIsDetailModalOpen(true);
              }}
              onGraduateStudent={handleGraduateStudent}
              onNavigateToImport={() => setActiveTab('excel-upload')}
            />
          )}

          {activeTab === 'excel-upload' && (
            <ExcelUpload
              onCommitImport={(imported) => {
                handleCommitExcelImport(imported);
                setActiveTab('students');
              }}
              existingStudents={students}
            />
          )}

          {activeTab === 'achievements' && (
            <AchievementList
              achievements={achievements}
              students={students}
              userRole={currentUser.role}
              onAddAchievement={handleAddAchievement}
              onDeleteAchievement={handleDeleteAchievement}
            />
          )}

          {activeTab === 'alumni' && (
            <AlumniList
              alumni={alumni}
              userRole={currentUser.role}
              onAddAlumni={handleAddAlumni}
              onDeleteAlumni={handleDeleteAlumni}
            />
          )}

          {activeTab === 'users' && (
            <UserManagement
              users={users}
              currentUser={currentUser}
              onAddUser={handleAddUser}
              onToggleUserStatus={handleToggleUserStatus}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'technical-doc' && <TechnicalDoc />}

        </main>
      </div>

      {/* School Logo Modal */}
      <SchoolLogoModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        currentLogo={schoolLogo}
        onSaveLogo={handleSaveLogo}
      />

      {/* Supabase Integration Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        students={students}
        onStudentsUpdated={(newStudents) => setStudents(newStudents)}
      />

      {/* Student Create/Edit Modal */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleSaveStudent}
        initialData={editingStudent}
      />

      {/* Student Detail Sheet */}
      <StudentDetailModal
        student={selectedStudentDetail}
        achievements={achievements}
        alumniRecord={alumni.find((a) => a.studentId === selectedStudentDetail?.id)}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      {/* Custom Global Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Application Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-bold">
            SIM-KESISWAAN © {new Date().getFullYear()} • Sistem Manajemen Data Kesiswaan & Alumni Sekolah
          </div>
          <div className="flex items-center space-x-3 text-slate-500 font-semibold">
            <span>Built with React + Express + XLSX</span>
            <button
              onClick={() => setActiveTab('technical-doc')}
              className="text-blue-600 hover:underline font-bold"
            >
              Rekomendasi Tech Stack & ERD
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
