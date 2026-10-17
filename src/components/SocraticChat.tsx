import React, { useState, useRef, useEffect } from 'react';
import { SocraticResponseParser } from './SocraticResponseParser';
import { MathRenderer } from './MathRenderer';
import { StudentProfile } from '../types/math';
import {
  Send,
  Camera,
  Image as ImageIcon,
  Sparkles,
  PauseCircle,
  RefreshCw,
  Brain,
  Flame,
  X,
  Compass,
  AlertCircle,
  Key,
} from 'lucide-react';
import { chatSocraticTutor, FallbackEvent } from '../services/geminiService';
import { VirtualMathKeypad } from './VirtualMathKeypad';
import { audioService } from '../services/audioService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: string;
  modelUsed?: string;
  isError?: boolean;
}

interface SocraticChatProps {
  onOpenGeometryViewer: () => void;
  currentStudent: StudentProfile;
  activeTopic?: string;
  onOpenApiKeyModal?: () => void;
}

export const SocraticChat: React.FC<SocraticChatProps> = ({
  onOpenGeometryViewer,
  currentStudent,
  activeTopic = 'Toán THPT Thích Ứng',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_initial',
      role: 'assistant',
      content: `### [Status Check]
Trạng thái nhận thức: Sẵn sàng kích hoạt luồng Deep Work. Vùng phát triển gần nhất (ZPD) hiện tại ELO: ${currentStudent.elo}.

### [Knowledge Bridge]
Chào em! Thầy/cô là Trợ lý Giáo dục Toán học Thích ứng tại ÔN TẬP TOÁN - PHẠM HẬU (dành cho học sinh lớp 10 & 11 theo định hướng GDPT 2018). Mọi kiến thức đại số, hình học, giới hạn đều liên kết chặt chẽ với thế giới thực: từ quỹ đạo drone, tối ưu hóa logistic đến chiếu tia AR.

### [Socratic Guidance]
Thầy/cô sẽ không đưa ra đáp án trực tiếp để em sao chép, mà sẽ cùng em thực hiện **Phân tích suy luận ngược** qua 3 tầng gợi mở:
1. Gợi ý định lý nền tảng qua Mindmap.
2. Đặt câu hỏi phản biện để em tự tìm bước biến đổi tiếp theo.
3. Chỉ hướng dẫn giải chi tiết khi em đã nỗ lực thử ít nhất 2 hướng suy nghĩ.

Em có thể gõ câu hỏi, dán biểu thức LaTeX, hoặc bấm biểu tượng **Camera 📸** để quét ảnh bài tập chụp từ sách/vở nhé!

### [Interactive Checkpoint]
Em muốn bắt đầu luyện tập phân môn nào hôm nay? (Ví dụ: Hàm số bậc hai, Hệ thức lượng, Lượng giác, hay Hình học không gian 11?)

### [Remediation Tip]
Mẹo học tập thích ứng: Khi gặp bài toán phức tạp, hãy chia nhỏ thành 2 pha: (1) Nhận diện định lý bản chất, (2) Lập bảng biến thiên hoặc vẽ hình minh họa rõ nét các cạnh thấy/khuất.

### [Visual/AR Suggestion]
Nếu gặp bài toán Hình học không gian (Lớp 11) về thiết diện hay quan hệ song song/vuông góc, hãy bấm nút "Mở mô hình 3D" để xoay góc nhìn đa chiều trực quan!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [isPauseReflectActive, setIsPauseReflectActive] = useState<boolean>(false);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle Image Upload / OCR Camera
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick Math Symbol Inserters
  const insertSymbol = (symbol: string) => {
    setInputPrompt((prev) => prev + symbol);
  };

  // Trigger Socratic Message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if ((!textToSend.trim() && !selectedImage) || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      image: selectedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    setFallbackNotice(null);
    try {
      const historyPayload = messages.slice(-5).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { reply, modelUsed } = await chatSocraticTutor(
        textToSend,
        historyPayload,
        {
          elo: currentStudent.elo,
          topic: activeTopic,
          grade: currentStudent.grade,
          failedAttempts,
          focusState: currentStudent.focusState,
        },
        imageToSend,
        (ev) => {
          setFallbackNotice(
            `Model ${ev.failedModel} gặp lỗi, đang tự động chuyển sang ${ev.nextModel}...`
          );
        }
      );

      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: reply || 'Hệ thống Socratic đang xử lý cấu trúc bài toán...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errText = err.message || 'Lỗi không xác định';
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `### [Trạng thái: Đã dừng do lỗi]\n⚠️ **Chi tiết lỗi từ Google API:**\n\`\`\`\n${errText}\n\`\`\`\n\n*Nếu gặp lỗi \`429 RESOURCE_EXHAUSTED\` hoặc chưa có API Key, vui lòng bấm nút đỏ **"Lấy API key để sử dụng app"** trên Header để cập nhật khóa mới.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      setFallbackNotice(null);
    }
  };

  // "Dừng suy ngẫm" (Pause & Reflect) Feature
  const handlePauseAndReflect = () => {
    setIsPauseReflectActive(true);
    handleSendMessage(
      'Em muốn bấm [Dừng suy ngẫm (Pause & Reflect)]. Em đang thấy hơi rối logic ở bước này. Xin thầy/cô giúp em tóm tắt lại định lý cốt lõi và đặt 1 câu hỏi dẫn dắt đơn giản nhất.'
    );
  };

  return (
    <div className="flex flex-col h-[750px] rounded-2xl border border-slate-800 bg-slate-900/70 shadow-2xl overflow-hidden">
      {/* Top Bar: Socratic Status, ELO & Focus */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30">
            <Brain className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Trợ Lý Socratic Phản Hồi Tức Thì</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live ZPD
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Chủ đề: <span className="text-indigo-300 font-semibold">{activeTopic}</span> • ELO: {currentStudent.elo} • ZPD Level {currentStudent.zpdLevel}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePauseAndReflect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
            title="Dừng lại để tóm tắt định lý khi bị rối chuỗi logic"
          >
            <PauseCircle className="h-4 w-4 text-amber-400" />
            Dừng Suy Ngẫm (Reflect)
          </button>
          <button
            onClick={onOpenGeometryViewer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <Compass className="h-4 w-4 text-teal-400" />
            Mô Phỏng 3D
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-none'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {/* If user uploaded image */}
              {msg.image && (
                <div className="mb-3 rounded-xl overflow-hidden border border-indigo-400/30 max-w-sm">
                  <img src={msg.image} alt="Chụp ảnh đề bài" className="w-full object-cover max-h-60" />
                  <div className="p-1.5 bg-black/60 text-[10px] text-indigo-200 text-center font-mono">
                    📸 Chụp bài tập - Đã quét OCR sang LaTeX
                  </div>
                </div>
              )}

              {msg.role === 'assistant' ? (
                <SocraticResponseParser
                  rawText={msg.content}
                  onOpenGeometryViewer={onOpenGeometryViewer}
                  onSelectCheckpoint={(ans) => handleSendMessage(ans)}
                />
              ) : (
                <div className="text-sm font-medium">
                  <MathRenderer content={msg.content} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-1 px-1">
              <span>{msg.role === 'user' ? 'Học sinh' : 'Kiến trúc sư Socratic'} • {msg.timestamp}</span>
              {msg.modelUsed && (
                <span className="text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-1.5 py-0.2 rounded font-mono">
                  {msg.modelUsed}
                </span>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-950/70 border border-slate-800 max-w-md">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-indigo-400 animate-spin" />
              <span className="text-xs text-indigo-300 font-medium">
                Kiến trúc sư đang phân tích suy luận ngược & đồ thị kiến thức...
              </span>
            </div>
            {fallbackNotice && (
              <div className="text-[11px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                <span className="animate-pulse">⚡</span>
                <span>{fallbackNotice}</span>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Virtual Math Keypad Drawer */}
      <div className="px-3 py-1 bg-slate-950 border-t border-slate-800">
        <VirtualMathKeypad
          onInsert={(latex) => {
            audioService.playKeyTap();
            insertSymbol(latex);
          }}
        />
      </div>

      {/* Input Composer */}
      <div className="p-3.5 bg-slate-950 border-t border-slate-800">
        {selectedImage && (
          <div className="mb-2 flex items-center justify-between p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/40 text-xs text-indigo-200">
            <span className="flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-indigo-400" />
              Đã đính kèm ảnh bài toán để nhận diện OCR
            </span>
            <button
              onClick={() => setSelectedImage(null)}
              className="p-1 rounded hover:bg-indigo-900/60 text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {/* Camera / Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
            title="Chụp hoặc tải ảnh bài toán (OCR)"
          >
            <Camera className="h-5 w-5" />
          </button>

          {/* Main Text Input */}
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Hỏi về bước giải, công thức LaTeX ($x^2$), hoặc dán đề bài..."
            className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={(!inputPrompt.trim() && !selectedImage) || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 disabled:opacity-40 transition-all cursor-pointer"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
