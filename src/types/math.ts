export type GradeLevel = 10 | 11;

export interface KnowledgeNode {
  id: string;
  grade: GradeLevel;
  subjectCategory: 'algebra' | 'geometry' | 'statistics_probability' | 'calculus';
  title: string;
  description: string;
  prerequisites: string[]; // Node IDs
  nextNodes: string[];
  realWorldApplication: {
    field: string;
    icon: string;
    headline: string;
    explanation: string;
  };
  sampleFormulas: string[];
  masteryLevel: number; // 0 - 100%
  status: 'locked' | 'remediation_needed' | 'in_progress' | 'mastered';
}

export type ExamFormat = 'multiple_choice' | 'true_false' | 'short_answer';

export interface ExamOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface TrueFalseSubItem {
  id: string;
  statement: string;
  isCorrect: boolean;
  keywordRationale: string;
}

export interface ExamProblem {
  id: string;
  grade: GradeLevel;
  topic: string;
  format: ExamFormat;
  eloDifficulty: number;
  realWorldContext: string;
  statement: string;
  options?: ExamOption[];
  subItems?: TrueFalseSubItem[];
  shortAnswerKey?: string;
  fullSolution: string;
  knowledgeNode: string;
}

export interface ErrorDiagnosticResult {
  errorType: 'Arithmetic' | 'Conceptual' | 'Logical';
  errorTypeNameVi: string;
  brokenStep: string;
  explanation: string;
  socraticQuestion: string;
  isomorphicProblem: {
    context: string;
    question: string;
    hint: string;
    correctKey: string;
  };
  remediationCapsule: string;
}

export interface StudentProfile {
  name: string;
  grade: GradeLevel;
  elo: number;
  zpdLevel: number; // 1 to 5
  streakDays: number;
  focusState: 'Deep Work' | 'Focus Flow' | 'Fatigued' | 'Need Pause';
  failedAttemptsInCurrentTopic: number;
  masteredNodeIds: string[];
  cognitiveGaps: string[];
}

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  grade: GradeLevel;
  elo: number;
  recentTopic: string;
  lastActiveMinutesAgo: number;
  engagementScore: number; // 0 - 100
  cognitiveGapCount: number;
  fatigueIndex: number; // 0 - 100
  status: 'Thành thạo' | 'Cần củng cố' | 'Rủi ro hổng kiến thức';
}

export interface SocraticBlocks {
  statusCheck?: string;
  knowledgeBridge?: string;
  socraticGuidance?: string;
  interactiveCheckpoint?: {
    question: string;
    type: 'tf' | 'mc' | 'reflect';
    options?: string[];
    correctAnswer?: string;
  } | string;
  isomorphicChallenge?: string;
  remediationTip?: string;
  visualArSuggestion?: string;
  rawText?: string;
}
