export interface Er15ReplayFrame {
  time: number;
  qpos: readonly number[];
}

export interface Er15Replay {
  readonly label: string;
  readonly durationMs: number;
  readonly loop: boolean;
  readonly frames: readonly Er15ReplayFrame[];
  readonly source: 'backend';
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function normalizeFrame(raw: unknown): Er15ReplayFrame | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const candidate = raw as { time?: unknown; t?: unknown; qpos?: unknown; positions?: unknown; joints?: unknown };
  const rawTime = candidate.time ?? candidate.t;
  const rawQpos = candidate.qpos ?? candidate.positions ?? candidate.joints;
  if (!isFiniteNumber(rawTime) || !Array.isArray(rawQpos)) {
    return null;
  }

  const qpos = rawQpos
    .map((value) => (typeof value === 'number' ? value : Number(value)))
    .filter((value) => Number.isFinite(value));
  if (qpos.length !== rawQpos.length || qpos.length === 0) {
    return null;
  }

  return {
    time: rawTime,
    qpos,
  };
}

export function normalizeBackendReplay(payload: unknown): Er15Replay | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const root = payload as {
    replay?: unknown;
    result?: unknown;
    frames?: unknown;
    trajectory?: unknown;
    qpos_series?: unknown;
    duration_ms?: unknown;
    durationMs?: unknown;
    duration_s?: unknown;
    duration?: unknown;
    loop?: unknown;
    label?: unknown;
  };

  const replayNode = (root.replay ?? root.result ?? root) as {
    frames?: unknown;
    trajectory?: unknown;
    qpos_series?: unknown;
    duration_ms?: unknown;
    durationMs?: unknown;
    duration_s?: unknown;
    duration?: unknown;
    loop?: unknown;
    label?: unknown;
  };

  const rawFrames = replayNode.frames ?? replayNode.trajectory ?? replayNode.qpos_series;
  if (!Array.isArray(rawFrames)) {
    return null;
  }

  const frames = rawFrames.map(normalizeFrame).filter((frame): frame is Er15ReplayFrame => frame !== null);
  if (frames.length < 2) {
    return null;
  }

  const explicitDurationMs = Number(
    replayNode.duration_ms ?? replayNode.durationMs ?? (isFiniteNumber(replayNode.duration_s) ? replayNode.duration_s * 1000 : replayNode.duration),
  );
  const inferredDurationMs = Math.max(1, Math.round(frames[frames.length - 1].time * 1000));
  const durationMs = Number.isFinite(explicitDurationMs) && explicitDurationMs > 0 ? explicitDurationMs : inferredDurationMs;

  return {
    label: typeof replayNode.label === 'string' && replayNode.label.trim() ? replayNode.label : 'Backend replay',
    durationMs,
    loop: replayNode.loop === true,
    frames,
    source: 'backend',
  };
}
