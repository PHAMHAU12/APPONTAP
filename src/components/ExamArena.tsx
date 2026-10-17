import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { MathRenderer } from './MathRenderer';
import { ExamProblem, ExamFormat, GradeLevel } from '../types/math';
import {
  Trophy,
  Timer,
  Flame,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Sparkles,
  AlertOctagon,
  Key,
  RefreshCw,
  FileText,
  Download,
} from 'lucide-react';
import { generateExamProblemAI, FallbackEvent } from '../services/geminiService';
import { exportExamToWord } from '../services/docxExportService';
import { exportProblemsToMoodleGift } from '../services/moodleExportService';
import { audioService } from '../services/audioService';
import { recordProblemOutcome, loadStudentMemory } from '../services/studentMemoryService';

interface ExamArenaProps {
  onOpenApiKeyModal?: () => void;
}

export const ExamArena: React.FC<ExamArenaProps> = ({ onOpenApiKeyModal }) => {
  const [grade, setGrade] = useState<GradeLevel>(10);
  const [topic, setTopic] = useState<string>('Hàm số bậc hai & Parabol');
  const [format, setFormat] = useState<ExamFormat>('true_false');
  const [elo, setElo] = useState<number>(() => {
    try {
      return loadStudentMemory().elo || 1280;
    } catch {
      return 1280;
    }
  });
  const [streak, setStreak] = useState<number>(() => {
    try {
      return loadStudentMemory().streak || 3;
    } catch {
      return 3;
    }
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [currentProblem, setCurrentProblem] = useState<ExamProblem | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);

  // User input states
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [tfAnswers, setTfAnswers] = useState<Record<string, boolean | null>>({
    a: null,
    b: null,
    c: null,
    d: null,
  });
  const [shortAnswerInput, setShortAnswerInput] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [scoreEarned, setScoreEarned] = useState<number | null>(null);
  const [eloChange, setEloChange] = useState<number | null>(null);

  // Timer & Fatigue calculation
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [responseTimeHistory, setResponseTimeHistory] = useState<number[]>([42, 55, 68]);
  const [fatigueWarning, setFatigueWarning] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  // Topics per grade
  const grade10Topics = [
    'Mệnh đề & Tập hợp',
    'Bất phương trình & Hệ BPT bậc nhất hai ẩn',
    'Hàm số bậc hai & Parabol',
    'Hệ thức lượng trong tam giác',
    'Véc-tơ & Tích vô hướng',
    'Thống kê & Xác suất cổ điển',
  ];

  const grade11Topics = [
    'Hàm số lượng giác & Phương trình lượng giác',
    'Dãy số, Cấp số cộng & Cấp số nhân',
    'Giới hạn & Hàm liên tục',
    'Đạo hàm & Tiếp tuyến',
    'Quan hệ song song trong không gian',
    'Quan hệ vuông góc & Khoảng cách 3D',
    'Xác suất có điều kiện',
  ];

  useEffect(() => {
    // Default fetch first problem
    fetchExamProblem();
  }, [grade, format]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  const fetchExamProblem = async (customTopic?: string, customFormat?: ExamFormat) => {
    setLoading(true);
    setIsSubmitted(false);
    setSelectedOption(null);
    setTfAnswers({ a: null, b: null, c: null, d: null });
    setShortAnswerInput('');
    setScoreEarned(null);
    setEloChange(null);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setApiError(null);
    setFallbackNotice(null);

    try {
      const { problem, modelUsed: usedModel } = await generateExamProblemAI(
        grade,
        customTopic || topic,
        customFormat || format,
        elo,
        (ev: FallbackEvent) => {
          setFallbackNotice(
            `Model ${ev.failedModel} gặp lỗi (${ev.errorReason}), đang tự động thử lại với ${ev.nextModel}...`
          );
        }
      );

      setCurrentProblem(problem);
      setModelUsed(usedModel);
    } catch (err: any) {
      console.error('Exam problem generation error:', err);
      setApiError(err.message || 'Lỗi không xác định từ Gemini API');
      setIsTimerRunning(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!currentProblem || isSubmitted) return;
    setIsTimerRunning(false);
    setIsSubmitted(true);

    // Record response time for fatigue analysis
    const timeSpent = timerSeconds;
    const newHistory = [...responseTimeHistory, timeSpent];
    setResponseTimeHistory(newHistory);

    // Detect fatigue if last 3 problems took noticeably longer
    if (newHistory.length >= 3) {
      const last = newHistory[newHistory.length - 1];
      const prev = newHistory[newHistory.length - 2];
      if (last > 90 || last > prev * 1.6) {
        setFatigueWarning(true);
      } else {
        setFatigueWarning(false);
      }
    }

    let isCorrectOverall = false;

    if (currentProblem.format === 'multiple_choice') {
      const correctOpt = currentProblem.options?.find((o) => o.isCorrect);
      if (correctOpt && selectedOption === correctOpt.id) {
        isCorrectOverall = true;
      }
    } else if (currentProblem.format === 'true_false') {
      let correctCount = 0;
      currentProblem.subItems?.forEach((sub) => {
        if (tfAnswers[sub.id] === sub.isCorrect) {
          correctCount++;
        }
      });
      // In MoET 2025: 4 correct = 1.0 pt, 3 correct = 0.5 pt, 2 correct = 0.25 pt, 1 correct = 0.1 pt
      isCorrectOverall = correctCount >= 3;
    } else if (currentProblem.format === 'short_answer') {
      const cleanExpected = (currentProblem.shortAnswerKey || '').trim().toLowerCase();
      const cleanUser = shortAnswerInput.trim().toLowerCase();
      isCorrectOverall = cleanExpected === cleanUser;
    }

    // ELO algorithm simulation
    if (isCorrectOverall) {
      const gained = Math.round(18 + Math.random() * 8);
      setElo((prev) => prev + gained);
      setEloChange(gained);
      setStreak((prev) => {
        const nextStreak = prev + 1;
        if (nextStreak >= 3) {
          audioService.playStreak();
        } else {
          audioService.playSuccess();
        }
        return nextStreak;
      });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      recordProblemOutcome(currentProblem.topic, true, gained);
    } else {
      const lost = Math.round(12 + Math.random() * 5);
      setElo((prev) => Math.max(800, prev - lost));
      setEloChange(-lost);
      setStreak(0);
      audioService.playError();
      recordProblemOutcome(currentProblem.topic, false, -lost);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Arena Stats & ELO Dashboard */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/40">
            <Trophy className="h-6 w-6 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                MoET Arena Mode (Bộ GD&ĐT 2025/2026)
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                <Flame className="h-3 w-3 text-amber-400" /> Streak: {streak}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xl font-black text-white font-mono">
                ELO: {elo}
              </span>
              <span className="text-xs text-slate-400">
                Phân vị ZPD: {elo > 1400 ? 'Chinh phục 9+ (Cao cấp)' : elo > 1200 ? 'Vận dụng 7-8' : 'Thông hiểu 5-6'}
              </span>
            </div>
          </div>
        </div>

        {/* Stopwatch & Fatigue alert */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-sm">
            <Timer className={`h-4 w-4 ${timerSeconds > 120 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="text-white font-bold">{formatTimer(timerSeconds)}</span>
          </div>

          {fatigueWarning && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-600/40 text-xs font-semibold text-amber-300">
              <AlertTriangle className="h-4 w-4 text-amber-400 animate-bounce" />
              Dự báo mệt mỏi: Hãy hít thở sâu hoặc bật "Dừng suy ngẫm"!
            </div>
          )}
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        {/* Grade switch */}
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5">Khối lớp:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setGrade(10);
                setTopic(grade10Topics[0]);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                grade === 10
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              Lớp 10
            </button>
            <button
              onClick={() => {
                setGrade(11);
                setTopic(grade11Topics[0]);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                grade === 11
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              Lớp 11
            </button>
          </div>
        </div>

        {/* Topic dropdown */}
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5">Chủ đề kiến thức:</label>
          <select
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              fetchExamProblem(e.target.value, format);
            }}
            className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {(grade === 10 ? grade10Topics : grade11Topics).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Format selector */}
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5">
            3 Định dạng đề thi chuẩn Bộ GD&ĐT:
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'multiple_choice', label: 'Trắc nghiệm 4 opt' },
              { id: 'true_false', label: 'Đúng / Sai (4 ý)' },
              { id: 'short_answer', label: 'Trả lời ngắn' },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => {
                  setFormat(fmt.id as ExamFormat);
                }}
                className={`py-2 px-1 rounded-lg text-[11px] font-semibold text-center transition-all ${
                  format === fmt.id
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Red Alert on API Error as per AI_INSTRUCTIONS.md */}
      {apiError && (
        <div className="p-5 rounded-2xl bg-rose-950/60 border border-rose-500 text-xs text-rose-200 space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <strong className="text-rose-300 font-bold flex items-center gap-2 text-sm">
              <AlertOctagon className="h-5 w-5 text-rose-400 shrink-0" />
              Đã dừng do lỗi tạo đề thi từ Gemini API:
            </strong>
            <div className="flex items-center gap-2">
              {onOpenApiKeyModal && (
                <button
                  onClick={onOpenApiKeyModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 cursor-pointer shadow-md"
                >
                  <Key className="h-3.5 w-3.5" />
                  Đổi API Key
                </button>
              )}
              <button
                onClick={() => fetchExamProblem()}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Thử lại
              </button>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 font-mono text-rose-300 text-xs break-all border border-rose-900/80">
            {apiError}
          </div>
          <p className="text-[11px] text-rose-300/80">
            * Nếu gặp mã lỗi <strong>429 RESOURCE_EXHAUSTED</strong>, hạn ngạch của API key đã hết. Vui lòng bấm vào nút đỏ <strong>"Lấy API key để sử dụng app"</strong> trên Header để tạo key mới hoàn toàn miễn phí.
          </p>
        </div>
      )}

      {/* Fallback Notice */}
      {fallbackNotice && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
          <span className="animate-pulse">⚡</span>
          <span>{fallbackNotice}</span>
        </div>
      )}

      {/* Exam Question Card */}
      {loading ? (
        <div className="p-16 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center gap-3">
          <BrainCircuit className="h-8 w-8 text-indigo-400 animate-spin" />
          <span className="text-sm font-semibold text-slate-300">
            Đang biên soạn câu hỏi chuẩn ZPD (ELO {elo}) theo định dạng mới...
          </span>
        </div>
      ) : currentProblem ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl space-y-6">
          {/* Header of Question */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                Câu hỏi ELO: {currentProblem.eloDifficulty || elo}
              </span>
              <span className="text-xs text-slate-400">
                Chủ đề: <strong>{currentProblem.topic}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Word Export Button */}
              <button
                onClick={() => exportExamToWord({ problems: [currentProblem], topic, grade })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                title="Xuất câu hỏi này thành file Word (.doc) chuẩn biểu mẫu Bộ GD&ĐT"
              >
                <FileText className="h-3.5 w-3.5 text-blue-400" />
                Xuất Đề Word (.doc)
              </button>

              {/* Moodle GIFT Export Button */}
              <button
                onClick={() => exportProblemsToMoodleGift([currentProblem], topic)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                title="Xuất sang định dạng Moodle GIFT để nạp trực tiếp vào LMS trường học"
              >
                <Download className="h-3.5 w-3.5 text-amber-400" />
                Xuất Moodle (GIFT)
              </button>

              {currentProblem.realWorldContext && (
                <span className="text-xs text-emerald-400 font-mono bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  🚀 Thực tiễn: {currentProblem.realWorldContext}
                </span>
              )}
            </div>
          </div>

          {/* Statement */}
          <div className="text-base text-slate-100 font-medium leading-relaxed">
            <MathRenderer content={currentProblem.statement} />
          </div>

          {/* FORMAT 1: Multiple Choice */}
          {currentProblem.format === 'multiple_choice' && currentProblem.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentProblem.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                let optStyle = 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200';

                if (isSubmitted) {
                  if (opt.isCorrect) {
                    optStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500';
                  } else if (isSelected && !opt.isCorrect) {
                    optStyle = 'bg-rose-950/50 border-rose-500 text-rose-200 ring-1 ring-rose-500';
                  }
                } else if (isSelected) {
                  optStyle = 'bg-indigo-950/50 border-indigo-500 text-indigo-100 ring-1 ring-indigo-500';
                }

                return (
                  <button
                    key={opt.id}
                    disabled={isSubmitted}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${optStyle}`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-800 font-bold text-xs text-white">
                      {opt.id}
                    </span>
                    <div className="flex-1 text-sm font-medium">
                      <MathRenderer content={opt.text} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* FORMAT 2: True / False (4 sub-items a, b, c, d) - Signature MoET 2025 */}
          {currentProblem.format === 'true_false' && currentProblem.subItems && (
            <div className="space-y-3 pt-2">
              <div className="text-xs text-amber-300 font-medium pb-1 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" />
                Mỗi ý a, b, c, d hãy chọn ĐÚNG hoặc SAI:
              </div>
              {currentProblem.subItems.map((sub) => {
                const ans = tfAnswers[sub.id];
                return (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 flex-1">
                      <span className="font-bold text-sm text-indigo-400 font-mono">
                        {sub.id})
                      </span>
                      <div className="text-sm text-slate-200">
                        <MathRenderer content={sub.statement} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        disabled={isSubmitted}
                        onClick={() => setTfAnswers({ ...tfAnswers, [sub.id]: true })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          ans === true
                            ? 'bg-emerald-600 text-white shadow'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        ĐÚNG
                      </button>
                      <button
                        disabled={isSubmitted}
                        onClick={() => setTfAnswers({ ...tfAnswers, [sub.id]: false })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          ans === false
                            ? 'bg-rose-600 text-white shadow'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        SAI
                      </button>

                      {isSubmitted && (
                        <div className="ml-2 flex items-center gap-1 text-xs">
                          {ans === sub.isCorrect ? (
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-400" />
                          )}
                          <span className="text-[11px] text-slate-400">
                            Đáp án: {sub.isCorrect ? 'Đúng' : 'Sai'} ({sub.keywordRationale})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* FORMAT 3: Short Answer */}
          {currentProblem.format === 'short_answer' && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-slate-300">
                Nhập kết quả tính toán số hoặc tối giản:
              </label>
              <div className="flex gap-3 max-w-md">
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={shortAnswerInput}
                  onChange={(e) => setShortAnswerInput(e.target.value)}
                  placeholder="Ví dụ: 12 hoặc 3/4 hoặc -5"
                  className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-4 py-2.5 text-base font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {isSubmitted && (
                <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200">
                  Đáp án chuẩn Bộ GD&ĐT: <strong>{currentProblem.shortAnswerKey}</strong>
                </div>
              )}
            </div>
          )}

          {/* Action Footer: Submit & Next */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              {eloChange !== null && (
                <div
                  className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                    eloChange > 0
                      ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/40'
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  {eloChange > 0 ? `+${eloChange} ELO` : `${eloChange} ELO`}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  Nộp Bài & Chấm Điểm ZPD
                </button>
              ) : (
                <button
                  onClick={() => fetchExamProblem()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  Câu Tiếp Theo Thích Ứng
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Full Solution & Socratic Explanation */}
          {isSubmitted && currentProblem.fullSolution && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-indigo-500/30 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Phân Tích Socratic & Lời Giải Chi Tiết:
              </span>
              <div className="text-sm text-slate-200">
                <MathRenderer content={currentProblem.fullSolution} />
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
