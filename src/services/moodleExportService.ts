// Service to export Exam Problems into standard Moodle LMS GIFT Format
// Inspired by moodle-external-api-development skill from SKILL EDUCATION

import { ExamProblem } from '../types/math';

export function exportProblemsToMoodleGift(problems: ExamProblem[], title: string = 'Ngan_Hang_Cau_Hoi_Toan'): void {
  let giftContent = `// ========================================================\n`;
  giftContent += `// HỆ THỐNG ÔN TẬP TOÁN - PHẠM HẬU\n`;
  giftContent += `// Đề thi trắc nghiệm chuẩn Moodle GIFT Format (GDPT 2018)\n`;
  giftContent += `// Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}\n`;
  giftContent += `// ========================================================\n\n`;

  problems.forEach((p, idx) => {
    const qNum = idx + 1;
    const cleanStatement = p.statement.replace(/[\r\n]+/g, ' ').replace(/[{}#=~]/g, '');

    if (p.format === 'multiple_choice' && p.options) {
      giftContent += `// Câu ${qNum} (ELO: ${p.eloDifficulty || 1200}) - Chủ đề: ${p.topic}\n`;
      giftContent += `::Q${qNum} - ${p.topic}::[markdown]${cleanStatement} {\n`;
      p.options.forEach((opt) => {
        const optText = opt.text.replace(/[\r\n]+/g, ' ').replace(/[{}#=~]/g, '');
        if (opt.isCorrect) {
          giftContent += `  =${optText} #Đáp án chính xác\n`;
        } else {
          giftContent += `  ~${optText} #Sai\n`;
        }
      });
      giftContent += `}\n\n`;
    } else if (p.format === 'true_false' && p.subItems) {
      // Split into 4 Moodle True/False sub-questions
      p.subItems.forEach((sub) => {
        const subStatement = `${cleanStatement} [Ý ${sub.id}]: ${sub.statement.replace(/[\r\n]+/g, ' ').replace(/[{}#=~]/g, '')}`;
        giftContent += `::Q${qNum}_${sub.id} - ${p.topic}::[markdown]${subStatement} {${sub.isCorrect ? 'TRUE' : 'FALSE'}#${sub.keywordRationale || ''}}\n\n`;
      });
    } else if (p.format === 'short_answer') {
      const cleanKey = (p.shortAnswerKey || '').replace(/[\r\n]+/g, ' ').replace(/[{}#=~]/g, '').trim();
      giftContent += `// Câu ${qNum} (Trả lời ngắn)\n`;
      giftContent += `::Q${qNum} - ${p.topic}::[markdown]${cleanStatement} {=${cleanKey}#Chính xác}\n\n`;
    }
  });

  // Download .gift file
  const blob = new Blob([giftContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_Moodle_GIFT.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
