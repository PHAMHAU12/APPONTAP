import React, { useState } from 'react';
import { INITIAL_STUDENT_ROSTER } from '../data/knowledgeGraph';
import { StudentRecord } from '../types/math';
import {
  Users,
  Upload,
  Download,
  PhoneCall,
  UserCheck,
  AlertCircle,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Brain
} from 'lucide-react';

export const ClassroomAdmin: React.FC = () => {
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENT_ROSTER);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterGroup, setFilterGroup] = useState<'all' | 'risk' | 'remediation' | 'mastered'>('all');
  const [selectedStudentForCall, setSelectedStudentForCall] = useState<StudentRecord | null>(null);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [showCsvModal, setShowCsvModal] = useState<boolean>(false);
  const [csvInput, setCsvInput] = useState<string>('');

  // Smart Cold Calling Algorithm
  // Priority score = (100 - engagementScore) * 0.4 + cognitiveGapCount * 15 + fatigueIndex * 0.3
  const handleSmartColdCall = () => {
    setIsCalling(true);
    setSelectedStudentForCall(null);

    setTimeout(() => {
      // Calculate weights
      const sortedByNeed = [...students].sort((a, b) => {
        const scoreA = (100 - a.engagementScore) * 0.4 + a.cognitiveGapCount * 15 + a.fatigueIndex * 0.3;
        const scoreB = (100 - b.engagementScore) * 0.4 + b.cognitiveGapCount * 15 + b.fatigueIndex * 0.3;
        return scoreB - scoreA;
      });

      // Pick among top 3 highest priority students to add slight variability
      const topCandidates = sortedByNeed.slice(0, 3);
      const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)];

      setSelectedStudentForCall(chosen);
      setIsCalling(false);
    }, 800);
  };

  // CSV Import
  const handleImportCsv = () => {
    if (!csvInput.trim()) return;
    const lines = csvInput.trim().split('\n');
    const newStudents: StudentRecord[] = [];

    lines.forEach((line, index) => {
      // ignore header if present
      if (index === 0 && line.toLowerCase().includes('tên')) return;
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 3) {
        newStudents.push({
          id: `hs_${Date.now()}_${index}`,
          name: parts[0] || 'Học sinh',
          email: parts[1] || `hs${index}@thpt.edu.vn`,
          grade: (parseInt(parts[2], 10) as any) === 11 ? 11 : 10,
          elo: parseInt(parts[3], 10) || 1200,
          recentTopic: parts[4] || 'Hàm số bậc hai',
          lastActiveMinutesAgo: 10,
          engagementScore: 70,
          cognitiveGapCount: 1,
          fatigueIndex: 30,
          status: 'Cần củng cố',
        });
      }
    });

    if (newStudents.length > 0) {
      setStudents((prev) => [...prev, ...newStudents]);
      setShowCsvModal(false);
      setCsvInput('');
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const header = 'Họ và Tên,Email,Lớp,ELO,Chủ đề gần nhất,Mức độ tương tác (%),Số lỗ hổng tư duy,Chỉ số mệt mỏi,Trạng thái\n';
    const rows = students
      .map(
        (s) =>
          `"${s.name}","${s.email}",${s.grade},${s.elo},"${s.recentTopic}",${s.engagementScore},${s.cognitiveGapCount},${s.fatigueIndex},"${s.status}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `danh_sach_hoc_sinh_zpd_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchName = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchName) return false;
    if (filterGroup === 'risk' && s.status !== 'Rủi ro hổng kiến thức') return false;
    if (filterGroup === 'remediation' && s.status !== 'Cần củng cố') return false;
    if (filterGroup === 'mastered' && s.status !== 'Thành thạo') return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Users className="h-6 w-6 text-indigo-400" />
            Quản Trị Lớp Học & Phân Nhóm Thích Ứng (Teacher Dashboard)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Theo dõi phân luồng ZPD, chỉ số mệt mỏi (Fatigue Index) và kích hoạt gọi tên sư phạm thông minh (Smart Cold Calling).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCsvModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            Nhập CSV
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Xuất CSV
          </button>
        </div>
      </div>

      {/* Smart Cold Calling Action Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/40">
              <PhoneCall className="h-5 w-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Tính Năng "Smart Cold Calling" Sư Phạm
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  Thuật toán ưu tiên ZPD
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tự động ưu tiên học sinh ít tương tác, có lỗ hổng tư duy chưa hàn gắn hoặc đang có dấu hiệu mệt mỏi.
              </p>
            </div>
          </div>

          <button
            onClick={handleSmartColdCall}
            disabled={isCalling}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isCalling ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                Đang quét phân vị nhận thức...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Kích Hoạt Smart Cold Call Ngay
              </>
            )}
          </button>
        </div>

        {/* Selected Student Callout Result */}
        {selectedStudentForCall && (
          <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  🎯 Đề xuất tương tác sư phạm:
                </span>
                <span className="text-xs text-slate-400">
                  Lớp {selectedStudentForCall.grade} • ELO: {selectedStudentForCall.elo}
                </span>
              </div>
              <div className="text-lg font-bold text-white flex items-center gap-2">
                {selectedStudentForCall.name} ({selectedStudentForCall.email})
              </div>
              <div className="text-xs text-slate-300">
                Chủ đề cần hỗ trợ: <strong className="text-indigo-300">{selectedStudentForCall.recentTopic}</strong> •
                Lỗ hổng tư duy: <strong className="text-rose-400">{selectedStudentForCall.cognitiveGapCount} điểm gãy</strong> •
                Chỉ số mệt mỏi: <strong className="text-amber-400">{selectedStudentForCall.fatigueIndex}%</strong>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 max-w-md space-y-1">
              <span className="font-semibold text-indigo-300 flex items-center gap-1">
                <Brain className="h-3.5 w-3.5" /> Gợi ý câu hỏi Socratic mở đầu cho GV:
              </span>
              <p className="italic text-slate-300">
                "{selectedStudentForCall.name} ơi, ở phần {selectedStudentForCall.recentTopic}, nếu chúng ta thay đổi điều kiện hệ số thì đồ thị biến thiên theo hướng nào? Thầy/cô cùng em phân tích bước 1 nhé!"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Cohort Segments & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: `Tất cả (${students.length})` },
            { id: 'risk', label: 'Rủi ro hổng kiến thức', color: 'text-rose-400' },
            { id: 'remediation', label: 'Cần củng cố ZPD', color: 'text-amber-400' },
            { id: 'mastered', label: 'Thành thạo (9+)', color: 'text-emerald-400' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterGroup(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterGroup === tab.id
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Roster Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Học Sinh</th>
                <th className="py-3 px-4">Khối</th>
                <th className="py-3 px-4">ELO Rating</th>
                <th className="py-3 px-4">Chủ Đề Gần Nhất</th>
                <th className="py-3 px-4">Tương Tác</th>
                <th className="py-3 px-4">Lỗ Hổng Tư Duy</th>
                <th className="py-3 px-4">Độ Mệt Mỏi</th>
                <th className="py-3 px-4">Trạng Thái ZPD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">
                    <div>{student.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{student.email}</div>
                  </td>
                  <td className="py-3 px-4">Lớp {student.grade}</td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-300">{student.elo}</td>
                  <td className="py-3 px-4 text-slate-300">{student.recentTopic}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${student.engagementScore}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px]">{student.engagementScore}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-mono font-bold ${
                        student.cognitiveGapCount > 2
                          ? 'bg-rose-500/20 text-rose-300'
                          : student.cognitiveGapCount > 0
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {student.cognitiveGapCount} điểm
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`${
                        student.fatigueIndex > 70
                          ? 'text-rose-400 font-bold'
                          : student.fatigueIndex > 40
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {student.fatigueIndex}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        student.status === 'Thành thạo'
                          ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30'
                          : student.status === 'Cần củng cố'
                          ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30'
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-indigo-400" />
              Nhập Danh Sách Học Sinh Qua CSV
            </h3>
            <p className="text-xs text-slate-400">
              Định dạng mỗi dòng: <code>Họ và tên, Email, Khối lớp (10 hoặc 11), ELO khởi điểm, Chủ đề</code>
            </p>

            <textarea
              rows={6}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder={`Lê Văn An, an.lv@thpt.edu.vn, 10, 1250, Hàm số bậc hai\nPhạm Thị Mai, mai.pt@thpt.edu.vn, 11, 1310, Cấp số cộng`}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-750"
              >
                Hủy
              </button>
              <button
                onClick={handleImportCsv}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
              >
                Nhập Dữ Liệu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
