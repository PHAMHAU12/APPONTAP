// Student Cognitive Memory & Spaced Repetition Persistence Service
// Inspired by ai-agents-architect & game-development skills from SKILL EDUCATION

import { StudentProfile } from '../types/math';

export interface StudentBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface StudentMemoryData extends StudentProfile {
  totalSolved: number;
  correctCount: number;
  topicSolveCount: Record<string, number>;
  badges: StudentBadge[];
  recentMistakes: Array<{
    id: string;
    topic: string;
    errorType: string;
    note: string;
    timestamp: string;
  }>;
}

const STORAGE_KEY = 'student_cognitive_memory';

const DEFAULT_BADGES: StudentBadge[] = [
  {
    id: 'badge_first_step',
    name: 'Khởi Đầu Tự Tin',
    description: 'Hoàn thành câu hỏi đầu tiên trên Đấu trường Arena.',
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 'badge_streak_3',
    name: 'Tập Trung Cao Độ',
    description: 'Duy trì chuỗi học tập 3 ngày liên tiếp.',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'badge_streak_7',
    name: 'Kỷ Luật Thép',
    description: 'Duy trì chuỗi học tập 7 ngày liên tiếp.',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'badge_elo_1300',
    name: 'Vận Dụng Vững Vàng',
    description: 'Vượt mốc 1300 điểm ELO trên hệ thống.',
    icon: '🏆',
    unlocked: false,
  },
  {
    id: 'badge_elo_1500',
    name: 'Chinh Phục 9+ THPT',
    description: 'Vượt mốc 1500 điểm ELO chuẩn bài toán Vận dụng cao.',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'badge_parabola_master',
    name: 'Bậc Thầy Parabol',
    description: 'Khắc phục triệt để lỗ hổng về đỉnh và bề lõm hàm số bậc hai.',
    icon: '📈',
    unlocked: false,
  },
  {
    id: 'badge_trig_master',
    name: 'Chiến Thần Lượng Giác',
    description: 'Thành thạo vòng tròn lượng giác và công thức biến đổi.',
    icon: '📐',
    unlocked: false,
  },
  {
    id: 'badge_remediation_hero',
    name: 'Hàn Gắn Tư Duy',
    description: 'Hoàn thành bài tập Isomorphic tương đương sau khi chẩn đoán lỗi.',
    icon: '🛡️',
    unlocked: false,
  },
];

export function loadStudentMemory(): StudentMemoryData {
  if (typeof window === 'undefined') {
    return createDefaultMemory();
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = createDefaultMemory();
    saveStudentMemory(initial);
    return initial;
  }

  try {
    const parsed = JSON.parse(raw);
    // Ensure all badges exist
    const existingBadgeIds = new Set(parsed.badges?.map((b: StudentBadge) => b.id) || []);
    const mergedBadges = [
      ...(parsed.badges || []),
      ...DEFAULT_BADGES.filter((b) => !existingBadgeIds.has(b.id)),
    ];

    return {
      ...createDefaultMemory(),
      ...parsed,
      badges: mergedBadges,
    };
  } catch {
    return createDefaultMemory();
  }
}

export function saveStudentMemory(data: StudentMemoryData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function createDefaultMemory(): StudentMemoryData {
  return {
    name: 'Nguyễn Minh Tuấn',
    grade: 10,
    elo: 1315,
    zpdLevel: 3,
    streakDays: 5,
    focusState: 'Focus Flow',
    failedAttemptsInCurrentTopic: 0,
    masteredNodeIds: ['k10_set_logic', 'k10_triangle_trig'],
    cognitiveGaps: ['k10_quadratic_func'],
    totalSolved: 14,
    correctCount: 10,
    topicSolveCount: {
      'Hàm số bậc hai & Parabol': 6,
      'Hệ thức lượng trong tam giác': 4,
      'Lượng giác': 4,
    },
    badges: DEFAULT_BADGES.map((b) => ({ ...b })),
    recentMistakes: [
      {
        id: 'err_init_1',
        topic: 'Hàm số bậc hai',
        errorType: 'Conceptual',
        note: 'Nhầm lẫn điều kiện đồng biến khoảng mở với tọa độ đỉnh Parabol',
        timestamp: 'Hôm qua',
      },
    ],
  };
}

export function recordProblemOutcome(
  topic: string,
  isCorrect: boolean,
  eloDelta: number = 0
): { updatedMemory: StudentMemoryData; newBadges: StudentBadge[] } {
  const mem = loadStudentMemory();
  mem.totalSolved += 1;
  if (isCorrect) {
    mem.correctCount += 1;
    mem.failedAttemptsInCurrentTopic = 0;
  } else {
    mem.failedAttemptsInCurrentTopic += 1;
  }

  mem.elo = Math.max(800, mem.elo + eloDelta);
  mem.topicSolveCount[topic] = (mem.topicSolveCount[topic] || 0) + 1;

  // Check badges to unlock
  const newlyUnlocked: StudentBadge[] = [];

  mem.badges.forEach((b) => {
    if (b.unlocked) return;

    let shouldUnlock = false;
    if (b.id === 'badge_first_step' && mem.totalSolved >= 1) shouldUnlock = true;
    if (b.id === 'badge_streak_3' && mem.streakDays >= 3) shouldUnlock = true;
    if (b.id === 'badge_streak_7' && mem.streakDays >= 7) shouldUnlock = true;
    if (b.id === 'badge_elo_1300' && mem.elo >= 1300) shouldUnlock = true;
    if (b.id === 'badge_elo_1500' && mem.elo >= 1500) shouldUnlock = true;
    if (b.id === 'badge_parabola_master' && (mem.topicSolveCount['Hàm số bậc hai & Parabol'] || 0) >= 5) shouldUnlock = true;
    if (b.id === 'badge_trig_master' && (mem.topicSolveCount['Lượng giác'] || 0) >= 5) shouldUnlock = true;

    if (shouldUnlock) {
      b.unlocked = true;
      b.unlockedAt = new Date().toLocaleDateString('vi-VN');
      newlyUnlocked.push(b);
    }
  });

  saveStudentMemory(mem);
  return { updatedMemory: mem, newBadges: newlyUnlocked };
}

export function recordCognitiveError(
  topic: string,
  errorType: string,
  note: string
): StudentMemoryData {
  const mem = loadStudentMemory();
  mem.recentMistakes.unshift({
    id: `err_${Date.now()}`,
    topic,
    errorType,
    note,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  if (mem.recentMistakes.length > 8) {
    mem.recentMistakes = mem.recentMistakes.slice(0, 8);
  }

  saveStudentMemory(mem);
  return mem;
}
