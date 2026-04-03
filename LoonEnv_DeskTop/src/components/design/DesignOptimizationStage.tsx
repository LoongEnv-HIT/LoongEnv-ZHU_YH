import React from 'react';
import { Activity, BrainCircuit, Cpu, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CollapsibleSection } from '../CollapsibleSection';
import type { DesignJob, PluginData } from '../../types';

export function DesignOptimizationStage({ designJob, data }: { designJob?: DesignJob; data?: PluginData }) {
  const algorithm = data?.selectedDesignAlgorithm;
  const profileMetrics = algorithm?.metrics ?? [];
  return (
    <div className="space-y-6">
      <CollapsibleSection title="当前设计任务 (Active Design Job)" defaultOpen>
        <div className="rounded-sm border border-[#e5e5e5] bg-[#f8fafc] px-3 py-3 text-[11px] text-[#526070] space-y-1.5">
          <div><span className="font-bold text-[#333333]">任务:</span> {designJob?.title ?? '尚未启动'}</div>
          <div><span className="font-bold text-[#333333]">状态:</span> {designJob?.state ?? 'draft'}</div>
          <div><span className="font-bold text-[#333333]">阶段:</span> {designJob?.currentStage ?? '等待配置'}</div>
          <div><span className="font-bold text-[#333333]">执行机器人:</span> {designJob?.executionRobotModel ?? data?.defineArtifact?.robotModel ?? '未选择'}</div>
          <div><span className="font-bold text-[#333333]">说明:</span> {designJob?.summary ?? '点击“启动算法设计流程”后会创建一条最小可运行的算法设计任务，并沿通用 Design 工作流推进。'}</div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="优化目标 (Optimization Objectives)" defaultOpen>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '节拍 (Quick)', value: 'cycle_time', color: 'text-[#007acc]', icon: <Layers className="w-3.5 h-3.5" /> },
            { label: '精度 (True)', value: 'e_max / rmse', color: 'text-[#388a3c]', icon: <BrainCircuit className="w-3.5 h-3.5" /> },
            { label: '稳定 (Stable)', value: 'vib_energy', color: 'text-[#d32f2f]', icon: <Activity className="w-3.5 h-3.5" /> },
            { label: '能耗 (Energy)', value: 'energy proxy', color: 'text-[#7b1fa2]', icon: <Cpu className="w-3.5 h-3.5" /> },
          ].map((s) => (
            <div key={s.label} className="bg-white p-3 border border-[#e5e5e5] rounded-sm shadow-sm hover:border-[#007acc] transition-colors group">
              <div className="flex items-center gap-2 mb-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                {s.icon}
                <span className="text-[9px] font-bold uppercase tracking-wider">{s.label}</span>
              </div>
              <p className={cn('text-xl font-bold tracking-tight', s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <details className="rounded-sm border border-[#e5e5e5] bg-white">
        <summary className="cursor-pointer px-3 py-2 text-[11px] font-bold text-[#333333]">更多细节</summary>
        <div className="border-t border-[#f3f3f3] px-3 py-3 space-y-4">
          <div className="space-y-2">
            {(designJob?.metrics?.length ? designJob.metrics : profileMetrics.map((metric) => ({
              name: metric.name,
              value: metric.meaning,
              status: 'info' as const,
            }))).map((metric) => (
              <div key={metric.name} className="rounded-sm border border-[#e5e5e5] bg-[#fafafa] px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-mono font-bold text-[#333333]">{metric.name}</span>
                  <span className={cn(
                    'text-[10px]',
                    metric.status === 'good' ? 'text-[#388a3c]' : metric.status === 'warn' ? 'text-[#d97706]' : 'text-[#6f6f6f]'
                  )}>
                    {metric.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#f8f8f8] border border-[#e5e5e5] rounded-sm p-3 font-mono text-[10px] text-[#333333] h-40 overflow-hidden relative">
            <div className="space-y-1">
              <p className="text-[#6a9955]">[设计] 载入 {algorithm?.name ?? '后端算法'} 所需模型、任务与约束</p>
              <p className="text-[#333333]">[设计] 构造算法候选并绑定评估协议</p>
              <p className="text-[#007acc]">[优化] {designJob ? `${designJob.artifacts.optimizer} job=${designJob.id} ff_mode=${designJob.artifacts.ffMode}` : '等待创建优化任务'}</p>
              <p className="text-[#d32f2f]">[约束] 当前算法画像的工程约束被纳入同一设计任务上下文</p>
              <p className="text-[#333333]">[结果] {designJob ? '已生成可验证设计结果工件，可继续评审' : '尚无结果工件'}</p>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
