import { useCallback, useEffect, useState } from 'react';
import { Plan } from '../types/api';

export function usePlan() {
  const [plan, setPlan] = useState<Plan | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/plan');
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { plan, refresh };
}
