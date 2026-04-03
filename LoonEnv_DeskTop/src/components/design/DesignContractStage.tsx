import React from 'react';
import { CollapsibleSection } from '../CollapsibleSection';
import { DESIGN_ARTIFACTS, DESIGN_BACKEND_ENDPOINTS, DESIGN_JOB_STATES, DESIGN_WORKFLOW_RULES } from '../../data/design-contract';

export function DesignContractStage() {
  return (
    <div className="space-y-6">
      <CollapsibleSection title="设计工件 (Design Artifacts)" defaultOpen={false}>
        <div className="space-y-2">
          {DESIGN_ARTIFACTS.map((artifact) => (
            <div key={artifact.name} className="rounded-sm border border-[#e5e5e5] bg-white px-3 py-2.5">
              <p className="text-[11px] font-mono font-bold text-[#333333]">{artifact.name}</p>
              <p className="mt-1 text-[10px] text-[#6f6f6f]">{artifact.role}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="任务状态机 (Job State Machine)" defaultOpen={false}>
        <div className="space-y-2">
          {DESIGN_JOB_STATES.map((job) => (
            <div key={job.state} className="rounded-sm border border-[#e5e5e5] bg-white px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono font-bold text-[#333333]">{job.state}</span>
                <span className="text-[10px] text-[#6f6f6f]">{job.meaning}</span>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="前后端契约 (Backend Contract)" defaultOpen={false}>
        <div className="space-y-2">
          {DESIGN_BACKEND_ENDPOINTS.map((item) => (
            <div key={item.endpoint} className="rounded-sm border border-[#e5e5e5] bg-white px-3 py-2.5">
              <p className="text-[11px] font-mono font-bold text-[#333333]">{item.endpoint}</p>
              <p className="mt-1 text-[10px] text-[#6f6f6f]">{item.purpose}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="工作流复用规则 (Workflow Reuse Rules)" defaultOpen={false}>
        <div className="space-y-2">
          {DESIGN_WORKFLOW_RULES.map((rule) => (
            <div key={rule} className="rounded-sm border border-[#e5e5e5] bg-white px-3 py-2.5">
              <p className="text-[10px] text-[#6f6f6f]">{rule}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
