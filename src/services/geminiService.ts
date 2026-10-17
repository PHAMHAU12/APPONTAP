// Service for Google Gemini API integration with Fallback & LocalStorage Key Management
// Specified in AI_INSTRUCTIONS.md

import { ExamProblem, ExamFormat, GradeLevel, ErrorDiagnosticResult } from '../types/math';

export interface ModelInfo {
  id: string;
  name: string;
  badge: string;
  isDefault?: boolean;
  desc: string;
}

export const GEMINI_MODELS: ModelInfo[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    badge: 'Mặc định • Nhanh nhất',
    isDefault: true,
    desc: 'Tốc độ phản hồi tức thì, tối ưu quota hàng ngày, phân tích Socratic nhanh chóng.',
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    badge: 'Tư duy sâu',
    isDefault: false,
    desc: 'Suy luận toán học bậc cao, bóc tách chuỗi logic và chẩn đoán lỗ hổng nhận thức.',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Dự phòng ổn định',
    isDefault: false,
    desc: 'Độ ổn định cao, dự phòng tức thì khi các model preview đạt giới hạn tải.',
  },
];

const LOCAL_STORAGE_KEY = 'gemini_api_key';
const LOCAL_STORAGE_MODEL = 'gemini_selected_model';

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(LOCAL_STORAGE_KEY) || '';
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, key.trim());
}

export function removeStoredApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

export function getStoredModel(): string {
  if (typeof window === 'undefined') return 'gemini-3-flash-preview';
  return localStorage.getItem(LOCAL_STORAGE_MODEL) || 'gemini-3-flash-preview';
}

export function setStoredModel(modelId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_MODEL, modelId);
}

// Build fallback list with selected model tried first, then others in order
export function getFallbackModelList(preferredModel?: string): string[] {
  const chosen = preferredModel || getStoredModel();
  const allIds = GEMINI_MODELS.map((m) => m.id);
  const remaining = allIds.filter((id) => id !== chosen);
  return [chosen, ...remaining];
}

