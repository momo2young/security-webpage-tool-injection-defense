import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../hooks/useChatStore';
import { streamChat } from '../lib/streaming';
import { Message } from '../types/api';
import { marked } from 'marked';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import { usePlan } from '../hooks/usePlan';

// Configure marked for safer line breaks and code highlighting placeholders
marked.setOptions({ gfm: true, breaks: true });

// Helper to split assistant content into markdown + code bubbles
function splitAssistantContent(content: string): { type: 'markdown' | 'code'; content: string; lang?: string }[] {
  const blocks: { type: 'markdown' | 'code'; content: string; lang?: string }[] = [];
  const codeFenceRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = codeFenceRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'markdown', content: content.slice(lastIndex, match.index) });
    }
    const lang = match[1] || 'text';
    const codeBody = match[2];
    blocks.push({ type: 'code', content: codeBody, lang });
    lastIndex = codeFenceRegex.lastIndex;
  }
  if (lastIndex < content.length) {
    blocks.push({ type: 'markdown', content: content.slice(lastIndex) });
  }
  return blocks.filter(b => b.content.trim() !== '');
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),1500); }}
      className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded bg-neutral-700/70 hover:bg-neutral-600 text-neutral-200"
      title="Copy code"
      type="button"
    >{copied ? 'Copied' : 'Copy'}</button>
  );
};

export const ChatWindow: React.FC = () => {
  const { messages, addMessage, updateAssistantStreaming, config, backendConfig, newAssistantMessage } = useChatStore();
  const { refresh } = usePlan();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { Prism.highlightAll(); }, [messages]);

  const configReady = backendConfig && config.model && config.agent;

  const send = async () => {
    const prompt = input.trim();
    if (!prompt || loading || !configReady) return;
    setInput('');
    addMessage({ role: 'user', content: prompt });
    setLoading(true);
    try {
      await streamChat(prompt, config, {
        onDelta: (partial: string) => { updateAssistantStreaming(partial); Prism.highlightAll(); },
        onAction: () => { refresh(); },
        onNewAssistantMessage: () => { newAssistantMessage(); }
      }, backendConfig?.codeTag || '<code>');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-300/80">
        {messages.map((m: Message, idx: number) => {
          const isUser = m.role === 'user';
          const blocks = isUser ? [{ type: 'markdown', content: m.content } as { type: 'markdown'; content: string; lang?: string }] : splitAssistantContent(m.content);
          return (
            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
              <div className={`group max-w-3xl w-fit ${isUser ? 'bg-gradient-to-tr from-brand-600 to-brand-500 text-white' : 'bg-white/90 border border-neutral-200 text-neutral-800'} rounded-xl shadow-sm px-5 py-3 space-y-3 text-sm leading-relaxed relative`}>                
                {blocks.map((b, bi) => b.type === 'markdown' ? (
                  <div key={bi} className="prose prose-sm max-w-none [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_code]:text-[12px]" dangerouslySetInnerHTML={{ __html: marked.parse(b.content) }} />
                ) : (
                  <div key={bi} className="relative">
                    <CopyButton text={b.content} />
                    <pre className="max-w-3xl overflow-x-auto text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-3 font-mono leading-relaxed">
                      <code className={`language-${(b as any).lang || 'text'}`}>{b.content}</code>
                    </pre>
                  </div>
                ))}
                {!isUser && idx === messages.length - 1 && loading && (
                  <div className="flex gap-1 items-center text-[10px] text-neutral-400 animate-pulse">Thinking<span className="w-1 h-1 bg-neutral-300 rounded-full animate-bounce [animation-delay:-0.2s]"></span><span className="w-1 h-1 bg-neutral-300 rounded-full animate-bounce [animation-delay:-0.05s]"></span><span className="w-1 h-1 bg-neutral-300 rounded-full animate-bounce"></span></div>
                )}
              </div>
            </div>
          );
        })}
        {!configReady && (
          <div className="text-xs text-neutral-400">Loading backend configuration...</div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-neutral-200 p-4 flex gap-3 bg-white/95">
        <div className="flex-1 relative">
          <textarea
            className="flex-1 w-full resize-none rounded-xl bg-neutral-50 border border-neutral-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 focus:outline-none px-4 py-3 text-sm placeholder-neutral-400 shadow-inner"
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={configReady ? 'Ask me anything...' : 'Waiting for config...'}
            disabled={!configReady}
          />
          <div className="absolute bottom-2 right-3 text-[10px] text-neutral-400 select-none">Enter to send • Shift+Enter newline</div>
        </div>
        <button
          type="submit"
          className="h-12 self-end rounded-lg bg-brand-600 hover:bg-brand-500 active:bg-brand-500/90 transition-colors px-5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow text-white"
          disabled={loading || !configReady}
        >
          {loading ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  );
};
