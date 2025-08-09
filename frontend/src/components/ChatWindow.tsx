import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../hooks/useChatStore';
import { streamChat } from '../lib/streaming';
import { Message } from '../types/api';
import { marked } from 'marked';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import { usePlan } from '../hooks/usePlan';

// Helper to split assistant content into markdown + code bubbles
function splitAssistantContent(content: string): { type: 'markdown' | 'code'; content: string }[] {
  const blocks: { type: 'markdown' | 'code'; content: string }[] = [];
  const codeFenceRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = codeFenceRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'markdown', content: content.slice(lastIndex, match.index) });
    }
    const codeBody = match[2];
    blocks.push({ type: 'code', content: codeBody });
    lastIndex = codeFenceRegex.lastIndex;
  }
  if (lastIndex < content.length) {
    blocks.push({ type: 'markdown', content: content.slice(lastIndex) });
  }
  return blocks.filter(b => b.content.trim() !== '');
}

export const ChatWindow: React.FC = () => {
  const { messages, addMessage, updateAssistantStreaming, config, backendConfig, newAssistantMessage } = useChatStore();
  const { refresh } = usePlan();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const configReady = backendConfig && config.model && config.agent;

  const send = async () => {
    const prompt = input.trim();
    if (!prompt || loading || !configReady) return;
    setInput('');
    addMessage({ role: 'user', content: prompt });
    setLoading(true);
    try {
      await streamChat(prompt, config, {
        onDelta: (partial: string) => {
          updateAssistantStreaming(partial);
          setTimeout(() => Prism.highlightAll(), 0);
        },
        onAction: () => { refresh(); },
        onNewAssistantMessage: () => { newAssistantMessage(); }
      }, backendConfig?.codeTag || '<code>');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m: Message, idx: number) => {
          if (m.role === 'user') {
            return (
              <div key={idx} className="text-right">
                <div className="inline-block max-w-3xl rounded-lg px-4 py-2 text-sm whitespace-pre-wrap bg-brand-600 text-white">
                  <div>{m.content}</div>
                </div>
              </div>
            );
          }
          // assistant: split into blocks
          const blocks = splitAssistantContent(m.content);
          return (
            <div key={idx} className="space-y-2">
              {blocks.map((b, bi) => b.type === 'markdown' ? (
                <div key={bi} className="text-left">
                  <div className="inline-block max-w-3xl rounded-lg px-4 py-2 text-sm bg-neutral-800 text-neutral-100 whitespace-pre-wrap">
                    <div dangerouslySetInnerHTML={{ __html: marked.parse(b.content) }} />
                  </div>
                </div>
              ) : (
                <div key={bi} className="text-left">
                  <pre className="max-w-3xl overflow-x-auto text-xs bg-neutral-900 border border-neutral-700 rounded p-3"><code className="language-python">{b.content}</code></pre>
                </div>
              ))}
            </div>
          );
        })}
        {!configReady && (
          <div className="text-xs text-neutral-500">Loading backend configuration...</div>
        )}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="border-t border-neutral-800 p-4 flex gap-2"
      >
        <textarea
          className="flex-1 resize-none rounded-md bg-neutral-800 border border-neutral-700 focus:border-brand-500 focus:outline-none px-3 py-2 text-sm"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={configReady ? 'Type a prompt...' : 'Waiting for config...'}
          disabled={!configReady}
        />
        <button
          type="submit"
          className="rounded-md bg-brand-600 hover:bg-brand-500 px-4 py-2 text-sm font-medium disabled:opacity-50"
          disabled={loading || !configReady}
        >
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};
