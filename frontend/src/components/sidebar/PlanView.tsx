import React from 'react';
import { Plan } from '../../types/api';

export const PlanView: React.FC<{ plan: Plan | null; onRefresh: () => void }> = ({ plan, onRefresh }) => {
  if (!plan) {
    return <div className="text-xs text-neutral-400">No plan loaded.</div>;
  }
  const completed = plan.tasks.filter(t => t.status === 'completed').length;
  const progress = plan.tasks.length ? completed / plan.tasks.length : 0;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-sm">Objective</h2>
        <button onClick={onRefresh} className="text-xs text-brand-500 hover:underline">Refresh</button>
      </div>
      <div className="text-sm font-semibold">{plan.objective}</div>
      <div className="w-full bg-neutral-800 rounded h-2 overflow-hidden">
        <div className="bg-brand-600 h-2" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="text-xs text-neutral-400">{completed}/{plan.tasks.length} tasks completed</div>
      <ul className="space-y-2 text-xs">
        {plan.tasks.map(task => (
          <li key={task.number} className="bg-neutral-800 rounded p-2">
            <div className="flex justify-between">
              <span>{task.number}. {task.description}</span>
              <span>{{
                pending: '⚪',
                in_progress: '🔵',
                completed: '🟢',
                failed: '🔴'
              }[task.status] || '❓'}</span>
            </div>
            {task.note && <div className="mt-1 italic text-neutral-400">{task.note}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
};
