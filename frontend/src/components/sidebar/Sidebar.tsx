import React from 'react';

interface SidebarProps {
  activeTab: 'chats' | 'plan' | 'config';
  onTabChange: (t: 'chats' | 'plan' | 'config') => void;
  chatsContent: React.ReactNode;
  planContent: React.ReactNode;
  configContent: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, chatsContent, planContent, configContent }) => {
  const getTabContent = () => {
    switch (activeTab) {
      case 'chats':
        return chatsContent;
      case 'plan':
        return planContent;
      case 'config':
        return configContent;
      default:
        return null;
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'chats':
        return 'Chats';
      case 'plan':
        return 'Plan';
      case 'config':
        return 'Configuration';
      default:
        return tab;
    }
  };

  return (
    <aside className="w-80 border-r border-neutral-200 flex flex-col bg-white/90 backdrop-blur">
      <nav className="flex border-b border-neutral-200">
        {['chats', 'plan', 'config'].map(tab => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab as any)}
              className={`flex-1 py-2.5 text-sm font-medium relative transition-colors ${active ? 'text-brand-600' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              {getTabLabel(tab)}
              {active && <span className="absolute left-1/2 -translate-x-1/2 -bottom-px h-0.5 w-8 bg-gradient-to-r from-brand-600 to-brand-400 rounded-full" />}
            </button>
          );
        })}
      </nav>
      <div className={`flex-1 overflow-y-auto ${activeTab === 'chats' ? '' : 'p-4 space-y-4'} scrollbar-thin scrollbar-thumb-neutral-300/70`}>
        {getTabContent()}
      </div>
    </aside>
  );
};
