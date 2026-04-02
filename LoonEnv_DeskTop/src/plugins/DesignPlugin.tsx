import React, { useState } from 'react';
import { BrainCircuit, Cpu, Layers, Play, Activity, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { Plugin } from '../types';
import { cn } from '../lib/utils';
import { CollapsibleSection } from '../components/CollapsibleSection';

export const DesignPlugin: Plugin = {
  metadata: {
    id: 'design',
    name: '算法设计与训练',
    description: '基于强化学习的策略训练，支持大规模并行仿真。',
    version: '1.2.0',
    author: 'AI Research'
  },
  icon: <BrainCircuit className="w-5 h-5" />,
  stepTitle: '策略设计与训练',
  techStack: ['Python/PyTorch', 'mujoco_warp', 'CUDA'],
  inputSchema: { algorithm: 'PPO', parallel_envs: 2048 },
  outputSchema: { policy_weights: 'policy.pth', success_rate: 0.95 },
  component: ({ data, onAction }) => {
    const [activeStep, setActiveStep] = useState(1);
    const steps = [
      { id: 1, label: '算法配置 (Algorithm)', icon: <Layers className="w-3.5 h-3.5" /> },
      { id: 2, label: '训练监控 (Training)', icon: <Activity className="w-3.5 h-3.5" /> },
      { id: 3, label: '评估报告 (Evaluation)', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    ];

    return (
      <div className="flex flex-col h-full bg-white text-[#333333] select-none">
        {/* VSCode-style Step Navigation */}
        <div className="grid grid-cols-3 px-2 bg-[#f3f3f3] border-b border-[#e5e5e5] shrink-0 gap-1">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={cn(
                "min-w-0 px-2 py-2.5 text-[11px] font-medium transition-all relative flex flex-col items-center justify-center gap-1 text-center leading-snug rounded-sm",
                activeStep === step.id 
                  ? "text-[#333333] border-b-2 border-[#007acc] bg-white/50" 
                  : "text-[#6f6f6f] hover:text-[#333333] hover:bg-[#e8e8e8]"
              )}
            >
              {step.icon}
              {step.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          {activeStep === 1 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <CollapsibleSection title="超参数设置 (Hyperparameters)" defaultOpen>
                <div className="space-y-1 border border-[#e5e5e5] rounded-sm overflow-hidden divide-y divide-[#f3f3f3]">
                  <div className="flex flex-col py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">学习率 (Learning Rate)</span>
                      <span className="text-[10px] font-mono text-[#007acc] bg-[#f0f7ff] px-1.5 py-0.5 rounded border border-[#007acc]/20">0.0003</span>
                    </div>
                    <input 
                      type="range" 
                      className="w-full h-1 bg-[#e5e5e5] rounded-lg appearance-none cursor-pointer accent-[#007acc]" 
                    />
                  </div>
                  <div className="flex flex-col py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">折扣因子 (Discount Factor)</span>
                      <span className="text-[10px] font-mono text-[#007acc] bg-[#f0f7ff] px-1.5 py-0.5 rounded border border-[#007acc]/20">0.99</span>
                    </div>
                    <input 
                      type="range" 
                      className="w-full h-1 bg-[#e5e5e5] rounded-lg appearance-none cursor-pointer accent-[#007acc]" 
                    />
                  </div>
                  <div className="flex items-center py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <span className="w-1/3 text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">批次大小 (Batch Size)</span>
                    <div className="w-2/3">
                      <select className="w-full bg-transparent text-[11px] outline-none cursor-pointer text-[#333333] font-medium">
                        <option>128</option>
                        <option>256</option>
                        <option>512</option>
                        <option>1024</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="计算资源 (Compute Resources)" defaultOpen={false}>
                <div className="border border-[#e5e5e5] rounded-sm p-3 bg-[#f8f8f8] flex items-center gap-3 shadow-sm">
                  <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center border border-[#e5e5e5]">
                    <Cpu className="w-5 h-5 text-[#007acc]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#333333]">NVIDIA RTX 4090</p>
                    <p className="text-[10px] text-[#6f6f6f]">2048 并行环境 | CUDA 已激活</p>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="网络架构 (Network Architecture)" defaultOpen={false}>
                <div className="bg-[#f8f8f8] border border-[#e5e5e5] rounded-sm p-3 font-mono text-[10px] text-[#333333] space-y-1.5 shadow-sm">
                  <div className="text-[#6a9955] mb-1">// MLP 策略网络</div>
                  <div className="flex justify-between"><span className="text-[#007acc] font-bold">输入 (Input):</span> <span>[State_Dim, 128]</span></div>
                  <div className="flex justify-between"><span className="text-[#007acc] font-bold">隐藏层 (Hidden):</span> <span>[128, 256, 128]</span></div>
                  <div className="flex justify-between"><span className="text-[#007acc] font-bold">输出 (Output):</span> <span>[Action_Dim]</span></div>
                </div>
              </CollapsibleSection>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <CollapsibleSection title="训练概览 (Training Overview)" defaultOpen>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: '训练进度 (Progress)', value: '78%', color: 'text-[#007acc]', icon: <Layers className="w-3.5 h-3.5" /> },
                    { label: '平均奖励 (Reward)', value: '1240', color: 'text-[#388a3c]', icon: <BrainCircuit className="w-3.5 h-3.5" /> },
                    { label: 'GPU 利用率', value: '92%', color: 'text-[#d32f2f]', icon: <Cpu className="w-3.5 h-3.5" /> },
                    { label: '策略熵 (Entropy)', value: '0.45', color: 'text-[#7b1fa2]', icon: <Activity className="w-3.5 h-3.5" /> }
                  ].map(s => (
                    <div key={s.label} className="bg-white p-3 border border-[#e5e5e5] rounded-sm shadow-sm hover:border-[#007acc] transition-colors group">
                      <div className="flex items-center gap-2 mb-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        {s.icon}
                        <span className="text-[9px] font-bold uppercase tracking-wider">{s.label}</span>
                      </div>
                      <p className={cn("text-xl font-bold tracking-tight", s.color)}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="训练实时日志 (Live Training Logs)" defaultOpen>
                <div className="bg-[#f8f8f8] border border-[#e5e5e5] rounded-sm p-3 font-mono text-[10px] text-[#333333] h-48 overflow-hidden relative shadow-sm">
                  <div className="space-y-1">
                    <p className="text-[#6a9955]">[信息] 正在初始化 mujoco_warp...</p>
                    <p className="text-[#333333]">[信息] CUDA 加速已启用</p>
                    <p className="text-[#007acc]">[训练] 第 3500 轮: 奖励=1240.5</p>
                    <p className="text-[#d32f2f]">[警告] 检测到高熵值</p>
                    <p className="text-[#333333]">[信息] 检查点已保存: policy_3500.pth</p>
                    <p className="text-[#007acc] animate-pulse mt-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#007acc] rounded-full" /> 正在同步模型权重...
                    </p>
                  </div>
                </div>
              </CollapsibleSection>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 flex flex-col items-center py-2">
              <CollapsibleSection title="评估报告 (Evaluation Report)" defaultOpen className="w-full">
                <div className="flex flex-col items-center text-center space-y-4 py-2">
                  <div className="w-16 h-16 bg-[#f3f3f3] rounded-full flex items-center justify-center text-[#007acc] shadow-inner border border-[#e5e5e5]">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-sm font-bold text-[#333333]">评估报告 (Evaluation Report)</h4>
                    <p className="text-[11px] text-[#6f6f6f] max-w-[240px] mx-auto mt-2 leading-relaxed">
                      训练完成。在 1000 次随机试验中，成功率达到 <span className="text-emerald-600 font-bold">95.4%</span>。
                    </p>
                  </div>
                  <div className="flex gap-2 w-full max-w-[240px]">
                    <button className="flex-1 py-1.5 bg-white border border-[#e5e5e5] text-[11px] font-bold text-[#333333] hover:bg-[#f8f8f8] rounded-sm transition-colors uppercase tracking-wider">详情 (Details)</button>
                    <button className="flex-1 py-1.5 bg-[#007acc] text-white text-[11px] font-bold hover:bg-[#005fb8] rounded-sm transition-colors shadow-sm uppercase tracking-wider">导出 (Export)</button>
                  </div>
                </div>
              </CollapsibleSection>
            </motion.div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-4 border-t border-[#e5e5e5] bg-[#f3f3f3] shrink-0">
          <button 
            onClick={() => onAction('COMPLETE', 'DESIGN_FINISHED')}
            className="w-full bg-[#007acc] hover:bg-[#0062a3] text-white py-2 text-[11px] font-bold uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] rounded-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> 开启训练会话 (Start Training Session)
          </button>
        </div>
      </div>
    );
  }
};
