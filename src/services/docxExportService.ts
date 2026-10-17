// Service to export Vietnamese Ministry of Education (MoET) compliant Math Exam Papers
// into Microsoft Word (.doc) format with clean typography, tables, and full Socratic solutions.

import { ExamProblem } from '../types/math';

// Helper to convert common LaTeX formulas into clean, readable Unicode math typography for Word
export function formatMathForWord(text: string): string {
  if (!text) return '';

  let formatted = text;

  // Replace common LaTeX expressions with Unicode symbols
  formatted = formatted
    .replace(/\\vec\{([^}]+)\}/g, '→$1')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\pi/g, 'π')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\theta/g, 'θ')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\ne/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\infty/g, '∞')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\in/g, '∈')
    .replace(/\\notin/g, '∉')
    .replace(/\\subset/g, '⊂')
    .replace(/\\cap/g, '∩')
    .replace(/\\cup/g, '∪')
    .replace(/\\perp/g, '⊥')
    .replace(/\\parallel/g, '∥')
    .replace(/\\lim_\{([^}]+)\}/g, 'lim($1)')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^n/g, 'ⁿ')
    .replace(/_1/g, '₁')
    .replace(/_2/g, '₂')
    .replace(/_I/g, 'ᵢ')
    .replace(/_0/g, '₀')
    .replace(/\$/g, ''); // strip dollar math delimiters

  return formatted;
}

export interface ExamExportOptions {
  title?: string;
  grade?: number;
  topic?: string;
  schoolName?: string;
  durationMinutes?: number;
  examCode?: string;
  problems: ExamProblem[];
}

export function exportExamToWord(options: ExamExportOptions): void {
  const {
    title = 'ĐỀ KIỂM TRA ĐÁNH GIÁ NĂNG LỰC TOÁN HỌC',
    grade = 10,
    topic = 'Hàm số bậc hai & Lượng giác',
    schoolName = 'TRƯỜNG THPT CHUYÊN - HỆ THỐNG ÔN TẬP TOÁN PHẠM HẬU',
    durationMinutes = 90,
    examCode = '101',
    problems,
  } = options;

  // Group problems by format
  const mcProblems = problems.filter((p) => p.format === 'multiple_choice');
  const tfProblems = problems.filter((p) => p.format === 'true_false');
  const saProblems = problems.filter((p) => p.format === 'short_answer');

  // If only 1 problem is currently loaded in arena, ensure it is presented properly
  const isSingleProblem = problems.length === 1;

  let contentHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${title} - ${topic}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: A4;
      margin: 2cm 2cm 2cm 2cm;
      mso-header-margin: 36pt;
      mso-footer-margin: 36pt;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 13pt;
      line-height: 1.35;
      color: #000;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12pt;
    }
    .header-table td {
      border: none;
      vertical-align: top;
      text-align: center;
    }
    .inst-name {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .national-title {
      font-size: 12pt;
      font-weight: bold;
    }
    .national-motto {
      font-size: 11pt;
      font-weight: bold;
      border-bottom: 1px solid #000;
      padding-bottom: 2pt;
      display: inline-block;
    }
    .exam-title {
      font-size: 15pt;
      font-weight: bold;
      text-align: center;
      margin: 10pt 0 4pt 0;
      text-transform: uppercase;
    }
    .exam-subtitle {
      font-size: 12pt;
      font-style: italic;
      text-align: center;
      margin-bottom: 12pt;
    }
    .student-info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16pt;
      border: 1px solid #000;
    }
    .student-info-table td {
      border: 1px solid #000;
      padding: 6pt;
      font-size: 11pt;
    }
    .section-title {
      font-size: 13pt;
      font-weight: bold;
      background-color: #f2f2f2;
      padding: 4pt 8pt;
      margin-top: 14pt;
      margin-bottom: 8pt;
      border-left: 4pt solid #1e3a8a;
    }
    .question-block {
      margin-bottom: 12pt;
      page-break-inside: avoid;
    }
    .question-statement {
      font-weight: bold;
      margin-bottom: 4pt;
    }
    .options-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4pt;
      margin-bottom: 6pt;
    }
    .options-table td {
      border: none;
      width: 50%;
      padding: 3pt 6pt;
    }
    .subitem-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4pt;
      margin-bottom: 6pt;
    }
    .subitem-table td {
      border: 1px solid #ccc;
      padding: 4pt 8pt;
      font-size: 12pt;
    }
    .badge {
      font-size: 10pt;
      font-weight: normal;
      background-color: #e2e8f0;
      padding: 2pt 5pt;
      border-radius: 3pt;
    }
    .page-break {
      page-break-before: always;
    }
    .answer-key-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8pt;
      margin-bottom: 14pt;
    }
    .answer-key-table th, .answer-key-table td {
      border: 1px solid #000;
      padding: 6pt;
      text-align: center;
      font-size: 11pt;
    }
    .answer-key-table th {
      background-color: #e5e7eb;
    }
    .solution-box {
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 8pt;
      margin-top: 6pt;
      margin-bottom: 12pt;
      font-size: 11pt;
    }
    .footer-note {
      text-align: center;
      font-style: italic;
      margin-top: 20pt;
      font-size: 11pt;
    }
  </style>
