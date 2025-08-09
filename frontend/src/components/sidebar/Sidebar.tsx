import React from 'react';

interface SidebarProps {
  activeTab: 'plan' | 'config';
  onTabChange: (t: 'plan' | 'config') => void;
  planContent: React.ReactNode;
  configContent: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, planContent, configContent }) => {
  return (
    <aside className="w-80 border-r border-neutral-200 flex flex-col bg-white/90 backdrop-blur">
      <nav className="flex">
        {['plan','config'].map(tab => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab as any)}
              className={`flex-1 py-2.5 text-sm font-medium relative transition-colors ${active ? 'text-brand-600' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              {tab === 'plan' ? 'Plan' : 'Configuration'}
              {active && <span className="absolute left-1/2 -translate-x-1/2 -bottom-px h-0.5 w-8 bg-gradient-to-r from-brand-600 to-brand-400 rounded-full" />}
            </button>
          );
        })}
      </nav>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-300/70">
        {activeTab === 'plan' ? planContent : configContent}
      </div>
    </aside>
  );
};
