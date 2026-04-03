export const PEROPT_SAMPLE_NAME = 'Backend Algorithm Design';

export const DESIGN_TECH_STACK = ['Design Spec', 'Optimization Job', 'Validation Report'] as const;
export const DESIGN_INPUT_SCHEMA = {
  robot: 'ER15-1400',
  design_spec: 'algorithm family + task profile + candidate structure + constraints',
  task_profile: 'reusable engineering task definition',
  constraints: 'position / velocity / torque / environment / review gates',
} as const;
export const DESIGN_OUTPUT_SCHEMA = {
  artifact: 'validated design result package',
  metrics: ['profile-defined interpretable metrics'],
  result: 'reviewable report + replayable result artifact',
} as const;

export const DESIGN_STEPS = [
  { id: 1, label: '选择算法' },
  { id: 2, label: '测试运行' },
  { id: 3, label: '性能优化' },
  { id: 4, label: '算法验收' },
] as const;

export const PEROPT_FLOW = [] as const;

export const PEROPT_FF_MODES = [] as const;

export const PEROPT_METRICS = [] as const;

export const PEROPT_VALIDATION_GATES = [] as const;

export const PEROPT_SAMPLE_JOB = {
  title: 'ER15 Algorithm Design Job',
  sample: PEROPT_SAMPLE_NAME,
  currentStage: 'Optimization',
  summary: '基于 ER15 定义工件执行计算力矩控制算法设计，由 PerfOpt 控制器优化后端负责优化、评估与结果回放。',
  artifacts: {
    specId: 'design-spec-er15-001',
    controllerProfile: 'backend-defined algorithm',
    ffMode: 'meas',
    optimizer: 'Optuna',
  },
  metrics: [
    { name: 'cycle_time', value: '0.82 s', status: 'good' },
    { name: 'e_max', value: '0.034 m', status: 'good' },
    { name: 'rmse', value: '0.011 m', status: 'good' },
    { name: 'vib_energy', value: '0.18', status: 'warn' },
    { name: 'energy', value: '0.42', status: 'info' },
    { name: 'torque_max', value: '61.3 N·m', status: 'info' },
  ],
} as const;
