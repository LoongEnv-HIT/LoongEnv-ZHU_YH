export const DESIGN_ARTIFACTS = [
  {
    name: 'Design Spec',
    role: '定义算法族、任务画像、候选结构、优化目标和验证门槛',
  },
  {
    name: 'Algorithm Candidate Config',
    role: '记录当前被评估的算法参数、求解配置、启发式或结构化策略',
  },
  {
    name: 'Optimization Job',
    role: '描述一次可追踪、可重跑的优化任务',
  },
  {
    name: 'Validation Report',
    role: '汇总指标、约束检查和通过/未通过结论',
  },
  {
    name: 'Design Result Package',
    role: '导出可复用设计工件、回放结果与元数据，供后续系统或人工决策使用',
  },
] as const;

export const DESIGN_JOB_STATES = [
  { state: 'draft', meaning: '定义阶段输入已准备，但尚未启动设计任务' },
  { state: 'configured', meaning: '控制器、约束、权重和目标已经配置完成' },
  { state: 'optimizing', meaning: '后端正在执行 rollout / Optuna 搜索' },
  { state: 'validated', meaning: '验证报告已生成，结果可审查' },
  { state: 'exported', meaning: '设计结果包已导出，可供后续系统消费' },
] as const;

export const DESIGN_JOB_TRANSITIONS = [
  { state: 'draft', label: '已具备 Define 输入，等待配置设计任务' },
  { state: 'configured', label: '设计任务已配置，准备启动优化' },
  { state: 'optimizing', label: '正在执行 PerOpt 样例优化任务' },
  { state: 'validated', label: '验证报告已生成，可审查结果' },
  { state: 'exported', label: '设计结果包已导出' },
] as const;

export const DESIGN_BACKEND_ENDPOINTS = [
  { endpoint: 'POST /api/design/jobs', purpose: '创建一次设计/优化任务' },
  { endpoint: 'GET /api/design/jobs/:id', purpose: '获取任务状态与实时进度' },
  { endpoint: 'GET /api/design/jobs/:id/metrics', purpose: '读取可解释指标与 loss 分解' },
  { endpoint: 'GET /api/design/jobs/:id/report', purpose: '读取验证报告' },
  { endpoint: 'GET /api/design/jobs/:id/result', purpose: '导出设计结果包' },
] as const;

export const DESIGN_WORKFLOW_RULES = [
  '新算法以 profile 形式接入，不重写 Design 工作流本身',
  '前端负责编排与展示，后端负责执行、搜索、结果持久化与 replay 生成',
  '任何 Design 任务都必须形成可审查 Validation Report 后才算完成',
  'Design Result Package 必须可复现、可追溯、可供 Deploy/Diagnose 消费',
] as const;