</head>
<body>

  <!-- Header Section -->
  <table class="header-table">
    <tr>
      <td style="width: 45%;">
        <div class="inst-name">SỞ GD&ĐT • HỆ THỐNG GIÁO DỤC</div>
        <div style="font-weight: bold; font-size: 10pt;">${schoolName}</div>
        <div style="font-size: 10pt; margin-top: 4pt;">Mã đề thi: <strong>${examCode}</strong></div>
      </td>
      <td style="width: 55%;">
        <div class="national-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div class="national-motto">Độc lập - Tự do - Hạnh phúc</div>
        <div style="font-size: 10pt; font-style: italic; margin-top: 4pt;">
          Áp dụng chuẩn đề thi Chương trình GDPT 2018
        </div>
      </td>
    </tr>
  </table>

  <div class="exam-title">${title} - TOÁN ${grade}</div>
  <div class="exam-subtitle">
    Chuyên đề: ${topic} • Thời gian làm bài: ${durationMinutes} phút (Không kể thời gian phát đề)
  </div>

  <!-- Student Info Box -->
  <table class="student-info-table">
    <tr>
      <td style="width: 60%;">Họ và tên thí sinh: ............................................................................</td>
      <td style="width: 40%;">Lớp: ........................ Phòng thi: ............</td>
    </tr>
    <tr>
      <td>Số báo danh: ...................................................................................</td>
      <td>Chữ ký giám thị: .....................................</td>
    </tr>
  </table>
`;

  let questionCounter = 1;

  // PHẦN I: Trắc nghiệm 4 lựa chọn
  if (mcProblems.length > 0) {
    contentHtml += `
  <div class="section-title">
    PHẦN I. Thí sinh trả lời các câu hỏi trắc nghiệm nhiều phương án lựa chọn.
    <span style="font-size: 11pt; font-weight: normal; font-style: italic;">
      (Mỗi câu hỏi thí sinh chỉ chọn một phương án).
    </span>
  </div>
`;
    mcProblems.forEach((p) => {
      contentHtml += `
    <div class="question-block">
      <div class="question-statement">
        Câu ${questionCounter++} (Độ khó ELO ${p.eloDifficulty || 1200}):
        ${formatMathForWord(p.statement)}
      </div>
      <table class="options-table">
        <tr>
          <td><strong>A.</strong> ${formatMathForWord(p.options?.[0]?.text || '')}</td>
          <td><strong>B.</strong> ${formatMathForWord(p.options?.[1]?.text || '')}</td>
        </tr>
        <tr>
          <td><strong>C.</strong> ${formatMathForWord(p.options?.[2]?.text || '')}</td>
          <td><strong>D.</strong> ${formatMathForWord(p.options?.[3]?.text || '')}</td>
        </tr>
      </table>
    </div>
`;
    });
  }

  // PHẦN II: Trắc nghiệm Đúng / Sai
  if (tfProblems.length > 0) {
    contentHtml += `
  <div class="section-title">
    PHẦN II. Thí sinh trả lời câu hỏi trắc nghiệm Đúng/Sai.
    <span style="font-size: 11pt; font-weight: normal; font-style: italic;">
      (Trong mỗi ý a, b, c, d ở mỗi câu, thí sinh chọn Đúng hoặc Sai).
    </span>
  </div>
`;
    tfProblems.forEach((p) => {
      contentHtml += `
    <div class="question-block">
      <div class="question-statement">
        Câu ${questionCounter++} (Độ khó ELO ${p.eloDifficulty || 1250}):
        ${formatMathForWord(p.statement)}
      </div>
      <table class="subitem-table">
        <tr style="background-color: #f1f5f9; font-weight: bold;">
          <th style="width: 8%; text-align: center;">Ý</th>
          <th style="width: 72%; text-align: left;">Mệnh đề khẳng định</th>
          <th style="width: 10%; text-align: center;">Đúng</th>
          <th style="width: 10%; text-align: center;">Sai</th>
        </tr>
        ${(p.subItems || [])
          .map(
            (sub) => `
        <tr>
          <td style="text-align: center; font-weight: bold;">${sub.id})</td>
          <td>${formatMathForWord(sub.statement)}</td>
          <td style="text-align: center;">[  ]</td>
          <td style="text-align: center;">[  ]</td>
        </tr>`
          )
          .join('')}
      </table>
    </div>
