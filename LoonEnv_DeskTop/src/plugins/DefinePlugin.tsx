import React, { useState } from 'react';
import { Box, Settings, Layout, ChevronRight, ChevronLeft, CheckCircle2, Upload, Database, Plus, X, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { Plugin } from '../types';
import { cn } from '../lib/utils';

export const DefinePlugin: Plugin = {
  metadata: {
    id: 'define',
    name: '机器人定义模块',
    description: '定义机器人结构、传感器配置及任务目标。',
    version: '1.0.0',
    author: 'LoongEnv Core'
  },
  icon: <Box className="w-5 h-5" />,
  stepTitle: '机器人定义与建模',
  techStack: ['URDF', 'MuJoCo WASM', 'Three.js'],
  inputSchema: { type: 'URDF/MJCF', format: 'XML' },
  outputSchema: { type: 'SceneGraph', format: 'JSON' },
  component: ({ data, onAction }) => {
    const [activeStep, setActiveStep] = useState(1);
    const steps = [
      { id: 1, label: '模型源 (Model Source)', icon: <Upload className="w-3.5 h-3.5" /> },
      { id: 2, label: '物理参数 (Physics)', icon: <Settings className="w-3.5 h-3.5" /> },
      { id: 3, label: '场景配置 (Scene)', icon: <Layout className="w-3.5 h-3.5" /> },
    ];

    return (
      <div className="flex flex-col h-full bg-white text-[#333333] select-none">
        {/* VSCode-style Step Navigation */}
        <div className="flex items-center px-2 bg-[#f3f3f3] border-b border-[#e5e5e5] shrink-0 overflow-x-auto no-scrollbar">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={cn(
                "px-4 py-2.5 text-[11px] font-medium transition-all relative whitespace-nowrap flex items-center gap-2",
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
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          {activeStep === 1 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <section>
                <h3 className="text-[10px] font-bold text-[#6f6f6f] uppercase tracking-wider mb-3 px-1">模型配置 (Model Configuration)</h3>
                <div className="space-y-1 border border-[#e5e5e5] rounded-sm overflow-hidden divide-y divide-[#f3f3f3]">
                  <div className="flex items-center py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <span className="w-1/3 text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">来源类型</span>
                    <div className="w-2/3">
                      <select className="w-full bg-transparent text-[11px] outline-none cursor-pointer text-[#333333] font-medium">
                        <option>本地文件 (.xml, .urdf)</option>
                        <option>云端仓库</option>
                        <option>程序化生成</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <span className="w-1/3 text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">文件路径</span>
                    <div className="w-2/3 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="/models/robot_arm.urdf"
                        className="flex-1 bg-transparent text-[11px] outline-none text-[#333333] font-mono"
                      />
                      <button className="text-[10px] text-[#007acc] hover:underline font-bold uppercase tracking-wider">浏览 (Browse)</button>
                    </div>
                  </div>
                </div>
              </section>
              
              <section>
                <h3 className="text-[10px] font-bold text-[#6f6f6f] uppercase tracking-wider mb-3 px-1">资产管理 (Asset Management)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center justify-center gap-2 p-4 border border-[#e5e5e5] hover:border-[#007acc] hover:bg-[#f0f7ff] transition-all group rounded-sm shadow-sm">
                    <Upload className="w-5 h-5 text-[#6f6f6f] group-hover:text-[#007acc]" />
                    <span className="text-[10px] font-bold text-[#6f6f6f] group-hover:text-[#333333] uppercase tracking-wider">上传 URDF</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 p-4 border border-[#e5e5e5] hover:border-[#007acc] hover:bg-[#f0f7ff] transition-all group rounded-sm shadow-sm">
                    <Box className="w-5 h-5 text-[#6f6f6f] group-hover:text-[#007acc]" />
                    <span className="text-[10px] font-bold text-[#6f6f6f] group-hover:text-[#333333] uppercase tracking-wider">模型库 (Mesh Library)</span>
                  </button>
                </div>
              </section>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <section>
                <h3 className="text-[10px] font-bold text-[#6f6f6f] uppercase tracking-wider mb-3 px-1">全局物理参数 (Global Physics)</h3>
                <div className="space-y-1 border border-[#e5e5e5] rounded-sm overflow-hidden divide-y divide-[#f3f3f3]">
                  <div className="flex items-center py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <span className="w-1/2 text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">重力 (Gravity, m/s²)</span>
                    <input type="number" defaultValue={-9.81} className="w-1/2 bg-transparent text-[11px] text-right outline-none text-[#333333] font-mono" />
                  </div>
                  <div className="flex items-center py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <span className="w-1/2 text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">时间步长 (Time Step, s)</span>
                    <input type="number" defaultValue={0.002} className="w-1/2 bg-transparent text-[11px] text-right outline-none text-[#333333] font-mono" />
                  </div>
                  <div className="flex items-center py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <span className="w-1/2 text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">求解器迭代次数</span>
                    <input type="number" defaultValue={50} className="w-1/2 bg-transparent text-[11px] text-right outline-none text-[#333333] font-mono" />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-bold text-[#6f6f6f] uppercase tracking-wider mb-3 px-1">材料属性 (Material Properties)</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-white border border-[#e5e5e5] rounded-sm hover:border-[#007acc] cursor-pointer transition-all group shadow-sm">
                    <div className="w-3.5 h-3.5 bg-blue-500 rounded-sm shadow-sm" />
                    <span className="text-[11px] text-[#333333] flex-1 font-medium">钢材 (高摩擦)</span>
                    <Settings className="w-3.5 h-3.5 text-[#6f6f6f] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-white border border-[#e5e5e5] rounded-sm hover:border-[#007acc] cursor-pointer transition-all group shadow-sm">
                    <div className="w-3.5 h-3.5 bg-slate-400 rounded-sm shadow-sm" />
                    <span className="text-[11px] text-[#333333] flex-1 font-medium">橡胶 (弹性)</span>
                    <Settings className="w-3.5 h-3.5 text-[#6f6f6f] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <section>
                <h3 className="text-[10px] font-bold text-[#6f6f6f] uppercase tracking-wider mb-3 px-1">环境配置 (Environment)</h3>
                <div className="space-y-1 border border-[#e5e5e5] rounded-sm overflow-hidden divide-y divide-[#f3f3f3]">
                  <div className="flex items-center py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <span className="w-1/3 text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">地面类型</span>
                    <div className="w-2/3">
                      <select className="w-full bg-transparent text-[11px] outline-none cursor-pointer text-[#333333] font-medium">
                        <option>无限网格</option>
                        <option>实验室地面</option>
                        <option>户外地形</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <span className="w-1/3 text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">光照配置</span>
                    <div className="w-2/3">
                      <select className="w-full bg-transparent text-[11px] outline-none cursor-pointer text-[#333333] font-medium">
                        <option>摄影棚 (默认)</option>
                        <option>日光</option>
                        <option>高对比度</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-bold text-[#6f6f6f] uppercase tracking-wider mb-3 px-1">场景对象 (Scene Objects)</h3>
                <div className="border border-[#e5e5e5] rounded-sm divide-y divide-[#f3f3f3] shadow-sm overflow-hidden">
                  {['Table_01', 'Obstacle_Box', 'Camera_Rig'].map(obj => (
                    <div key={obj} className="flex items-center justify-between px-3 py-2.5 hover:bg-[#f9f9f9] cursor-pointer group transition-colors">
                      <div className="flex items-center gap-3">
                        <Box className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[11px] text-[#333333] font-medium">{obj}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Settings className="w-3 h-3 text-[#6f6f6f] hover:text-[#333333]" />
                        <X className="w-3 h-3 text-[#6f6f6f] hover:text-red-500" />
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-2.5 text-[10px] text-[#007acc] hover:bg-[#f0f7ff] flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors">
                    <Plus className="w-3.5 h-3.5" /> 添加对象 (Add Object)
                  </button>
                </div>
              </section>
            </motion.div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-4 border-t border-[#e5e5e5] bg-[#f3f3f3] shrink-0">
          <button 
            onClick={() => onAction('COMPLETE', 'DEFINE_FINISHED')}
            className="w-full bg-[#007acc] hover:bg-[#0062a3] text-white py-2 text-[11px] font-bold uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] rounded-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> 初始化仿真 (Initialize Simulation)
          </button>
        </div>
      </div>
    );
  }
};