export const SYSTEM_INSTRUCTION = `# Custom System Instruction: ÔN TẬP TOÁN - PHẠM HẬU (Adaptive Math Education Architect)

## 1. Role
Bạn là một Hệ thống Trợ lý Học tập Phản hồi Tức thì (Instant Feedback Learning Assistant) cao cấp thuộc hệ sinh thái "ÔN TẬP TOÁN - PHẠM HẬU", chuyên sâu về chương trình Toán lớp 10 và 11 tại Việt Nam. Bạn đóng vai trò là một chuyên gia sư phạm tích hợp công nghệ AI đa chiều, hoạt động dựa trên Đồ thị Kiến thức (Knowledge Graph) và triết lý "Kết nối tri thức với cuộc sống". Bạn không chỉ giải toán, mà là người điều phối lộ trình nhận thức, giúp học sinh lấp đầy lỗ hổng tư duy thông qua phương pháp Socratic và học tập thích ứng.

## 2. Objective
* Cá nhân hóa lộ trình: Sử dụng thuật toán ELO và lý thuyết ZPD (Vùng phát triển gần nhất) để điều chỉnh độ khó và kiến thức phù hợp với năng lực thực tế của từng học sinh.
* Thúc đẩy tư duy độc lập: Tuyệt đối không cung cấp đáp án trực tiếp ngay lập tức. Sử dụng cơ chế "Phân tích suy luận ngược" để gợi mở.
* Hàn gắn kiến thức: Nhận diện "Lỗ hổng tư duy" (Cognitive Gap) và thiết lập lộ trình "Remediation Path" tự động.
* Kết nối thực tiễn: Số hóa các khái niệm trừu tượng thành ứng dụng đời sống (Logistic, Tài chính, Vật lý, Drone, Kiến trúc...).
* Tối ưu hóa kỳ thi: Giúp học sinh làm chủ định dạng đề thi mới của Bộ Giáo dục (Trắc nghiệm đúng/sai, trả lời ngắn) và rèn luyện kỹ năng dưới áp lực phòng thi (Arena mode).

## 3. Guidelines & Rules
* Cơ chế Gợi ý Socratic: Khi học sinh gặp khó khăn, hãy phản hồi theo các tầng:
  1. Gợi ý về định lý/khái niệm liên quan qua Mindmap (dạng văn bản hoặc ký hiệu mũi tên ->).
  2. Đặt câu hỏi gợi mở để học sinh tự tìm ra bước tiếp theo.
  3. Chỉ cung cấp lời giải chi tiết khi học sinh đã thử ít nhất 2 hướng nhưng thất bại.
* Quy tắc Nội dung & Định dạng:
  * BẮT BUỘC sử dụng LaTeX cho mọi công thức toán học (ví dụ: $f(x) = ax^2 + bx + c$, $\\vec{u} \\cdot \\vec{v}$, $\\lim_{x \\to 0}$).
  * Tuân thủ 3 định dạng đề thi mới: Trắc nghiệm nhiều lựa chọn, Trắc nghiệm Đúng/Sai (yêu cầu giải thích keyword), Trắc nghiệm trả lời ngắn.
  * Tích hợp tính năng "Dừng suy ngẫm" (Pause & Reflect): Nếu nhận thấy chuỗi logic của người dùng bị rối hoặc lặp lỗi, hãy yêu cầu họ dừng lại để tóm tắt lại định lý chính.
* Phân tích lỗi sai đa chiều: Khi học sinh làm sai, phải chỉ rõ:
  * Sai về tính toán (Arithmetic error).
  * Sai về khái niệm (Conceptual gap).
  * Sai về logic (Logical fallacy).
  * Sau đó, tự động tạo 1 bài tập tương tự (Isomorphic Problem) với biến số thực tế để kiểm tra lại.
* Liên kết liên môn: Mỗi phản hồi hướng dẫn hoặc bài tập lớn phải đính kèm một "Viên nang kiến thức" kết nối với thực tế (Ví dụ: Parabol -> Quỹ đạo Drone, Lượng giác -> Sóng âm hoặc Thủy triều, Cấp số nhân -> Lãi kép ngân hàng, Đạo hàm -> Tối ưu hóa chi phí sản xuất).

## 4. Tone & Persona
* Phong cách: Thông minh, kiên nhẫn, truyền cảm hứng và đậm chất công nghệ.
* Ngôn ngữ: Tiếng Việt sư phạm chuẩn mực, chuyên nghiệp nhưng gần gũi, sử dụng thuật ngữ hiện đại (Deep Work, Focus Flow, Gamification, ZPD).
* Tâm thế: Một Mentor đồng hành hơn là máy giải toán. Biết khích lệ đúng lúc và cảnh báo về độ mệt mỏi (Fatigue Prediction) nếu cần.
* Giao diện văn bản: Sử dụng icon phân loại rõ ràng: 🚀 Ứng dụng, 🧠 Tư duy, ⚠️ Cảnh báo lỗi, 🏆 Thử thách.

## 5. BẮT BUỘC Định Dạng Phản Hồi (Output Format)
Mọi phản hồi trợ lý Socratic phải có cấu trúc gồm các khối sau:

### [Status Check]
Đánh giá trạng thái nhận thức hiện tại của người học (Vd: "Tâm trí Focus Flow - Đang tiếp cận vùng ZPD bậc 2" hoặc "Cần củng cố kiến thức tiền đề về định lý Cosin").

### [Knowledge Bridge]
Liên kết bài toán với Nút Đồ thị Kiến thức lớp 10/11 & ứng dụng thực tiễn liên môn.

### [Socratic Guidance]
Gợi mở theo phương pháp Socratic: câu hỏi định hướng tư duy, phân tích suy luận ngược, mindmap tóm tắt. TUYỆT ĐỐI không tuôn lời giải trọn vẹn ở lần hỏi đầu tiên.

### [Interactive Checkpoint]
Một câu hỏi tương tác kiểm tra ngay lập tức (Trắc nghiệm Đúng/Sai hoặc Trắc nghiệm nhanh 1 bước) để học sinh khẳng định tư duy trước khi đi tiếp.

### [Isomorphic Challenge]
Một bài toán biến thể tương tự gắn với kịch bản thực tế (kinh tế, kỹ thuật, đời sống) để kiểm chứng tư duy bền vững.

### [Remediation Tip]
Mẹo ghi nhớ bản chất, công thức Spaced Repetition hoặc cạm bẫy học sinh hay mắc.

### [Visual/AR Suggestion]
Hướng dẫn hình dung không gian trực quan, xoay góc nhìn 3D hoặc tương tác thiết diện, đồ thị.`;

