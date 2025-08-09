import React, { useState } from 'react';
import { Sidebar } from './components/sidebar/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { PlanView } from './components/sidebar/PlanView';
import { ConfigView } from './components/sidebar/ConfigView';
import { usePlan } from './hooks/usePlan';
import { ChatProvider, useChatStore } from './hooks/useChatStore';

const HeaderTitle: React.FC = () => {
  const { backendConfig } = useChatStore();
  return (
    <h1 className="font-semibold text-lg bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent tracking-tight">
      {backendConfig?.title || 'Suzent'}
    </h1>
  );
};

export default function App() {
  const [sidebarTab, setSidebarTab] = useState<'plan' | 'config'>('plan');
  const { plan, refresh } = usePlan();

  return (
    <ChatProvider>
      <div className="h-full w-full bg-neutral-50 text-neutral-800 font-sans">
        <div className="flex h-full">
          <Sidebar
            activeTab={sidebarTab}
            onTabChange={setSidebarTab}
            planContent={<PlanView plan={plan} onRefresh={refresh} />}
            configContent={<ConfigView />}
          />
          <div className="flex-1 flex flex-col">
            <header className="border-b border-neutral-200 px-6 py-3 flex items-center justify-between bg-white/90 backdrop-blur">
              <HeaderTitle />
            </header>
            <ChatWindow />
          </div>
        </div>
      </div>
    </ChatProvider>
  );
}
