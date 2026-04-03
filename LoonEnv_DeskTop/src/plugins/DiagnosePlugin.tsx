import React, { useState } from 'react';
import { ShieldAlert, BrainCircuit, Activity, Zap, CheckCircle2, Database, FileText, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { Plugin } from '../types';
import { cn } from '../lib/utils';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

const DIAGNOSE_DATA = Array.from({ length: 50 }, (_, i) => ({
  time: i,
  q: Math.sin(i * 0.2) * 1.5 + 2,
  dq: Math.cos(i * 0.2) * 0.8,
  tau: Math.sin(i * 0.3) * 5 + 10,
  error: Math.random() * 0.1
}));

export const DiagnosePlugin: Plugin = {
  metadata: {
    id: 'diagnose',
    name: '智能诊断与监测',
    description: '实时数据监测与 AI 驱动的故障预测。',
    version: '2.1.0',
    author: 'Ops Team'
  },
  icon: <ShieldAlert className="w-5 h-5" />,
  stepTitle: '智能诊断与监测',
  techStack: ['WebSocket', 'Parquet', 'AI 分析'],
  inputSchema: { metrics: ['q', 'tau'], rate: '500Hz' },
  outputSchema: { health_score: 98, advice: '检查关节 3 (Check Joint 3)' },
  component: ({ data, onAction }) => {
    const [activeStep, setActiveStep] = useState(1);
    const diagnoseConfig = data.projectConfig?.diagnose;
    const steps = [
      { id: 1, label: '数据源 (Data Source)', icon: <Database className="w-3.5 h-3.5" /> },
      { id: 2, label: '实时监控 (Monitoring)', icon: <Activity className="w-3.5 h-3.5" /> },
      { id: 3, label: '诊断报告 (Reports)', icon: <FileText className="w-3.5 h-3.5" /> },
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
              <CollapsibleSection title="实时数据源 (Real-time Data Source)" defaultOpen>
                <div className="border border-[#e5e5e5] rounded-sm p-4 bg-[#f8f8f8] flex items-center gap-3 shadow-sm hover:border-[#cccccc] transition-colors">
                  <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center border border-[#e5e5e5]">
                    <Database className="w-6 h-6 text-[#007acc]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#333333]">WebSocket 数据流 (Stream)</p>
                    <p className="text-[10px] text-[#6f6f6f]">{diagnoseConfig?.streamUrl ?? 'ws://192.168.1.105:8080/stream'}</p>
                  </div>
                </div>
                <input
                  value={diagnoseConfig?.streamUrl ?? ''}
                  onChange={(event) => onAction('DIAGNOSE_CONFIG_UPDATED', { streamUrl: event.target.value })}
                  className="w-full mt-3 rounded-sm border border-[#e5e5e5] px-3 py-2 text-[11px] outline-none"
                  placeholder="数据流地址"
                />
                <button className="w-full mt-3 py-2 bg-[#333333] text-white rounded-sm text-[10px] font-bold hover:bg-[#1e1e1e] transition-all uppercase tracking-widest shadow-sm active:scale-[0.98]">
                  连接数据链路 (Connect Data Link)
                </button>
              </CollapsibleSection>
              
              <CollapsibleSection title="指标选择 (Metrics Selection)" defaultOpen>
                <div className="grid grid-cols-2 gap-2.5">
                  {['关节扭矩 (Torque)', '关节位置 (Position)', '末端速度 (Velocity)', '电机温度 (Temp)'].map((label) => {
                    const selected = diagnoseConfig?.selectedMetrics?.includes(label) ?? false;
                    return (
                    <div key={label} className="flex items-center gap-2.5 p-2.5 bg-white border border-[#e5e5e5] rounded-sm hover:border-[#007acc] transition-colors cursor-pointer group shadow-sm">
                      <div
                        onClick={() => {
                          const current = diagnoseConfig?.selectedMetrics ?? [];
                          const next = selected ? current.filter((item) => item !== label) : [...current, label];
                          onAction('DIAGNOSE_CONFIG_UPDATED', { selectedMetrics: next });
                        }}
                        className="w-3.5 h-3.5 border-2 border-[#e5e5e5] rounded-sm flex items-center justify-center group-hover:border-[#007acc] bg-white transition-colors"
                      >
                        <CheckCircle2 className={`w-2.5 h-2.5 text-[#007acc] ${selected ? 'opacity-100' : 'opacity-20'}`} />
                      </div>
                      <span className="text-[10px] text-[#333333] font-medium">{label}</span>
                    </div>
                  )})}
                </div>
              </CollapsibleSection>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <CollapsibleSection title="监控概览 (Monitoring Overview)" defaultOpen>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: '健康评分 (Health)', value: '98', color: 'text-[#388a3c]', icon: <Zap className="w-3 h-3" /> },
                    { label: '故障预测 (Predict)', value: '0.02%', color: 'text-[#388a3c]', icon: <ShieldAlert className="w-3 h-3" /> },
                    { label: '采样率 (Rate)', value: '500Hz', color: 'text-[#007acc]', icon: <Activity className="w-3 h-3" /> },
                    { label: '吞吐量 (Throughput)', value: '124MB/s', color: 'text-[#007acc]', icon: <Activity className="w-3 h-3" /> }
                  ].map(s => (
                    <div key={s.label} className="bg-white p-3 border border-[#e5e5e5] rounded-sm shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-1.5 mb-1.5 opacity-60">
                        {s.icon}
                        <span className="text-[9px] font-bold uppercase tracking-widest">{s.label}</span>
                      </div>
                      <p className={cn("text-xl font-bold tracking-tight", s.color)}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="实时遥测 (Live Telemetry)" defaultOpen>
                <section className="h-[200px] bg-white border border-[#e5e5e5] rounded-sm p-3 relative overflow-hidden shadow-sm">
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 opacity-60">
                    <Activity className="w-3 h-3 text-[#007acc]" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">实时遥测 (Live Telemetry)</span>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={DIAGNOSE_DATA} margin={{ top: 30, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis stroke="#94a3b8" fontSize={8} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '2px', border: '1px solid #e5e5e5', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', padding: '4px', fontSize: '9px' }} 
                      />
                      <Area type="monotone" dataKey="tau" stroke="#007acc" strokeWidth={1.5} fill="#007acc" fillOpacity={0.1} />
                      <Area type="monotone" dataKey="q" stroke="#388a3c" strokeWidth={1.5} fill="#388a3c" fillOpacity={0.05} />
                    </AreaChart>
                  </ResponsiveContainer>
                </section>
              </CollapsibleSection>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <CollapsibleSection title="AI 诊断见解 (Diagnostic Insights)" defaultOpen>
                <section className="p-4 bg-[#f0f7ff] border border-[#d0e7ff] rounded-sm shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-[#007acc] rounded-sm flex items-center justify-center text-white shadow-md">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <p className="text-[11px] font-bold text-[#005fb8]">AI 诊断见解 (Diagnostic Insights)</p>
                  </div>
                  <p className="text-[10px] text-[#005fb8] leading-relaxed opacity-80">
                    系统稳定。在高速运动中检测到末端执行器有 2% 的超调。建议在设计阶段调整阻尼参数。
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 py-1.5 bg-white border border-[#d0e7ff] text-[#007acc] rounded-sm text-[10px] font-bold hover:bg-[#f8fbff] transition-all shadow-sm active:scale-[0.98]">
                      下载 PDF (Download PDF)
                    </button>
                    <button className="flex-1 py-1.5 bg-[#007acc] text-white rounded-sm text-[10px] font-bold hover:bg-[#005fb8] transition-all shadow-md active:scale-[0.98]">
                      同步到云端 (Sync to Cloud)
                    </button>
                  </div>
                </section>
              </CollapsibleSection>

              <CollapsibleSection title="诊断摘要" defaultOpen>
                <div className="rounded-sm border border-[#e5e5e5] bg-white px-3 py-3 text-[11px] text-[#526070] space-y-1.5">
                  <div><span className="font-bold text-[#333333]">健康评分:</span> 98</div>
                  <div><span className="font-bold text-[#333333]">故障预测:</span> 0.02%</div>
                  <div><span className="font-bold text-[#333333]">主要建议:</span> 在设计阶段调整阻尼参数</div>
                  <div><span className="font-bold text-[#333333]">数据源:</span> {diagnoseConfig?.streamUrl ?? '未配置'}</div>
                  <div><span className="font-bold text-[#333333]">当前结论:</span> 系统稳定，可继续跟踪观察</div>
                </div>
              </CollapsibleSection>
            </motion.div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-5 border-t border-[#e5e5e5] bg-[#f3f3f3] shrink-0">
          <button 
            onClick={() => onAction('COMPLETE', 'DIAGNOSE_FINISHED')}
            className="w-full bg-[#007acc] hover:bg-[#0062a3] text-white py-2.5 text-xs font-medium shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Search className="w-4 h-4" /> 生成完整诊断报告 (Generate Full Diagnostic Report)
          </button>
        </div>
      </div>
    );
  }
};
