import React, { useState, useRef, useEffect } from 'react';
import { Box, RotateCcw, Layers, Eye, Compass, Sparkles } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  label?: string;
}

export const GeometryVisualizer3D: React.FC = () => {
  const [shape, setShape] = useState<'pyramid' | 'tetrahedron' | 'prism'>('pyramid');
  const [rotX, setRotX] = useState<number>(20);
  const [rotY, setRotY] = useState<number>(35);
  const [zoom, setZoom] = useState<number>(1);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [cuttingPlaneHeight, setCuttingPlaneHeight] = useState<number>(0.5); // 0 to 1
  const [showSection, setShowSection] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDragging = useRef<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 3D rotation projection
  const project = (p: Point3D, width: number, height: number): { x: number; y: number; z: number } => {
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;

    // Rotate Y
    let x1 = p.x * Math.cos(radY) + p.z * Math.sin(radY);
    let y1 = p.y;
    let z1 = -p.x * Math.sin(radY) + p.z * Math.cos(radY);

    // Rotate X
    let x2 = x1;
    let y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
    let z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

    // Isometric projection with zoom
    const scale = 110 * zoom;
    return {
      x: width / 2 + x2 * scale,
      y: height / 2 - y2 * scale,
      z: z2,
    };
  };

  useEffect(() => {
    let animId: number;
    if (isAutoRotate) {
      const loop = () => {
        setRotY((prev) => (prev + 0.4) % 360);
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animId);
  }, [isAutoRotate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Draw coordinate axes if enabled
    if (showAxes) {
      const origin = project({ x: 0, y: 0, z: 0 }, width, height);
      const axisX = project({ x: 1.8, y: 0, z: 0 }, width, height);
      const axisY = project({ x: 0, y: 1.8, z: 0 }, width, height);
      const axisZ = project({ x: 0, y: 0, z: 1.8 }, width, height);

      ctx.lineWidth = 1;
      // X axis (Red)
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(axisX.x, axisX.y);
      ctx.stroke();

      // Y axis (Green - height)
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(axisY.x, axisY.y);
      ctx.stroke();

      // Z axis (Blue)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(axisZ.x, axisZ.y);
      ctx.stroke();
    }

    // Define shapes
    let vertices: Point3D[] = [];
    let edges: [number, number, boolean][] = []; // [from, to, isDashed]
    let sectionPoints: Point3D[] = [];

    if (shape === 'pyramid') {
      // S.ABCD pyramid
      const h = 1.4;
      const b = 1.0;
      vertices = [
        { x: 0, y: h, z: 0, label: 'S' }, // 0
        { x: -b, y: -0.6, z: -b, label: 'A' }, // 1
        { x: b, y: -0.6, z: -b, label: 'B' }, // 2
        { x: b, y: -0.6, z: b, label: 'C' }, // 3
        { x: -b, y: -0.6, z: b, label: 'D' }, // 4
      ];

      // Edges: A is back-left
      edges = [
        [0, 1, true], // SA (dashed)
        [0, 2, false], // SB
        [0, 3, false], // SC
        [0, 4, false], // SD
        [1, 2, true], // AB (dashed)
        [1, 4, true], // AD (dashed)
        [2, 3, false], // BC
        [3, 4, false], // CD
      ];

      if (showSection) {
        // Cutting plane parallel to base at height k
        const k = cuttingPlaneHeight;
        const interp = (p1: Point3D, p2: Point3D, t: number, lbl: string): Point3D => ({
          x: p1.x + (p2.x - p1.x) * t,
          y: p1.y + (p2.y - p1.y) * t,
          z: p1.z + (p2.z - p1.z) * t,
          label: lbl,
        });
        const A_prime = interp(vertices[0], vertices[1], k, "M");
        const B_prime = interp(vertices[0], vertices[2], k, "N");
        const C_prime = interp(vertices[0], vertices[3], k, "P");
        const D_prime = interp(vertices[0], vertices[4], k, "Q");
        sectionPoints = [A_prime, B_prime, C_prime, D_prime];
      }
    } else if (shape === 'tetrahedron') {
      // ABCD tetrahedron
      vertices = [
        { x: 0, y: 1.3, z: 0, label: 'A' }, // 0
        { x: -1.0, y: -0.7, z: -0.8, label: 'B' }, // 1
        { x: 1.1, y: -0.7, z: -0.6, label: 'C' }, // 2
        { x: 0, y: -0.7, z: 1.1, label: 'D' }, // 3
      ];
      edges = [
        [0, 1, false],
        [0, 2, false],
        [0, 3, false],
        [1, 2, true], // BC dashed
        [2, 3, false],
        [3, 1, false],
      ];
      if (showSection) {
        const k = cuttingPlaneHeight;
        sectionPoints = [
          { x: vertices[0].x * (1 - k) + vertices[1].x * k, y: vertices[0].y * (1 - k) + vertices[1].y * k, z: vertices[0].z * (1 - k) + vertices[1].z * k, label: 'M' },
          { x: vertices[0].x * (1 - k) + vertices[2].x * k, y: vertices[0].y * (1 - k) + vertices[2].y * k, z: vertices[0].z * (1 - k) + vertices[2].z * k, label: 'N' },
          { x: vertices[0].x * (1 - k) + vertices[3].x * k, y: vertices[0].y * (1 - k) + vertices[3].y * k, z: vertices[0].z * (1 - k) + vertices[3].z * k, label: 'P' },
        ];
      }
    } else {
      // Prism ABC.A'B'C'
      const topY = 0.9;
      const botY = -0.9;
      vertices = [
        { x: -0.8, y: topY, z: -0.6, label: "A'" },
        { x: 0.9, y: topY, z: -0.4, label: "B'" },
        { x: 0, y: topY, z: 0.8, label: "C'" },
        { x: -0.8, y: botY, z: -0.6, label: 'A' },
        { x: 0.9, y: botY, z: -0.4, label: 'B' },
        { x: 0, y: botY, z: 0.8, label: 'C' },
      ];
      edges = [
        [0, 1, false],
        [1, 2, false],
        [2, 0, false],
        [3, 4, true],
        [4, 5, false],
        [5, 3, false],
        [0, 3, true],
        [1, 4, false],
        [2, 5, false],
      ];
      if (showSection) {
        const k = cuttingPlaneHeight;
        sectionPoints = [
          { x: vertices[3].x, y: botY + (topY - botY) * k, z: vertices[3].z, label: 'E' },
          { x: vertices[4].x, y: botY + (topY - botY) * k, z: vertices[4].z, label: 'F' },
          { x: vertices[5].x, y: botY + (topY - botY) * k, z: vertices[5].z, label: 'G' },
        ];
      }
    }

    // Project points
    const projVerts = vertices.map((v) => ({ ...project(v, width, height), label: v.label }));
    const projSection = sectionPoints.map((v) => ({ ...project(v, width, height), label: v.label }));

    // Draw Cutting Plane / Cross-section if available
    if (showSection && projSection.length > 2) {
      ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(projSection[0].x, projSection[0].y);
      for (let i = 1; i < projSection.length; i++) {
        ctx.lineTo(projSection[i].x, projSection[i].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Section labels
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
      projSection.forEach((p) => {
        if (p.label) {
          ctx.fillText(p.label, p.x + 6, p.y - 6);
        }
      });
    }

    // Draw Edges
    edges.forEach(([from, to, isDashed]) => {
      const p1 = projVerts[from];
      const p2 = projVerts[to];

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      if (isDashed) {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.lineWidth = 1.5;
      } else {
        ctx.setLineDash([]);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
      }
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Draw Vertex Points and Labels
    projVerts.forEach((p) => {
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (p.label) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Plus Jakarta Sans, sans-serif';
        ctx.fillText(p.label, p.x + 8, p.y - 4);
      }
    });
  }, [shape, rotX, rotY, zoom, cuttingPlaneHeight, showSection, showAxes]);

  // Handle Drag to Rotate
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    setIsAutoRotate(false);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;

    setRotY((prev) => (prev + dx * 0.6) % 360);
    setRotX((prev) => Math.max(-80, Math.min(80, prev - dy * 0.6)));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 bg-slate-900/60 rounded-2xl border border-slate-800 shadow-xl">
      {/* 3D Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 overflow-hidden min-h-[380px]">
        <canvas
          ref={canvasRef}
          width={520}
          height={380}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-grab active:cursor-grabbing w-full max-w-[520px] aspect-[520/380] select-none"
        />

        {/* Viewport Floating Controls */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700/80 text-xs font-medium text-slate-300">
            <Compass className="h-3.5 w-3.5 text-indigo-400" />
            Kéo chuột để xoay 3D
          </span>
          {showSection && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-950/80 border border-amber-600/40 text-[11px] font-semibold text-amber-300">
              <Sparkles className="h-3 w-3" />
              Thiết diện cắt (Mặt phẳng $\alpha$)
            </span>
          )}
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isAutoRotate
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} />
            {isAutoRotate ? 'Đang xoay tự động' : 'Tự động xoay'}
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-4 text-sm">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Box className="h-5 w-5 text-indigo-400" />
            Mô Phỏng Hình Học Không Gian 11
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Khảo sát quan hệ song song, vuông góc và thiết diện cắt theo chuẩn GDPT 2018.
          </p>
        </div>

        {/* Shape selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Khối đa diện:</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setShape('pyramid')}
              className={`px-2.5 py-2 rounded-lg text-xs font-medium border text-center transition-all ${
                shape === 'pyramid'
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Chóp S.ABCD
            </button>
            <button
              onClick={() => setShape('tetrahedron')}
              className={`px-2.5 py-2 rounded-lg text-xs font-medium border text-center transition-all ${
                shape === 'tetrahedron'
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Tứ diện ABCD
            </button>
            <button
              onClick={() => setShape('prism')}
              className={`px-2.5 py-2 rounded-lg text-xs font-medium border text-center transition-all ${
                shape === 'prism'
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Lăng trụ ABC.A'B'C'
            </button>
          </div>
        </div>

        {/* Cutting plane slider */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Mặt phẳng cắt thiết diện
            </label>
            <button
              onClick={() => setShowSection(!showSection)}
              className="text-[11px] text-amber-400 font-medium hover:underline"
            >
              {showSection ? 'Bật' : 'Tắt'}
            </button>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={cuttingPlaneHeight}
            onChange={(e) => setCuttingPlaneHeight(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Gần đỉnh</span>
            <span>Tỉ số k = {cuttingPlaneHeight.toFixed(2)}</span>
            <span>Gần đáy</span>
          </div>
        </div>

        {/* View toggles */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowAxes(!showAxes)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
              showAxes ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            {showAxes ? 'Ẩn hệ trục Oxyz' : 'Hiện hệ trục Oxyz'}
          </button>
          <button
            onClick={() => {
              setRotX(20);
              setRotY(35);
              setZoom(1);
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all"
          >
            Góc nhìn mặc định
          </button>
        </div>

        {/* Educational Capsule */}
        <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200/90 leading-relaxed">
          <div className="font-semibold text-indigo-300 mb-1 flex items-center gap-1">
            💡 Quy ước nét vẽ hình học không gian THPT:
          </div>
          Nét liền là các cạnh và thiết diện nhìn thấy trực tiếp từ góc chiếu. Nét đứt là các đường khuất phía sau mặt đáy hoặc mặt phẳng bên.
        </div>
      </div>
    </div>
  );
};
