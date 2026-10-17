import React, { useState } from 'react';
import {
  Keyboard,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Compass,
  PieChart,
  FunctionSquare,
  Binary,
} from 'lucide-react';

interface KeypadSymbol {
  label: string;
  latex: string;
  description?: string;
}

interface CategoryGroup {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  symbols: KeypadSymbol[];
}

interface VirtualMathKeypadProps {
  onInsert: (latex: string) => void;
  defaultExpanded?: boolean;
}

export const VirtualMathKeypad: React.FC<VirtualMathKeypadProps> = ({
  onInsert,
  defaultExpanded = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultExpanded);
  const [activeCategory, setActiveCategory] = useState<string>('basic');

  const categories: CategoryGroup[] = [
    {
      id: 'basic',
      name: 'Cơ bản',
      icon: FunctionSquare,
      symbols: [
        { label: 'x²', latex: 'x^2 ', description: 'Bình phương' },
        { label: 'xⁿ', latex: 'x^{n} ', description: 'Số mũ tổng quát' },
        { label: '√x', latex: '\\sqrt{x} ', description: 'Căn bậc hai' },
        { label: 'ⁿ√x', latex: '\\sqrt[n]{x} ', description: 'Căn bậc n' },
        { label: 'a/b', latex: '\\frac{a}{b} ', description: 'Phân số' },
        { label: '|x|', latex: '|x| ', description: 'Giá trị tuyệt đối' },
        { label: '±', latex: '\\pm ', description: 'Cộng trừ' },
        { label: '≠', latex: '\\ne ', description: 'Khác' },
        { label: '≤', latex: '\\le ', description: 'Nhỏ hơn hoặc bằng' },
        { label: '≥', latex: '\\ge ', description: 'Lớn hơn hoặc bằng' },
        { label: '≈', latex: '\\approx ', description: 'Xấp xỉ' },
        { label: '∞', latex: '\\infty ', description: 'Vô cực' },
      ],
    },
    {
      id: 'algebra',
      name: 'Đại số & Tập hợp',
      icon: Binary,
      symbols: [
        { label: 'f(x)', latex: 'f(x) ', description: 'Hàm số f(x)' },
        { label: 'Δ', latex: '\\Delta = b^2 - 4ac ', description: 'Biệt thức Delta' },
        { label: "Δ'", latex: "\\Delta' = b'^2 - ac ", description: 'Delta phẩy' },
        { label: '∈', latex: '\\in ', description: 'Thuộc' },
        { label: '∉', latex: '\\notin ', description: 'Không thuộc' },
        { label: '⊂', latex: '\\subset ', description: 'Tập con' },
        { label: '∩', latex: '\\cap ', description: 'Giao tập hợp' },
        { label: '∪', latex: '\\cup ', description: 'Hợp tập hợp' },
        { label: '\\', latex: '\\setminus ', description: 'Hiệu tập hợp' },
        { label: 'ℝ', latex: '\\mathbb{R} ', description: 'Tập số thực' },
        { label: '{...}', latex: '\\begin{cases} x =  \\\\ y =  \\end{cases} ', description: 'Hệ phương trình' },
        { label: 'x₁', latex: 'x_1 ', description: 'Nghiệm x1' },
      ],
    },
    {
      id: 'trig',
      name: 'Lượng giác',
      icon: PieChart,
      symbols: [
        { label: 'sin x', latex: '\\sin(x) ', description: 'Sin' },
        { label: 'cos x', latex: '\\cos(x) ', description: 'Cosin' },
        { label: 'tan x', latex: '\\tan(x) ', description: 'Tang' },
        { label: 'cot x', latex: '\\cot(x) ', description: 'Cotang' },
        { label: 'α', latex: '\\alpha ', description: 'Góc Alpha' },
        { label: 'β', latex: '\\beta ', description: 'Góc Beta' },
        { label: 'θ', latex: '\\theta ', description: 'Góc Theta' },
        { label: 'π', latex: '\\pi ', description: 'Số Pi' },
        { label: '°', latex: '^{\\circ} ', description: 'Độ' },
        { label: 'sin²x', latex: '\\sin^2(x) ', description: 'Sin bình phương' },
        { label: 'cos²x', latex: '\\cos^2(x) ', description: 'Cos bình phương' },
        { label: '2kπ', latex: 'k2\\pi (k \\in \\mathbb{Z}) ', description: 'Họ nghiệm tuần hoàn' },
      ],
    },
    {
      id: 'geometry',
      name: 'Hình học & Véc-tơ',
      icon: Compass,
      symbols: [
        { label: '→u', latex: '\\vec{u} ', description: 'Véc-tơ u' },
        { label: '→v', latex: '\\vec{v} ', description: 'Véc-tơ v' },
        { label: '→AB', latex: '\\vec{AB} ', description: 'Véc-tơ AB' },
        { label: '→0', latex: '\\vec{0} ', description: 'Véc-tơ không' },
        { label: 'u·v', latex: '\\vec{u} \\cdot \\vec{v} ', description: 'Tích vô hướng' },
        { label: '|→u|', latex: '|\\vec{u}| ', description: 'Độ dài véc-tơ' },
        { label: '⊥', latex: '\\perp ', description: 'Vuông góc' },
        { label: '∥', latex: '\\parallel ', description: 'Song song' },
        { label: 'ΔABC', latex: '\\Delta ABC ', description: 'Tam giác ABC' },
        { label: '∠A', latex: '\\widehat{A} ', description: 'Góc A' },
        { label: '(P)', latex: '(P) ', description: 'Mặt phẳng (P)' },
        { label: 'd(M,P)', latex: 'd(M, (P)) ', description: 'Khoảng cách' },
      ],
    },
    {
      id: 'calculus',
      name: 'Giải tích 11',
      icon: Layers,
      symbols: [
        { label: 'lim x→0', latex: '\\lim_{x \\to 0} ', description: 'Giới hạn khi x tiến về 0' },
        { label: 'lim x→∞', latex: '\\lim_{x \\to +\\infty} ', description: 'Giới hạn vô cực' },
        { label: "f'(x)", latex: "f'(x) ", description: 'Đạo hàm bậc nhất' },
        { label: "y'", latex: "y' ", description: 'Đạo hàm y phẩy' },
        { label: 'Δx', latex: '\\Delta x ', description: 'Số gia đối số' },
        { label: 'u_n', latex: 'u_n ', description: 'Số hạng dãy số' },
        { label: 'S_n', latex: 'S_n ', description: 'Tổng n số hạng' },
        { label: 'qⁿ', latex: 'q^n ', description: 'Công bội mũ n' },
      ],
    },
  ];

  const currentCategory = categories.find((c) => c.id === activeCategory) || categories[0];

  return (
    <div className="w-full bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all">
      {/* Keypad Ribbon Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800/80">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-bold text-indigo-300 hover:text-white transition-colors cursor-pointer"
        >
          <Keyboard className="h-4 w-4 text-indigo-400" />
          <span>Bàn phím ảo Toán học (LaTeX Keypad)</span>
          {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
        </button>

        {/* Quick frequent symbols visible even when collapsed */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs py-0.5">
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">Phím nhanh:</span>
          {[
            { label: 'x²', val: 'x^2 ' },
            { label: '√x', val: '\\sqrt{x} ' },
            { label: 'a/b', val: '\\frac{a}{b} ' },
            { label: 'Δ', val: '\\Delta ' },
            { label: '→u', val: '\\vec{u} ' },
            { label: 'lim', val: '\\lim_{x \\to 0} ' },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onInsert(item.val)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-[11px] font-mono border border-slate-700/60 transition-colors shrink-0 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded Keypad Drawer */}
      {isOpen && (
        <div className="p-3 bg-slate-950/95 space-y-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Symbol Keys Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {currentCategory.symbols.map((sym, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onInsert(sym.latex)}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/90 hover:bg-indigo-950/70 border border-slate-800 hover:border-indigo-500/50 text-slate-100 hover:text-indigo-300 transition-all cursor-pointer group shadow-sm"
                title={`${sym.description || sym.label}: ${sym.latex}`}
              >
                <span className="text-sm font-bold font-mono group-hover:scale-110 transition-transform">
                  {sym.label}
                </span>
                {sym.description && (
                  <span className="text-[10px] text-slate-500 font-sans mt-0.5 line-clamp-1 group-hover:text-slate-400">
                    {sym.description}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