export interface GeminiCallParams {
  contents: any[];
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
}

export interface FallbackEvent {
  failedModel: string;
  nextModel: string;
  errorReason: string;
}

// Low-level caller with automatic multi-model fallback as per AI_INSTRUCTIONS.md
export async function callGeminiWithFallback(
  params: GeminiCallParams,
  onFallback?: (ev: FallbackEvent) => void
): Promise<{ text: string; modelUsed: string }> {
  const apiKey = getStoredApiKey();

  // If no API key is provided in localStorage, check if we can fall back to local /api (dev mode)
  if (!apiKey) {
    throw new Error('Chưa cấu hình API Key. Vui lòng bấm vào nút "Lấy API key để sử dụng app" trên Header để thiết lập!');
  }

  const modelList = getFallbackModelList();
  let lastError: Error | null = null;

  for (let i = 0; i < modelList.length; i++) {
    const currentModel = modelList[i];
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

      const requestBody: any = {
        contents: params.contents,
      };

      if (params.systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{ text: params.systemInstruction }],
        };
      }

      const generationConfig: any = {};
      if (typeof params.temperature === 'number') {
        generationConfig.temperature = params.temperature;
      }
      if (params.responseMimeType) {
        generationConfig.responseMimeType = params.responseMimeType;
      }
      if (Object.keys(generationConfig).length > 0) {
        requestBody.generationConfig = generationConfig;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        const code = data.error?.code || response.status;
        const status = data.error?.status || '';
        const message = data.error?.message || response.statusText || 'Unknown API error';
        const formattedError = `${code} ${status ? status + ': ' : ''}${message}`;
        throw new Error(formattedError);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { text, modelUsed: currentModel };
    } catch (err: any) {
      lastError = err;
      const isLast = i === modelList.length - 1;
      if (!isLast) {
        const nextModel = modelList[i + 1];
        if (onFallback) {
          onFallback({
            failedModel: currentModel,
            nextModel,
            errorReason: err.message || 'Lỗi API',
          });
        }
      }
    }
  }

  // All models failed - throw verbatim error as requested in AI_INSTRUCTIONS.md
  throw (
    lastError ||
    new Error('Tất cả các model AI đều không thể phản hồi. Vui lòng kiểm tra lại API Key hoặc hạn ngạch tài khoản!')
  );
}

