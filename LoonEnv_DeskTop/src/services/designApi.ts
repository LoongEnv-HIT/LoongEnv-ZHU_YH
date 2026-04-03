import type { DefineArtifact, DesignAlgorithmModule, DesignJob } from '../types';
import { PEROPT_SAMPLE_JOB } from '../data/design-workflow';
import { getRobotBackendFsPath } from '../data/er15';
import { normalizeBackendReplay, type Er15Replay } from '../data/er15Replay';

export interface StartDesignJobInput {
  defineArtifact?: DefineArtifact;
  algorithmId?: string;
  algorithmModuleId?: string;
}

export interface DesignApi {
  fetchAlgorithmCatalog(robotModelId?: string): Promise<readonly DesignAlgorithmModule[]>;
  startDesignJob(input: StartDesignJobInput): Promise<DesignJob>;
  pollDesignJob(job: DesignJob): Promise<DesignJob>;
  fetchDesignReplay(job: DesignJob): Promise<Er15Replay | null>;
}

const PERFOPT_HTTP_BASE_URL = 'http://127.0.0.1:8080';
type LogFn = (level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR', message: string) => void;

function formatMetricValue(value: number, unit = '', digits = 4) {
  if (!Number.isFinite(value)) {
    return `0${unit}`;
  }
  const absValue = Math.abs(value);
  const formatted = absValue > 0 && absValue < 10 ** -digits
    ? value.toExponential(2)
    : value.toFixed(digits);
  return `${formatted}${unit}`;
}

function createMockJob(defineArtifact?: DefineArtifact): DesignJob {
  return {
    id: `design-job-${Date.now()}`,
    state: 'optimizing',
    basedOn: defineArtifact,
    backendMode: 'mock',
    ...PEROPT_SAMPLE_JOB,
  };
}

class MockDesignApi implements DesignApi {
  constructor(private readonly log?: LogFn) {}

  async fetchAlgorithmCatalog(_robotModelId?: string): Promise<readonly DesignAlgorithmModule[]> {
    this.log?.('WARN', 'PerfOpt backend unavailable, algorithm catalog is empty.');
    return [];
  }

  async startDesignJob(input: StartDesignJobInput): Promise<DesignJob> {
    this.log?.('WARN', 'PerfOpt backend unavailable, falling back to mock Design job.');
    return createMockJob(input.defineArtifact);
  }

  async pollDesignJob(job: DesignJob): Promise<DesignJob> {
    if (job.state === 'optimizing') {
      this.log?.('DEBUG', `Mock Design job ${job.id} advanced to validated.`);
      return { ...job, state: 'validated', currentStage: 'Validation' };
    }
    return job;
  }

  async fetchDesignReplay(_job: DesignJob): Promise<Er15Replay | null> {
    return null;
  }
}

class PerfOptHttpDesignApi implements DesignApi {
  constructor(private readonly baseUrl: string, private readonly log?: LogFn) {}

  private async fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
    this.log?.('DEBUG', `HTTP ${init?.method ?? 'GET'} ${this.baseUrl}${path}`);
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      ...init,
    });

    if (!response.ok) {
      throw new Error(`backend_http_${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async fetchAlgorithmCatalog(robotModelId?: string): Promise<readonly DesignAlgorithmModule[]> {
    const suffix = robotModelId ? `?robot_model_id=${encodeURIComponent(robotModelId)}` : '';
    const payload = await this.fetchJson<{ ok: boolean; modules: DesignAlgorithmModule[] }>(`/algorithms/catalog${suffix}`);
    return payload.modules;
  }

  async startDesignJob(input: StartDesignJobInput): Promise<DesignJob> {
    const payload = {
      algorithm_module_id: input.algorithmModuleId,
      algorithm_id: input.algorithmId,
      robot_model_id: input.defineArtifact?.robotModel,
      mjcf_path: input.defineArtifact ? getRobotBackendFsPath(input.defineArtifact.robotModel) : input.defineArtifact?.sourcePath,
      preset: 'default',
      jobs: 2,
      trials: 8,
      config: {
        ff_mode: 'meas',
      },
    };

    const started = await this.fetchJson<{
      ok: boolean;
      job_id: string;
      robot_model_id?: string;
      resolved_mjcf_path?: string;
    }>('/optimize/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.log?.('INFO', `PerfOpt optimize job started: backend_job_id=${started.job_id}`);

    return {
      id: `design-job-${Date.now()}`,
      state: 'optimizing',
      basedOn: input.defineArtifact,
      backendMode: 'perfopt-http',
      backendJobId: started.job_id,
      executionRobotModel: started.robot_model_id ?? input.defineArtifact?.robotModel,
      resolvedMjcfPath: started.resolved_mjcf_path ?? input.defineArtifact?.sourcePath,
      ...PEROPT_SAMPLE_JOB,
    };
  }

  async pollDesignJob(job: DesignJob): Promise<DesignJob> {
    if (!job.backendJobId) {
      return job;
    }

    const status = await this.fetchJson<{
      ok: boolean;
      job: {
        state: string;
        robot_model_id?: string;
        resolved_mjcf_path?: string;
        error?: string | null;
        snapshot?: {
          best?: {
            metrics?: Record<string, number>;
            params?: Record<string, { kp: number; kd: number }>;
          } | null;
        };
      };
    }>(`/optimize/status?job_id=${encodeURIComponent(job.backendJobId)}`);

    const backendState = status.job.state;
    this.log?.('DEBUG', `PerfOpt optimize job ${job.backendJobId} state=${backendState}`);
    const metrics = status.job.snapshot?.best?.metrics;

    const nextMetrics = metrics
      ? [
          { name: 'cycle_time', value: formatMetricValue(Number(metrics.cycle_time ?? 0), ' s', 3), status: 'good' as const },
          { name: 'e_max', value: formatMetricValue(Number(metrics.e_max ?? 0), ' m', 4), status: 'good' as const },
          { name: 'rmse', value: formatMetricValue(Number(metrics.rmse ?? 0), ' m', 4), status: 'good' as const },
          { name: 'vib_energy', value: formatMetricValue(Number(metrics.vib_energy ?? 0), '', 4), status: 'warn' as const },
          { name: 'energy', value: formatMetricValue(Number(metrics.energy ?? 0), '', 4), status: 'info' as const },
          { name: 'torque_max', value: formatMetricValue(Number(metrics.torque_max ?? 0), '', 3), status: 'info' as const },
        ]
      : job.metrics;

    if (backendState === 'FINISHED') {
      return {
        ...job,
        state: 'validated',
        currentStage: 'Validation',
        metrics: nextMetrics,
        executionRobotModel: status.job.robot_model_id ?? job.executionRobotModel,
        resolvedMjcfPath: status.job.resolved_mjcf_path ?? job.resolvedMjcfPath,
      };
    }

    if (backendState === 'ERROR' || backendState === 'STOPPED') {
      this.log?.('ERROR', `PerfOpt optimize job ${job.backendJobId} failed: ${status.job.error ?? 'unknown error'}`);
      return {
        ...job,
        state: 'error',
        currentStage: 'Validation',
        executionRobotModel: status.job.robot_model_id ?? job.executionRobotModel,
        resolvedMjcfPath: status.job.resolved_mjcf_path ?? job.resolvedMjcfPath,
        error: status.job.error ?? 'PerfOpt backend job failed',
      };
    }

    return {
      ...job,
      state: 'optimizing',
      currentStage: 'Optimization',
      metrics: nextMetrics,
      executionRobotModel: status.job.robot_model_id ?? job.executionRobotModel,
      resolvedMjcfPath: status.job.resolved_mjcf_path ?? job.resolvedMjcfPath,
    };
  }

  async fetchDesignReplay(job: DesignJob): Promise<Er15Replay | null> {
    if (!job.backendJobId) {
      return null;
    }

    const candidatePaths = [
      `/optimize/result?job_id=${encodeURIComponent(job.backendJobId)}`,
      `/api/design/jobs/${encodeURIComponent(job.backendJobId)}/result`,
    ];

    for (const path of candidatePaths) {
      try {
        const payload = await this.fetchJson<unknown>(path);
        const replay = normalizeBackendReplay(payload);
        if (replay) {
          this.log?.('INFO', `PerfOpt optimize job ${job.backendJobId} replay loaded from ${path}.`);
          return replay;
        }
        this.log?.('WARN', `PerfOpt optimize job ${job.backendJobId} result from ${path} did not contain replay frames.`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.startsWith('backend_http_404')) {
          this.log?.('WARN', `PerfOpt optimize job ${job.backendJobId} replay fetch failed at ${path}: ${message}`);
        }
      }
    }

    return null;
  }
}

async function canReachPerfOpt(baseUrl: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 1200);
  try {
    const response = await fetch(`${baseUrl}/health`, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function createDesignApi(log?: LogFn): DesignApi {
  const mockApi = new MockDesignApi(log);
  const perfOptApi = new PerfOptHttpDesignApi(PERFOPT_HTTP_BASE_URL, log);

  return {
    async fetchAlgorithmCatalog(robotModelId?: string) {
      if (await canReachPerfOpt(PERFOPT_HTTP_BASE_URL)) {
        try {
          return await perfOptApi.fetchAlgorithmCatalog(robotModelId);
        } catch (error) {
          log?.('WARN', `PerfOpt algorithm catalog load failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      return mockApi.fetchAlgorithmCatalog(robotModelId);
    },
    async startDesignJob(input: StartDesignJobInput) {
      log?.('INFO', 'Starting Design job from current Define artifact.');
      if (await canReachPerfOpt(PERFOPT_HTTP_BASE_URL)) {
        log?.('INFO', `PerfOpt backend reachable at ${PERFOPT_HTTP_BASE_URL}.`);
        try {
          return await perfOptApi.startDesignJob(input);
        } catch (error) {
          log?.('WARN', `PerfOpt backend start failed, using mock fallback: ${error instanceof Error ? error.message : String(error)}`);
          return mockApi.startDesignJob(input);
        }
      }
      log?.('WARN', `PerfOpt backend not reachable at ${PERFOPT_HTTP_BASE_URL}.`);
      return mockApi.startDesignJob(input);
    },
    async pollDesignJob(job: DesignJob) {
      if (job.backendMode === 'perfopt-http') {
        return perfOptApi.pollDesignJob(job);
      }
      return mockApi.pollDesignJob(job);
    },
    async fetchDesignReplay(job: DesignJob) {
      if (job.backendMode === 'perfopt-http') {
        return perfOptApi.fetchDesignReplay(job);
      }
      return mockApi.fetchDesignReplay(job);
    },
  };
}
