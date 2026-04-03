import React from 'react';
import { Gauge, PlayCircle } from 'lucide-react';
import { CollapsibleSection } from '../CollapsibleSection';
import type { DesignJob, PluginData } from '../../types';

export function DesignTestRunStage({ designJob, data }: { designJob?: DesignJob; data?: PluginData }) {
  const algorithm = data?.selectedDesignAlgorithm;
  const currentState = designJob?.state ?? 'draft';
  const currentStage = designJob?.currentStage ?? '等待测试运行';

  return (
    <div className="space-y-6">
      <CollapsibleSection title="测试运行说明" defaultOpen>
        <div className="rounded-sm border border-[#e5e5e5] bg-[#f8fafc] px-3 py-3">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-[#007acc]" />
            <span className="text-[11px] font-bold text-[#333333]">测试运行</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-[#526070]">
            启动后，系统会先按当前算法与参数进行最小可运行测试，确认后端模块、模型和任务工况是联通的，再进入性能优化。
          </p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="当前状态" defaultOpen>
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-sm border border-[#e5e5e5] bg-white px-3 py-3 text-[11px] text-[#526070] space-y-1.5">
            <div><span className="font-bold text-[#333333]">算法:</span> {algorithm?.name ?? '未选择'}</div>
            <div><span className="font-bold text-[#333333]">任务状态:</span> {currentState}</div>
            <div><span className="font-bold text-[#333333]">当前阶段:</span> {currentStage}</div>
          </div>
        </div>
      </CollapsibleSection>

      <details className="rounded-sm border border-[#e5e5e5] bg-white">
        <summary className="cursor-pointer px-3 py-2 text-[11px] font-bold text-[#333333]">更多信息</summary>
        <div className="border-t border-[#f3f3f3] px-3 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-4 h-4 text-[#007acc]" />
            <span className="text-[11px] font-bold text-[#333333]">预期输出</span>
          </div>
          <div className="space-y-1 text-[11px] text-[#526070]">
            <p>1. 后端算法模块可正常启动</p>
            <p>2. 基本仿真链路可跑通</p>
            <p>3. 进入性能优化前已有初步可用结果</p>
          </div>
        </div>
      </details>
    </div>
  );
}
