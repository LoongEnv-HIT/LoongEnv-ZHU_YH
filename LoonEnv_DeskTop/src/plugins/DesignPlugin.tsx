import React, { useState } from 'react';
import { BrainCircuit, Play, Search, Gauge, Activity, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { Plugin } from '../types';
import { cn } from '../lib/utils';
import { DESIGN_INPUT_SCHEMA, DESIGN_OUTPUT_SCHEMA, DESIGN_STEPS, DESIGN_TECH_STACK } from '../data/design-workflow';
import { DesignOptimizationStage } from '../components/design/DesignOptimizationStage';
import { DesignSynthesisStage } from '../components/design/DesignSynthesisStage';
import { DesignTestRunStage } from '../components/design/DesignTestRunStage';
import { DesignValidationStage } from '../components/design/DesignValidationStage';

export const DesignPlugin: Plugin = {
  metadata: {
    id: 'design',
    name: '控制算法正向设计',
    description: '以算法合成、参数优化、验证评审为主线，支持将 PerOpt 的前馈+反馈设计与优化作为样例工作流。',
    version: '1.3.0',
    author: 'LoongEnv Design'
  },
  icon: <BrainCircuit className="w-5 h-5" />,
  stepTitle: '控制算法正向设计',
  techStack: [...DESIGN_TECH_STACK],
  inputSchema: DESIGN_INPUT_SCHEMA,
  outputSchema: DESIGN_OUTPUT_SCHEMA,
  component: ({ data, onAction }) => {
    const [activeStep, setActiveStep] = useState(1);
    const algorithmReady = Boolean(data.selectedDesignAlgorithm);
    const steps = [
      { ...DESIGN_STEPS[0], icon: <Search className="w-3.5 h-3.5" /> },
      { ...DESIGN_STEPS[1], icon: <Gauge className="w-3.5 h-3.5" /> },
      { ...DESIGN_STEPS[2], icon: <Activity className="w-3.5 h-3.5" /> },
      { ...DESIGN_STEPS[3], icon: <BarChart3 className="w-3.5 h-3.5" /> },
    ];

    return (
      <div className="flex flex-col h-full bg-white text-[#333333] select-none">
        <div className="grid grid-cols-4 px-2 bg-[#f3f3f3] border-b border-[#e5e5e5] shrink-0 gap-1">
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

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 pb-24 space-y-6">
          {activeStep === 1 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              <DesignSynthesisStage data={data} onAction={onAction} />
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              <DesignTestRunStage designJob={data.designJob} data={data} />
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              <DesignOptimizationStage designJob={data.designJob} data={data} />
            </motion.div>
          )}

          {activeStep === 4 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              <DesignValidationStage designJob={data.designJob} data={data} />
            </motion.div>
          )}
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-0 z-10 p-4 border-t border-[#e5e5e5] bg-[#f3f3f3]/95 backdrop-blur-sm shrink-0">
          <button 
            disabled={!algorithmReady}
            onClick={() => onAction('START_DESIGN_FLOW')}
            className={cn(
              "w-full py-2 text-[11px] font-bold uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-2 rounded-sm",
              algorithmReady
                ? "bg-[#007acc] hover:bg-[#0062a3] text-white active:scale-[0.98]"
                : "bg-[#cfd8e3] text-white cursor-not-allowed"
            )}
          >
            <Play className="w-3.5 h-3.5 fill-current" /> {algorithmReady ? '启动算法设计流程 (Start Design Flow)' : '等待后端算法目录'}
          </button>
        </div>
      </div>
    );
  }
};
