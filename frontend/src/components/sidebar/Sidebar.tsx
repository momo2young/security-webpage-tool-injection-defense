import React from 'react';

interface SidebarProps {
  activeTab: 'chats' | 'plan' | 'config';
  onTabChange: (t: 'chats' | 'plan' | 'config') => void;
  chatsContent: React.ReactNode;
  planContent: React.ReactNode;
  configContent: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, chatsContent, planContent, configContent }) => {
  const [animateContent, setAnimateContent] = React.useState(false);

  React.useEffect(() => {
    setAnimateContent(true);
    const timeout = window.setTimeout(() => setAnimateContent(false), 200);
    return () => window.clearTimeout(timeout);
  }, [activeTab]);

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
        return 'Settings';
      default:
        return tab;
    }
  };

  return (
    <aside className="w-80 border-r-4 border-brutal-black flex flex-col bg-neutral-100">
      <nav className="flex border-b-3 border-brutal-black">
        {['chats', 'plan', 'config'].map(tab => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab as any)}
              className={`flex-1 py-3 text-sm font-bold uppercase relative transition-all duration-100 active:animate-brutal-shake ${active ? 'bg-brutal-black text-brutal-white' : 'bg-neutral-100 text-brutal-black hover:bg-neutral-200 border-r-3 border-brutal-black last:border-r-0'}`}
            >
              {getTabLabel(tab)}
            </button>
          );
        })}
      </nav>
      <div
        className={`flex-1 overflow-y-auto ${activeTab === 'chats' ? '' : 'p-4 space-y-4'} scrollbar-thin scrollbar-thumb-brutal-black ${
          animateContent ? 'sidebar-content-animate' : ''
        }`}
      >
        {getTabContent()}
      </div>
    </aside>
  );
};
