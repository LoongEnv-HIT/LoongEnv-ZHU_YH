/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  LayoutDashboard, 
  Play, 
  Settings, 
  ShieldAlert, 
  Zap, 
  ArrowRight, 
  Code, 
  Terminal, 
  Layers,
  Upload,
  BrainCircuit,
  ChevronRight,
  ChevronLeft,
  Monitor,
  Box,
  CheckCircle2,
  Puzzle,
  Menu,
  X,
  Plus,
  ExternalLink,
  Info,
  Files,
  Search,
  GitBranch,
  PlayCircle,
  Package,
  UserCircle,
  Bell,
  Split,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- Types ---
import { DefineArtifact, DesignAlgorithmModule, DesignJob, Plugin, PluginData, ProjectConfig, RuntimeLogEntry } from './types';

// --- Plugins ---
import { DefinePlugin } from './plugins/DefinePlugin';
import { DesignPlugin } from './plugins/DesignPlugin';
import { DeployPlugin } from './plugins/DeployPlugin';
import { DiagnosePlugin } from './plugins/DiagnosePlugin';

// --- New Components ---
import { SimulationView } from './components/SimulationView';
import { SystemMonitor } from './components/SystemMonitor';
import { createDefaultEr15DefineArtifact } from './data/er15';
import type { Er15Replay } from './data/er15Replay';
import { buildDefineArtifact, DEFAULT_PROJECT_CONFIG } from './data/projectConfig';
import { createDesignApi } from './services/designApi';

// --- Utility ---

// 插件注册表
const PLUGIN_REGISTRY: Plugin[] = [
  DefinePlugin,
  DesignPlugin,
  DeployPlugin,
  DiagnosePlugin
];

// --- Components ---

interface TechBadgeProps {
  name: string;
}

const TechBadge: React.FC<TechBadgeProps> = ({ name }) => (
  <span className="px-1 py-0.5 bg-[#f3f3f3] text-[#6f6f6f] border border-[#e5e5e5] rounded-sm text-[10px] font-mono">
    {name}
  </span>
);

interface SchemaCardProps {
  title: string;
  data: any;
}