// Test connection with an API key
export async function testGeminiApiKey(apiKeyToTest: string): Promise<{ success: boolean; message: string }> {
  if (!apiKeyToTest || apiKeyToTest.trim().length === 0) {
    return { success: false, message: 'Vui lòng nhập API Key trước khi kiểm tra.' };
  }

  const trimmed = apiKeyToTest.trim();
  const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${trimmed}`;

  try {
    const res = await fetch(testUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Ping test. Trả lời: OK' }] }],
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      const code = data.error?.code || res.status;
      const status = data.error?.status || '';
      const message = data.error?.message || res.statusText || 'Lỗi không xác định';
      return {
        success: false,
        message: `${code} ${status ? status + ': ' : ''}${message}`,
      };
    }

    return {
      success: true,
      message: 'Kết nối thành công! Khóa API Google Gemini hoạt động bình thường.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Lỗi kết nối mạng khi kiểm tra API Key.',
    };
  }
}

// 1. Socratic Tutor Chat API
export async function chatSocraticTutor(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  studentContext: {
    elo?: number;
    topic?: string;
    grade?: number;
    failedAttempts?: number;
    focusState?: string;
  },
  image?: string | null,
  onFallback?: (ev: FallbackEvent) => void
): Promise<{ reply: string; modelUsed: string }> {
  const parts: any[] = [];

  if (image && typeof image === 'string') {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data,
      },
    });
    parts.push({
      text: `[CHỤP ẢNH BÀI TOÁN - OCR]: Vui lòng nhận diện chữ viết/hình ảnh bài toán, trích xuất đề bài dưới dạng LaTeX chuẩn xác, kiểm tra chuỗi logic từng bước (nếu có lời giải) và phản hồi theo chuẩn 7 khối sư phạm Socratic. Yêu cầu của học sinh: "${message || 'Hãy hướng dẫn em tư duy giải bài này'}"`,
    });
  } else {
    let promptText = `Học sinh hỏi/trình bày: "${message}"\n\n`;
    if (studentContext) {
      promptText += `[Thông tin học sinh]:
- ELO hiện tại: ${studentContext.elo || 1200}
- Chủ đề đang học: ${studentContext.topic || 'Toán THPT'}
- Lớp: ${studentContext.grade || 10}
- Số lần thử chưa thành công: ${studentContext.failedAttempts || 0}
- Mức độ tập trung: ${studentContext.focusState || 'Deep Work'}
`;
    }
    parts.push({ text: promptText });
  }

  const contents: any[] = [];
  if (Array.isArray(history) && history.length > 0) {
    for (const item of history.slice(-6)) {
      contents.push({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.content }],
      });
    }
  }

  contents.push({
    role: 'user',
    parts,
  });

  const { text, modelUsed } = await callGeminiWithFallback(
    {
      contents,
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
    onFallback
  );

  return {
    reply: text || 'Không nhận được phản hồi từ Hệ thống Socratic.',
    modelUsed,
  };
}

// 2. Error Diagnostic Studio API
export async function diagnoseStudentError(
  problem: string,
  studentSolution: string,
  topic?: string,
  onFallback?: (ev: FallbackEvent) => void
): Promise<{ result: ErrorDiagnosticResult; modelUsed: string }> {
  const prompt = `Bạn là Chuyên gia Đánh giá Lỗi Sai Toán học Thích ứng (Grade 10-11).
Bài toán:
${problem}

Lời giải của học sinh:
${studentSolution}

Chủ đề: ${topic || 'Đại số & Hình học THPT'}

Hãy phân tích chi tiết:
1. Phân loại lỗi sai: Chỉ ra rõ là lỗi Tính toán (Arithmetic error), lỗi Khái niệm (Conceptual gap), hay lỗi Logic (Logical fallacy).
2. Dòng/bước bị gãy tư duy và nguyên nhân tâm lý/nhận thức.
3. Câu hỏi phản biện Socratic gợi mở để học sinh tự nhận ra.
4. Một bài toán tương đương (Isomorphic Problem) với bối cảnh thực tế (Drone, Kinh tế, Vật lý...) để kiểm tra lại.
5. "Viên nang ghi nhớ" (Remediation Capsule) ngắn gọn với công thức LaTeX.

Hãy trả lời định dạng JSON hợp lệ:
{
  "errorType": "Arithmetic" | "Conceptual" | "Logical",
  "errorTypeNameVi": "Lỗi sai tính toán" | "Lỗ hổng khái niệm" | "Ngụy biện logic",
  "brokenStep": "Mô tả bước sai",
  "explanation": "Giải thích chi tiết vì sao sai",
  "socraticQuestion": "Câu hỏi gợi mở học sinh tự sửa",
  "isomorphicProblem": {
    "context": "Bối cảnh thực tế",
    "question": "Nội dung câu hỏi bài tập tương tự (LaTeX)",
    "hint": "Gợi ý bước 1",
    "correctKey": "Đáp án mẫu"
  },
  "remediationCapsule": "Mẹo bản chất ngắn gọn"
}`;

  const { text, modelUsed } = await callGeminiWithFallback(
    {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      responseMimeType: 'application/json',
      temperature: 0.4,
    },
    onFallback
  );

  let cleanJson = text.trim();
  if (cleanJson.startsWith('```json')) {
    cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(cleanJson);
  return { result: parsed, modelUsed };
}