`;
    });
  }

  // PHẦN III: Trắc nghiệm Trả lời ngắn
  if (saProblems.length > 0) {
    contentHtml += `
  <div class="section-title">
    PHẦN III. Thí sinh trả lời câu hỏi trắc nghiệm trả lời ngắn.
    <span style="font-size: 11pt; font-weight: normal; font-style: italic;">
      (Thí sinh ghi đáp số hoặc kết quả thu gọn vào ô tương ứng).
    </span>
  </div>
`;
    saProblems.forEach((p) => {
      contentHtml += `
    <div class="question-block">
      <div class="question-statement">
        Câu ${questionCounter++} (Độ khó ELO ${p.eloDifficulty || 1350}):
        ${formatMathForWord(p.statement)}
      </div>
      <div style="margin: 6pt 0 10pt 0;">
        Đáp số của thí sinh: ....................................................................................................
      </div>
    </div>
`;
    });
  }

  contentHtml += `
  <div class="footer-note">
    ----------------------- HẾT -----------------------<br/>
    <small>Cán bộ coi thi không giải thích gì thêm. Thí sinh không được sử dụng tài liệu.</small>
  </div>
`;

  // Trang Đáp án & Hướng dẫn giải chi tiết (Page Break)
  contentHtml += `
  <div class="page-break"></div>
  <div class="exam-title" style="color: #1e3a8a;">HƯỚNG DẪN GIẢI CHI TIẾT & BẢNG ĐÁP ÁN (SOCRATIC)</div>
  <div class="exam-subtitle">Mã đề: ${examCode} • Hệ thống Ôn tập Toán - Phạm Hậu</div>

  <table class="answer-key-table">
    <tr>
      <th>Câu</th>
      <th>Dạng thức</th>
      <th>Nội dung đáp án chuẩn</th>
      <th>Độ khó ELO</th>
    </tr>
`;

  let ansCounter = 1;
  problems.forEach((p) => {
    let ansDisplay = '';
    if (p.format === 'multiple_choice') {
      const correctOpt = p.options?.find((o) => o.isCorrect);
      ansDisplay = `<strong>${correctOpt?.id || 'A'}</strong>: ${formatMathForWord(correctOpt?.text || '')}`;
    } else if (p.format === 'true_false') {
      ansDisplay = (p.subItems || [])
        .map((s) => `<strong>${s.id}</strong>: ${s.isCorrect ? 'ĐÚNG' : 'SAI'}`)
        .join(' | ');
    } else {
      ansDisplay = `<strong>${formatMathForWord(p.shortAnswerKey || '')}</strong>`;
    }

    contentHtml += `
    <tr>
      <td style="font-weight: bold;">Câu ${ansCounter++}</td>
      <td>${p.format === 'multiple_choice' ? 'Trắc nghiệm 4 opt' : p.format === 'true_false' ? 'Đúng / Sai' : 'Trả lời ngắn'}</td>
      <td style="text-align: left;">${ansDisplay}</td>
      <td>${p.eloDifficulty || 1250}</td>
    </tr>
`;
  });

  contentHtml += `
  </table>

  <h3 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 4pt; margin-top: 18pt;">
    HƯỚNG DẪN TƯ DUY & LỜI GIẢI CHI TIẾT THEO PHƯƠNG PHÁP SOCRATIC:
  </h3>
`;

  let solCounter = 1;
  problems.forEach((p) => {
    contentHtml += `
  <div class="solution-box">
    <div style="font-weight: bold; color: #1e3a8a; margin-bottom: 4pt;">
      Câu ${solCounter++}: ${formatMathForWord(p.statement)}
    </div>
    ${
      p.format === 'true_false' && p.subItems
        ? `
      <div style="margin: 4pt 0;">
        <strong>Phân tích từng ý Đúng/Sai:</strong>
        <ul>
          ${p.subItems
            .map(
              (s) =>
                `<li><strong>Ý ${s.id}) [${s.isCorrect ? 'ĐÚNG' : 'SAI'}]:</strong> ${formatMathForWord(
                  s.keywordRationale || 'Đúng theo định nghĩa.'
                )}</li>`
            )
            .join('')}
        </ul>
      </div>`
        : ''
    }
    <div style="margin-top: 4pt;">
      <strong>Lời giải & Định lý bản chất:</strong><br/>
      ${formatMathForWord(p.fullSolution || 'Xem hướng dẫn phân tích trong hệ thống Socratic.')}
    </div>
    ${
      p.realWorldContext
        ? `<div style="margin-top: 4pt; font-style: italic; color: #047857;">
      💡 Liên hệ thực tiễn liên môn: ${p.realWorldContext}
    </div>`
        : ''
    }
  </div>
`;
  });

  contentHtml += `
</body>
</html>
`;

  // Create Word document Blob
  const blob = new Blob([contentHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `De_Thi_Toan_${grade}_${topic.replace(/[^a-zA-Z0-9]/g, '_')}_Ma_${examCode}.doc`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
