import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Plan } from '../types/api';

interface PlanContextValue {
  plan: Plan | null;
  refresh: () => Promise<void>;
  setPlan: React.Dispatch<React.SetStateAction<Plan | null>>;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plan, setPlan] = useState<Plan | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/plan');
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return React.createElement(PlanContext.Provider, { value: { plan, refresh, setPlan } }, children);
};

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within PlanProvider');
  return ctx;
}
