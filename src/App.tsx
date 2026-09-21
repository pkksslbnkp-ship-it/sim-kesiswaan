import React, { useState, useEffect } from 'react';
import { User, Student, Achievement, Alumni, ActivityLog } from './types';
import { getCurrentUser, setCurrentUser } from './lib/storage';
import { supabase } from './lib/supabaseConfig';

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
  const [schoolLogo, setSchoolLogo] = useState<string | null>(() => localStorage.getItem('sim_kesiswaan_school_logo'));

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

  // State Utama Murni Terhubung Supabase
  const [currentUser, setCurrentUserRule] = useState<User>(getCurrentUser());
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

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

  // 1. FETCH DATA UTAMA DARI SUPABASE
  const fetchAllDataFromSupabase = async () => {
    try {
      // Fetch Students
      const { data: studentData, error: studentErr } = await supabase.from('students').select('*').order('created_at', { ascending: false });
      if (!studentErr && studentData) {
        const formatted: Student[] = studentData.map((item: any) => ({
          id: item.id,
          nisn: item.nisn || '',
          nis: item.nis || '',
          name: item.name || '',
          gender: (item.gender ? String(item.gender).toUpperCase() : 'L') as 'L' | 'P',
          class: item.class || '10B',
          major: item.major || 'Tunagrahita',
          religion: item.religion || 'Islam',
          specialNeeds: item.specialNeeds || item.special_needs || 'Tidak Ada',
          generation: item.generation || '2025/2026',
          entryYear: Number(item.entryYear || item.entry_year) || 2025,
          status: item.status || 'Aktif',
          birthPlace: item.birthPlace || item.birth_place || '',
          birthDate: item.birthDate || item.birth_date || '',
          address: item.address || '',
          phone: item.phone || '',
          parentName: item.parentName || item.parent_name || '',
          parentPhone: item.parentPhone || item.parent_phone || '',
          notes: item.notes || '',
          createdAt: item.createdAt || item.created_at || new Date().toISOString(),
        }));
        setStudents(formatted);
      }

      // Fetch Users
      const { data: userData, error: userErr } = await supabase.from('users').select('*');
      if (!userErr && userData) {
        setUsers(userData as User[]);
      }

      // Fetch Achievements
      const { data: achData, error: achErr } = await supabase.from('achievements').select('*');
      if (!achErr && achData) {
        setAchievements(achData as Achievement[]);
      }

      // Fetch Alumni
      const { data: almData, error: almErr } = await supabase.from('alumni').select('*');
      if (!almErr && almData) {
        setAlumni(almData as Alumni[]);
      }
    } catch (err) {
      console.error('Error saat mengambil data dari Supabase:', err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchAllDataFromSupabase();
    }
  }, [isLoggedIn]);

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

  // 2. SIMPAN / EDIT SISWA LANGSUNG KE SUPABASE
  const handleSaveStudent = async (data: Partial<Student>) => {
    if (editingStudent) {
      const payload = {
        name: data.name,
        nisn: data.nisn,
        nis: data.nis,
        gender: data.gender,
        class: data.class,
        major: data.major,
        religion: data.religion,
        specialNeeds: data.specialNeeds,
        special_needs: data.specialNeeds,
        status: data.status,
        birthPlace: data.birthPlace,
        birth_place: data.birthPlace,
        birthDate: data.birthDate,
        birth_date: data.birthDate,
        address: data.address,
        phone: data.phone,
        parentName: data.parentName,
        parent_name: data.parentName,
        parentPhone: data.parentPhone,
        parent_phone: data.parentPhone,
        notes: data.notes,
      };

      const { error } = await supabase.from('students').update(payload).eq('id', editingStudent.id);
      if (error) alert(`Gagal memperbarui siswa: ${error.message}`);
    } else {
      const newId = `std-${Date.now()}`;
      const payload = {
        id: newId,
        nisn: data.nisn || `00${Date.now()}`,
        nis: data.nis || `${23241000 + students.length}`,
        name: data.name || 'Siswa Baru',
        gender: (data.gender ? String(data.gender).toUpperCase() : 'L') as 'L' | 'P',
        class: data.class || '10B',
        major: data.major || 'Tunagrahita',
        religion: data.religion || 'Islam',
        specialNeeds: data.specialNeeds || 'Tidak Ada',
        special_needs: data.specialNeeds || 'Tidak Ada',
        generation: data.generation || '2025/2026',
        entryYear: data.entryYear || 2025,
        entry_year: String(data.entryYear || 2025),
        status: data.status || 'Aktif',
        birthPlace: data.birthPlace || '',
        birth_place: data.birthPlace || '',
        birthDate: data.birthDate || '',
        birth_date: data.birthDate || '',
        address: data.address || '',
        phone: data.phone || '',
        parentName: data.parentName || '',
        parent_name: data.parentName || '',
        parentPhone: data.parentPhone || '',
        parent_phone: data.parentPhone || '',
        notes: data.notes || '',
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('students').insert([payload]);
      if (error) alert(`Gagal menambah siswa: ${error.message}`);
    }

    setEditingStudent(null);
    setIsStudentModalOpen(false);
    await fetchAllDataFromSupabase();
  };

  // 3. HAPUS SISWA LANGSUNG DARI SUPABASE
  const handleDeleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    const targetName = target ? target.name : 'Siswa';
    
    askConfirmation({
      title: 'Hapus Data Siswa',
      message: `Apakah Anda yakin ingin menghapus data siswa "${targetName}" secara permanen dari Supabase?`,
      confirmText: 'Hapus Siswa',
      variant: 'danger',
      onConfirm: async () => {
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) {
          alert(`Gagal menghapus data: ${error.message}`);
        } else {
          await fetchAllDataFromSupabase();
        }
      },
    });
  };

  // 4. LULUSKAN SISWA & MUTASI
  const handleGraduateStudent = (student: Student) => {
    askConfirmation({
      title: 'Luluskan Siswa ke Alumni',
      message: `Ubah status "${student.name}" menjadi Lulus dan tambahkan data ini ke Rekap Alumni?`,
      confirmText: 'Luluskan Siswa',
      variant: 'info',
      onConfirm: async () => {
        await supabase.from('students').update({ status: 'Lulus' }).eq('id', student.id);
        
        const newAlumni = {
          id: `alm-${Date.now()}`,
          studentId: student.id,
          nisn: student.nisn,
          name: student.name,
          graduationYear: new Date().getFullYear(),
          major: student.major,
          currentStatus: 'Kuliah',
          institutionName: 'Perguruan Tinggi',
          positionOrMajor: student.major,
          phone: student.phone || '-',
          address: student.address || '-',
          notes: 'Dialihkan dari Siswa Aktif',
          updatedAt: new Date().toISOString(),
        };

        await supabase.from('alumni').insert([newAlumni]);
        await fetchAllDataFromSupabase();
      },
    });
  };

  const handleMutateStudent = (student: Student) => {
    askConfirmation({
      title: 'Mutasikan Siswa',
      message: `Apakah Anda yakin ingin mengubah status siswa "${student.name}" menjadi Mutasi (Pindah Sekolah)?`,
      confirmText: 'Proses Mutasi',
      variant: 'warning',
      onConfirm: async () => {
        await supabase.from('students').update({ status: 'Mutasi' }).eq('id', student.id);
        await fetchAllDataFromSupabase();
      },
    });
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUserRule(user);
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('sim_kesiswaan_is_logged_in_v1', 'false');
  };

  if (!isLoggedIn) {
    return <LoginPage allUsers={users} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header
        currentUser={currentUser}
        allUsers={users}
        schoolLogo={schoolLogo}
        onSwitchUser={(user) => {
          setCurrentUserRule(user);
          setCurrentUser(user);
        }}
        onResetData={() => fetchAllDataFromSupabase()}
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
              onCommitImport={async () => {
                await fetchAllDataFromSupabase();
                setActiveTab('students');
              }}
            />
          )}

          {activeTab === 'achievements' && (
            <AchievementList
              achievements={achievements}
              students={students}
              userRole={currentUser.role}
              onAddAchievement={async (newAchData) => {
                await supabase.from('achievements').insert([{ ...newAchData, id: `ach-${Date.now()}` }]);
                await fetchAllDataFromSupabase();
              }}
              onDeleteAchievement={async (id) => {
                await supabase.from('achievements').delete().eq('id', id);
                await fetchAllDataFromSupabase();
              }}
            />
          )}

          {activeTab === 'alumni' && (
            <AlumniList
              alumni={alumni}
              userRole={currentUser.role}
              onAddAlumni={async (newAlumniData) => {
                await supabase.from('alumni').insert([{ ...newAlumniData, id: `alm-${Date.now()}` }]);
                await fetchAllDataFromSupabase();
              }}
              onDeleteAlumni={async (id) => {
                await supabase.from('alumni').delete().eq('id', id);
                await fetchAllDataFromSupabase();
              }}
            />
          )}

          {activeTab === 'users' && (
            <UserManagement
              users={users}
              currentUser={currentUser}
              onAddUser={async (user) => {
                await supabase.from('users').insert([{ ...user, id: `usr-${Date.now()}` }]);
                await fetchAllDataFromSupabase();
              }}
              onEditUser={async (user) => {
                await supabase.from('users').update(user).eq('id', user.id);
                await fetchAllDataFromSupabase();
              }}
              onToggleUserStatus={async (userId) => {
                const u = users.find((item) => item.id === userId);
                if (u) {
                  await supabase.from('users').update({ status: u.status === 'aktif' ? 'nonaktif' : 'aktif' }).eq('id', userId);
                  await fetchAllDataFromSupabase();
                }
              }}
              onDeleteUser={async (userId) => {
                await supabase.from('users').delete().eq('id', userId);
                await fetchAllDataFromSupabase();
              }}
            />
          )}

          {activeTab === 'technical-doc' && <TechnicalDoc />}
        </main>
      </div>

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
        onStudentsUpdated={() => fetchAllDataFromSupabase()}
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
    </div>
  );
}