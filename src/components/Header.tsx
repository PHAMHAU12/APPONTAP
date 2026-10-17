import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types/math';
import {
  Brain,
  GitMerge,
  Trophy,
  ShieldAlert,
  Box,
  Users,
  Flame,
  Activity,
  Award,
  Key,
  ExternalLink,
  TrendingUp,
  Volume2,
  VolumeX,
  Headphones,
} from 'lucide-react';
import { getStoredApiKey } from '../services/geminiService';
import { audioService } from '../services/audioService';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  student: StudentProfile;
  onOpenApiKeyModal: () => void;
  onOpenBadgesModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  student,
  onOpenApiKeyModal,
  onOpenBadgesModal,
}) => {
  const storedApiKey = getStoredApiKey();
  const [audioEnabled, setAudioEnabled] = useState<boolean>(audioService.getAudioEnabled());
  const [isFocusAudioPlaying, setIsFocusAudioPlaying] = useState<boolean>(audioService.getIsAmbientPlaying());

  const toggleSound = () => {
    const next = !audioEnabled;
    audioService.setAudioEnabled(next);
    setAudioEnabled(next);
    if (next) {
      audioService.playKeyTap();
    }
  };

  const toggleFocusAudio = () => {
    const playing = audioService.toggleFocusBinaural();
    setIsFocusAudioPlaying(playing);
  };

  const tabs = [
    { id: 'socratic', label: 'Trợ Lý Socratic', icon: Brain, badge: 'Phản Hồi Tức Thì' },
    { id: 'math2d', label: 'Phòng Lab 2D', icon: TrendingUp, badge: 'Parabol & Lượng Giác' },
    { id: 'geometry', label: 'Hình Không Gian 3D', icon: Box, badge: 'Thiết Diện' },
    { id: 'arena', label: 'Đấu Trường Arena', icon: Trophy, badge: 'Chuẩn Bộ GD&ĐT' },
    { id: 'diagnostic', label: 'Chẩn Đoán Lỗi Sai', icon: ShieldAlert, badge: 'Isomorphic' },
    { id: 'graph', label: 'Đồ Thị Kiến Thức', icon: GitMerge, badge: 'ZPD Map' },
    { id: 'classroom', label: 'Quản Trị Lớp Học', icon: Users, badge: 'Cold Calling' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-600/30">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  ÔN TẬP TOÁN - PHẠM HẬU
                </span>
                <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-indigo-300">
                  LỚP 10 & 11
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Hệ sinh thái Học tập & Trợ lý Toán học Thích ứng
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Audio Toggle Button */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                audioEnabled
                  ? 'bg-slate-900 border-slate-800 text-indigo-300 hover:text-white hover:bg-slate-800'
                  : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'
              }`}
              title={audioEnabled ? 'Đang bật âm thanh phản hồi (Click để tắt)' : 'Đang tắt âm thanh (Click để bật)'}
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* 40Hz Gamma Focus Audio Button */}
            <button
              onClick={toggleFocusAudio}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isFocusAudioPlaying
                  ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
              title="Sóng não 40Hz Gamma hỗ trợ tập trung luồng Deep Work (Web Audio API)"
            >
              <Headphones className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Focus 40Hz</span>
            </button>

            {/* Direct CTA link to Google AI Studio */}
            <a
              href="https://aistudio.google.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-all cursor-pointer shrink-0"
              title="Nhận Google Gemini API Key miễn phí tại Google AI Studio"
            >
              <span className="text-rose-400 font-bold">Lấy API key để sử dụng app</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>

            {/* Settings (API Key) Button - Always visible as requested */}
            <button
              onClick={onOpenApiKeyModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-indigo-500/40 hover:border-indigo-400 text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-sm shrink-0"
              title="Thiết lập Model AI & Khóa API Key"
            >
              <Key className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Settings (API Key)</span>
              {storedApiKey ? (
                <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" title="Đã có API Key" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shrink-0" title="Chưa có API Key" />
              )}
            </button>

            {/* Badges / Gamification Trigger Button */}
            {onOpenBadgesModal && (
              <button
                onClick={onOpenBadgesModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 transition-all cursor-pointer shrink-0"
                title="Xem bộ sưu tập Huy hiệu & Thành tựu"
              >
                <Award className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden lg:inline">Huy hiệu</span>
              </button>
            )}

            {/* Streak & ELO metrics */}
            <div className="hidden xl:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-bold text-amber-300 font-mono text-[11px]">{student.streakDays} ngày</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
                <span className="text-slate-400 text-[11px]">ELO:</span>
                <span className="font-black text-indigo-300 font-mono text-[11px]">{student.elo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  audioService.playKeyTap();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-normal font-mono ${
                    isActive ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
