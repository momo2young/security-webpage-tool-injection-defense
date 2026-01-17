import React, { useState } from 'react';
import { Sidebar } from './components/sidebar/Sidebar';
import { ChatWindow } from './components/ChatWindow';

import { ConfigView } from './components/sidebar/ConfigView';
import { ChatList } from './components/ChatList';
import { MemoryView } from './components/memory/MemoryView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StatusBar } from './components/StatusBar';
import { PlanProvider, usePlan } from './hooks/usePlan';
import { ChatProvider, useChatStore } from './hooks/useChatStore.js';

const HeaderTitle: React.FC<{ text?: string }> = ({ text }) => {
  const { backendConfig } = useChatStore();
  return (
    <div className="flex items-center gap-3">
      <div className="w-3 h-3 bg-brutal-black"></div>
      <h1 className="font-brutal text-3xl text-brutal-black tracking-tighter uppercase leading-none">
        {text || backendConfig?.title || 'SUZENT'}
      </h1>
      <div className="w-3 h-3 bg-brutal-black"></div>
    </div>
  );
};

import { SkillsView } from './components/skills/SkillsView';

const AppInner: React.FC = () => {
  const [sidebarTab, setSidebarTab] = useState<'chats' | 'config'>('chats');
  const [mainView, setMainView] = useState<'chat' | 'memory' | 'skills'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { refresh } = usePlan();
  const { currentChatId, setViewSwitcher } = useChatStore();
  const chatIdRef = React.useRef<string | null>(null);

  const handlePlanRefresh = React.useCallback(() => {
    refresh(currentChatId);
  }, [refresh, currentChatId]);

  // Set view switcher in context so child components can switch views
  // Note: setViewSwitcher type in ChatStore likely expects dispatching to 'chat' | 'memory'.
  // Casting or ignoring here if strict typing prevents 'skills'.
  // Ideally update useChatStore type definition, but for now we accept it might mismatch if only used for memory switch.
  React.useEffect(() => {
    setViewSwitcher?.(setMainView as any);
  }, [setViewSwitcher, setMainView]);

  // Load plan when chat changes
  React.useEffect(() => {
    console.log('Loading plan for chat:', currentChatId);
    refresh(currentChatId);
    // Track chat change
    chatIdRef.current = currentChatId;
    // Close sidebar on mobile when chat changes (user selected a chat)
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [currentChatId, refresh]);

  const getTitle = () => {
    switch (mainView) {
      case 'memory': return 'MEMORY SYSTEM';
      case 'skills': return 'SKILLS LIBRARY';
      default: return undefined;
    }
  };

  return (
    <div className="h-full w-full bg-neutral-50 text-brutal-black font-sans">
      <div className="flex h-full relative">
        <Sidebar
          activeTab={sidebarTab}
          onTabChange={setSidebarTab}
          chatsContent={<ChatList />}
          configContent={<ConfigView />}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <header className="border-b-3 border-brutal-black px-4 md:px-6 py-3 md:py-5 flex items-center justify-between bg-brutal-white flex-shrink-0 h-16 md:h-auto">
            <div className="flex items-center gap-2 md:gap-0">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 mr-1 hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
                aria-label="Open Menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <HeaderTitle text={getTitle()} />
            </div>

            {/* View Switcher - Segmented Control */}
            <div className="flex border-3 border-brutal-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {[
                { id: 'chat', label: 'Chat' },
                { id: 'memory', label: 'Memory' },
                { id: 'skills', label: 'Skills' }
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setMainView(view.id as any)}
                  className={`
                            px-4 py-2 font-bold uppercase text-xs md:text-sm transition-colors
                            ${mainView === view.id
                      ? 'bg-brutal-black text-white'
                      : 'bg-white text-brutal-black hover:bg-neutral-100'}
                            ${view.id !== 'skills' ? 'border-r-3 border-brutal-black' : ''}
                        `}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </header>

          {/* System Status Line */}
          <StatusBar />

          {mainView === 'chat' && (
            <div key="chat" className="flex-1 flex flex-col min-h-0 animate-view-fade">
              <ChatWindow />
            </div>
          )}
          {mainView === 'memory' && (
            <div key="memory" className="flex-1 flex flex-col min-h-0 animate-view-fade">
              <MemoryView />
            </div>
          )}
          {mainView === 'skills' && (
            <div key="skills" className="flex-1 flex flex-col min-h-0 animate-view-fade">
              <SkillsView />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ChatProvider>
        <PlanProvider>
          <AppInner />
        </PlanProvider>
      </ChatProvider>
    </ErrorBoundary>
  );
}
