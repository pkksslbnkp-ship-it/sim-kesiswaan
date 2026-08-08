import React, { useState } from 'react';
import { Student, Achievement } from '../types';
import {
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  Trophy,
  BookOpen,
  FileText,
  ShieldAlert,
} from 'lucide-react';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  achievements?: Achievement[];
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  achievements = [],
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'achievements' | 'violations'>('profile');

  if (!isOpen || !student) return null;

  // Filter achievements for this student if needed
  const studentAchievements = achievements.filter(
    (a) => a.studentId === student.id || a.studentName === student.name
  );

  const violationPoints = student.violationPoints || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 transform transition-all">
        {/* Header Modal */}
        <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-700 border-2 border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
              {student.photo ? (
                <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-white">
                  {student.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black">{student.name}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    student.status === 'Aktif'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {student.status || 'Aktif'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                NISN: {student.nisn} {student.nis ? `| NIS: ${student.nis}` : ''}
              </p>
              <div className="flex items-center space-x-3 mt-2 text-xs font-semibold text-slate-400">
                <span>Kelas: {student.class}</span>
                <span>•</span>
                <span>Jurusan: {student.major}</span>
                <span>•</span>
                <span>JK: {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil Lengkap</span>
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'achievements'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Prestasi ({studentAchievements.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('violations')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'violations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Poin Pelanggaran ({violationPoints})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {activeTab === 'profile' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>Kontak Siswa & Orang Tua</span>
                  </div>
                  <div className="space-y-1">
                    <p><span className="text-slate-400">No. HP Siswa:</span> {student.phone || '-'}</p>
                    <p><span className="text-slate-400">Nama Orang Tua/Wali:</span> {student.parentName || '-'}</p>
                    <p><span className="text-slate-400">No. HP Orang Tua:</span> {student.parentPhone || '-'}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Tempat & Tanggal Lahir</span>
                  </div>
                  <div className="space-y-1">
                    <p><span className="text-slate-400">Tempat Lahir:</span> {student.birthPlace || '-'}</p>
                    <p><span className="text-slate-400">Tanggal Lahir:</span> {student.birthDate || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="font-bold text-slate-900 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Alamat Domisili</span>
                </div>
                <p className="text-slate-600">{student.address || 'Belum diisi'}</p>
              </div>

              {student.notes && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-2">
                  <div className="font-bold text-amber-900 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>Catatan Khusus</span>
                  </div>
                  <p className="text-amber-800">{student.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-3">
              {studentAchievements.length > 0 ? (
                studentAchievements.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start space-x-3">
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{item.category} • {item.level}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{item.date}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">
                  Belum ada catatan prestasi untuk siswa ini.
                </div>
              )}
            </div>
          )}

          {activeTab === 'violations' && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-rose-900">Total Akumulasi Poin</div>
                    <div className="text-[11px] text-rose-700">Batas maksimal poin sebelum peringatan keras: 100 Poin</div>
                  </div>
                </div>
                <div className="text-2xl font-black text-rose-700">{violationPoints} Poin</div>
              </div>

              {violationPoints === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                  Siswa ini memiliki catatan kedisiplinan yang bersih (0 Poin).
                </div>
              ) : (
                <div className="text-xs text-slate-500 text-center">
                  Catatan rincian riwayat pelanggaran tercatat di sistem kesiswaan.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-md"
          >
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
  );
};
