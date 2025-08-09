import React from 'react';

interface SidebarProps {
  activeTab: 'plan' | 'config';
  onTabChange: (t: 'plan' | 'config') => void;
  planContent: React.ReactNode;
  configContent: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, planContent, configContent }) => {
  return (
    <aside className="w-80 border-r border-neutral-800 flex flex-col bg-neutral-900">
      <nav className="flex">
        {['plan','config'].map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab as any)}
            className={`flex-1 py-2 text-sm font-medium ${activeTab === tab ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'}`}
          >
            {tab === 'plan' ? 'Plan' : 'Configuration'}
          </button>
        ))}
      </nav>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activeTab === 'plan' ? planContent : configContent}
      </div>
    </aside>
  );
};
