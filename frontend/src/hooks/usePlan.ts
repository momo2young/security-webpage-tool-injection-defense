import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Plan } from '../types/api';

interface PlanContextValue {
  plan: Plan | null;
  refresh: (chatId?: string | null) => Promise<void>;
  setPlan: React.Dispatch<React.SetStateAction<Plan | null>>;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plan, setPlan] = useState<Plan | null>(null);

  const refresh = useCallback(async (chatId?: string | null) => {
    if (!chatId) {
      // No chat selected, clear plan
      setPlan(null);
      return;
    }
    
    try {
      console.log(`Fetching plan for chat_id: ${chatId}`);
      const res = await fetch(`/api/plan?chat_id=${chatId}`);
      console.log(`Plan fetch response: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log('Plan data received:', data);
        setPlan(data);
      } else if (res.status === 400 || res.status === 404) {
        console.log('No plan found for this chat');
        setPlan(null);
      } else {
        console.warn(`Plan fetch failed with status ${res.status}`);
        setPlan(null);
      }
    } catch (error) {
      console.warn('Failed to fetch plan:', error);
      setPlan(null);
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
