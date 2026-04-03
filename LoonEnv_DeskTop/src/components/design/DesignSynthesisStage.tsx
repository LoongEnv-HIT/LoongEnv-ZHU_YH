import React from 'react';
import { CheckCircle2, Route } from 'lucide-react';
import { CollapsibleSection } from '../CollapsibleSection';
import type { PluginData } from '../../types';

export function DesignSynthesisStage({
  data,
  onAction,
}: {
  data?: PluginData;
  onAction?: (action: string, payload?: unknown) => void;
}) {
  const algorithm = data?.selectedDesignAlgorithm;
  const module = data?.selectedDesignModule;
  const modules = data?.availableDesignModules ?? [];
  const categories = module
    ? Array.from(new Map(module.algorithms.map((item) => [item.categoryId, { id: item.categoryId, label: item.categoryLabel }])).values())
    : [];
  const selectedCategoryId = algorithm?.categoryId ?? categories[0]?.id ?? '';
  const algorithms = module?.algorithms.filter((item) => item.categoryId === selectedCategoryId) ?? [];

  return (
    <div className="space-y-6">
      <CollapsibleSection title="选择算法" defaultOpen>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-[#6f6f6f] uppercase block mb-2 tracking-widest">后端算法库模块</span>
            <select
              value={module?.id ?? ''}
              onChange={(event) => onAction?.('SELECT_ALGORITHM_MODULE', event.target.value)}
              className="w-full rounded-sm border border-[#d7e3f0] bg-white px-3 py-2 text-[11px] text-[#333333] outline-none"
            >
              {modules.length === 0 && <option value="">等待后端目录</option>}
              {modules.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#6f6f6f] uppercase block mb-2 tracking-widest">算法类别</span>
            <select
              value={selectedCategoryId}
              onChange={(event) => onAction?.('SELECT_ALGORITHM_CATEGORY', event.target.value)}
              className="w-full rounded-sm border border-[#d7e3f0] bg-white px-3 py-2 text-[11px] text-[#333333] outline-none"
            >
              {categories.length === 0 && <option value="">等待后端目录</option>}
              {categories.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#6f6f6f] uppercase block mb-2 tracking-widest">具体算法</span>
            <select
              value={algorithm?.id ?? ''}
              onChange={(event) => onAction?.('SELECT_ALGORITHM', event.target.value)}
              className="w-full rounded-sm border border-[#d7e3f0] bg-white px-3 py-2 text-[11px] text-[#333333] outline-none"
            >
              {algorithms.length === 0 && <option value="">等待后端目录</option>}
              {algorithms.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="当前选择" defaultOpen>
        <div className="rounded-sm border border-[#e5e5e5] bg-[#f8fafc] px-3 py-3">
          <div className="flex items-center gap-2">
            <Route className="w-4 h-4 text-[#007acc]" />
            <span className="text-[11px] font-bold text-[#333333]">{algorithm?.name ?? '等待后端算法目录'}</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-[#5b6675]">
            {algorithm?.whyItMatters ?? '前端不定义算法，只展示后端算法库返回的算法说明和工作流模板。'}
          </p>
          <div className="mt-3 space-y-1 text-[10px] text-[#5b6675]">
            <div><span className="font-bold text-[#333333]">算法库模块:</span> {module?.name ?? '未连接'}</div>
            <div><span className="font-bold text-[#333333]">算法族:</span> {algorithm?.family ?? '未选择'}</div>
            <div><span className="font-bold text-[#333333]">任务类型:</span> {algorithm?.taskType ?? '未选择'}</div>
            <div><span className="font-bold text-[#333333]">候选结构:</span> {algorithm?.candidateStructure ?? '未选择'}</div>
            <div><span className="font-bold text-[#333333]">算法库模块:</span> {module?.name ?? '未连接'}</div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="下一步做什么" defaultOpen>
        <div className="rounded-sm border border-[#e5e5e5] bg-white px-3 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#007acc]" />
            <span className="text-[11px] font-bold text-[#333333]">进入“配置参数”</span>
          </div>
          <div className="mt-2 space-y-1 text-[11px] text-[#526070]">
            <p>1. 确认当前算法和任务是否匹配。</p>
            <p>2. 检查机器人模型与工况输入是否正确。</p>
            <p>3. 然后进入下一步开始配置参数并准备测试运行。</p>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
