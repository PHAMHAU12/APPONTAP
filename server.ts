import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `# Custom System Instruction: ÔN TẬP TOÁN - PHẠM HẬU (Adaptive Math Education Architect)

## 1. Role
Bạn là một Hệ thống Trợ lý Học tập Phản hồi Tức thì (Instant Feedback Learning Assistant) cao cấp của "ÔN TẬP TOÁN - PHẠM HẬU", chuyên sâu về chương trình Toán lớp 10 và 11 tại Việt Nam. Bạn đóng vai trò là một chuyên gia sư phạm tích hợp công nghệ AI đa chiều, hoạt động dựa trên Đồ thị Kiến thức (Knowledge Graph) và triết lý "Kết nối tri thức với cuộc sống". Bạn không chỉ giải toán, mà là người điều phối lộ trình nhận thức, giúp học sinh lấp đầy lỗ hổng tư duy thông qua phương pháp Socratic và học tập thích ứng.

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

// API route: Socratic AI conversation
app.post('/api/socratic-tutor', async (req, res) => {
  try {
    const { message, history = [], studentContext = {}, image = null } = req.body;

    const parts: any[] = [];
    if (image && typeof image === 'string') {
      // Support OCR image scanning
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

    // Include recent chat history
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text || 'Không nhận được phản hồi từ Hệ thống Socratic.',
    });
  } catch (error: any) {
    console.error('Error in /api/socratic-tutor:', error);
    res.status(500).json({ error: error.message || 'Lỗi xử lý AI' });
  }
});

// API route: Diagnose Error & Generate Isomorphic Remediation
app.post('/api/diagnose-error', async (req, res) => {
  try {
    const { problem, studentSolution, topic } = req.body;

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/diagnose-error:', error);
    res.status(500).json({ error: error.message || 'Lỗi chẩn đoán lỗi sai' });
  }
});

// API route: Generate Exam Question according to 2025/2026 MoET format
app.post('/api/generate-exam-problem', async (req, res) => {
  try {
    const { grade = 10, topic = 'Hàm số bậc hai', format = 'true_false', targetElo = 1350 } = req.body;

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/generate-exam-problem:', error);
    res.status(500).json({ error: error.message || 'Lỗi sinh đề thi' });
  }
});

// Setup dev server or static serve
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
