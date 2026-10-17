import React, { useState } from 'react';
import { MathRenderer } from './MathRenderer';
import {
  Activity,
  GitFork,
  Brain,
  HelpCircle,
  Trophy,
  Lightbulb,
  Box,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface SocraticResponseParserProps {
  rawText: string;
  onOpenGeometryViewer?: () => void;
  onSelectCheckpoint?: (answer: string) => void;
}

export const SocraticResponseParser: React.FC<SocraticResponseParserProps> = ({
  rawText,
  onOpenGeometryViewer,
  onSelectCheckpoint,
}) => {
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string | null>(null);
  const [showIsomorphicHint, setShowIsomorphicHint] = useState<boolean>(false);

  // Parsing 7 blocks by regex
  const extractSection = (headingPattern: string): string | null => {
    // Matches ### [Heading] or ## [Heading] or **[Heading]** or [Heading]
    const regex = new RegExp(
      `(?:###|##|#|\\*\\*|\\b)\\[?${headingPattern}\\]?\\*?\\*?([\\s\\S]*?)(?=(?:###|##|#|\\*\\*|\\b)\\[?(?:Status Check|Knowledge Bridge|Socratic Guidance|Interactive Checkpoint|Isomorphic Challenge|Remediation Tip|Visual\\/AR Suggestion)\\]?|$)`,
      'i'
    );
    const match = rawText.match(regex);
    return match && match[1] ? match[1].trim() : null;
  };

  const statusCheck = extractSection('Status Check');
  const knowledgeBridge = extractSection('Knowledge Bridge');
  const socraticGuidance = extractSection('Socratic Guidance');
  const interactiveCheckpoint = extractSection('Interactive Checkpoint');
  const isomorphicChallenge = extractSection('Isomorphic Challenge');
  const remediationTip = extractSection('Remediation Tip');
  const visualArSuggestion = extractSection('Visual\\/AR Suggestion');

  const hasStructuredBlocks = Boolean(
    statusCheck || knowledgeBridge || socraticGuidance || interactiveCheckpoint || isomorphicChallenge
  );

  if (!hasStructuredBlocks) {
    return (
      <div className="space-y-3">
        <MathRenderer content={rawText} />
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      {/* 1. [Status Check] */}
      {statusCheck && (
        <div className="flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-950/30 p-3.5 text-sky-100 backdrop-blur-sm shadow-sm">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/30">
            <Activity className="h-4 w-4 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                [Status Check] Trạng Thái Nhận Thức & ZPD
              </span>
              <span className="inline-flex items-center rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-300 ring-1 ring-sky-500/20">
                Focus Flow Active
              </span>
            </div>
            <div className="mt-1 font-medium text-sky-100">
              <MathRenderer content={statusCheck} />
            </div>
          </div>
        </div>
      )}

      {/* 2. [Knowledge Bridge] */}
      {knowledgeBridge && (
        <div className="flex items-start gap-3 rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-3.5 text-indigo-100 backdrop-blur-sm">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/30">
            <GitFork className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                [Knowledge Bridge] Nút Đồ Thị & Kết Nối Thực Tiễn
              </span>
              <span className="text-[10px] text-indigo-300/70 font-mono">🚀 Ứng dụng liên môn</span>
            </div>
            <div className="mt-1 text-slate-200">
              <MathRenderer content={knowledgeBridge} />
            </div>
          </div>
        </div>
      )}

      {/* 3. [Socratic Guidance] */}
      {socraticGuidance && (
        <div className="rounded-xl border border-violet-500/30 bg-gradient-to-b from-slate-900/90 to-violet-950/20 p-4 shadow-md">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-violet-500/10">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300 ring-1 ring-violet-400/30">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300">
                [Socratic Guidance] Gợi Mở Tư Duy Ngược (Không Lời Giải Trực Tiếp)
              </h4>
              <p className="text-[11px] text-slate-400">Từng bước kích hoạt suy luận độc lập theo lý thuyết ZPD</p>
            </div>
          </div>
          <div className="mt-3.5 space-y-2 text-slate-100 pl-1">
            <MathRenderer content={socraticGuidance} />
          </div>
        </div>
      )}

      {/* 4. [Interactive Checkpoint] */}
      {interactiveCheckpoint && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30">
                <HelpCircle className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                [Interactive Checkpoint] Điểm Dừng Kiểm Tra Khái Niệm
              </span>
            </div>
            <span className="text-[11px] text-amber-300/80">Chọn để xác nhận tư duy</span>
          </div>
          <div className="mt-2 text-slate-200">
            <MathRenderer content={interactiveCheckpoint} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-amber-500/20">
            <button
              onClick={() => {
                setSelectedCheckpoint('correct_affirmation');
                onSelectCheckpoint?.('Em đồng ý với hướng suy luận này (Đúng)');
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCheckpoint === 'correct_affirmation'
                  ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Đúng - Em đã nắm ý này
            </button>
            <button
              onClick={() => {
                setSelectedCheckpoint('need_clarification');
                onSelectCheckpoint?.('Em vẫn chưa rõ bước biến đổi này, thầy cô gợi ý thêm tầng tiếp theo được không?');
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCheckpoint === 'need_clarification'
                  ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
              }`}
            >
              <XCircle className="h-3.5 w-3.5 text-amber-400" />
              Chưa rõ - Cần thêm gợi ý tầng 2
            </button>
          </div>
        </div>
      )}

      {/* 5. [Isomorphic Challenge] */}
      {isomorphicChallenge && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30">
                <Trophy className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                [Isomorphic Challenge] Thử Thách Biến Thể Thực Tế
              </span>
            </div>
            <button
              onClick={() => setShowIsomorphicHint(!showIsomorphicHint)}
              className="text-[11px] font-medium text-emerald-400 hover:underline flex items-center gap-1"
            >
              {showIsomorphicHint ? 'Ẩn gợi ý' : 'Mở gợi ý giải'}
              <ChevronRight className={`h-3 w-3 transform transition-transform ${showIsomorphicHint ? 'rotate-90' : ''}`} />
            </button>
          </div>
          <div className="mt-2 text-slate-200">
            <MathRenderer content={isomorphicChallenge} />
          </div>
        </div>
      )}

      {/* 6. [Remediation Tip] */}
      {remediationTip && (
        <div className="flex items-start gap-3 rounded-xl border border-purple-500/20 bg-purple-950/20 p-3.5 text-purple-100">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-purple-500/20 text-purple-300">
            <Lightbulb className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              [Remediation Tip] Viên Nang Spaced Repetition
            </span>
            <div className="mt-1 text-slate-200 text-xs">
              <MathRenderer content={remediationTip} />
            </div>
          </div>
        </div>
      )}

      {/* 7. [Visual/AR Suggestion] */}
      {visualArSuggestion && (
        <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-500/20 text-teal-300">
              <Box className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                [Visual/AR Suggestion] Trực Quan Không Gian 3D/4D
              </span>
              <div className="mt-1 text-xs text-slate-300">
                <MathRenderer content={visualArSuggestion} />
              </div>
            </div>
          </div>
          {onOpenGeometryViewer && (
            <button
              onClick={onOpenGeometryViewer}
              className="shrink-0 self-end sm:self-center flex items-center gap-1.5 rounded-lg bg-teal-500/20 px-3 py-1.5 text-xs font-semibold text-teal-200 ring-1 ring-teal-500/40 hover:bg-teal-500/30 transition-colors"
            >
              Mở mô hình 3D
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
