import React from 'react';

interface SidebarProps {
  activeTab: 'chats' | 'config';
  onTabChange: (t: 'chats' | 'config') => void;
  chatsContent: React.ReactNode;
  configContent: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  chatsContent,
  configContent,
  isOpen = false,
  onClose
}) => {
  const [animateContent, setAnimateContent] = React.useState(false);
  const [mountedTabs, setMountedTabs] = React.useState<Set<'chats' | 'config'>>(() => new Set(['chats']));

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
        fixed md:relative z-50 h-full shrink-0
        w-80 border-r-3 border-brutal-black flex flex-col bg-neutral-50
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 md:ml-0' : '-translate-x-full md:translate-x-0 md:-ml-80'}
      `}>
        <div className="h-14 flex items-center justify-start px-4 border-b-3 border-brutal-black bg-white sticky top-0 z-10 shrink-0">
          {/* Toggle Button (Close) */}
          <button
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-neutral-200 transition-colors text-brutal-black"
            aria-label="Close Sidebar"
            title="Close Sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <line x1="9" y1="4" x2="9" y2="20" />
            </svg>
          </button>

          {/* Vertical Separator */}
          <div className="h-6 w-[2px] bg-neutral-300 mx-2 rounded-full" />

          {/* Logo (Static) */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="Suzent Logo" className="h-10 w-10">
            <rect x="1.5" y="1.5" width="21" height="21" rx="3" fill="#FFFFFF" />
            <rect x="3.5" y="3.5" width="17" height="17" rx="3" fill="#000000" />
            <rect x="5.5" y="7" width="5" height="5" rx="1.5" fill="#FFFFFF" />
            <rect x="13.5" y="7" width="5" height="5" rx="1.5" fill="#FFFFFF" />
          </svg>
        </div>
        <nav className="flex border-b-3 border-brutal-black">
          {['chats', 'config'].map(tab => {
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
          className={`flex-1 flex flex-col overflow-hidden relative ${animateContent ? 'animate-brutal-drop' : ''
            }`}
        >
          <div className={activeTab === 'chats' ? 'h-full' : 'hidden'} aria-hidden={activeTab !== 'chats'}>
            {mountedTabs.has('chats') ? chatsContent : null}
          </div>
          <div className={`${activeTab === 'config' ? '' : 'hidden'} h-full overflow-y-auto scrollbar-thin p-4 space-y-4`} aria-hidden={activeTab !== 'config'}>
            {mountedTabs.has('config') ? configContent : null}
          </div>
        </div>
      </aside>
    </>
  );
};
