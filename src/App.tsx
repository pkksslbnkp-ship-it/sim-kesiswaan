import React, { useState, useEffect } from 'react';
import { User, Student, Achievement, Alumni, ActivityLog } from './types';
import { 
  getStoredStudents, setStoredStudents, 
  getStoredUsers, setStoredUsers, 
  getStoredAchievements, setStoredAchievements, 
  getStoredAlumni, setStoredAlumni, 
  getStoredLogs, addActivityLog, 
  getCurrentUser, setCurrentUser, 
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
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const [schoolLogo, setSchoolLogo] = useState<string | null>(() => {
    try {
      return localStorage.getItem('sim_kesiswaan_school_logo');
    } catch {
      return null;
    }
  });

  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Status Login
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const auth = localStorage.getItem('sim_kesiswaan_is_logged_in_v1');
      return auth ? JSON.parse(auth) : false;
    } catch {
      return false;
    }
  });

  // State Utama
  const [currentUser, setCurrentUserRule] = useState<User>(getCurrentUser());
  const [users, setUsers] = useState<User[]>(getStoredUsers());
  const [students, setStudents] = useState<Student[]>(getStoredStudents());
  const [achievements, setAchievements] = useState<Achievement[]>(getStoredAchievements());
  const [alumni, setAlumni] = useState<Alumni[]>(getStoredAlumni());
  const [logs, setLogs] = useState<ActivityLog[]>(getStoredLogs());

  // Modal State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);

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

  useEffect(() => { setStoredStudents(students); }, [students]);
  useEffect(() => { setStoredUsers(users); }, [users]);
  useEffect(() => { setStoredAchievements(achievements); }, [achievements]);
  useEffect(() => { setStoredAlumni(alumni); }, [alumni]);

  useEffect(() => {
    try {
      localStorage.setItem('sim_kesiswaan_is_logged_in_v1', JSON.stringify(isLoggedIn));
    } catch (e) {
      console.error(e);
    }
  }, [isLoggedIn]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUserRule(user);
    setCurrentUser(user);
    setIsLoggedIn(true);
    addActivityLog(user.name, user.role, 'LOGIN', `Berhasil login sebagai ${user.name}`);
    setLogs(getStoredLogs());
  };

  const handleLogout = () => {
    addActivityLog(currentUser.name, currentUser.role, 'LOGOUT', `Pengguna ${currentUser.name} keluar dari sistem`);
    setIsLoggedIn(false);
    localStorage.setItem('sim_kesiswaan_is_logged_in_v1', 'false');
    setLogs(getStoredLogs());
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUserRule(user);
    setCurrentUser(user);
    addActivityLog(user.name, user.role, 'SWITCH_USER', `Beralih peran sebagai ${user.name}`);
    setLogs(getStoredLogs());
  };

  const handleResetData = () => {
    askConfirmation({
      title: 'Reset Data Demo',
      message: 'Apakah Anda yakin ingin mereset seluruh data kembali ke set awal demo?',
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

  const handleSaveStudent = (data: Partial<Student>) => {
    if (editingStudent) {
      const updated = students.map((s) => (s.id === editingStudent.id ? ({ ...s, ...data } as Student) : s));
      setStudents(updated);
      addActivityLog(currentUser.name, currentUser.role, 'UPDATE_STUDENT', `Memperbarui data siswa: ${data.name}`);
    } else {
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
      message: `Apakah Anda yakin ingin menghapus data siswa "${targetName}"?`,
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
          institutionName: 'Perguruan Tinggi',
          positionOrMajor: student.major,
          phone: student.phone || '08123456789',
          address: student.address || '-',
          notes: 'Dialihkan dari Data Siswa Aktif',
          updatedAt: new Date().toISOString(),
        };
        setAlumni((prev) => [newAlumniRecord, ...prev]);
        addActivityLog(currentUser.name, currentUser.role, 'GRADUATE_STUDENT', `Meluluskan siswa "${student.name}"`);
        setLogs(getStoredLogs());
      },
    });
  };

  // Handler Edit Pengguna (Menghubungkan Edit ke State Users & State Active Profile)
  const handleEditUser = (updatedUser: User) => {
    const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updatedUsers);

    if (currentUser.id === updatedUser.id) {
      setCurrentUserRule(updatedUser);
      setCurrentUser(updatedUser);
    }

    addActivityLog(currentUser.name, currentUser.role, 'UPDATE_USER', `Memperbarui data pengguna: ${updatedUser.name}`);
    setLogs(getStoredLogs());
  };

  // JIKA BELUM LOGIN -> TAMPILKAN LOGIN PAGE
  if (!isLoggedIn) {
    return (
      <LoginPage
        allUsers={users}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // JIKA SUDAH LOGIN -> TAMPILKAN APLIKASI DENGAN SIDEBAR
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Header */}
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

      {/* Main Layout dengan Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        
        {/* Sidebar Navigasi */}
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

        {/* Konten Halaman Aktif */}
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
                setStudents((prev) => [...imported, ...prev]);
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
              onAddAchievement={(newAchData) => {
                const newAch: Achievement = { ...newAchData, id: `ach-${Date.now()}`, createdAt: new Date().toISOString() };
                setAchievements((prev) => [newAch, ...prev]);
              }}
              onDeleteAchievement={(id) => setAchievements((prev) => prev.filter((a) => a.id !== id))}
            />
          )}

          {activeTab === 'alumni' && (
            <AlumniList
              alumni={alumni}
              userRole={currentUser.role}
              onAddAlumni={(newAlumniData) => {
                const newAlm: Alumni = { ...newAlumniData, id: `alm-${Date.now()}`, updatedAt: new Date().toISOString() };
                setAlumni((prev) => [newAlm, ...prev]);
              }}
              onDeleteAlumni={(id) => setAlumni((prev) => prev.filter((a) => a.id !== id))}
            />
          )}

          {activeTab === 'users' && (
            <UserManagement
              users={users}
              currentUser={currentUser}
              onAddUser={(newUserData) => {
                const newUser: User = { ...newUserData, id: `usr-${Date.now()}`, createdAt: new Date().toISOString() };
                setUsers([...users, newUser]);
              }}
              onEditUser={handleEditUser}
              onToggleUserStatus={(userId) => {
                setUsers(users.map((u) => u.id === userId ? { ...u, status: u.status === 'aktif' ? 'nonaktif' : 'aktif' } : u));
              }}
              onDeleteUser={(userId) => setUsers(users.filter((u) => u.id !== userId))}
            />
          )}

          {activeTab === 'technical-doc' && <TechnicalDoc />}

        </main>
      </div>

      {/* Modals */}
      <SchoolLogoModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        currentLogo={schoolLogo}
        onSaveLogo={(logo) => {
          setSchoolLogo(logo);
          if (logo) localStorage.setItem('sim_kesiswaan_school_logo', logo);
          else localStorage.removeItem('sim_kesiswaan_school_logo');
        }}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        students={students}
        onStudentsUpdated={(newStudents) => setStudents(newStudents)}
      />

      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleSaveStudent}
        initialData={editingStudent}
      />

      <StudentDetailModal
        student={selectedStudentDetail}
        achievements={achievements}
        alumniRecord={alumni.find((a) => a.studentId === selectedStudentDetail?.id)}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-bold">
            SIM-KESISWAAN © {new Date().getFullYear()} • Sistem Manajemen Data Kesiswaan
          </div>
          <button
            onClick={() => setActiveTab('technical-doc')}
            className="text-blue-600 hover:underline font-bold"
          >
            Rekomendasi Tech Stack & ERD
          </button>
        </div>
      </footer>

    </div>
  );
}