import React, { useEffect } from 'react';
import { Student, Achievement, Alumni } from '../types';
import { X, Trophy, GraduationCap, UserCheck, FileText, ExternalLink } from 'lucide-react';

interface StudentDetailModalProps {
  student: Student | null;
  achievements: Achievement[];
  alumniRecord?: Alumni | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  achievements = [],
  alumniRecord,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !student) return null;

  const studentAchievements = achievements.filter(
    (a) => a.studentId === student.id || (a.studentName && a.studentName.toLowerCase() === student.name.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl text-slate-900 overflow-hidden my-8">
        
        {/* Header Profile Banner */}
        <div className="bg-slate-900 p-6 border-b border-slate-800 relative text-white">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg border-2 border-white/20 shrink-0">
              {student.name ? student.name.charAt(0) : 'S'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  student.status === 'Aktif'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}>
                  Status: {student.status || 'Aktif'}
                </span>
                <span className="text-xs text-blue-300 font-mono font-bold">NISN: {student.nisn || '-'}</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">{student.name}</h2>
              <p className="text-xs text-slate-300 font-bold">
                Kelas {student.class || '-'} • Angkatan {student.generation || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Section 1: Biodata & Kontak */}
          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Biodata Kesiswaan & Kontak</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">NIS Sekolah:</span>
                <span className="font-bold text-slate-900">{student.nis || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Jenis Kelamin:</span>
                <span className="font-bold text-slate-900">
                  {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Agama:</span>
                <span className="font-bold text-slate-900">{student.religion || 'Islam'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Kebutuhan Khusus / Inklusi:</span>
                <span className={`font-bold ${student.specialNeeds && !student.specialNeeds.toLowerCase().includes('tidak ada') ? 'text-purple-700 font-extrabold' : 'text-slate-900'}`}>
                  {student.specialNeeds || 'Tidak Ada'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Tahun Masuk:</span>
                <span className="font-bold text-slate-900">{student.entryYear || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Tempat, Tanggal Lahir:</span>
                <span className="font-bold text-slate-900">
                  {student.birthPlace || '-'}{student.birthDate ? `, ${student.birthDate}` : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">No. Telepon/WA Siswa:</span>
                <span className="font-bold text-emerald-700">{student.phone || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Nama Orang Tua / Wali:</span>
                <span className="font-bold text-slate-900">{student.parentName || '-'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[10px] font-bold">Alamat Lengkap:</span>
                <span className="font-bold text-slate-900">{student.address || '-'}</span>
              </div>
              {student.notes && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-amber-700 block text-[10px] font-black">Catatan Khusus Kesiswaan:</span>
                  <span className="font-bold text-slate-900">{student.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Dokumen Berkas */}
          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Dokumen Berkas Siswa</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Kartu Keluarga (KK)</div>
                  <div className="text-[10px] font-semibold text-slate-500">
                    {student.kkUrl ? 'Tersedia' : 'Belum diunggah'}
                  </div>
                </div>
                {student.kkUrl ? (
                  <a
                    href={student.kkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center space-x-1 transition"
                  >
                    <span>Lihat</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 font-bold">-</span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Akta Kelahiran</div>
                  <div className="text-[10px] font-semibold text-slate-500">
                    {student.akteUrl ? 'Tersedia' : 'Belum diunggah'}
                  </div>
                </div>
                {student.akteUrl ? (
                  <a
                    href={student.akteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center space-x-1 transition"
                  >
                    <span>Lihat</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 font-bold">-</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Prestasi Terkait */}
          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Prestasi & Penghargaan ({studentAchievements.length})</span>
            </h4>

            {studentAchievements.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400 font-bold text-center">
                Belum ada catatan prestasi terdaftar untuk siswa ini.
              </div>
            ) : (
              <div className="space-y-2">
                {studentAchievements.map((ach) => (
                  <div key={ach.id} className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 flex items-start justify-between">
                    <div>
                      <div className="text-xs font-black text-slate-900">{ach.title}</div>
                      <div className="text-[11px] font-bold text-amber-900 mt-0.5">
                        {ach.rank || '-'} {ach.organizer ? `• ${ach.organizer}` : ''}
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-200">
                      {ach.level}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Status Alumni */}
          {alumniRecord && (
            <div>
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Tracer Study Data Alumni</span>
              </h4>

              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs space-y-2 text-indigo-950">
                <div className="flex justify-between">
                  <span className="font-bold">Status Karir Saat Ini:</span>
                  <strong className="text-emerald-800 font-black">{alumniRecord.currentStatus}</strong>
                </div>
                {alumniRecord.institutionName && (
                  <div className="flex justify-between">
                    <span className="font-bold">Instansi / Perguruan Tinggi:</span>
                    <strong className="text-slate-900 font-black">{alumniRecord.institutionName}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider transition border border-slate-200 shadow-sm cursor-pointer"
          >
            Tutup Detail
          </button>
        </div>

      </div>
    </div>
  );
};