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
        <nav className="flex border-b-3 border-brutal-black relative pr-10">
          <button
            onClick={onClose}
            className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center hover:bg-brutal-red hover:text-white border-l-3 border-brutal-black transition-colors z-10"
            title="Collapse Sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
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
          className={`flex-1 overflow-y-auto scrollbar-thin ${animateContent ? 'animate-brutal-drop' : ''
            }`}
        >
          <div className={activeTab === 'chats' ? '' : 'hidden'} aria-hidden={activeTab !== 'chats'}>
            {mountedTabs.has('chats') ? chatsContent : null}
          </div>
          <div className={`${activeTab === 'config' ? '' : 'hidden'} p-4 space-y-4`} aria-hidden={activeTab !== 'config'}>
            {mountedTabs.has('config') ? configContent : null}
          </div>
        </div>
      </aside>
    </>
  );
};
