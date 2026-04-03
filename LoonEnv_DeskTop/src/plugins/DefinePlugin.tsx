import React, { useEffect, useState } from 'react';
import { Box, Settings, Layout, Upload, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { Plugin } from '../types';
import { cn } from '../lib/utils';
import { CollapsibleSection } from '../components/CollapsibleSection';
import {
  AVAILABLE_ROBOT_MODELS,
  ER15_EMBEDDED_ASSETS_LABEL,
  ER15_INPUT_SCHEMA,
  ER15_JOINT_CONFIGURATION,
  ER15_JOINT_LIMITS,
  ER15_MODEL_BOUNDARY,
  ER15_MODEL_NAME,
  ER15_OUTPUT_SCHEMA,
  ER15_RESOURCE_PATH,
  ER15_SHOWCASE_QPOS,
  ER15_TECH_STACK,
  createDefineArtifactFromRobotModel,
  getRobotAssetDefinition,
} from '../data/er15';

export const DefinePlugin: Plugin = {
  metadata: {
    id: 'define',
    name: '机器人定义模块',
    description: `加载并配置 ${ER15_MODEL_NAME} 工业机器人模型、关节约束与仿真场景初始条件。`,
    version: '1.1.0',
    author: 'LoongEnv Core'
  },
  icon: <Box className="w-5 h-5" />,
  stepTitle: '机器人定义与建模',
  techStack: [...ER15_TECH_STACK],
  inputSchema: ER15_INPUT_SCHEMA,
  outputSchema: ER15_OUTPUT_SCHEMA,
  component: ({ data, onAction }) => {
    const [activeStep, setActiveStep] = useState(1);
    const [robotModel, setRobotModel] = useState(ER15_MODEL_NAME);
    const [sourceType, setSourceType] = useState('内置模型资源 (Built-in Assets)');
    const [sourcePath, setSourcePath] = useState(ER15_RESOURCE_PATH);
    const [groundType, setGroundType] = useState('MuJoCo 蓝色棋盘反射地面');
    const [lightingType, setLightingType] = useState('MuJoCo 样例双方向光');
    const steps = [
      { id: 1, label: '模型源 (Model Source)', icon: <Upload className="w-3.5 h-3.5" /> },
      { id: 2, label: '物理参数 (Physics)', icon: <Settings className="w-3.5 h-3.5" /> },
      { id: 3, label: '场景配置 (Scene)', icon: <Layout className="w-3.5 h-3.5" /> },
    ];

    const robotDefinition = getRobotAssetDefinition(robotModel);

    useEffect(() => {
      const config = data.projectConfig?.define;
      if (!config) {
        return;
      }
      setRobotModel(config.robotModel);
      setSourceType(config.sourceType);
      setSourcePath(config.sourcePath);
      setGroundType(config.ground);
      setLightingType(config.lighting);
    }, [data.projectConfig?.define]);

    const emitDefineArtifact = () => {
      onAction('DEFINE_ARTIFACT_UPDATED', createDefineArtifactFromRobotModel(robotModel, {
        sourceType,
        sourcePath,
        ground: groundType,
        lighting: lightingType,
      }));
    };

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
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          {activeStep === 1 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <CollapsibleSection title="模型配置 (Model Configuration)" defaultOpen>
                <div className="space-y-1 border border-[#e5e5e5] rounded-sm overflow-hidden divide-y divide-[#f3f3f3]">
                  <div className="flex items-center py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <span className="w-1/3 text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">机器人型号</span>
                    <div className="w-2/3">
                      <select
                        value={robotModel}
                        onChange={(event) => {
                          const nextRobotModel = event.target.value;
                          setRobotModel(nextRobotModel);
                          const nextDefinition = getRobotAssetDefinition(nextRobotModel);
                          setSourcePath(nextDefinition.resourcePath);
                        }}
                        className="w-full bg-transparent text-[11px] outline-none cursor-pointer text-[#333333] font-medium"
                      >
                        {AVAILABLE_ROBOT_MODELS.map((name) => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <span className="w-1/3 text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">来源类型</span>
                    <div className="w-2/3">
                      <select
                        value={sourceType}
                        onChange={(event) => setSourceType(event.target.value)}
                        className="w-full bg-transparent text-[11px] outline-none cursor-pointer text-[#333333] font-medium"
                      >
                        <option>内置模型资源 (Built-in Assets)</option>
                        <option>本地文件 (.xml, .urdf)</option>
                        <option>云端仓库</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <span className="w-1/3 text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">文件路径</span>
                    <div className="w-2/3 flex gap-2">
                      <input 
                        type="text" 
                        value={sourcePath}
                        onChange={(event) => setSourcePath(event.target.value)}
                        className="flex-1 bg-transparent text-[11px] outline-none text-[#333333] font-mono"
                      />
                      <button className="text-[10px] text-[#007acc] hover:underline font-bold uppercase tracking-wider">定位 (Open)</button>
                    </div>
                  </div>
                  <div className="flex items-center py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <span className="w-1/3 text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">关节配置</span>
                    <span className="w-2/3 text-[11px] text-[#333333] font-medium">{robotDefinition.jointConfiguration}</span>
                  </div>
                  <div className="flex items-center py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <span className="w-1/3 text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">模型边界</span>
                    <span className="w-2/3 text-[11px] text-[#333333] font-medium">{robotDefinition.modelBoundary}</span>
                  </div>
                </div>
              </CollapsibleSection>
              
              <CollapsibleSection title="定义工件 (Define Artifact)" defaultOpen>
                <div className="rounded-sm border border-[#e5e5e5] bg-[#f8fafc] px-3 py-3 text-[11px] text-[#526070] space-y-1.5">
                  <div><span className="font-bold text-[#333333]">模型:</span> {robotModel}</div>
                  <div><span className="font-bold text-[#333333]">来源:</span> {sourceType}</div>
                  <div><span className="font-bold text-[#333333]">路径:</span> <span className="font-mono">{sourcePath}</span></div>
                  <div><span className="font-bold text-[#333333]">资产:</span> {robotDefinition.embeddedAssetsLabel}</div>
                  <div><span className="font-bold text-[#333333]">输出目的:</span> 为 Design 阶段提供可复用的机器人定义工件</div>
                </div>
              </CollapsibleSection>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <CollapsibleSection title="全局物理参数 (Global Physics)" defaultOpen>
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
                  <div className="flex items-center py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <span className="w-1/2 text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">关节角限制</span>
                    <span className="w-1/2 text-right text-[11px] text-[#333333] font-mono">J1 ~ J6 已写入 MJCF</span>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="关节约束 (Joint Limits)" defaultOpen>
                <div className="overflow-hidden rounded-sm border border-[#e5e5e5] bg-white shadow-sm">
                  <div className="grid grid-cols-[72px_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b border-[#e5e5e5] bg-[#f8fafc] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#6f6f6f]">
                    <span>关节</span>
                    <span>位置限制</span>
                    <span>速度限制</span>
                    <span>力矩限制</span>
                  </div>
                  {robotDefinition.jointLimits.map((limit) => (
                    <div
                      key={limit.joint}
                      className="grid grid-cols-[72px_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b border-[#f1f5f9] px-3 py-2.5 text-[11px] last:border-b-0 hover:bg-[#f9fbfd]"
                    >
                      <span className="font-mono font-bold text-[#333333]">{limit.joint}</span>
                      <span className="font-mono text-[#333333]">{limit.position}</span>
                      <span className="font-mono text-[#6f6f6f]">{limit.velocity}</span>
                      <span className="font-mono text-[#6f6f6f]">{limit.torque}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-[#6f6f6f]">
                  说明: 位置限制来自当前 ER15 MJCF/URDF。速度与力矩上限在现有导出文件中为 0，暂按“未提供”处理，后续建议补充厂家额定参数后再用于控制器与动力学约束。
                </p>
              </CollapsibleSection>

            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <CollapsibleSection title="环境配置 (Environment)" defaultOpen>
                <div className="space-y-1 border border-[#e5e5e5] rounded-sm overflow-hidden divide-y divide-[#f3f3f3]">
                  <div className="flex items-center py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <span className="w-1/3 text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">地面类型</span>
                    <div className="w-2/3">
                      <select
                        value={groundType}
                        onChange={(event) => setGroundType(event.target.value)}
                        className="w-full bg-transparent text-[11px] outline-none cursor-pointer text-[#333333] font-medium"
                      >
                        <option>MuJoCo 蓝色棋盘反射地面</option>
                        <option>无限网格</option>
                        <option>实验室地面</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <span className="w-1/3 text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">光照配置</span>
                    <div className="w-2/3">
                      <select
                        value={lightingType}
                        onChange={(event) => setLightingType(event.target.value)}
                        className="w-full bg-transparent text-[11px] outline-none cursor-pointer text-[#333333] font-medium"
                      >
                        <option>MuJoCo 样例双方向光</option>
                        <option>摄影棚 (默认)</option>
                        <option>高对比度</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center py-2.5 px-3 hover:bg-[#f9f9f9] transition-colors group">
                    <span className="w-1/3 text-[11px] text-[#6f6f6f] group-hover:text-[#333333]">展示姿态</span>
                    <span className="w-2/3 text-[11px] text-[#333333] font-medium">{robotDefinition.modelName} Showcase QPos 已预置: [{robotDefinition.showcaseQpos.join(', ')}]</span>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="场景摘要 (Scene Summary)" defaultOpen>
                <div className="rounded-sm border border-[#e5e5e5] bg-[#f8fafc] px-3 py-3 text-[11px] text-[#526070] space-y-1.5">
                  <div><span className="font-bold text-[#333333]">地面:</span> {groundType}</div>
                  <div><span className="font-bold text-[#333333]">光照:</span> {lightingType}</div>
                  <div><span className="font-bold text-[#333333]">展示姿态:</span> ER15 Showcase QPos 已预置</div>
                  <div><span className="font-bold text-[#333333]">场景用途:</span> 为算法测试运行和后续优化提供统一仿真场景。</div>
                </div>
              </CollapsibleSection>
            </motion.div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-4 border-t border-[#e5e5e5] bg-[#f3f3f3] shrink-0">
          <button 
            onClick={() => {
              emitDefineArtifact();
              onAction('COMPLETE', 'DEFINE_FINISHED');
            }}
            className="w-full bg-[#007acc] hover:bg-[#0062a3] text-white py-2 text-[11px] font-bold uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] rounded-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> 初始化仿真 (Initialize Simulation)
          </button>
        </div>
      </div>
    );
  }
};
