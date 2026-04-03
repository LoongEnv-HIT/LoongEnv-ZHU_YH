import type { DefineArtifact } from '../types';
import robotModels from './robotModels.json';

export interface RobotAssetDefinition {
  modelName: string;
  sceneFile: string;
  publicDir: string;
  backendFsPath: string;
  showcaseQpos: readonly number[];
  assetFiles: readonly string[];
  techStack: readonly string[];
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  resourcePath: string;
  modelBoundary: string;
  jointConfiguration: string;
  embeddedAssetsLabel: string;
  jointLimits: readonly { joint: string; position: string; velocity: string; torque: string }[];
}

export const ER15_MODEL_NAME = 'ER15-1400';
export const ER15_SCENE_FILE = 'er15-1400.mjcf.xml';
export const ER15_MODEL_PUBLIC_DIR = 'robots/er15/';
export const ER15_SHOWCASE_QPOS = [0.55, -1.18, 1.36, 0.18, 0.92, 0.0] as const;
export const ER15_ASSET_FILES = [
  'er15-1400.mjcf.xml',
  'b_link.STL',
  'l_1.STL',
  'l_2.STL',
  'l_3.STL',
  'l_4.STL',
  'l_5.STL',
  'l_6.STL',
] as const;

export const ER15_TECH_STACK = ['MuJoCo WASM', 'MJCF', 'STL Mesh'] as const;
export const ER15_INPUT_SCHEMA = {
  robot: ER15_MODEL_NAME,
  source: 'MJCF + STL',
  format: 'XML/Binary Mesh',
} as const;
export const ER15_OUTPUT_SCHEMA = {
  model: ER15_MODEL_NAME,
  joints: 6,
  scene: 'MuJoCo Runtime State',
} as const;

export const ER15_RESOURCE_PATH = `/robots/er15/${ER15_SCENE_FILE}`;
export const ER15_MODEL_BOUNDARY = '统计范围 extent = 2.2, center = [0, 0, 0.8]';
export const ER15_JOINT_CONFIGURATION = '6 自由度转动关节 (Revolute, Z Axis)';
export const ER15_EMBEDDED_ASSETS_LABEL = 'b_link.STL, l_1 ~ l_6.STL';

export const ER15_JOINT_LIMITS = [
  { joint: 'J1', position: '-2.967 ~ 2.967 rad', velocity: '未提供', torque: '未提供' },
  { joint: 'J2', position: '-2.7925 ~ 1.5708 rad', velocity: '未提供', torque: '未提供' },
  { joint: 'J3', position: '-1.4835 ~ 3.0543 rad', velocity: '未提供', torque: '未提供' },
  { joint: 'J4', position: '-3.316 ~ 3.316 rad', velocity: '未提供', torque: '未提供' },
  { joint: 'J5', position: '-2.2689 ~ 2.2689 rad', velocity: '未提供', torque: '未提供' },
  { joint: 'J6', position: '-6.2832 ~ 6.2832 rad', velocity: '未提供', torque: '未提供' },
] as const;

export const KUKA_KR300_MODEL_NAME = 'KUKA KR300 R2500 ultra';
export const KUKA_KR300_SCENE_FILE = 'kr300_r2500_ultra_good.xml';
export const KUKA_KR300_MODEL_PUBLIC_DIR = 'robots/kuka_kr300_r2500_ultra/';
export const KUKA_KR300_SHOWCASE_QPOS = [0, -0.5, 0.8, 0, 0.4, 0] as const;
export const KUKA_KR300_ASSET_FILES = [
  'kr300_r2500_ultra_good.xml',
  'KUKA-KR-300-R2500-ultra-base.stl',
  'KUKA-KR-300-R2500-ultra-1.stl',
  'KUKA-KR-300-R2500-ultra-2.stl',
  'KUKA-KR-300-R2500-ultra-3.stl',
  'KUKA-KR-300-R2500-ultra-4.stl',
  'KUKA-KR-300-R2500-ultra-5.stl',
  'KUKA-KR-300-R2500-ultra-6.stl',
  'KUKA-KR-300-R2500-ultra-7.stl',
  'KUKA-KR-300-R2500-ultra-8.stl',
  'obj/0.obj',
  'obj/0.mtl',
  'obj/0_0.obj',
  'obj/0_0.mtl',
  'obj/0_1.obj',
  'obj/0_1.mtl',
  'obj/0_2.obj',
  'obj/0_2.mtl',
  'obj/0_3.obj',
  'obj/0_3.mtl',
  'obj/0_4.obj',
  'obj/0_4.mtl',
  'obj/1.obj',
  'obj/1.mtl',
  'obj/1_0.obj',
  'obj/1_0.mtl',
  'obj/1_1.obj',
  'obj/1_1.mtl',
  'obj/1_2.obj',
  'obj/1_2.mtl',
  'obj/2.obj',
  'obj/2.mtl',
  'obj/2_0.obj',
  'obj/2_0.mtl',
  'obj/2_1.obj',
  'obj/2_1.mtl',
  'obj/2_2.obj',
  'obj/2_2.mtl',
  'obj/3.obj',
  'obj/3.mtl',
  'obj/3_0.obj',
  'obj/3_0.mtl',
  'obj/3_1.obj',
  'obj/3_1.mtl',
  'obj/3_2.obj',
  'obj/3_2.mtl',
  'obj/4.obj',
  'obj/4.mtl',
  'obj/5.obj',
  'obj/5.mtl',
  'obj/5_0.obj',
  'obj/5_0.mtl',
  'obj/5_1.obj',
  'obj/5_1.mtl',
  'obj/5_2.obj',
  'obj/5_2.mtl',
  'obj/6.obj',
  'obj/6.mtl',
  'obj/6_0.obj',
  'obj/6_0.mtl',
  'obj/6_1.obj',
  'obj/6_1.mtl',
  'obj/6_2.obj',
  'obj/6_2.mtl',
  'obj/6_3.obj',
  'obj/6_3.mtl',
  'obj/7.obj',
  'obj/7.mtl',
  'obj/8.obj',
  'obj/8.mtl',
] as const;
export const KUKA_KR300_TECH_STACK = ['MuJoCo WASM', 'MJCF', 'STL + OBJ Mesh'] as const;
export const KUKA_KR300_INPUT_SCHEMA = {
  robot: KUKA_KR300_MODEL_NAME,
  source: 'MJCF + STL + OBJ',
  format: 'XML/Binary Mesh',
} as const;
export const KUKA_KR300_OUTPUT_SCHEMA = {
  model: KUKA_KR300_MODEL_NAME,
  joints: 6,
  scene: 'MuJoCo Runtime State',
} as const;
export const KUKA_KR300_RESOURCE_PATH = `/robots/kuka_kr300_r2500_ultra/${KUKA_KR300_SCENE_FILE}`;
export const KUKA_KR300_MODEL_BOUNDARY = 'KR300 大工作空间模型，适用于大负载工业臂仿真';
export const KUKA_KR300_JOINT_CONFIGURATION = '6 自由度转动关节 + 平衡器闭环机构';
export const KUKA_KR300_EMBEDDED_ASSETS_LABEL = 'KUKA STL 主网格 + OBJ 细分视觉网格';
export const KUKA_KR300_JOINT_LIMITS = [
  { joint: 'J1', position: '-3.2289 ~ 3.2289 rad', velocity: '未提供', torque: '未提供' },
  { joint: 'J2', position: '-0.8727 ~ 1.4835 rad', velocity: '未提供', torque: '未提供' },
  { joint: 'J3', position: '-3.6652 ~ 1.1345 rad', velocity: '未提供', torque: '未提供' },
  { joint: 'J4', position: '-6.1087 ~ 6.1087 rad', velocity: '未提供', torque: '未提供' },
  { joint: 'J5', position: '-2.1380 ~ 2.1380 rad', velocity: '未提供', torque: '未提供' },
  { joint: 'J6', position: '-6.1087 ~ 6.1087 rad', velocity: '未提供', torque: '未提供' },
] as const;

