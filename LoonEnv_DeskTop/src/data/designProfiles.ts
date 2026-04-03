export const DESIGN_WORKFLOW_OVERVIEW = {
  name: 'Normalized Algorithm Design Workflow',
  purpose: '为控制、规划与优化类算法提供统一的 Design 工作流。算法目录和算法模板本身由后端算法库返回，前端只负责编排和展示。',
  stages: [
    {
      id: 'synthesis',
      title: '1. 算法合成 (Synthesis)',
      summary: '定义算法任务、候选结构、搜索空间与评估协议。',
    },
    {
      id: 'optimization',
      title: '2. 调优优化 (Optimization)',
      summary: '创建后端任务、执行仿真评估/搜索、汇总指标并生成结果工件。',
    },
    {
      id: 'validation',
      title: '3. 验证评审 (Validation)',
      summary: '执行门槛检查、审查证据、形成可复用设计结果包。',
    },
  ],
} as const;
