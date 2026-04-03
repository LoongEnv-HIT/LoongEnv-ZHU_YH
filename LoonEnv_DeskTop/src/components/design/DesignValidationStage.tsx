import React from 'react';
import { BarChart3, CheckCircle2, XCircle } from 'lucide-react';
import { CollapsibleSection } from '../CollapsibleSection';
import type { DesignJob, PluginData } from '../../types';

function parseMetricValue(raw: string) {
  const match = raw.match(/-?\d+(\.\d+)?([eE][+-]?\d+)?/);
  return match ? Number(match[0]) : Number.NaN;
}

export function DesignValidationStage({ designJob, data }: { designJob?: DesignJob; data?: PluginData }) {
  const algorithm = data?.selectedDesignAlgorithm;
  const validationGates = algorithm?.validationGates ?? [];
  const metrics = new Map((designJob?.metrics ?? []).map((metric) => [metric.name, parseMetricValue(metric.value)]));
  const acceptanceChecks = [
    {
      label: '误差验收',
      value: metrics.get('e_max'),
      pass: (metrics.get('e_max') ?? Number.POSITIVE_INFINITY) <= 0.05,
      summary: 'e_max <= 0.05 m',
    },
    {
      label: '振动验收',
      value: metrics.get('vib_energy'),
      pass: (metrics.get('vib_energy') ?? Number.POSITIVE_INFINITY) <= 0.2,
      summary: 'vib_energy <= 0.20',
    },
    {
      label: '能耗验收',
      value: metrics.get('energy'),
      pass: (metrics.get('energy') ?? Number.POSITIVE_INFINITY) <= 1.0,
      summary: 'energy <= 1.00',
    },
  ];
  const availableChecks = acceptanceChecks.filter((check) => Number.isFinite(check.value ?? Number.NaN));
  const accepted = designJob?.state === 'validated' && availableChecks.length > 0 && availableChecks.every((check) => check.pass);

  return (
    <div className="space-y-6 flex flex-col items-center py-2">
      <CollapsibleSection title="算法验收结果" defaultOpen className="w-full">
        <div className="flex flex-col items-center text-center space-y-4 py-2">
          <div className="w-16 h-16 bg-[#f3f3f3] rounded-full flex items-center justify-center text-[#007acc] shadow-inner border border-[#e5e5e5]">
            {accepted ? <CheckCircle2 className="w-8 h-8 text-[#388a3c]" /> : <XCircle className="w-8 h-8 text-[#d32f2f]" />}
          </div>
          <div className="text-center">
            <h4 className="text-sm font-bold text-[#333333]">算法验收结论</h4>
            <p className="text-[11px] text-[#6f6f6f] max-w-[280px] mx-auto mt-2 leading-relaxed">
              {designJob
                ? `当前任务 ${designJob.id} 的算法画像为“${algorithm?.name ?? '后端算法'}”。系统已根据关键性能指标执行定量验收，当前结论为：${accepted ? '通过验收' : '未通过验收'}。`
                : '运行完成后，这里会基于误差、振动、能耗等关键指标给出定量验收结论。'}
            </p>
            {designJob?.executionRobotModel && (
              <p className="mt-2 text-[10px] text-[#526070]">
                实际执行机器人: {designJob.executionRobotModel}
              </p>
            )}
            {designJob?.resolvedMjcfPath && (
              <p className="mt-1 text-[10px] text-[#6f6f6f] break-all">
                MJCF: {designJob.resolvedMjcfPath}
              </p>
            )}
          </div>
          <div className="w-full space-y-2">
            {availableChecks.map((check) => (
              <div key={check.label} className="rounded-sm border border-[#e5e5e5] bg-white px-3 py-2.5 text-left">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-bold text-[#333333]">{check.label}</span>
                  <span className={check.pass ? 'text-[10px] font-bold text-[#388a3c]' : 'text-[10px] font-bold text-[#d32f2f]'}>
                    {check.pass ? '通过' : '未通过'}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-[#6f6f6f]">规则: {check.summary}</p>
                <p className="mt-1 text-[10px] text-[#526070]">结果: {Number.isFinite(check.value ?? Number.NaN) ? Number(check.value).toFixed(4) : '无数据'}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 w-full max-w-[240px]">
            <button className="flex-1 py-1.5 bg-white border border-[#e5e5e5] text-[11px] font-bold text-[#333333] hover:bg-[#f8f8f8] rounded-sm transition-colors uppercase tracking-wider">查看工件</button>
            <button className="flex-1 py-1.5 bg-[#007acc] text-white text-[11px] font-bold hover:bg-[#005fb8] rounded-sm transition-colors shadow-sm uppercase tracking-wider">
              {accepted ? '通过验收' : designJob?.state === 'validated' || designJob?.state === 'exported' ? '待复核' : '等待运行完成'}
            </button>
          </div>
        </div>
      </CollapsibleSection>

      <details className="w-full rounded-sm border border-[#e5e5e5] bg-white">
        <summary className="cursor-pointer px-3 py-2 text-[11px] font-bold text-[#333333]">更多细节</summary>
        <div className="border-t border-[#f3f3f3] px-3 py-3 space-y-2">
          {validationGates.map((gate) => (
            <div key={gate} className="rounded-sm border border-[#e5e5e5] bg-[#fafafa] px-3 py-2.5 text-[11px] text-[#333333]">
              {gate}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