function toRobotAssetDefinition(record: any): RobotAssetDefinition {
  return {
    modelName: record.displayName,
    sceneFile: record.sceneFile,
    publicDir: record.publicDir,
    backendFsPath: record.backendFsPath,
    showcaseQpos: record.showcaseQpos,
    assetFiles: record.assetFiles,
    techStack: record.techStack,
    inputSchema: record.displayName === ER15_MODEL_NAME ? ER15_INPUT_SCHEMA : KUKA_KR300_INPUT_SCHEMA,
    outputSchema: record.displayName === ER15_MODEL_NAME ? ER15_OUTPUT_SCHEMA : KUKA_KR300_OUTPUT_SCHEMA,
    resourcePath: record.publicResourcePath,
    modelBoundary: record.modelBoundary,
    jointConfiguration: record.jointConfiguration,
    embeddedAssetsLabel: record.embeddedAssetsLabel,
    jointLimits: record.jointLimits,
  };
}

export const ROBOT_ASSET_LIBRARY: Record<string, RobotAssetDefinition> = Object.fromEntries(
  Object.entries(robotModels).map(([key, value]) => [key, toRobotAssetDefinition(value)]),
) as Record<string, RobotAssetDefinition>;

export const AVAILABLE_ROBOT_MODELS = Object.keys(ROBOT_ASSET_LIBRARY);

export function getRobotAssetDefinition(robotModel: string) {
  return ROBOT_ASSET_LIBRARY[robotModel] ?? ROBOT_ASSET_LIBRARY[ER15_MODEL_NAME];
}

export function getRobotAssetRoot(robotModel: string) {
  const definition = getRobotAssetDefinition(robotModel);
  return new URL(definition.publicDir, document.baseURI).toString().replace(/\/$/, '');
}

export function getRobotBackendFsPath(robotModel: string) {
  return getRobotAssetDefinition(robotModel).backendFsPath;
}

export function createDefaultEr15DefineArtifact(): DefineArtifact {
  return createDefineArtifactFromRobotModel(ER15_MODEL_NAME);
}

export function createDefineArtifactFromRobotModel(
  robotModel: string,
  overrides?: Partial<Pick<DefineArtifact, 'sourceType' | 'sourcePath' | 'assetsSummary'>> & {
    ground?: string;
    lighting?: string;
  },
): DefineArtifact {
  const definition = getRobotAssetDefinition(robotModel);
  return {
    robotModel: definition.modelName,
    sourceType: overrides?.sourceType ?? '内置模型资源 (Built-in Assets)',
    sourcePath: overrides?.sourcePath ?? definition.resourcePath,
    jointConfiguration: definition.jointConfiguration,
    jointLimitStatus: 'J1 ~ J6 已写入 MJCF',
    environment: {
      ground: overrides?.ground ?? 'MuJoCo 蓝色棋盘反射地面',
      lighting: overrides?.lighting ?? 'MuJoCo 样例双方向光',
      showcasePose: `${definition.modelName} Showcase QPos 已预置: [${definition.showcaseQpos.join(', ')}]`,
    },
    assetsSummary: overrides?.assetsSummary ?? definition.embeddedAssetsLabel,
  };
}
