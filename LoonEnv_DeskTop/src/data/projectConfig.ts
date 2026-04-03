import type {
  DefineArtifact,
  DefineProjectConfig,
  ProjectConfig,
} from '../types';
import {
  AVAILABLE_ROBOT_MODELS,
  ER15_EMBEDDED_ASSETS_LABEL,
  ER15_JOINT_CONFIGURATION,
  ER15_MODEL_NAME,
  ER15_RESOURCE_PATH,
  ER15_SHOWCASE_QPOS,
  createDefineArtifactFromRobotModel,
} from './er15';

export const DEFAULT_PROJECT_CONFIG: ProjectConfig = {
  version: 1,
  define: {
    robotModel: ER15_MODEL_NAME,
    sourceType: '内置模型资源 (Built-in Assets)',
    sourcePath: ER15_RESOURCE_PATH,
    ground: 'MuJoCo 蓝色棋盘反射地面',
    lighting: 'MuJoCo 样例双方向光',
  },
  design: {},
  deploy: {
    hardwareTarget: 'Jetson Orin AGX',
    targetHost: '192.168.1.105',
    controlFrequencyHz: 1000,
  },
  diagnose: {
    streamUrl: 'ws://192.168.1.105:8080/stream',
    selectedMetrics: ['关节扭矩 (Torque)', '关节位置 (Position)'],
  },
  ui: {
    activeModuleId: 'define',
    sidebarVisible: true,
    sidebarWidth: 560,
    bottomPanelHeight: 160,
  },
};

export function buildDefineArtifact(config: DefineProjectConfig): DefineArtifact {
  const robotModel = AVAILABLE_ROBOT_MODELS.includes(config.robotModel) ? config.robotModel : ER15_MODEL_NAME;
  return createDefineArtifactFromRobotModel(robotModel, {
    sourceType: config.sourceType,
    sourcePath: config.sourcePath,
    ground: config.ground,
    lighting: config.lighting,
  });
}
