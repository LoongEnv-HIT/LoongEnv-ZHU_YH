import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  ChevronRight, 
  Activity, 
  Cpu, 
  Terminal,
  RefreshCw,
  Box as BoxIcon,
  Link as LinkIcon,
  Maximize2,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { MujocoViewer } from './MujocoViewer';

interface TelemetryData {
  time: number;
  joint1: number;
  joint2: number;
  torque: number;
  error: number;
}

const MODELS = [
  {
    id: 'er15-1400',
    name: 'ER15-1400',
    file: 'er15-1400.mjcf.xml',
    joints: 6,
    type: 'MJCF',
    source: 'https://github.com/zhuyanhe1975-hit/PerfOpt'
  }
];

export const Twin: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([]);
  const [activeJoint, setActiveJoint] = useState(1);
  const [simSpeed, setSimSpeed] = useState(1);
  const [activeModelId, setActiveModelId] = useState(MODELS[0].id);
  const [logs, setLogs] = useState<{time: string, msg: string, type: 'info' | 'warn' | 'error'}[]>([
    { time: '08:00:01', msg: 'Physics engine initialized: MuJoCo', type: 'info' },
    { time: '08:00:02', msg: `Loading model from PerfOpt: ${MODELS[0].file}`, type: 'info' },
    { time: '08:00:03', msg: `Robot model loaded: ${MODELS[0].name} (${MODELS[0].joints} DOF)`, type: 'info' },
  ]);

  const activeModel = MODELS.find(m => m.id === activeModelId) || MODELS[0];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSimulating) {
      timerRef.current = setInterval(() => {
        const now = Date.now() * 0.001 * simSpeed;
        
        setTelemetry(prev => {
          const nextTime = prev.length > 0 ? prev[prev.length - 1].time + 1 : 0;
          const newData = {
            time: nextTime,
            joint1: Math.sin(now * 0.5) * 45,
            joint2: Math.cos(now * 0.7) * 30,
            torque: 10 + Math.abs(Math.sin(now * 0.5)) * 50,
            error: Math.abs(Math.sin(now * 2)) * 0.5
          };
          const updated = [...prev, newData].slice(-30);
          return updated;
        });

        if (Math.random() > 0.98) {
          setLogs(prev => [
            { 
              time: new Date().toLocaleTimeString([], { hour12: false }), 
              msg: Math.random() > 0.5 ? `Approaching joint limit: J${Math.floor(Math.random() * activeModel.joints) + 1}` : 'Dynamic compensation active', 
              type: (Math.random() > 0.5 ? 'warn' : 'info') as 'warn' | 'info' | 'error'
            },
            ...prev
          ].slice(0, 50));
        }
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isSimulating, simSpeed, activeModel.joints]);

  const resetSim = () => {
    setIsSimulating(false);
    setTelemetry([]);
    setLogs([{ time: new Date().toLocaleTimeString([], { hour12: false }), msg: 'Simulation reset', type: 'info' }]);
  };

  return (
    <div className="fixed inset-0 bg-loong-dark z-[100] flex flex-col font-sans text-main transition-colors duration-300 overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[var(--nav-bg)] backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-loong-accent"
          >
            <ChevronRight className="rotate-180" size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-bold text-white">T</div>
            <h1 className="font-display font-bold text-lg tracking-tight hidden sm:block">LoongEnv-Twin</h1>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono border border-emerald-500/20">SIMULATION MODE</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[10px] font-mono text-muted uppercase">Speed</span>
            <select 
              value={simSpeed} 
              onChange={(e) => setSimSpeed(Number(e.target.value))}
              className="bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer text-main outline-none"
            >
              <option value={0.5} className="bg-loong-dark">0.5x</option>
              <option value={1} className="bg-loong-dark">1.0x</option>
              <option value={2} className="bg-loong-dark">2.0x</option>
              <option value={5} className="bg-loong-dark">5.0x</option>
            </select>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <button 
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-lg text-sm ${
              isSimulating 
                ? 'bg-rose-500 text-white shadow-rose-500/20' 
                : 'bg-emerald-500 text-white shadow-emerald-500/20'
            }`}
          >
            {isSimulating ? <><Square size={16} /> 停止仿真</> : <><Play size={16} /> 开始仿真</>}
          </button>
          <button 
            onClick={resetSim}
            className="p-2 hover:bg-white/5 rounded-lg text-muted hover:text-main transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black/5 flex flex-col shrink-0">
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Model Info */}
          <div>
            <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3 flex items-center gap-2 px-2">
              <BoxIcon size={12} className="text-indigo-500" /> 当前模型
            </h3>
            <div className="space-y-2">
              <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-medium text-main">
                {activeModel.name}
              </div>
              
              <div className="glass-card p-3 text-[10px] font-mono text-muted space-y-1.5">
                <div className="flex justify-between">
                  <span>TYPE</span>
                  <span className="text-main">{activeModel.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>DOF</span>
                  <span className="text-main">{activeModel.joints} Joints</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>SOURCE</span>
                  <a href={activeModel.source} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                    PerfOpt <LinkIcon size={10} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div>
            <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3 flex items-center gap-2 px-2">
              <Cpu size={12} className="text-emerald-500" /> 数字孪生状态
            </h3>
            <div className="glass-card p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted">同步状态</span>
                <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  已连接
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted">延迟</span>
                <span className="font-mono text-blue-400 font-medium">1.2ms</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted">模型漂移</span>
                <span className="font-mono text-amber-400 font-medium">0.02%</span>
              </div>
            </div>
          </div>

          {/* Logs Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                <Terminal size={12} /> 仿真日志
              </h3>
              <button 
                onClick={() => setLogs([])}
                className="text-[10px] text-muted hover:text-main transition-colors font-bold"
              >
                清除
              </button>
            </div>
            <div className="glass-card p-3 h-48 overflow-y-auto font-mono text-[10px] space-y-1.5">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 leading-relaxed">
                  <span className="opacity-40 shrink-0">[{log.time}]</span>
                  <span className={
                    log.type === 'error' ? 'text-rose-500' : 
                    log.type === 'warn' ? 'text-amber-500' : 
                    'text-main/80'
                  }>
                    {log.msg}
                  </span>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="h-full flex items-center justify-center text-muted italic">
                  暂无日志
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-auto p-4 border-t border-white/10 space-y-4">
          <div className="glass-card p-3 text-[10px] font-mono text-muted space-y-1.5">
            <div className="flex justify-between">
              <span>PROJECT_ID</span>
              <span className="text-main">LE-2026-0321</span>
            </div>
            <div className="flex justify-between">
              <span>TARGET_HW</span>
              <span className="text-main">LOONG_BOX_V2</span>
            </div>
          </div>
          
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all text-muted hover:text-main">
            <RefreshCw size={14} /> 同步至实机 (Box)
          </button>
        </div>
      </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col min-w-0 bg-loong-dark tech-grid relative">
          {/* 3D Visualizer */}
          <div className="flex-1 relative overflow-hidden">
            <MujocoViewer isPaused={!isSimulating} speed={simSpeed} />

            {/* HUD Overlays */}
            <div className="absolute top-6 left-6 space-y-4 pointer-events-none">
              <div className="glass-card p-4 w-48 pointer-events-auto">
                <div className="text-[10px] font-mono text-muted mb-2 uppercase tracking-wider">关节状态 (deg)</div>
                <div className="space-y-2">
                  {Array.from({ length: activeModel.joints }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-muted">J{i + 1}</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {isSimulating ? (Math.sin(Date.now() * 0.001 * (i + 1)) * 45).toFixed(2) : '0.00'}°
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card p-4 w-48 pointer-events-auto">
                <div className="text-[10px] font-mono text-muted mb-2 uppercase tracking-wider">末端位姿 (mm)</div>
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between"><span className="text-muted">X:</span> <span className="text-blue-400">245.21</span></div>
                  <div className="flex justify-between"><span className="text-muted">Y:</span> <span className="text-blue-400">-12.05</span></div>
                  <div className="flex justify-between"><span className="text-muted">Z:</span> <span className="text-blue-400">512.88</span></div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 flex gap-2">
              <button className="p-3 glass-card hover:bg-white/5 transition-colors text-muted hover:text-main">
                <Maximize2 size={18} />
              </button>
              <button className="p-3 glass-card hover:bg-white/5 transition-colors text-muted hover:text-main">
                <Settings size={18} />
              </button>
            </div>
          </div>

          {/* Bottom Telemetry Panel */}
          <div className="h-56 border-t border-white/10 bg-black/20 backdrop-blur-md flex shrink-0">
            <div className="w-48 border-r border-white/10 p-4 flex flex-col gap-3">
              <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                <Activity size={12} className="text-emerald-500" /> 遥测数据
              </h3>
              <div className="flex flex-col gap-1.5">
                {['关节位置', '力矩输出', '跟踪误差'].map((label, i) => (
                  <button 
                    key={label}
                    onClick={() => setActiveJoint(i + 1)}
                    className={`text-left px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${
                      activeJoint === i + 1 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'text-muted hover:text-main hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 p-4 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetry}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="white" opacity={0.03} vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '10px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={activeJoint === 1 ? 'joint1' : activeJoint === 2 ? 'torque' : 'error'} 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorVal)" 
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

