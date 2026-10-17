import React, { useState } from 'react';
import { KNOWLEDGE_GRAPH_NODES } from '../data/knowledgeGraph';
import { KnowledgeNode, GradeLevel } from '../types/math';
import { MathRenderer } from './MathRenderer';
import {
  GitMerge,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface KnowledgeGraphViewerProps {
  onStartTopicPractice: (node: KnowledgeNode) => void;
}

export const KnowledgeGraphViewer: React.FC<KnowledgeGraphViewerProps> = ({ onStartTopicPractice }) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode>(KNOWLEDGE_GRAPH_NODES[2]); // Default quadratic func

  const filteredNodes = KNOWLEDGE_GRAPH_NODES.filter((n) => {
    if (selectedGrade !== 'all' && n.grade !== selectedGrade) return false;
    if (activeCategory !== 'all' && n.subjectCategory !== activeCategory) return false;
    return true;
  });

  const getStatusBadge = (status: KnowledgeNode['status']) => {
    switch (status) {
      case 'mastered':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
            <CheckCircle className="h-3 w-3" /> Thành thạo (Mastered)
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 ring-1 ring-blue-500/30">
            <Clock className="h-3 w-3" /> Đang học (Focus)
          </span>
        );
      case 'remediation_needed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 ring-1 ring-amber-500/30">
            <AlertTriangle className="h-3 w-3" /> Cần hàn gắn ZPD (Gap)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2 py-0.5 text-xs font-semibold text-slate-400 ring-1 ring-slate-500/30">
            Khóa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Overview Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <GitMerge className="h-6 w-6 text-indigo-400" />
            Đồ Thị Kiến Thức Thích Ứng (Knowledge Graph)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Bản đồ liên kết nhận thức Toán 10 & 11 - Phân luồng theo lý thuyết Vùng phát triển gần nhất (ZPD).
          </p>
        </div>

        {/* Grade tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedGrade('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedGrade === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Tất cả (Lớp 10 & 11)
          </button>
          <button
            onClick={() => setSelectedGrade(10)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedGrade === 10
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Lớp 10 (Chương trình mới)
          </button>
          <button
            onClick={() => setSelectedGrade(11)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedGrade === 11
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Lớp 11 (Chương trình mới)
          </button>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { id: 'all', label: 'Tất cả phân môn' },
          { id: 'algebra', label: 'Đại số & Lượng giác' },
          { id: 'geometry', label: 'Hình học & Véc-tơ & Không gian' },
          { id: 'calculus', label: 'Giới hạn & Đạo hàm' },
          { id: 'statistics_probability', label: 'Thống kê & Xác suất' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full border transition-all ${
              activeCategory === cat.id
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Interactive Graph Nodes on Left, Detailed Capsule Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Node Cards Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[650px] overflow-y-auto pr-1">
          {filteredNodes.map((node) => {
            const isSelected = selectedNode.id === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`cursor-pointer rounded-xl p-4 border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-950/50'
                    : 'bg-slate-900/50 border-slate-800/90 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                {/* Node category badge */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                      Lớp {node.grade} • {node.subjectCategory}
                    </span>
                    {getStatusBadge(node.status)}
                  </div>
                  <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                    {node.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {node.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-slate-800/60">
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="text-slate-400">Độ thành thạo ZPD</span>
                    <span className="font-semibold text-indigo-300">{node.masteryLevel}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        node.masteryLevel >= 80
                          ? 'bg-emerald-500'
                          : node.masteryLevel >= 60
                          ? 'bg-indigo-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${node.masteryLevel}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Node Details: Real-world Capsule & Actions */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-slate-900/80 p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-mono font-medium mb-1.5">
                  Lớp {selectedNode.grade} • ID: {selectedNode.id}
                </span>
                <h3 className="text-lg font-bold text-white">{selectedNode.title}</h3>
              </div>
              {getStatusBadge(selectedNode.status)}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {selectedNode.description}
            </p>

            {/* Real World Capsule: "Kết nối tri thức với cuộc sống" */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedNode.realWorldApplication.icon}</span>
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">
                    Viên Nang Kiến Thức Liên Môn
                  </div>
                  <div className="text-sm font-bold text-white">
                    {selectedNode.realWorldApplication.headline}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                <MathRenderer content={selectedNode.realWorldApplication.explanation} />
              </p>
              <div className="text-[10px] text-emerald-300/80 font-mono">
                Lĩnh vực: {selectedNode.realWorldApplication.field}
              </div>
            </div>

            {/* Core LaTeX Formulas */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                <BookOpen className="h-3.5 w-3.5" />
                Công thức cốt lõi (Core LaTeX):
              </div>
              <div className="space-y-1.5">
                {selectedNode.sampleFormulas.map((form, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
                    <MathRenderer content={`$$${form}$$`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Prerequisites & Next Nodes */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-1">Kiến thức tiền đề:</span>
                {selectedNode.prerequisites.length > 0 ? (
                  <div className="space-y-1">
                    {selectedNode.prerequisites.map((pId) => {
                      const pNode = KNOWLEDGE_GRAPH_NODES.find((n) => n.id === pId);
                      return (
                        <div key={pId} className="font-medium text-indigo-300 flex items-center gap-1">
                          • {pNode ? pNode.title : pId}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-slate-500 italic">Nền tảng khởi đầu</span>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-1">Mở rộng tiếp theo:</span>
                {selectedNode.nextNodes.length > 0 ? (
                  <div className="space-y-1">
                    {selectedNode.nextNodes.map((nId) => {
                      const nNode = KNOWLEDGE_GRAPH_NODES.find((n) => n.id === nId);
                      return (
                        <div key={nId} className="font-medium text-emerald-300 flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" /> {nNode ? nNode.title : nId}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-slate-500 italic">Đỉnh đồ thị</span>
                )}
              </div>
            </div>

            {/* Start Practice Button */}
            <button
              onClick={() => onStartTopicPractice(selectedNode)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Luyện Tập Thích Ứng Socratic Về Chủ Đề Này
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
