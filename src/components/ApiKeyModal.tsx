import React, { useState, useEffect } from 'react';
import {
  Key,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Brain,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import {
  GEMINI_MODELS,
  getStoredApiKey,
  setStoredApiKey,
  removeStoredApiKey,
  getStoredModel,
  setStoredModel,
  testGeminiApiKey,
} from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-flash-preview');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setSelectedModel(getStoredModel());
      setTestResult(null);
      setSaveMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hasExistingKey = Boolean(getStoredApiKey());

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        message: 'Vui lòng nhập mã API Key trước khi kiểm tra!',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    const result = await testGeminiApiKey(apiKey.trim());
    setIsTesting(false);
    setTestResult(result);
  };

  const handleSave = () => {
    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        message: 'Mã API Key không được để trống!',
      });
      return;
    }

    setStoredApiKey(apiKey.trim());
    setStoredModel(selectedModel);
    setSaveMessage('Đã lưu cấu hình API Key và Model thành công!');
    setTestResult(null);

    if (onSaved) {
      onSaved();
    }

    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleRemoveKey = () => {
    removeStoredApiKey();
    setApiKey('');
    setTestResult(null);
    setSaveMessage('Đã xóa API Key khỏi trình duyệt.');
  };

  const handleClose = () => {
    if (!hasExistingKey && !apiKey.trim()) {
      const confirmDismiss = window.confirm(
        'Bạn chưa lưu API Key. Không có API Key thì các tính năng giải toán, luyện đề và Socratic sẽ không phản hồi. Bạn có chắc muốn đóng?'
      );
      if (!confirmDismiss) return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 text-slate-100 my-8">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Đóng modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 text-white shadow-lg shadow-indigo-600/30 shrink-0">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Thiết Lập Model & API Key
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cấu hình khóa Google Gemini API cá nhân để kích hoạt toàn bộ tính năng Trí tuệ Nhân tạo
            </p>
          </div>
        </div>

        {/* Warning if no key */}
        {!hasExistingKey && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-200">
              <strong className="font-semibold block text-rose-300">Chưa cấu hình API Key:</strong>
              Ứng dụng cần Google Gemini API Key để trò chuyện Socratic, chẩn đoán lỗi sai và tạo đề thi thích ứng. Khóa được lưu an toàn trong trình duyệt của bạn (localStorage).
            </div>
          </div>
        )}

        {/* Instructions to get Free API Key */}
        <div className="mb-6 p-4 rounded-xl bg-slate-950/60 border border-indigo-500/30 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Hướng dẫn lấy API Key miễn phí
              </span>
              <p className="text-xs text-slate-300">
                Lấy API Key chính thức của Google hoàn toàn miễn phí từ Google AI Studio:
              </p>
            </div>
            <a
              href="https://aistudio.google.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 shadow-md shadow-rose-950/50 transition-all"
            >
              Lấy API key để sử dụng app
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <ol className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1 list-decimal list-inside">
            <li>
              Bấm nút đỏ bên trên để mở{' '}
              <span className="text-indigo-300 font-mono">aistudio.google.com/api-keys</span>
            </li>
            <li>Đăng nhập bằng tài khoản Google, bấm <strong>"Create API key"</strong></li>
            <li>Sao chép mã khóa (bắt đầu bằng <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">AIzaSy...</code>) và dán vào ô bên dưới</li>
          </ol>
        </div>

        {/* 1. Model Selection (Cards) */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
            1. Chọn Model AI Mặc Định:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {GEMINI_MODELS.map((model) => {
              const isSelected = selectedModel === model.id;
              return (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-950/50 border-indigo-500 shadow-md shadow-indigo-950/50 ring-1 ring-indigo-500'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-bold text-xs text-white leading-tight">
                        {model.name}
                      </span>
                      <input
                        type="radio"
                        name="modelSelect"
                        checked={isSelected}
                        onChange={() => setSelectedModel(model.id)}
                        className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    <span
                      className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold mb-2 ${
                        model.isDefault
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {model.badge}
                    </span>
                    <p className="text-[11px] text-slate-400 line-clamp-3">
                      {model.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 italic">
            * Cơ chế Fallback: Nếu model đang dùng bị quá tải (429 RESOURCE_EXHAUSTED), hệ thống sẽ tự động thử các model còn lại trong danh sách để đảm bảo không bị gián đoạn.
          </p>
        </div>

        {/* 2. API Key Input */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            2. Khóa Google Gemini API Key:
          </label>
          <div className="relative flex items-center">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Dán mã API Key tại đây (AIzaSy...)"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 py-3 pl-4 pr-24 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                title={showKey ? 'Ẩn key' : 'Hiện key'}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              {hasExistingKey && (
                <button
                  type="button"
                  onClick={handleRemoveKey}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                  title="Xóa key đã lưu"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Test Result / Feedback */}
        {testResult && (
          <div
            className={`mb-4 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold block">
                {testResult.success ? 'Kiểm tra thành công:' : 'Lỗi kết nối API:'}
              </span>
              <span className="font-mono text-[11px] break-all">{testResult.message}</span>
            </div>
          </div>
        )}

        {saveMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Lưu trực tiếp trong trình duyệt, không gửi qua máy chủ thứ ba.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting || !apiKey.trim()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {isTesting ? (
                <>
                  <div className="h-3 w-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  Đang kiểm tra...
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  Kiểm tra kết nối
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              Lưu & Bắt đầu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
