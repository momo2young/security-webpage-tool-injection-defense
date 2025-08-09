import React from 'react';
import { Plan } from '../../types/api';

export const PlanView: React.FC<{ plan: Plan | null; onRefresh: () => void }> = ({ plan, onRefresh }) => {
  if (!plan) {
    return <div className="text-xs text-neutral-500">No plan loaded.</div>;
  }
  const completed = plan.tasks.filter(t => t.status === 'completed').length;
  const progress = plan.tasks.length ? completed / plan.tasks.length : 0;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-sm tracking-wide text-neutral-700">Objective</h2>
        <button onClick={onRefresh} className="text-[11px] text-brand-600 hover:text-brand-500 transition-colors">Refresh</button>
      </div>
      <div className="text-sm font-semibold leading-snug text-neutral-900">{plan.objective}</div>
      <div className="w-full h-2 rounded bg-neutral-200 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-300" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="text-[11px] text-neutral-500">{completed}/{plan.tasks.length} tasks completed</div>
      <ul className="space-y-2 text-[11px]">
        {plan.tasks.map(task => {
          const statusIcons: Record<string,string> = { pending: '⚪', in_progress: '🔵', completed: '🟢', failed: '🔴' };
          return (
            <li key={task.number} className="bg-white/70 rounded border border-neutral-200 p-2.5">
              <div className="flex justify-between items-start gap-2">
                <span className="font-medium text-neutral-800 flex-1">{task.number}. {task.description}</span>
                <span className="shrink-0 text-xs">{statusIcons[task.status] || '❓'}</span>
              </div>
              {task.note && <div className="mt-1 italic text-neutral-500">{task.note}</div>}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
