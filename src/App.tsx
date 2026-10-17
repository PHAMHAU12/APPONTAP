import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SocraticChat } from './components/SocraticChat';
import { MathLab2D } from './components/MathLab2D';
import { GeometryVisualizer3D } from './components/GeometryVisualizer3D';
import { ExamArena } from './components/ExamArena';
import { ErrorDiagnosticStudio } from './components/ErrorDiagnosticStudio';
import { KnowledgeGraphViewer } from './components/KnowledgeGraphViewer';
import { ClassroomAdmin } from './components/ClassroomAdmin';
import { ApiKeyModal } from './components/ApiKeyModal';
import { BadgesModal } from './components/BadgesModal';
import { StudentProfile, KnowledgeNode } from './types/math';
import { getStoredApiKey } from './services/geminiService';
import { loadStudentMemory, StudentMemoryData } from './services/studentMemoryService';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('socratic');
  const [activeTopic, setActiveTopic] = useState<string>('Hàm số bậc hai & Parabol');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState<boolean>(false);
  const [studentMemory, setStudentMemory] = useState<StudentMemoryData>(loadStudentMemory());

  // Auto-prompt API Key modal on initial visit if no key is stored
  useEffect(() => {
    const key = getStoredApiKey();
    if (!key) {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  const handleStartTopicPractice = (node: KnowledgeNode) => {
    setActiveTopic(node.title);
    setActiveTab('socratic');
  };

  const handleOpenGeometryViewer = () => {
    setActiveTab('geometry');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        student={studentMemory}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenBadgesModal={() => setIsBadgesModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'socratic' && (
          <SocraticChat
            onOpenGeometryViewer={handleOpenGeometryViewer}
            currentStudent={studentMemory}
            activeTopic={activeTopic}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          />
        )}

        {activeTab === 'math2d' && <MathLab2D />}

        {activeTab === 'geometry' && <GeometryVisualizer3D />}

        {activeTab === 'arena' && (
          <ExamArena onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} />
        )}

        {activeTab === 'diagnostic' && (
          <ErrorDiagnosticStudio onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} />
        )}

        {activeTab === 'graph' && (
          <KnowledgeGraphViewer onStartTopicPractice={handleStartTopicPractice} />
        )}

        {activeTab === 'classroom' && <ClassroomAdmin />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ÔN TẬP TOÁN - PHẠM HẬU • Hệ sinh thái Học tập Thích ứng Toán THPT (Lớp 10 & 11) • Chương trình GDPT 2018
          </span>
          <span className="font-mono text-[11px] text-slate-600">
            Socratic Engine • ZPD & ELO Adaptive Algorithm • MoET 2025/2026 Ready
          </span>
        </div>
      </footer>

      {/* Modal Setup API Key & Model */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      {/* Modal Badges & Achievements */}
      <BadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
      />
    </div>
  );
}
