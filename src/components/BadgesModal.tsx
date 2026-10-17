import React from 'react';
import { X, Award, CheckCircle2, Lock, Flame, Sparkles } from 'lucide-react';
import { StudentBadge, loadStudentMemory } from '../services/studentMemoryService';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const memory = loadStudentMemory();
  const badges: StudentBadge[] = memory.badges || [];
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-lg shadow-amber-500/20 shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Huy Hiệu & Thành Tựu ZPD
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Đã mở khóa <strong className="text-amber-400">{unlockedCount}/{badges.length}</strong> huy hiệu vinh danh toán học
            </p>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-2.5 mb-5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-center font-mono">
          <div>
            <span className="text-slate-500 text-[10px] block">ĐIỂM ELO:</span>
            <span className="font-bold text-indigo-300 text-base">{memory.elo}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">CHUỖI STREAK:</span>
            <span className="font-bold text-amber-300 text-base">{memory.streakDays} ngày</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">BÀI ĐÃ GIẢI:</span>
            <span className="font-bold text-emerald-400 text-base">{memory.correctCount}/{memory.totalSolved}</span>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                b.unlocked
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-100 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-60'
              }`}
            >
              <div
                className={`text-2xl p-2 rounded-xl shrink-0 ${
                  b.unlocked ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-800/50'
                }`}
              >
                {b.icon}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h4 className={`text-xs font-bold ${b.unlocked ? 'text-amber-300' : 'text-slate-400'}`}>
                    {b.name}
                  </h4>
                  {b.unlocked ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Lock className="h-3 w-3 text-slate-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {b.description}
                </p>
                {b.unlocked && b.unlockedAt && (
                  <span className="text-[9px] text-amber-400/80 font-mono block pt-0.5">
                    Đạt được: {b.unlockedAt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
