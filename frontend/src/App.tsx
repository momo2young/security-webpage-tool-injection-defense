import React, { useState } from 'react';
import { Sidebar } from './components/sidebar/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { PlanView } from './components/sidebar/PlanView';
import { ConfigView } from './components/sidebar/ConfigView';
import { usePlan } from './hooks/usePlan';
import { ChatProvider, useChatStore } from './hooks/useChatStore';

const HeaderTitle: React.FC = () => {
  const { backendConfig } = useChatStore();
  return <h1 className="font-semibold text-lg">{backendConfig?.title || 'Suzent'}</h1>;
};

export default function App() {
  const [sidebarTab, setSidebarTab] = useState<'plan' | 'config'>('plan');
  const { plan, refresh } = usePlan();

  return (
    <ChatProvider>
      <div className="flex h-full">
        <Sidebar
          activeTab={sidebarTab}
          onTabChange={setSidebarTab}
          planContent={<PlanView plan={plan} onRefresh={refresh} />}
          configContent={<ConfigView />}
        />
        <div className="flex-1 flex flex-col">
          <header className="border-b border-neutral-800 px-4 py-2 flex items-center justify-between">
            <HeaderTitle />
          </header>
          <ChatWindow />
        </div>
      </div>
    </ChatProvider>
  );
}
