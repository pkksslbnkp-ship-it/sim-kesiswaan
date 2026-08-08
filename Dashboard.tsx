import React from 'react';
import { 
  Student, 
  Achievement, 
  Alumni, 
  ActivityLog, 
  UserRole 
} from '../types';
import { 
  Users, 
  Trophy, 
  GraduationCap, 
  FileSpreadsheet, 
  TrendingUp, 
  Award, 
  Clock, 
  UserCheck, 
  ChevronRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

interface DashboardProps {
  students: Student[];
  achievements: Achievement[];
  alumni: Alumni[];
  logs: ActivityLog[];
  userRole: UserRole;
  schoolLogo?: string | null;
  onNavigate: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  achievements,
  alumni,
  logs,
  userRole,
  schoolLogo,
  onNavigate,
}) => {
  const isAdmin = userRole === 'admin';

  // Stats calculation
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'Aktif').length;
  const totalAchievements = achievements.length;
  const totalAlumni = alumni.length;

  const maleCount = students.filter((s) => s.gender === 'L').length;
  const femaleCount = students.filter((s) => s.gender === 'P').length;

  // Chart 1: Distribution by Major (Jurusan)
  const majorCounts: { [key: string]: number } = {};
  students.forEach((s) => {
    const major = s.major || 'Lainnya';
    majorCounts[major] = (majorCounts[major] || 0) + 1;
  });
  const majorChartData = Object.keys(majorCounts).map((key) => ({
    name: key,
    jumlah: majorCounts[key],
  }));

  // Chart 2: Achievements by Level
  const levelCounts: { [key: string]: number } = {};
  achievements.forEach((a) => {
    levelCounts[a.level] = (levelCounts[a.level] || 0) + 1;
  });
  const achievementChartData = Object.keys(levelCounts).map((key) => ({
    name: key,
    jumlah: levelCounts[key],
  }));

  // Chart 3: Alumni Current Status
  const alumniStatusCounts: { [key: string]: number } = {
    Kuliah: 0,
    Bekerja: 0,
    Wirausaha: 0,
    'Mencari Kerja': 0,
  };
  alumni.forEach((a) => {
    if (alumniStatusCounts[a.currentStatus] !== undefined) {
      alumniStatusCounts[a.currentStatus] += 1;
    }
  });
  const alumniPieData = Object.keys(alumniStatusCounts).map((key) => ({
    name: key,
    value: alumniStatusCounts[key],
  }));

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      
      {/* Welcome Hero Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <GraduationCap className="w-80 h-80 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest">
                {isAdmin ? 'Dashboard Waka Kesiswaan' : 'Portal Informasi Guru'}
              </span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tahun Ajaran 2025/2026</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none">
              Selamat Datang di SIM KESISWAAN
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              Pusat manajemen data terpadu untuk pencatatan siswa aktif, pengolahan impor Excel, pelacakan prestasi perlombaan, hingga pendataan karir alumni.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('excel-upload')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition flex items-center space-x-2 uppercase tracking-wide"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Upload Data Excel Siswa</span>
              </button>
              <button
                onClick={() => onNavigate('students')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition flex items-center space-x-2"
              >
                <Users className="w-4 h-4 text-blue-400" />
                <span>Cari Data Siswa ({totalStudents})</span>
              </button>
              <button
                onClick={() => onNavigate('technical-doc')}
                className="px-5 py-2.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-xs font-bold border border-indigo-800/80 transition flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Dokumentasi Tech & ERD</span>
              </button>
            </div>
          </div>

          {/* School Logo Hero Display */}
          <div className="shrink-0 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-2xl backdrop-blur-sm min-w-[140px]">
            {schoolLogo ? (
              <img
                src={schoolLogo}
                alt="Logo Sekolah"
                className="w-20 h-20 object-contain rounded-2xl bg-white p-2 shadow-md border border-slate-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
                <GraduationCap className="w-10 h-10" />
              </div>
            )}
            <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-300 text-center">
              {schoolLogo ? 'Logo Sekolah' : 'Logo Default'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid (Matching exact Design HTML stats specification) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Siswa */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Siswa Terdata</div>
              <div className="text-5xl font-black tracking-tighter text-slate-900">{totalStudents}</div>
            </div>
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="text-emerald-600 text-sm font-bold mt-3 flex items-center justify-between">
            <span>Siswa Aktif: {activeStudents}</span>
            <span className="text-slate-400 text-xs font-semibold">{maleCount} L / {femaleCount} P</span>
          </div>
        </div>

        {/* Card 2: Total Prestasi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Prestasi Terdaftar</div>
              <div className="text-5xl font-black tracking-tighter text-amber-600">{totalAchievements}</div>
            </div>
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
          <div className="text-amber-600 text-sm font-bold mt-3 flex items-center justify-between">
            <span>Nasional & Prov</span>
            <span className="text-amber-600 font-bold flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Berprestasi
            </span>
          </div>
        </div>

        {/* Card 3: Total Alumni */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Alumni Terlacak</div>
              <div className="text-5xl font-black tracking-tighter text-indigo-600">{totalAlumni}</div>
            </div>
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
          <div className="text-slate-500 text-sm font-bold mt-3 flex items-center justify-between">
            <span>Tracer Study</span>
            <span className="text-indigo-600 font-bold">Kuliah & Kerja</span>
          </div>
        </div>

        {/* Card 4: Status Akses RBAC */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Akses Hak Peran</div>
              <div className={`text-2xl font-black tracking-tight mt-1 ${isAdmin ? 'text-amber-600' : 'text-emerald-600'}`}>
                {isAdmin ? 'Admin (Waka)' : 'User (Guru)'}
              </div>
            </div>
            <div className={`p-3.5 rounded-2xl border ${
              isAdmin ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}>
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="text-slate-500 text-xs font-bold mt-4 pt-2 border-t border-slate-100">
            Mode: {isAdmin ? 'Full CRUD + Excel Import' : 'Read-only Search'}
          </div>
        </div>

      </div>

      {/* Action Banner Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-600 text-white p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <h4 className="font-black text-xl tracking-tight">Upload Data Baru?</h4>
            <p className="text-blue-100 text-xs font-medium">Import file .xlsx untuk sinkronisasi otomatis</p>
          </div>
          <button 
            onClick={() => onNavigate('excel-upload')}
            className="bg-white text-blue-600 font-black py-2.5 px-6 rounded-xl hover:bg-blue-50 transition-colors text-xs uppercase tracking-wider"
          >
            UNGGAH EXCEL
          </button>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <h4 className="font-black text-xl tracking-tight">Manajemen Role</h4>
            <p className="text-slate-400 text-xs font-medium">Kelola hak akses Guru dan Staff</p>
          </div>
          <button 
            onClick={() => onNavigate('users')}
            className="bg-slate-800 text-white border border-slate-700 font-black py-2.5 px-6 rounded-xl hover:bg-slate-700 transition-colors text-xs uppercase tracking-wider"
          >
            PENGATURAN
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Distribusi Siswa per Jurusan */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Distribusi Siswa per Jurusan</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Jumlah siswa terdaftar berdasarkan program keahlian</p>
            </div>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={majorChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight={600} />
                <YAxis stroke="#64748b" fontSize={11} fontWeight={600} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#ffffff', borderRadius: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="jumlah" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Sebaran Karir Alumni */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>Tracer Study Karir Alumni</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Aktivitas pasca kelulusan (Kuliah, Bekerja, Wirausaha)</p>
            </div>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={alumniPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {alumniPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#ffffff', borderRadius: '12px', fontWeight: 'bold' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom Feed Grid: Latest Achievements & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Latest Achievements */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span>Prestasi Siswa Terbaru</span>
            </h3>
            <button
              onClick={() => onNavigate('achievements')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center"
            >
              Lihat Semua <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {achievements.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition flex items-start space-x-3"
              >
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 font-bold border border-amber-200 mt-0.5">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 truncate">{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-extrabold uppercase">
                      {item.level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-bold mt-0.5">
                    {item.studentName} ({item.studentClass})
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-1">{item.organizer} • {item.rank}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>Aktivitas Sistem Kesiswaan</span>
            </h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audit Trail</span>
          </div>

          <div className="mt-4 space-y-3">
            {logs.slice(0, 4).map((log) => (
              <div key={log.id} className="text-xs p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1">
                  <span className="font-extrabold text-slate-900">{log.userName}</span>
                  <span className="font-semibold">{new Date(log.timestamp).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-slate-700 font-medium">{log.details}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
