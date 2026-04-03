import React from 'react';
import { Terminal } from 'lucide-react';
import { RuntimeLogEntry } from '../types';

function levelClass(level: RuntimeLogEntry['level']) {
  if (level === 'ERROR') return 'text-red-600';
  if (level === 'WARN') return 'text-amber-600';
  if (level === 'DEBUG') return 'text-blue-600';
  return 'text-emerald-600';
}

export function SystemMonitor({ logs = [] }: { logs?: RuntimeLogEntry[] }) {
  return (
    <div className="h-full bg-white flex flex-col overflow-hidden select-text">
      <div className="h-8 px-4 flex items-center gap-2 border-b border-[#e5e5e5] shrink-0 bg-[#f8f8f8]">
        <Terminal className="w-3.5 h-3.5 text-[#6f6f6f]" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#333333]">运行日志</span>
      </div>

      <div className="flex-1 p-2 overflow-y-auto custom-scrollbar font-mono text-[11px] leading-tight space-y-0.5">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-[#6f6f6f] shrink-0 select-none w-16">[{log.timestamp}]</span>
            <p className="text-[#333333]">
              <span className={levelClass(log.level)}>{log.level}:</span> {log.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