// 3. Generate Exam Problem API (MoET 2025/2026 format)
export async function generateExamProblemAI(
  grade: GradeLevel,
  topic: string,
  format: ExamFormat,
  targetElo: number,
  onFallback?: (ev: FallbackEvent) => void
): Promise<{ problem: ExamProblem; modelUsed: string }> {
  const prompt = `Hãy tạo 1 câu hỏi kiểm tra Toán lớp ${grade} theo chuẩn định dạng đề thi mới của Bộ Giáo dục & Đào tạo Việt Nam.
Chủ đề: "${topic}".
Độ khó tương ứng ELO: ${targetElo} (ZPD phù hợp).
Định dạng yêu cầu: "${format}" (một trong 3 loại: 'multiple_choice' [4 lựa chọn], 'true_false' [Đúng/Sai với 4 ý a, b, c, d có giải thích keyword], 'short_answer' [Trả lời ngắn giá trị số hoặc tối giản]).

Yêu cầu:
- Sử dụng chuẩn LaTeX cho mọi biểu thức toán học ($...$ hoặc $$...$$).
- Gắn liền một ứng dụng thực tiễn liên môn ("Kết nối tri thức với cuộc sống").
- Trả về JSON theo cấu trúc:
{
  "id": "q_${Date.now()}",
  "grade": ${grade},
  "topic": "${topic}",
  "format": "${format}",
  "eloDifficulty": ${targetElo},
  "realWorldContext": "Bối cảnh thực tế",
  "statement": "Đề bài chi tiết bằng tiếng Việt có LaTeX",
  "options": [ // nếu là multiple_choice (4 lựa chọn A, B, C, D)
    {"id": "A", "text": "...", "isCorrect": true},
    {"id": "B", "text": "...", "isCorrect": false},
    {"id": "C", "text": "...", "isCorrect": false},
    {"id": "D", "text": "...", "isCorrect": false}
  ],
  "subItems": [ // nếu là true_false (4 ý a, b, c, d)
    {"id": "a", "statement": "Khẳng định a", "isCorrect": true, "keywordRationale": "Keyword giải thích"},
    {"id": "b", "statement": "Khẳng định b", "isCorrect": false, "keywordRationale": "Keyword giải thích"},
    {"id": "c", "statement": "Khẳng định c", "isCorrect": true, "keywordRationale": "Keyword giải thích"},
    {"id": "d", "statement": "Khẳng định d", "isCorrect": false, "keywordRationale": "Keyword giải thích"}
  ],
  "shortAnswerKey": "Đáp án số hoặc chuỗi gọn gàng nếu là short_answer",
  "fullSolution": "Hướng dẫn tư duy Socratic và lời giải chi tiết",
  "knowledgeNode": "Tên nút đồ thị kiến thức liên quan"
}`;

  const { text, modelUsed } = await callGeminiWithFallback(
    {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      responseMimeType: 'application/json',
      temperature: 0.5,
    },
    onFallback
  );

  let cleanJson = text.trim();
  if (cleanJson.startsWith('```json')) {
    cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(cleanJson);
  return { problem: parsed, modelUsed };
}
