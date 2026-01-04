import React from 'react';

interface SidebarProps {
  activeTab: 'chats' | 'plan' | 'config';
  onTabChange: (t: 'chats' | 'plan' | 'config') => void;
  chatsContent: React.ReactNode;
  planContent: React.ReactNode;
  configContent: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  chatsContent,
  planContent,
  configContent,
  isOpen = false,
  onClose
}) => {
  const [animateContent, setAnimateContent] = React.useState(false);
  const [mountedTabs, setMountedTabs] = React.useState<Set<'chats' | 'plan' | 'config'>>(() => new Set(['chats']));

  React.useEffect(() => {
    setAnimateContent(true);
    const timeout = window.setTimeout(() => setAnimateContent(false), 200);
    return () => window.clearTimeout(timeout);
  }, [activeTab]);

  React.useEffect(() => {
    setMountedTabs(prev => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

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
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-brutal-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <aside className={`
        fixed md:relative z-50 h-full
        w-80 border-r-3 border-brutal-black flex flex-col bg-neutral-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <nav className="flex border-b-3 border-brutal-black">
          {['chats', 'plan', 'config'].map(tab => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab as any)}
                className={`flex-1 py-3 text-xs font-bold uppercase relative transition-all duration-200 ${active ? 'bg-brutal-black text-white' : 'bg-white text-brutal-black hover:bg-brutal-yellow border-r-3 border-brutal-black last:border-r-0'}`}
              >
                {getTabLabel(tab)}
              </button>
            );
          })}
        </nav>
        <div
          className={`flex-1 overflow-y-auto scrollbar-thin ${
            animateContent ? 'animate-brutal-drop' : ''
          }`}
        >
          <div className={activeTab === 'chats' ? '' : 'hidden'} aria-hidden={activeTab !== 'chats'}>
            {mountedTabs.has('chats') ? chatsContent : null}
          </div>
          <div className={`${activeTab === 'plan' ? '' : 'hidden'} p-4 space-y-4`} aria-hidden={activeTab !== 'plan'}>
            {mountedTabs.has('plan') ? planContent : null}
          </div>
          <div className={`${activeTab === 'config' ? '' : 'hidden'} p-4 space-y-4`} aria-hidden={activeTab !== 'config'}>
            {mountedTabs.has('config') ? configContent : null}
          </div>
        </div>
      </aside>
    </>
  );
};