const SchemaCard: React.FC<SchemaCardProps> = ({ title, data }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-1">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-0.5 cursor-pointer hover:bg-[#e8e8e8] transition-colors"
      >
        <ChevronRight className={cn("w-3 h-3 text-[#6f6f6f] transition-transform", isOpen && "rotate-90")} />
        <span className="text-[10px] font-bold text-[#6f6f6f] uppercase tracking-wider">{title}</span>
      </div>
      {isOpen && (
        <div className="pl-6 pr-2 py-1 bg-[#f9f9f9] border-l border-[#e5e5e5] ml-3 mt-0.5">
          <pre className="text-[10px] font-mono text-[#6f6f6f] overflow-x-auto custom-scrollbar leading-relaxed">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

const SIDEBAR_DEFAULT_WIDTH = 560;
const SIDEBAR_MIN_WIDTH = 380;
const SIDEBAR_MAX_WIDTH = 560;
const BOTTOM_PANEL_DEFAULT_HEIGHT = 160;
const BOTTOM_PANEL_MIN_HEIGHT = 120;
const BOTTOM_PANEL_MAX_HEIGHT = 280;
const VS_CODE_MENUS = ['文件', '编辑', '选择', '视图', '转到', '运行', '终端', '帮助'] as const;

type DragState =
  | { type: 'sidebar'; startPos: number; startValue: number }
  | { type: 'bottom'; startPos: number; startValue: number }
  | null;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function App() {
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>(DEFAULT_PROJECT_CONFIG);
  const [activeModuleId, setActiveModuleId] = useState('define');
  const [showCore, setShowCore] = useState(false);
  const [showPluginManager, setShowPluginManager] = useState(false);
  const [isSideBarVisible, setIsSideBarVisible] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(BOTTOM_PANEL_DEFAULT_HEIGHT);
  const [dragState, setDragState] = useState<DragState>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [defineArtifact, setDefineArtifact] = useState<DefineArtifact>(createDefaultEr15DefineArtifact);
  const [designJob, setDesignJob] = useState<DesignJob>();
  const [algorithmModules, setAlgorithmModules] = useState<readonly DesignAlgorithmModule[]>([]);
  const [selectedAlgorithmModuleId, setSelectedAlgorithmModuleId] = useState<string>();
  const [selectedAlgorithmCategoryId, setSelectedAlgorithmCategoryId] = useState<string>();
  const [selectedAlgorithmId, setSelectedAlgorithmId] = useState<string>();
  const [simulationReplay, setSimulationReplay] = useState<Er15Replay>();
  const replayedJobIdsRef = useRef<Set<string>>(new Set());
  const [runtimeLogs, setRuntimeLogs] = useState<RuntimeLogEntry[]>([
    { id: 'log-boot-1', timestamp: '09:42:15', level: 'INFO', message: 'MuJoCo WASM 引擎初始化成功。' },
    { id: 'log-boot-2', timestamp: '09:42:16', level: 'INFO', message: 'Design 模块已加载，等待 Define 工件输入。' },
  ]);
  const appendRuntimeLog = (level: RuntimeLogEntry['level'], message: string) => {
    const now = new Date();
    const timestamp = now.toTimeString().slice(0, 8);
    setRuntimeLogs((current) => [
      ...current.slice(-79),
      { id: `log-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, timestamp, level, message },
    ]);
  };
  const [designApi] = useState(() => createDesignApi((level, message) => appendRuntimeLog(level, message)));
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const activePlugin = PLUGIN_REGISTRY.find(p => p.metadata.id === activeModuleId) || PLUGIN_REGISTRY[0];
  const selectedAlgorithmModule = algorithmModules.find((module) => module.id === selectedAlgorithmModuleId) ?? algorithmModules[0];
  const availableCategories = selectedAlgorithmModule
    ? Array.from(
        new Map(
          selectedAlgorithmModule.algorithms.map((algorithm) => [
            algorithm.categoryId,
            { id: algorithm.categoryId, label: algorithm.categoryLabel },
          ]),
        ).values(),
      )
    : [];
  const effectiveCategoryId = selectedAlgorithmCategoryId ?? availableCategories[0]?.id;
  const categoryAlgorithms = selectedAlgorithmModule?.algorithms.filter((algorithm) => algorithm.categoryId === effectiveCategoryId) ?? [];
  const selectedDesignAlgorithm = categoryAlgorithms.find((algorithm) => algorithm.id === selectedAlgorithmId) ?? categoryAlgorithms[0];
  const pluginData: PluginData = {
    defineArtifact,
    designJob,
    projectConfig,
    availableDesignModules: algorithmModules,
    selectedDesignModule: selectedAlgorithmModule,
    selectedDesignAlgorithm,
  };

  useEffect(() => {
    if (!dragState) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (dragState.type === 'sidebar') {
        const maxWidth = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, window.innerWidth - 320));
        setSidebarWidth(clamp(dragState.startValue + event.clientX - dragState.startPos, SIDEBAR_MIN_WIDTH, maxWidth));
        return;
      }

      const maxHeight = Math.min(BOTTOM_PANEL_MAX_HEIGHT, Math.max(BOTTOM_PANEL_MIN_HEIGHT, Math.floor(window.innerHeight * 0.45)));
      setBottomPanelHeight(clamp(dragState.startValue - (event.clientY - dragState.startPos), BOTTOM_PANEL_MIN_HEIGHT, maxHeight));
    };

    const handleMouseUp = () => setDragState(null);
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = dragState.type === 'sidebar' ? 'ew-resize' : 'ns-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    handleFullscreenChange();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    void designApi.fetchAlgorithmCatalog(defineArtifact.robotModel).then((modules) => {
      setAlgorithmModules(modules);
      const nextModule = modules.find((module) => module.id === selectedAlgorithmModuleId) ?? modules[0];
      if (!nextModule) {
        setSelectedAlgorithmModuleId(undefined);
        setSelectedAlgorithmCategoryId(undefined);
        setSelectedAlgorithmId(undefined);
        appendRuntimeLog('WARN', `当前机器人 ${defineArtifact.robotModel} 暂无可用算法，请先更换机器人或扩展算法库支持。`);
        return;
      }
      setSelectedAlgorithmModuleId(nextModule.id);
      const nextCategory = nextModule.algorithms.find((algorithm) => algorithm.categoryId === selectedAlgorithmCategoryId)?.categoryId
        ?? nextModule.algorithms[0]?.categoryId;
      setSelectedAlgorithmCategoryId(nextCategory);
      const nextAlgorithm = nextModule.algorithms.find((algorithm) => algorithm.id === selectedAlgorithmId && algorithm.categoryId === nextCategory)
        ?? nextModule.algorithms.find((algorithm) => algorithm.categoryId === nextCategory);
      setSelectedAlgorithmId(nextAlgorithm?.id);
      if (selectedAlgorithmId && nextAlgorithm?.id !== selectedAlgorithmId) {
        appendRuntimeLog('WARN', `机器人已切换为 ${defineArtifact.robotModel}，先前算法不兼容，已自动切换为 ${nextAlgorithm?.name ?? '未选择'}`);
        setActiveModuleId('design');
      }
    }).catch((error) => {
      appendRuntimeLog('WARN', `后端算法目录读取失败: ${error instanceof Error ? error.message : String(error)}`);
    });
  }, [designApi, defineArtifact.robotModel, selectedAlgorithmCategoryId, selectedAlgorithmId, selectedAlgorithmModuleId]);

  useEffect(() => {
    setProjectConfig((current) => ({
      ...current,
      define: {
        robotModel: defineArtifact.robotModel,
        sourceType: defineArtifact.sourceType,
        sourcePath: defineArtifact.sourcePath,
        ground: defineArtifact.environment.ground,
        lighting: defineArtifact.environment.lighting,
      },
      design: {
        algorithmModuleId: selectedAlgorithmModule?.id,
        algorithmCategoryId: effectiveCategoryId,
        algorithmId: selectedDesignAlgorithm?.id,
      },
      ui: {
        activeModuleId,
        sidebarVisible: isSideBarVisible,
        sidebarWidth,
        bottomPanelHeight,
      },
    }));
  }, [
    activeModuleId,
    bottomPanelHeight,
    defineArtifact,
    effectiveCategoryId,
    isSideBarVisible,
    selectedAlgorithmModule?.id,
    selectedDesignAlgorithm?.id,
    sidebarWidth,
  ]);

  const applyProjectConfig = (nextConfig: ProjectConfig) => {
    setProjectConfig(nextConfig);
    setActiveModuleId(nextConfig.ui.activeModuleId);
    setIsSideBarVisible(nextConfig.ui.sidebarVisible);
    setSidebarWidth(nextConfig.ui.sidebarWidth);
    setBottomPanelHeight(nextConfig.ui.bottomPanelHeight);
    setDefineArtifact(buildDefineArtifact(nextConfig.define));
    setSelectedAlgorithmModuleId(nextConfig.design.algorithmModuleId);
    setSelectedAlgorithmCategoryId(nextConfig.design.algorithmCategoryId);
    setSelectedAlgorithmId(nextConfig.design.algorithmId);
    setDesignJob(undefined);
    setSimulationReplay(undefined);
  };

  const handleNewProject = () => {
    applyProjectConfig(DEFAULT_PROJECT_CONFIG);
    appendRuntimeLog('INFO', '已新建项目配置。');
    setOpenMenu(null);
  };

  const handleExportProjectConfig = () => {
    const blob = new Blob([JSON.stringify(projectConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'loonenv-project-config.json';
    link.click();
    URL.revokeObjectURL(url);
    appendRuntimeLog('INFO', '项目配置已导出。');
    setOpenMenu(null);
  };

  const handleImportProjectConfig = async (file: File) => {
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as ProjectConfig;
      applyProjectConfig(parsed);
      appendRuntimeLog('INFO', `项目配置已导入: ${file.name}`);
    } catch (error) {
      appendRuntimeLog('ERROR', `配置导入失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
      setOpenMenu(null);
    }
  };

  useEffect(() => {
    if (!designJob || designJob.state !== 'optimizing') {
      return;
    }

    const timer = window.setInterval(() => {
      void designApi.pollDesignJob(designJob).then((nextJob) => {
        setDesignJob(nextJob);
      }).catch((error) => {
        setDesignJob((current) => current ? {
          ...current,
          state: 'error',
          currentStage: 'Validation',
          error: error instanceof Error ? error.message : String(error),
        } : current);
      });
    }, 1500);

    return () => window.clearInterval(timer);
  }, [designApi, designJob]);

  useEffect(() => {
    if (!designJob || designJob.state !== 'validated') {
      return;
    }

    if (replayedJobIdsRef.current.has(designJob.id)) {
      return;
    }

    replayedJobIdsRef.current.add(designJob.id);
    void designApi.fetchDesignReplay(designJob).then((replay) => {
      if (!replay) {
        appendRuntimeLog(
          'WARN',
          `PerfOpt optimize job ${designJob.backendJobId ?? designJob.id} 已完成，但后端未提供可回放轨迹；前端不会伪造机器人动作。`,
        );
        return;
      }

      setSimulationReplay(replay);
      appendRuntimeLog(
        'INFO',
        `PerfOpt optimize job ${designJob.backendJobId ?? designJob.id} 已完成，开始显示后端回放 (${(replay.durationMs / 1000).toFixed(2)} s)。`,
      );
    }).catch((error) => {
      appendRuntimeLog(
        'WARN',
        `PerfOpt optimize job ${designJob.backendJobId ?? designJob.id} 回放读取失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    });
  }, [designApi, designJob]);

  return (
    <div className="h-screen bg-[#ffffff] text-[#333333] font-sans selection:bg-[#add6ff] flex flex-col overflow-hidden select-none">
      <header className="shrink-0 h-10 border-b border-[#1f1f1f] bg-[#181818] text-[#cccccc]">
        <div className="h-full grid grid-cols-[1fr_auto_1fr] items-center px-2">
          <div className="flex items-center gap-0.5 min-w-0">
            <div className="w-3 h-3 rounded-full bg-[#007acc] mx-1 shrink-0" />
            {VS_CODE_MENUS.map((item) => (
              <div key={item} className="relative shrink-0">
                <button
                  onClick={() => setOpenMenu((current) => current === item ? null : item)}
                  className="px-2.5 h-7 rounded-sm text-[11px] text-[#cccccc] hover:bg-white/10 hover:text-white transition-colors shrink-0"
                >
                  {item}
                </button>
                {item === '文件' && openMenu === item && (
                  <div className="absolute top-8 left-0 z-[120] min-w-[180px] rounded-sm border border-[#2f2f2f] bg-[#252526] py-1 shadow-xl">
                    <button onClick={handleNewProject} className="w-full px-3 py-1.5 text-left text-[11px] text-[#cccccc] hover:bg-[#094771]">
                      新建项目
                    </button>
                    <button onClick={() => importInputRef.current?.click()} className="w-full px-3 py-1.5 text-left text-[11px] text-[#cccccc] hover:bg-[#094771]">
                      导入配置...
                    </button>
                    <button onClick={handleExportProjectConfig} className="w-full px-3 py-1.5 text-left text-[11px] text-[#cccccc] hover:bg-[#094771]">
                      导出配置...
                    </button>
                  </div>
                )}
              </div>
            ))}
            <input
              ref={importInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleImportProjectConfig(file);
                }
              }}
            />
          </div>
          <div className="flex items-center justify-center gap-2 min-w-0 px-4">
            <span className="text-[11px] font-medium tracking-wide text-[#f3f3f3] shrink-0">LoonEnv</span>
            <span className="text-[11px] text-[#8f8f8f] truncate">
              {selectedDesignAlgorithm?.name ?? activePlugin.metadata.name} · 工业机器人算法设计工作台
            </span>
          </div>
          <div className="flex items-center justify-end gap-1">
            <button className="w-8 h-7 flex items-center justify-center rounded-sm text-[#c5c5c5] hover:bg-white/10 transition-colors" title="最小化">
              <div className="w-3 h-px bg-current" />
            </button>
            <button
              onClick={() => {
                if (document.fullscreenElement) {
                  void document.exitFullscreen().catch(() => {});
                  return;
                }
                void document.documentElement.requestFullscreen().catch(() => {});
              }}
              className="w-8 h-7 flex items-center justify-center rounded-sm text-[#c5c5c5] hover:bg-white/10 transition-colors"
              title={isFullscreen ? '退出全屏' : '全屏显示'}
            >
              {isFullscreen ? (
                <div className="w-3 h-3 border border-current relative">
                  <div className="absolute inset-[2px] border border-current bg-[#181818]" />
                </div>
              ) : (
                <div className="w-3 h-3 border border-current" />
              )}
            </button>
            <button className="w-8 h-7 flex items-center justify-center rounded-sm text-[#c5c5c5] hover:bg-[#c42b1c] hover:text-white transition-colors" title="关闭">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>
      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 1. Activity Bar (Far Left) */}
        <aside className="w-12 bg-[#2c2c2c] flex flex-col items-center py-2 shrink-0 z-50">
          <div className="flex flex-col gap-1 w-full items-center">
            {PLUGIN_REGISTRY.map((p, idx) => {
              const icons = [Files, Search, GitBranch, PlayCircle];
              const IconComponent = icons[idx];
              const iconElement = IconComponent ? <IconComponent className="w-6 h-6" /> : p.icon;
              return (
                <button
                  key={p.metadata.id}
                  onClick={() => {
                    setActiveModuleId(p.metadata.id);
                    setIsSideBarVisible(true);
                    setShowCore(false);
                  }}
                  className={cn(
                    "w-12 h-12 flex items-center justify-center transition-all relative group",
                    activeModuleId === p.metadata.id && isSideBarVisible && !showCore
                      ? "text-white border-l-2 border-white" 
                      : "text-slate-400 hover:text-white"
                  )}
                  title={p.metadata.name}
                >
                  {iconElement}
                </button>
              );
            })}
            <button
              onClick={() => {
                setShowCore(!showCore);
                setIsSideBarVisible(true);
              }}
              className={cn(
                "w-12 h-12 flex items-center justify-center transition-all relative group",
                showCore && isSideBarVisible ? "text-white border-l-2 border-white" : "text-slate-400 hover:text-white"
              )}
              title="核心底座"
            >
              <Database className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-auto flex flex-col gap-1 w-full items-center mb-2">
            <button 
              onClick={() => setShowPluginManager(true)}
              className={cn(
                "w-12 h-12 flex items-center justify-center transition-all",
                showPluginManager ? "text-white" : "text-slate-400 hover:text-white"
              )}
              title="插件管理"
            >
              <Puzzle className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-all" title="账户">
              <UserCircle className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-all" title="设置">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </aside>

        {/* 2. Side Bar (Collapsible) */}
        {isSideBarVisible && (
          <>
          <aside
            style={{ width: sidebarWidth }}
            className="bg-[#f3f3f3] border-r border-[#e5e5e5] flex flex-col shrink-0 z-40 shadow-sm min-w-0"
          >
            <div className="h-9 px-4 flex items-center justify-between shrink-0 bg-[#f3f3f3]">
              <span className="text-[11px] text-[#6f6f6f] font-bold tracking-wider uppercase">
                {showCore ? "资源管理器: 核心" : activePlugin.metadata.name}
              </span>
              <div className="w-4" />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-[#f3f3f3]">
              {showCore ? (
                <div className="flex flex-col">
                  {/* Accordion Section */}
                  <div className="border-b border-[#e5e5e5]">
                    <div className="h-6 px-1 flex items-center gap-1 bg-[#e8e8e8] cursor-pointer hover:bg-[#d8d8d8] transition-colors">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                      <span className="text-[11px] font-bold text-[#333333] uppercase tracking-tighter">通用架构 (Universal Schema)</span>
                    </div>
                    <div className="py-2 bg-white/50">
                      {['状态 (State)', '动作 (Action)', '日志 (Log)', '指标 (Metrics)'].map(item => (
                        <div key={item} className="flex items-center gap-2 px-6 py-1.5 hover:bg-[#e8e8e8] cursor-pointer text-[12px] text-[#6f6f6f] group">
                          <Database className="w-3.5 h-3.5 text-blue-500 opacity-70 group-hover:opacity-100" /> 
                          <span className="group-hover:text-[#333333] transition-colors">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col flex-1">
                  {/* Plugin Custom UI Section - Primary focus */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                      <activePlugin.component 
                        data={pluginData}
                        onAction={(action, payload) => {
                          if (action === 'SELECT_ALGORITHM_MODULE') {
                            const nextModule = algorithmModules.find((module) => module.id === payload);
                            setSelectedAlgorithmModuleId(nextModule?.id);
                            const nextCategory = nextModule?.algorithms[0]?.categoryId;
                            setSelectedAlgorithmCategoryId(nextCategory);
                            const nextAlgorithm = nextModule?.algorithms.find((algorithm) => algorithm.categoryId === nextCategory);
                            setSelectedAlgorithmId(nextAlgorithm?.id);
                            return;
                          }
                          if (action === 'SELECT_ALGORITHM_CATEGORY') {
                            const nextCategoryId = String(payload ?? '');
                            setSelectedAlgorithmCategoryId(nextCategoryId);
                            const nextAlgorithm = selectedAlgorithmModule?.algorithms.find((algorithm) => algorithm.categoryId === nextCategoryId);
                            setSelectedAlgorithmId(nextAlgorithm?.id);
                            return;
                          }
                          if (action === 'SELECT_ALGORITHM') {
                            setSelectedAlgorithmId(String(payload ?? ''));
                            return;
                          }
                          if (action === 'DEFINE_ARTIFACT_UPDATED' && payload) {
                            setDefineArtifact(payload);
                            setProjectConfig((current) => ({
                              ...current,
                              define: {
                                robotModel: payload.robotModel,
                                sourceType: payload.sourceType,
                                sourcePath: payload.sourcePath,
                                ground: payload.environment.ground,
                                lighting: payload.environment.lighting,
                              },
                            }));
                            appendRuntimeLog('INFO', `Define 工件已更新: robot=${payload.robotModel}, source=${payload.sourceType}`);
                            return;
                          }
                          if (action === 'DEPLOY_CONFIG_UPDATED' && payload) {
                            setProjectConfig((current) => ({
                              ...current,
                              deploy: {
                                ...current.deploy,
                                ...payload,
                              },
                            }));
                            return;
                          }
                          if (action === 'DIAGNOSE_CONFIG_UPDATED' && payload) {
                            setProjectConfig((current) => ({
                              ...current,
                              diagnose: {
                                ...current.diagnose,
                                ...payload,
                              },
                            }));
                            return;
                          }
                          if (action === 'START_DESIGN_FLOW') {
                            setActiveModuleId('design');
                            setSimulationReplay(undefined);
                            appendRuntimeLog(
                              'INFO',
                              `用户触发“启动算法设计流程”: module=${selectedAlgorithmModule?.name ?? 'unknown'} algorithm=${selectedDesignAlgorithm?.name ?? 'unknown'}`,
                            );
                            void designApi.startDesignJob({
                              defineArtifact,
                              algorithmId: selectedDesignAlgorithm?.id,
                              algorithmModuleId: selectedAlgorithmModule?.id,
                            }).then((createdJob) => {
                              setDesignJob({
                                ...createdJob,
                                title: `${selectedDesignAlgorithm?.name ?? 'Backend Algorithm'} Design Job`,
                                sample: selectedDesignAlgorithm?.name ?? createdJob.sample,
                                summary: `${selectedDesignAlgorithm?.family ?? '后端算法'} 已绑定当前 Design 工作流模板，正在执行后端优化与验证。`,
                                artifacts: {
                                  ...createdJob.artifacts,
                                  controllerProfile: selectedDesignAlgorithm?.candidateStructure ?? createdJob.artifacts.controllerProfile,
                                },
                              });
                              appendRuntimeLog('INFO', `Design 任务已创建: id=${createdJob.id}, mode=${createdJob.backendMode ?? 'unknown'}`);
                            }).catch((error) => {
                              appendRuntimeLog('ERROR', `Design 任务启动失败: ${error instanceof Error ? error.message : String(error)}`);
                              setDesignJob({
                                id: `design-job-${Date.now()}`,
                                state: 'error',
                                title: `${selectedDesignAlgorithm?.name ?? 'Backend Algorithm'} Design Job`,
                                sample: selectedDesignAlgorithm?.name ?? 'Unknown Algorithm',
                                basedOn: defineArtifact,
                                currentStage: 'Validation',
                                summary: '设计任务启动失败，请检查 PerfOpt 后端可达性。',
                                metrics: [],
                                artifacts: {
                                  specId: 'design-spec-er15-001',
                                  controllerProfile: selectedDesignAlgorithm?.candidateStructure ?? 'backend-defined algorithm',
                                  ffMode: 'meas',
                                  optimizer: 'Optuna',
                                },
                                backendMode: 'mock',
                                error: error instanceof Error ? error.message : String(error),
                              });
                            });
                            return;
                          }
                          console.log('Plugin Action:', action, payload);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="调整操作面板宽度"
            onMouseDown={(event) => setDragState({ type: 'sidebar', startPos: event.clientX, startValue: sidebarWidth })}
            className="group w-2 shrink-0 cursor-ew-resize bg-white hover:bg-[#f5f9ff] transition-colors flex items-center justify-center"
            title="拖动以调整操作面板宽度"
          >
            <div className={cn(
              "h-full w-[3px] rounded-full transition-colors",
              dragState?.type === 'sidebar' ? "bg-[#007acc]/60" : "bg-transparent group-hover:bg-[#007acc]/35"
            )} />
          </div>
          </>
        )}

        {/* 3. Main Editor Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white relative">
          <div className="h-9 bg-[#f3f3f3] flex items-center justify-between px-4 shrink-0 border-b border-[#e5e5e5]">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium text-[#333333]">Simulation View</span>
            </div>
            <div className="text-[10px] text-[#6f6f6f]">
              {selectedDesignAlgorithm?.name ?? activePlugin.metadata.name}
            </div>
          </div>

            {/* Editor Content (Simulation View) */}
            <div className="flex-1 relative overflow-hidden">
              <SimulationView replay={simulationReplay} defineArtifact={defineArtifact} />
            </div>

          <div
            role="separator"
            aria-orientation="horizontal"
            aria-label="调整底部输出面板高度"
            onMouseDown={(event) => setDragState({ type: 'bottom', startPos: event.clientY, startValue: bottomPanelHeight })}
            className="group h-2 shrink-0 cursor-ns-resize bg-white hover:bg-[#f5f9ff] transition-colors flex items-center justify-center"
            title="拖动以调整输出面板高度"
          >
            <div className={cn(
              "h-[3px] w-full rounded-full transition-colors",
              dragState?.type === 'bottom' ? "bg-[#007acc]/60" : "bg-transparent group-hover:bg-[#007acc]/35"
            )} />
          </div>

          {/* 4. Bottom Panel (Output/Terminal) */}
          <div
            style={{ height: bottomPanelHeight }}
            className="border-t border-[#e5e5e5] flex flex-col shrink-0 min-h-0"
          >
            <SystemMonitor logs={runtimeLogs} />
          </div>
        </main>
      </div>

      {/* 5. Status Bar (Very Bottom) */}
      <footer className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-[11px] shrink-0 z-[60]">
        <div className="flex items-center h-full">
          <div className="flex items-center gap-1.5 px-2 hover:bg-white/10 h-full cursor-pointer transition-colors">
            <GitBranch className="w-3.5 h-3.5" />
            <span>main*</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 hover:bg-white/10 h-full cursor-pointer transition-colors">
            <Activity className="w-3.5 h-3.5" />
            <span>物理引擎: MuJoCo</span>
          </div>
        </div>
        <div className="flex items-center h-full">
          <div className="px-2 hover:bg-white/10 h-full cursor-pointer transition-colors">UTF-8</div>
          <div className="px-2 hover:bg-white/10 h-full cursor-pointer transition-colors flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready</span>
          </div>
        </div>
      </footer>

      {/* 插件管理器弹窗 - 保持原有逻辑但调整样式 */}
      <AnimatePresence>
        {showPluginManager && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPluginManager(false)}
              className="absolute inset-0 bg-black/20"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-4xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-[#e5e5e5]"
            >
              <div className="h-10 px-4 border-b border-[#e5e5e5] flex items-center justify-between bg-[#f3f3f3]">
                <div className="flex items-center gap-2">
                  <Puzzle className="w-4 h-4 text-[#6f6f6f]" />
                  <span className="text-[11px] font-bold text-[#333333] uppercase tracking-wider">插件市场 (Extensions Marketplace)</span>
                </div>
                <button 
                  onClick={() => setShowPluginManager(false)}
                  className="p-1 hover:bg-[#e8e8e8] rounded transition-colors"
                >
                  <X className="w-4 h-4 text-[#6f6f6f]" />
                </button>
              </div>
              
              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar of modal */}
                <div className="w-64 border-r border-[#e5e5e5] bg-[#f3f3f3] overflow-y-auto">
                  <div className="p-2">
                    <div className="px-2 py-1 bg-[#007acc] text-white text-xs rounded-sm mb-1 cursor-pointer">已安装</div>
                    <div className="px-2 py-1 hover:bg-[#e8e8e8] text-[#6f6f6f] text-xs rounded-sm cursor-pointer">推荐插件</div>
                  </div>
                </div>

                {/* Content of modal */}
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-2">
                  {PLUGIN_REGISTRY.map((p) => (
                    <div key={p.metadata.id} className="p-3 bg-white border border-[#e5e5e5] hover:bg-[#f8f8f8] transition-all flex gap-4 cursor-pointer group">
                      <div className="w-10 h-10 bg-[#f3f3f3] flex items-center justify-center text-[#007acc] shrink-0">
                        {p.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-[13px] font-bold text-[#333333]">{p.metadata.name}</h3>
                          <span className="text-[10px] text-[#6f6f6f]">v{p.metadata.version}</span>
                        </div>
                        <p className="text-[11px] text-[#6f6f6f] line-clamp-1 mb-1">
                          {p.metadata.description}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-[#007acc]">{p.metadata.author}</span>
                          <div className="flex items-center gap-1">
                            <button className="text-[10px] px-2 py-0.5 bg-[#007acc] text-white rounded-sm hover:bg-[#005fb8]">安装</button>
                            <button className="text-[10px] px-2 py-0.5 bg-[#e8e8e8] text-[#333333] rounded-sm hover:bg-[#d8d8d8]"><Settings className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
