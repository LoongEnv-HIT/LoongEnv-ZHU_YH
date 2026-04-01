import React, { useState } from 'react';
import { 
  Settings, 
  Play, 
  Save, 
  Download, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Cpu, 
  Layers, 
  Workflow,
  Terminal,
  Code,
  Box,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MujocoViewer } from './MujocoViewer';

interface AlgorithmConfig {
  type: 'PID' | 'MPC' | 'LQR';
  params: {
    kp: number;
    ki: number;
    kd: number;
    horizon?: number;
    q_weight?: number;
    r_weight?: number;
  };
}

export const Studio: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'algorithms' | 'export'>('tasks');
  
  const [scene, setScene] = useState('车间环境 + 6轴机器人');
  const [taskType, setTaskType] = useState('包装袋码垛');
  const [goal, setGoal] = useState('安全、高速');

  const [algo, setAlgo] = useState<AlgorithmConfig>({
    type: 'PID',
    params: { kp: 1.2, ki: 0.5, kd: 0.1 }
  });

  return (
    <div className="fixed inset-0 bg-loong-dark z-[100] flex flex-col font-sans text-main transition-colors duration-300">
      {/* Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[var(--nav-bg)] backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-loong-accent"
          >
            <ChevronRight className="rotate-180" size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-white">S</div>
            <h1 className="font-display font-bold text-lg tracking-tight">LoongEnv-Studio</h1>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-mono border border-blue-500/20">DESIGN MODE</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">
            <Save size={16} /> 保存
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
            <Download size={16} /> 导出工程配置
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-black/5 flex flex-col">
          <nav className="p-4 space-y-2">
            {[
              { id: 'tasks', label: '任务流定义', icon: Workflow },
              { id: 'algorithms', label: '算法正向设计', icon: Cpu },
              { id: 'export', label: '工程预览', icon: Terminal },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                    : 'text-muted hover:text-main hover:bg-white/5 border border-transparent'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
          
          <div className="mt-auto p-6 border-t border-white/10">
            <div className="glass-card p-4 text-[10px] font-mono text-muted space-y-2">
              <div className="flex justify-between">
                <span>PROJECT_ID</span>
                <span className="text-main">LE-2026-0321</span>
              </div>
              <div className="flex justify-between">
                <span>TARGET_HW</span>
                <span className="text-main">LOONG_BOX_V2</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto bg-loong-dark tech-grid p-8">
          <div className="w-full max-w-[1400px] mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'tasks' && (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-display font-bold mb-2">任务流定义</h2>
                      <p className="text-muted text-base">定义机器人运行场景、具体任务与优化目标</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      {/* 1. 场景 */}
                      <div className="glass-card p-8 border-l-4 border-blue-500">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-sm font-bold">1</div>
                          定义场景 (Scene)
                        </h3>
                        <input 
                          value={scene}
                          onChange={(e) => setScene(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-blue-500/50 transition-colors"
                          placeholder="例如：车间环境 + 6轴机器人"
                        />
                      </div>

                      {/* 2. 任务 */}
                      <div className="glass-card p-8 border-l-4 border-emerald-500">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-bold">2</div>
                          定义任务 (Task)
                        </h3>
                        <input 
                          value={taskType}
                          onChange={(e) => setTaskType(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-emerald-500/50 transition-colors"
                          placeholder="例如：包装袋码垛"
                        />
                      </div>

                      {/* 3. 目标 */}
                      <div className="glass-card p-8 border-l-4 border-purple-500">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center text-sm font-bold">3</div>
                          定义目标 (Goal)
                        </h3>
                        <input 
                          value={goal}
                          onChange={(e) => setGoal(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-purple-500/50 transition-colors"
                          placeholder="例如：安全、高速"
                        />
                      </div>
                    </div>

                    {/* MuJoCo WASM Simulation Viewer */}
                    <div className="glass-card p-4 flex flex-col h-[600px] lg:h-auto">
                      <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <Box size={20} className="text-emerald-500" />
                          仿真实例 (D:\AI\robotics-pick-and-place)
                        </h3>
                        <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono border border-emerald-500/20">
                          WASM ACTIVE
                        </span>
                      </div>
                      <div className="flex-1 rounded-xl overflow-hidden relative">
                        <MujocoViewer />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'algorithms' && (
                <motion.div
                  key="algo"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="mb-8">
                    <h2 className="text-3xl font-display font-bold mb-2">算法正向设计</h2>
                    <p className="text-muted text-base">从准则到评估的完整算法设计闭环</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 1. 设计准则 */}
                    <div className="glass-card p-8">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-blue-400">
                        <Layers size={24} /> 1. 设计准则
                      </h3>
                      <p className="text-muted mb-4 text-sm">基于任务目标（{goal}）自动推导出的控制准则。</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 保证全局渐进稳定性</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 满足关节力矩饱和约束</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 最小化轨迹跟踪误差</li>
                      </ul>
                    </div>

                    {/* 2. 算法推荐 */}
                    <div className="glass-card p-8">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-emerald-400">
                        <Cpu size={24} /> 2. 算法推荐
                      </h3>
                      <p className="text-muted mb-4 text-sm">系统根据场景与任务推荐的最优算法结构。</p>
                      <div className="flex gap-4 mb-4">
                        {['MPC', 'LQR', 'PID'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setAlgo({ ...algo, type: type as any })}
                            className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                              algo.type === type 
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                                : 'bg-white/5 border-white/10 text-muted hover:border-white/20'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-muted bg-black/20 p-3 rounded-lg border border-white/5">
                        当前选择 <strong>{algo.type}</strong>: {
                          algo.type === 'MPC' ? '模型预测控制，适合处理多约束与高速轨迹跟踪。' :
                          algo.type === 'LQR' ? '线性二次型调节器，适合线性化模型的最优控制。' :
                          '经典PID控制，适合基础的单关节伺服。'
                        }
                      </div>
                    </div>

                    {/* 3. 参数设计 */}
                    <div className="glass-card p-8 lg:col-span-2">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-purple-400">
                        <Sliders size={24} /> 3. 参数设计
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {Object.entries(algo.params).map(([key, val]) => (
                          <div key={key} className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="font-mono text-muted uppercase">{key}</span>
                              <span className="font-bold text-purple-400">{val}</span>
                            </div>
                            <input 
                              type="range" min="0" max="10" step="0.1" value={val}
                              onChange={(e) => setAlgo({...algo, params: { ...algo.params, [key]: parseFloat(e.target.value) }})}
                              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. 性能评估 */}
                    <div className="glass-card p-8 lg:col-span-2">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-orange-400">
                        <Settings size={24} /> 4. 性能评估
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                          <div className="text-xs text-muted mb-1">超调量 (Overshoot)</div>
                          <div className="text-xl font-bold text-main">{(algo.params.kp * 1.2).toFixed(1)}%</div>
                        </div>
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                          <div className="text-xs text-muted mb-1">调节时间 (Settling)</div>
                          <div className="text-xl font-bold text-main">{(2.5 / (algo.params.kd || 0.1)).toFixed(2)}s</div>
                        </div>
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                          <div className="text-xs text-muted mb-1">稳态误差 (SSE)</div>
                          <div className="text-xl font-bold text-main">{(0.1 / (algo.params.ki || 0.1)).toFixed(3)}</div>
                        </div>
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                          <div className="text-xs text-muted mb-1">鲁棒性评分</div>
                          <div className="text-xl font-bold text-emerald-400">A-</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'export' && (
                <motion.div
                  key="export"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-display font-bold">工程预览 (JSON)</h2>
                    <div className="flex gap-2">
                      <button className="p-3 hover:bg-white/5 rounded-xl text-muted hover:text-main transition-colors">
                        <Code size={24} />
                      </button>
                    </div>
                  </div>
                  <div className="bg-black/60 rounded-3xl p-10 font-mono text-sm text-blue-400/80 border border-white/5 overflow-x-auto shadow-2xl">
                    <pre className="leading-relaxed">
                      {JSON.stringify({
                        project: "LE-2026-0321",
                        version: "1.0.0",
                        definition: {
                          scene,
                          task: taskType,
                          goal
                        },
                        algorithm: algo,
                        hardware: "LOONG_BOX_V2"
                      }, null, 2)}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};
