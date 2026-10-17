import React, { useState } from 'react';
import { MathRenderer } from './MathRenderer';
import { ErrorDiagnosticResult } from '../types/math';
import {
  AlertOctagon,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldAlert,
  Brain,
  Key,
} from 'lucide-react';
import { diagnoseStudentError, FallbackEvent } from '../services/geminiService';
import { VirtualMathKeypad } from './VirtualMathKeypad';
import { audioService } from '../services/audioService';
import { recordCognitiveError } from '../services/studentMemoryService';

interface ErrorDiagnosticStudioProps {
  onOpenApiKeyModal?: () => void;
}

export const ErrorDiagnosticStudio: React.FC<ErrorDiagnosticStudioProps> = ({ onOpenApiKeyModal }) => {
  const [problemText, setProblemText] = useState<string>(
    'Tìm m để hàm số $y = x^2 - 2(m+1)x + 4m$ đồng biến trên khoảng $(2; +\\infty)$.'
  );
  const [solutionText, setSolutionText] = useState<string>(
    'Hàm số đồng biến khi đỉnh $x_I \\le 2$.\nTa có đỉnh $x_I = -\\frac{b}{2a} = -\\frac{-2(m+1)}{2} = m+1$.\nDo đó $m+1 \\le 2 \\implies m \\le 1$.\nKết luận: $m \\le 1$.'
  );
  const [topic, setTopic] = useState<string>('Hàm số bậc hai');
  const [loading, setLoading] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<ErrorDiagnosticResult | null>(null);
  const [isomorphicAnswer, setIsomorphicAnswer] = useState<string>('');
  const [isomorphicFeedback, setIsomorphicFeedback] = useState<string | null>(null);

  // State Management as per AI_INSTRUCTIONS.md
  const [stepState, setStepState] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [apiError, setApiError] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<'problem' | 'solution'>('solution');

  // Preset faulty solutions for instant testing
  const presets = [
    {
      label: 'Nhầm lẫn đỉnh Parabol & Điều kiện đồng biến (Lớp 10)',
      problem: 'Tìm m để hàm số $y = x^2 - 2(m+1)x + 4m$ đồng biến trên khoảng $(2; +\\infty)$.',
      solution: 'Đỉnh $x_I = m+1$. Để hàm số đồng biến trên $(2; +\\infty)$ thì $x_I \\le 2 \\iff m+1 \\le 2 \\iff m \\le 1$. Em thử thế $m=0$ thì $y=x^2-2x$ có đỉnh $x=1$, đồng biến trên $(1; +\\infty)$ chứa $(2; +\\infty)$ nên đúng.',
      topic: 'Hàm số bậc hai',
    },
    {
      label: 'Sai lầm dấu căn bậc hai: $\\sqrt{A^2} = A$ thay vì $|A|$ (Lớp 10)',
      problem: 'Rút gọn biểu thức $P = \\sqrt{x^2 - 4x + 4} + 2x$ với $x < 2$.',
      solution: 'Ta có $P = \\sqrt{(x-2)^2} + 2x = (x-2) + 2x = 3x - 2$.',
      topic: 'Căn thức bậc hai',
    },
    {
      label: 'Ngụy biện Logic: Quan hệ vuông góc trong không gian (Lớp 11)',
      problem: 'Cho hình chóp $S.ABC$. Biết $SA \\perp AB$ và $SA \\perp AC$. Hỏi $SA \\perp (ABC)$ không?',
      solution: 'Do $SA$ vuông góc với 2 đường thẳng $AB$ và $AC$ nên $SA \\perp (ABC)$.',
      topic: 'Quan hệ vuông góc trong không gian',
    },
  ];

  const handleDiagnose = async () => {
    if (!problemText || !solutionText) return;
    setLoading(true);
    setDiagnosticResult(null);
    setIsomorphicFeedback(null);
    setIsomorphicAnswer('');
    setApiError(null);
    setFallbackNotice(null);
    setStepState('running');

    try {
      const { result, modelUsed: usedModel } = await diagnoseStudentError(
        problemText,
        solutionText,
        topic,
        (ev: FallbackEvent) => {
          setFallbackNotice(
            `Model ${ev.failedModel} gặp lỗi (${ev.errorReason}), đang tự động thử lại với ${ev.nextModel}...`
          );
        }
      );

      setDiagnosticResult(result);
      setModelUsed(usedModel);
      setStepState('completed');
      recordCognitiveError(topic, result.errorType, result.brokenStep);
      audioService.playSuccess();
    } catch (err: any) {
      console.error('Diagnostic error:', err);
      setApiError(err.message || 'Lỗi không xác định từ Gemini API');
      setStepState('error');
      audioService.playError();
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIsomorphic = () => {
    if (!diagnosticResult || !isomorphicAnswer) return;
    setIsomorphicFeedback(
      `🎯 Đã đối chiếu lời giải của bạn! Đáp án mẫu gợi ý từ hệ thống: "${diagnosticResult.isomorphicProblem.correctKey}". Hãy đối chiếu với từng bước biến đổi của bạn!`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <ShieldAlert className="h-6 w-6 text-rose-400" />
            Phân Tích Lỗi Sai Đa Chiều & Hàn Gắn Tư Duy (Remediation)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Tự động bóc tách lỗi: <strong className="text-amber-400">Tính toán (Arithmetic)</strong> |{' '}
            <strong className="text-rose-400">Khái niệm (Conceptual)</strong> |{' '}
            <strong className="text-purple-400">Logic (Logical)</strong> kèm bài toán Isomorphic tương đương.
          </p>
        </div>
      </div>

      {/* Preset Quick Loader */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          Tải nhanh các ca sai lầm nhận thức điển hình:
        </label>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setProblemText(p.problem);
                setSolutionText(p.solution);
                setTopic(p.topic);
                setDiagnosticResult(null);
                setIsomorphicFeedback(null);
                setStepState('idle');
                setApiError(null);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700/80 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-indigo-300">Đề bài Toán (Hỗ trợ LaTeX $...$):</label>
            {focusedField === 'problem' && (
              <span className="text-[10px] text-indigo-400 font-mono">● Đang trỏ bàn phím vào đây</span>
            )}
          </div>
          <textarea
            rows={4}
            value={problemText}
            onFocus={() => setFocusedField('problem')}
            onChange={(e) => setProblemText(e.target.value)}
            className={`w-full rounded-xl bg-slate-950/80 border p-3.5 text-sm text-slate-200 focus:outline-none font-mono transition-all ${
              focusedField === 'problem' ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-800'
            }`}
            placeholder="Nhập đề bài..."
          />
          <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/60 text-xs">
            <span className="text-slate-400 block text-[11px] mb-1">Xem trước đề bài:</span>
            <MathRenderer content={problemText} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-amber-300">Lời giải hiện tại của học sinh:</label>
            {focusedField === 'solution' && (
              <span className="text-[10px] text-amber-400 font-mono">● Đang trỏ bàn phím vào đây</span>
            )}
          </div>
          <textarea
            rows={4}
            value={solutionText}
            onFocus={() => setFocusedField('solution')}
            onChange={(e) => setSolutionText(e.target.value)}
            className={`w-full rounded-xl bg-slate-950/80 border p-3.5 text-sm text-slate-200 focus:outline-none font-mono transition-all ${
              focusedField === 'solution' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-800'
            }`}
            placeholder="Nhập từng bước giải của học sinh..."
          />
          <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/60 text-xs">
            <span className="text-slate-400 block text-[11px] mb-1">Xem trước lời giải:</span>
            <MathRenderer content={solutionText} />
          </div>
        </div>
      </div>

      {/* Virtual Math Keypad */}
      <VirtualMathKeypad
        onInsert={(latex) => {
          audioService.playKeyTap();
          if (focusedField === 'problem') {
            setProblemText((prev) => prev + latex);
          } else {
            setSolutionText((prev) => prev + latex);
          }
        }}
      />

      {/* Trigger Button */}
      <div className="flex justify-end">
        <button
          onClick={handleDiagnose}
          disabled={loading || !problemText || !solutionText}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-rose-950/50 disabled:opacity-50 transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Đang phân tích cấu trúc nhận thức...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Chẩn Đoán Lỗi Sai & Sinh Đề Isomorphic
            </>
          )}
        </button>
      </div>

      {/* 3-Step Pipeline & Progress State (as specified in AI_INSTRUCTIONS.md) */}
      {(stepState === 'running' || stepState === 'completed' || stepState === 'error') && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">
              Tiến trình xử lý chẩn đoán (3 Bước):
            </span>
            {stepState === 'completed' && (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Hoàn tất phân tích {modelUsed && `(${modelUsed})`}
              </span>
            )}
            {stepState === 'error' && (
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <AlertOctagon className="h-4 w-4" /> Đã dừng do lỗi
              </span>
            )}
            {stepState === 'running' && (
              <span className="text-indigo-400 font-medium flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Đang xử lý...
              </span>
            )}
          </div>

          {/* Progress Bar: Only green on completed success */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                stepState === 'completed'
                  ? 'w-full bg-emerald-500'
                  : stepState === 'error'
                  ? 'w-1/2 bg-rose-500'
                  : 'w-2/3 bg-indigo-500 animate-pulse'
              }`}
            />
          </div>

          {/* 3 Step Status Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Step 1: Input & Data validation */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Bước 1: Tiếp nhận dữ liệu</span>
                <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Hoàn tất
                </span>
              </div>
            </div>

            {/* Step 2: Cognitive error breakdown */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Bước 2: Bóc tách lỗi</span>
                {stepState === 'completed' ? (
                  <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Hoàn tất
                  </span>
                ) : stepState === 'error' ? (
                  <span className="text-rose-400 font-bold text-[11px] flex items-center gap-1">
                    <AlertOctagon className="h-3.5 w-3.5" /> Đã dừng do lỗi
                  </span>
                ) : (
                  <span className="text-indigo-300 font-medium text-[11px]">Đang phân tích...</span>
                )}
              </div>
            </div>

            {/* Step 3: Isomorphic problem generation */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Bước 3: Đề Isomorphic</span>
                {stepState === 'completed' ? (
                  <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Hoàn tất
                  </span>
                ) : stepState === 'error' ? (
                  <span className="text-rose-400 font-bold text-[11px] flex items-center gap-1">
                    <AlertOctagon className="h-3.5 w-3.5" /> Đã dừng do lỗi
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium text-[11px]">Đang chờ...</span>
                )}
              </div>
            </div>
          </div>

          {/* Red Banner showing verbatim API error */}
          {stepState === 'error' && apiError && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500 text-xs text-rose-200 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <strong className="text-rose-300 font-bold flex items-center gap-2 text-sm">
                  <AlertOctagon className="h-5 w-5 text-rose-400 shrink-0" />
                  Đã dừng do lỗi API (Tất cả model AI đều thất bại):
                </strong>
                {onOpenApiKeyModal && (
                  <button
                    onClick={onOpenApiKeyModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 cursor-pointer shadow-md"
                  >
                    <Key className="h-3.5 w-3.5" />
                    Đổi API Key
                  </button>
                )}
              </div>
              <div className="p-3 rounded-lg bg-slate-950 font-mono text-rose-300 text-xs break-all border border-rose-900/80">
                {apiError}
              </div>
              <p className="text-[11px] text-rose-300/80">
                * Lưu ý: Nếu gặp mã lỗi <strong>429 RESOURCE_EXHAUSTED</strong>, hạn ngạch của API key đã hết. Vui lòng bấm vào nút đỏ <strong>"Lấy API key để sử dụng app"</strong> trên Header để tạo key mới hoàn toàn miễn phí.
              </p>
            </div>
          )}

          {fallbackNotice && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
              <span className="animate-pulse">⚡</span>
              <span>{fallbackNotice}</span>
            </div>
          )}
        </div>
      )}

      {/* Diagnostic Result Section */}
      {diagnosticResult && (
        <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl text-white font-bold ${
                  diagnosticResult.errorType === 'Arithmetic'
                    ? 'bg-amber-600'
                    : diagnosticResult.errorType === 'Conceptual'
                    ? 'bg-rose-600'
                    : 'bg-purple-600'
                }`}
              >
                <AlertOctagon className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Phân Loại Lỗi Sai Đa Chiều:
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {diagnosticResult.errorTypeNameVi} ({diagnosticResult.errorType} Error)
                </h3>
              </div>
            </div>

            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-mono text-slate-300 border border-slate-700">
              Chủ đề: {topic}
            </span>
          </div>

          {/* Broken Step & Psychological Root Cause */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-1.5">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                1. Bước bị gãy tư duy (Broken Step):
              </span>
              <p className="text-sm text-slate-200 font-mono">
                {diagnosticResult.brokenStep}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-1.5">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                2. Phân tích nguyên nhân nhận thức:
              </span>
              <p className="text-sm text-slate-300 leading-relaxed">
                {diagnosticResult.explanation}
              </p>
            </div>
          </div>

          {/* Socratic Question */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="h-4 w-4" />
              3. Câu hỏi phản biện Socratic gợi mở:
            </span>
            <div className="text-sm text-slate-100 font-medium">
              <MathRenderer content={diagnosticResult.socraticQuestion} />
            </div>
          </div>

          {/* Isomorphic Problem */}
          {diagnosticResult.isomorphicProblem && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  4. Bài toán tương đương (Isomorphic Problem) bối cảnh thực tế:
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {diagnosticResult.isomorphicProblem.context}
                </span>
              </div>

              <div className="text-sm text-slate-200">
                <MathRenderer content={diagnosticResult.isomorphicProblem.question} />
              </div>

              {diagnosticResult.isomorphicProblem.hint && (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs text-slate-400">
                  <strong className="text-amber-300">Gợi ý tư duy: </strong>
                  <MathRenderer content={diagnosticResult.isomorphicProblem.hint} />
                </div>
              )}

              {/* Student Trial Input */}
              <div className="pt-2 space-y-2">
                <label className="text-xs text-slate-400">
                  Thử giải bài toán tương đương để kiểm chứng mức độ khắc phục lỗ hổng:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={isomorphicAnswer}
                    onChange={(e) => setIsomorphicAnswer(e.target.value)}
                    placeholder="Nhập đáp án hoặc kết quả rút gọn của bạn..."
                    className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    onClick={handleCheckIsomorphic}
                    disabled={!isomorphicAnswer}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    Đối chiếu
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {isomorphicFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200">
                    <MathRenderer content={isomorphicFeedback} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Remediation Capsule */}
          {diagnosticResult.remediationCapsule && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/50 to-purple-950/50 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-300 block mb-1">
                  Viên nang ghi nhớ (Spaced Repetition Capsule):
                </strong>
                <MathRenderer content={diagnosticResult.remediationCapsule} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
