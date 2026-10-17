import React, { useState, useEffect, useRef } from 'react';
import { MathRenderer } from './MathRenderer';
import {
  TrendingUp,
  PieChart,
  Sliders,
  RotateCcw,
  Sparkles,
  Info,
  Maximize2,
  Compass,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const MathLab2D: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'parabola' | 'unit_circle'>('parabola');

  // ================= PARABOLA STATE =================
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(-4);
  const [c, setC] = useState<number>(3);
  const parabolaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Parabola calculations
  const vertexX = -b / (2 * a);
  const delta = b * b - 4 * a * c;
  const vertexY = -delta / (4 * a);
  const roots: number[] = [];
  if (delta > 0) {
    roots.push((-b + Math.sqrt(delta)) / (2 * a));
    roots.push((-b - Math.sqrt(delta)) / (2 * a));
    roots.sort((x, y) => x - y);
  } else if (delta === 0) {
    roots.push(-b / (2 * a));
  }

  // Draw Parabola Canvas
  useEffect(() => {
    if (activeTab !== 'parabola') return;
    const canvas = parabolaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Coordinate system parameters
    const originX = width / 2;
    const originY = height / 2 + 30; // slightly shift down
    const scale = 28; // pixels per math unit

    // Clear background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    // Draw Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1e293b';

    for (let x = originX % scale; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = originY % scale; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Axes
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#64748b';

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Axis Arrows
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(width - 8, originY - 4);
    ctx.lineTo(width, originY);
    ctx.lineTo(width - 8, originY + 4);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(originX - 4, 8);
    ctx.lineTo(originX, 0);
    ctx.lineTo(originX + 4, 8);
    ctx.fill();

    // Axis Labels
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('x', width - 15, originY - 8);
    ctx.fillText('y', originX + 8, 15);
    ctx.fillText('O', originX - 14, originY + 14);

    // Axis coordinate numbers
    for (let i = -10; i <= 10; i++) {
      if (i === 0) continue;
      const px = originX + i * scale;
      const py = originY - i * scale;
      if (px > 0 && px < width) {
        ctx.fillText(i.toString(), px - 4, originY + 12);
      }
      if (py > 0 && py < height) {
        ctx.fillText(i.toString(), originX + 5, py + 4);
      }
    }

    // Draw Axis of Symmetry (Dashed Yellow Line)
    const symmPixelX = originX + vertexX * scale;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(symmPixelX, 0);
    ctx.lineTo(symmPixelX, height);
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Draw Parabola Curve
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#6366f1';
    ctx.beginPath();

    let started = false;
    for (let px = 0; px <= width; px += 2) {
      const mathX = (px - originX) / scale;
      const mathY = a * mathX * mathX + b * mathX + c;
      const py = originY - mathY * scale;

      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Draw Vertex Point I
    const vPx = originX + vertexX * scale;
    const vPy = originY - vertexY * scale;

    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(vPx, vPy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label Vertex
    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#f43f5e';
    ctx.fillText(`I (${vertexX.toFixed(2)}; ${vertexY.toFixed(2)})`, vPx + 8, vPy - 8);

    // Draw Roots (X-intercepts)
    roots.forEach((root, idx) => {
      const rx = originX + root * scale;
      const ry = originY;
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(rx, ry, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText(`x${idx + 1} = ${root.toFixed(2)}`, rx - 15, ry + 20);
    });

    // Draw Y-intercept (0, c)
    const yIntX = originX;
    const yIntY = originY - c * scale;
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(yIntX, yIntY, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [a, b, c, activeTab]);

  // ================= UNIT CIRCLE STATE =================
  const [angleDeg, setAngleDeg] = useState<number>(45);
  const circleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const angleRad = (angleDeg * Math.PI) / 180;
  const sinVal = Math.sin(angleRad);
  const cosVal = Math.cos(angleRad);
  const tanVal = Math.abs(cosVal) > 0.0001 ? Math.tan(angleRad) : null;
  const cotVal = Math.abs(sinVal) > 0.0001 ? 1 / Math.tan(angleRad) : null;

  // Determine Quadrant
  let quadrant = 'Góc phần tư I (sin > 0, cos > 0)';
  const normDeg = ((angleDeg % 360) + 360) % 360;
  if (normDeg > 90 && normDeg < 180) quadrant = 'Góc phần tư II (sin > 0, cos < 0)';
  else if (normDeg > 180 && normDeg < 270) quadrant = 'Góc phần tư III (sin < 0, cos < 0)';
  else if (normDeg > 270 && normDeg < 360) quadrant = 'Góc phần tư IV (sin < 0, cos > 0)';

  // Draw Unit Circle Canvas
  useEffect(() => {
    if (activeTab !== 'unit_circle') return;
    const canvas = circleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const originX = width / 2;
    const originY = height / 2;
    const radius = 150; // pixels for R = 1

    // Background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    // Axes
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#475569';

    ctx.beginPath();
    ctx.moveTo(20, originY);
    ctx.lineTo(width - 20, originY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(originX, 20);
    ctx.lineTo(originX, height - 20);
    ctx.stroke();

    // Axis Labels
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('cos α', width - 48, originY - 8);
    ctx.fillText('sin α', originX + 8, 30);
    ctx.fillText('O', originX - 14, originY + 16);

    // Draw Unit Circle (R = 1)
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(originX, originY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Mark 1, -1 on axes
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('1', originX + radius + 4, originY + 12);
    ctx.fillText('-1', originX - radius - 14, originY + 12);
    ctx.fillText('1', originX - 14, originY - radius - 4);
    ctx.fillText('-1', originX - 18, originY + radius + 12);

    // Calculate Point M on Circle
    const pointX = originX + cosVal * radius;
    const pointY = originY - sinVal * radius;

    // Draw Angle Arc
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(originX, originY, 35, 0, -angleRad, angleRad < 0);
    ctx.stroke();

    // Label Angle
    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`${angleDeg}°`, originX + 42, originY - 10);

    // Draw Radius Vector OM
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(pointX, pointY);
    ctx.stroke();

    // Projection onto Cos axis (horizontal blue line)
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(pointX, originY);
    ctx.stroke();

    // Projection dashed line from M to Cos axis
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(pointX, pointY);
    ctx.lineTo(pointX, originY);
    ctx.stroke();

    // Projection onto Sin axis (vertical rose line)
    ctx.setLineDash([]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, pointY);
    ctx.stroke();

    // Projection dashed line from M to Sin axis
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(pointX, pointY);
    ctx.lineTo(originX, pointY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Point M
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(pointX, pointY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label Point M
    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      `M (${cosVal.toFixed(2)}; ${sinVal.toFixed(2)})`,
      pointX + 10,
      pointY - 6
    );
  }, [angleDeg, activeTab]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <TrendingUp className="h-6 w-6 text-indigo-400" />
            Phòng Thí Nghiệm Toán Học 2D Tương Tác (Interactive Math Lab)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Trực quan hóa đồ thị Parabol, điểm cực trị, trục đối xứng và vòng tròn lượng giác đơn vị thời gian thực theo GDPT 2018.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('parabola')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'parabola'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Hàm Số Bậc Hai & Parabol
          </button>
          <button
            onClick={() => setActiveTab('unit_circle')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'unit_circle'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieChart className="h-4 w-4" />
            Vòng Tròn Lượng Giác
          </button>
        </div>
      </div>

      {/* ================= PARABOLA MODULE ================= */}
      {activeTab === 'parabola' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col items-center justify-center relative shadow-xl overflow-hidden">
            <canvas
              ref={parabolaCanvasRef}
              width={540}
              height={440}
              className="w-full max-w-[540px] h-auto rounded-xl border border-slate-800/80 shadow-inner"
            />
            {/* Real world context pill */}
            <div className="mt-3 w-full flex items-center justify-between text-[11px] text-slate-400 font-mono px-2">
              <span>Đỉnh I (đỏ) • Trục đối xứng x=-b/2a (vàng) • Giao điểm Ox (xanh)</span>
              <span className="text-indigo-400">Tỉ lệ: 1 đơn vị = 28px</span>
            </div>
          </div>

          {/* Controls & Math Analysis Panel */}
          <div className="lg:col-span-5 space-y-4">
            {/* Quick Presets */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Các dạng bài tập kinh điển:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Hai nghiệm x=1, x=3', a: 1, b: -4, c: 3 },
                  { label: 'Bề lõm quay xuống (Cực đại)', a: -1, b: 2, c: 3 },
                  { label: 'Tiếp xúc Ox (Nghiệm kép)', a: 1, b: -2, c: 1 },
                  { label: 'Vô nghiệm (Δ < 0)', a: 1, b: 0, c: 2 },
                  { label: 'Quỹ đạo Drone (Thực tiễn)', a: -0.5, b: 2, c: 6 },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setA(p.a);
                      setB(p.b);
                      setC(p.c);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-all border border-slate-700/60"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders for a, b, c */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="h-4 w-4" />
                  Điều khiển tham số Parabol:
                </span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  y = {a === 1 ? '' : a === -1 ? '-' : a}x² {b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}x {c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`}
                </span>
              </div>

              {/* Slider a */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Hệ số a (Độ mở & Bề lõm):</span>
                  <span className="font-bold text-white">{a}</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.25"
                  value={a}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setA(val === 0 ? 0.25 : val);
                  }}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Slider b */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Hệ số b (Dịch chuyển đỉnh):</span>
                  <span className="font-bold text-white">{b}</span>
                </div>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="0.5"
                  value={b}
                  onChange={(e) => setB(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Slider c */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Hệ số c (Giao điểm trục Oy):</span>
                  <span className="font-bold text-white">{c}</span>
                </div>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="0.5"
                  value={c}
                  onChange={(e) => setC(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Analysis Metrics */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-300 block mb-1">Đặc trưng hình học & Nhận thức:</span>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">TỌA ĐỘ ĐỈNH I:</span>
                  <span className="font-bold text-rose-400">({vertexX.toFixed(2)}; {vertexY.toFixed(2)})</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">TRỤC ĐỐI XỨNG:</span>
                  <span className="font-bold text-amber-400">x = {vertexX.toFixed(2)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">BIỆT THỨC Δ:</span>
                  <span className={`font-bold ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {delta.toFixed(2)} ({delta > 0 ? '2 nghiệm' : delta === 0 ? '1 nghiệm kép' : 'Vô nghiệm'})
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">BỀ LÕM:</span>
                  <span className="font-bold text-sky-400">
                    {a > 0 ? 'Quay lên (min tại I)' : 'Quay xuống (max tại I)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= UNIT CIRCLE MODULE ================= */}
      {activeTab === 'unit_circle' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col items-center justify-center relative shadow-xl overflow-hidden">
            <canvas
              ref={circleCanvasRef}
              width={540}
              height={440}
              className="w-full max-w-[540px] h-auto rounded-xl border border-slate-800/80 shadow-inner"
            />
            <div className="mt-3 w-full flex items-center justify-between text-[11px] text-slate-400 font-mono px-2">
              <span>Trục hoành: cos (lam) • Trục tung: sin (hồng) • Điểm M: (cos α; sin α)</span>
              <span className="text-amber-400 font-bold">{quadrant}</span>
            </div>
          </div>

          {/* Controls & Trig Table */}
          <div className="lg:col-span-5 space-y-4">
            {/* Quick Angle Presets */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Các góc đặc biệt (Bảng lượng giác):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[0, 30, 45, 60, 90, 120, 135, 150, 180, 270, 360].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => setAngleDeg(deg)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-mono transition-all border ${
                      angleDeg === deg
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border-slate-700/60'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>

            {/* Angle Slider */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="h-4 w-4" />
                  Kéo điều chỉnh góc α:
                </span>
                <span className="font-mono text-base font-bold text-amber-400">
                  α = {angleDeg}° ({((angleDeg * Math.PI) / 180).toFixed(2)} rad)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={angleDeg}
                onChange={(e) => setAngleDeg(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* 4 Trig Values Live Card */}
            <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-sky-500/30">
                <span className="text-sky-400 font-bold block text-sm">sin({angleDeg}°)</span>
                <span className="text-lg font-black text-white mt-1 block">{sinVal.toFixed(4)}</span>
                <span className="text-[10px] text-slate-500 font-sans">Hình chiếu lên trục tung Oy</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30">
                <span className="text-indigo-400 font-bold block text-sm">cos({angleDeg}°)</span>
                <span className="text-lg font-black text-white mt-1 block">{cosVal.toFixed(4)}</span>
                <span className="text-[10px] text-slate-500 font-sans">Hình chiếu lên trục hoành Ox</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/30">
                <span className="text-purple-400 font-bold block text-sm">tan({angleDeg}°)</span>
                <span className="text-lg font-black text-white mt-1 block">
                  {tanVal !== null ? tanVal.toFixed(4) : 'Không xác định (cos=0)'}
                </span>
                <span className="text-[10px] text-slate-500 font-sans">tan = sin / cos</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30">
                <span className="text-amber-400 font-bold block text-sm">cot({angleDeg}°)</span>
                <span className="text-lg font-black text-white mt-1 block">
                  {cotVal !== null ? cotVal.toFixed(4) : 'Không xác định (sin=0)'}
                </span>
                <span className="text-[10px] text-slate-500 font-sans">cot = cos / sin</span>
              </div>
            </div>

            {/* Mnemonic Slogan */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-amber-400 block">Quy tắc ghi nhớ dấu góc phần tư:</span>
              <p className="font-mono text-slate-400 text-[11px]">
                {'"Nhất cả (I: all > 0), Nhì sin (II: sin > 0), Tam tang (III: tan, cot > 0), Tứ cos (IV: cos > 0)."'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
