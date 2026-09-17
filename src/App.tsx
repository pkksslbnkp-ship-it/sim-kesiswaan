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
import { 
  getSupabaseClient, 
  fetchStudentsFromSupabase, 
  syncStudentsToSupabase,
  fetchUsersFromSupabase,
  syncUsersToSupabase,
  syncUserToSupabase,
  deleteUserFromSupabase
} from './lib/supabase';

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

  // Status Login State
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
  const [students, setStudents] = useState<Student[]>(() => {
    const loaded = getStoredStudents();
    return loaded && loaded.length > 0 ? loaded : [];
  });
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

  // HELPER SYNC CLOUD AUTOMATIC
  const syncToCloud = async (studentsList: Student[]) => {
    try {
      await syncStudentsToSupabase(studentsList);
    } catch (e) {
      console.warn('Gagal sync data siswa ke Cloud Supabase:', e);
    }
  };

  const syncUsersToCloud = async (usersList: User[]) => {
    try {
      await syncUsersToSupabase(usersList);
    } catch (e) {
      console.warn('Gagal sync data users ke Cloud Supabase:', e);
    }
  };

  // OTOMATIS TARIK DATA DARI SUPABASE SAAT APLIKASI DIBUKA
  useEffect(() => {
    const fetchCloudData = async () => {
      try {
        const cloudStudents = await fetchStudentsFromSupabase();
        if (cloudStudents && cloudStudents.length > 0) {
          setStudents(cloudStudents);
          setStoredStudents(cloudStudents);
        }

        const cloudUsers = await fetchUsersFromSupabase();
        if (cloudUsers && cloudUsers.length > 0) {
          setUsers(cloudUsers);
          setStoredUsers(cloudUsers);
        }
      } catch (err) {
        console.log('Tidak dapat membaca Cloud Supabase, menggunakan data lokal.');
      }
    };

    fetchCloudData();
  }, []);

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

  const handleCommitImport = (importedStudents: Student[]) => {
    if (!importedStudents || importedStudents.length === 0) {
      alert('Tidak ada data siswa yang diimpor.');
      return;
    }

    setStudents((prevStudents) => {
      const formattedImport = importedStudents.map((s, idx) => ({
        ...s,
        id: s.id || `imported-${Date.now()}-${idx}`,
        gender: (s.gender ? String(s.gender).toUpperCase() : 'L') as 'L' | 'P',
        religion: s.religion || 'Islam',
        specialNeeds: s.specialNeeds || 'Tidak Ada',
        status: s.status || 'Aktif',
        class: s.class || '10B',
      }));

      const existingNisns = new Set(prevStudents.map((s) => s.nisn).filter(Boolean));
      const freshOnly = formattedImport.filter((s) => !s.nisn || !existingNisns.has(s.nisn));

      const updatedList = [...freshOnly, ...prevStudents];

      setStoredStudents(updatedList);
      syncToCloud(updatedList);

      return updatedList;
    });

    addActivityLog(
      currentUser.name,
      currentUser.role,
      'IMPORT_EXCEL',
      `Berhasil mengimpor ${importedStudents.length} data siswa baru.`
    );
    setLogs(getStoredLogs());

    setActiveTab('students');
  };

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
    
    if (user.role !== 'ADMIN' && activeTab === 'users') {
      setActiveTab('dashboard');
    }

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
      setStudents((prev) => {
        const updated = prev.map((s) => (s.id === editingStudent.id ? ({ ...s, ...data } as Student) : s));
        setStoredStudents(updated);
        syncToCloud(updated);
        return updated;
      });
      addActivityLog(currentUser.name, currentUser.role, 'UPDATE_STUDENT', `Memperbarui data siswa: ${data.name}`);
    } else {
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        nisn: data.nisn || `00${Date.now()}`,
        nis: data.nis || `${23241000 + students.length}`,
        name: data.name || 'Siswa Baru',
        gender: (data.gender ? String(data.gender).toUpperCase() : 'L') as 'L' | 'P',
        class: data.class || '10B',
        major: data.major || 'Tunagrahita',
        religion: data.religion || 'Islam',
        specialNeeds: data.specialNeeds || 'Tidak Ada',
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
      setStudents((prev) => {
        const updated = [newStudent, ...prev];
        setStoredStudents(updated);
        syncToCloud(updated);
        return updated;
      });
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
        setStudents((prev) => {
          const updated = prev.filter((s) => s.id !== id);
          setStoredStudents(updated);
          syncToCloud(updated);
          return updated;
        });
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
        setStudents((prev) => {
          const updated = prev.map((s) => (s.id === student.id ? { ...s, status: 'Lulus' as const } : s));
          setStoredStudents(updated);
          syncToCloud(updated);
          return updated;
        });

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

  const handleMutateStudent = (student: Student) => {
    askConfirmation({
      title: 'Mutasikan Siswa',
      message: `Apakah Anda yakin ingin mengubah status siswa "${student.name}" menjadi Mutasi (Pindah Sekolah)?`,
      confirmText: 'Proses Mutasi',
      variant: 'warning',
      onConfirm: () => {
        setStudents((prev) => {
          const updated = prev.map((s) => 
            s.id === student.id ? { ...s, status: 'Mutasi' as const } : s
          );
          setStoredStudents(updated);
          syncToCloud(updated);
          return updated;
        });

        addActivityLog(
          currentUser.name,
          currentUser.role,
          'MUTATE_STUDENT',
          `Memindahkan status siswa "${student.name}" ke Mutasi`
        );
        setLogs(getStoredLogs());
      },
    });
  };

  const handleEditUser = async (updatedUser: User) => {
    const isSuccess = await syncUserToSupabase(updatedUser);
    if (isSuccess) {
      const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      setUsers(updatedUsers);
      setStoredUsers(updatedUsers);

      if (currentUser.id === updatedUser.id) {
        setCurrentUserRule(updatedUser);
        setCurrentUser(updatedUser);
      }

      addActivityLog(currentUser.name, currentUser.role, 'UPDATE_USER', `Memperbarui data pengguna: ${updatedUser.name}`);
      setLogs(getStoredLogs());
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
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

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row gap-6 p-4 sm:p-6 lg:p-8">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={currentUser.role}
          schoolLogo={schoolLogo}
          counts={{
            students: students.filter((s) => s.status === 'Aktif' || !s.status).length,
            mutasi: students.filter((s) => s.status === 'Mutasi').length,
            achievements: achievements.length,
            alumni: alumni.length,
            users: users.length,
          }}
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              students={students}
              achievements={achievements}
              alumni={alumni}
              logs={logs}
              userRole={currentUser.role}
              schoolLogo={schoolLogo}
              onNavigate={(tab) => setActiveTab(tab as TabType)}
            />
          )}

          {activeTab === 'students' && (
            <StudentList
              students={students.filter((s) => s.status === 'Aktif' || !s.status)}
              userRole={currentUser.role as 'ADMIN' | 'GURU'}
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
              onMutateStudent={handleMutateStudent}
              onNavigateToImport={() => setActiveTab('excel-upload')}
            />
          )}

          {activeTab === 'mutasi' && (
            <StudentList
              students={students.filter((s) => s.status === 'Mutasi')}
              userRole={currentUser.role as 'ADMIN' | 'GURU'}
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
              onMutateStudent={handleMutateStudent}
              onNavigateToImport={() => setActiveTab('excel-upload')}
            />
          )}

          {activeTab === 'excel-upload' && (
            <ExcelUpload
              onCommitImport={handleCommitImport}
              onImportSuccess={handleCommitImport}
              onImportStudents={handleCommitImport}
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

          {/* Halaman Manajemen Pengguna */}
          {activeTab === 'users' && (
            currentUser.role === 'ADMIN' ? (
              <UserManagement
                users={users}
                currentUser={currentUser}
                onAddUser={async (newUserData) => {
                  const newUser: User = { 
                    ...newUserData, 
                    id: `usr-${Date.now()}`, 
                    createdAt: new Date().toISOString() 
                  };

                  // 1. Kirim data ke Supabase terlebih dahulu
                  const isSuccess = await syncUserToSupabase(newUser);

                  // 2. Hanya update State & LocalStorage jika Supabase berhasil menyimpan
                  if (isSuccess) {
                    const updatedUsers = [...users, newUser];
                    setUsers(updatedUsers);
                    setStoredUsers(updatedUsers);

                    addActivityLog(currentUser.name, currentUser.role, 'ADD_USER', `Menambahkan pengguna baru: ${newUser.name}`);
                    setLogs(getStoredLogs());
                  }
                }}
                onEditUser={handleEditUser}
                onToggleUserStatus={async (userId) => {
                  const targetUser = users.find((u) => u.id === userId);
                  if (!targetUser) return;

                  const updatedUser = { 
                    ...targetUser, 
                    status: (targetUser.status === 'aktif' ? 'nonaktif' : 'aktif') as 'aktif' | 'nonaktif' 
                  };

                  const isSuccess = await syncUserToSupabase(updatedUser);
                  if (isSuccess) {
                    const updatedUsers = users.map((u) => u.id === userId ? updatedUser : u);
                    setUsers(updatedUsers);
                    setStoredUsers(updatedUsers);
                  }
                }}
                onDeleteUser={async (userId) => {
                  const isSuccess = await deleteUserFromSupabase(userId);
                  if (isSuccess || true) {
                    const updatedUsers = users.filter((u) => u.id !== userId);
                    setUsers(updatedUsers);
                    setStoredUsers(updatedUsers);
                  }
                }}
              />
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-100 my-4">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  🚫
                </div>
                <h3 className="text-lg font-bold text-slate-800">Akses Ditolak</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
                  Halaman Manajemen Pengguna hanya dapat diakses oleh akun dengan peran <strong>Admin (Waka Kesiswaan)</strong>.
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="mt-5 px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            )
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
        onStudentsUpdated={(newStudents) => {
          setStudents(newStudents);
          setStoredStudents(newStudents);
          syncToCloud(newStudents);
        }}
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

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 mt-auto">
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