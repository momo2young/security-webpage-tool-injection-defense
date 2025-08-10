import React from 'react';
import { useChatStore } from '../../hooks/useChatStore';

export const ConfigView: React.FC = () => {
  const { config, setConfig, backendConfig, resetChat } = useChatStore();

  if (!backendConfig) {
    return <div className="text-xs text-neutral-500">Loading config...</div>;
  }

  const update = (patch: Partial<typeof config>) => setConfig({ ...config, ...patch });

  const toggleTool = (tool: string) => {
    const tools = config.tools.includes(tool) ? config.tools.filter((t: string) => t !== tool) : [...config.tools, tool];
    update({ tools });
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold tracking-wide text-neutral-700">Session</div>
        <button type="button" onClick={resetChat} className="text-[11px] px-2 py-1 rounded bg-neutral-200 hover:bg-neutral-300 text-neutral-700">New Chat</button>
      </div>
      <div className="space-y-1">
        <label className="block font-medium tracking-wide text-neutral-700">Model</label>
        <select
          value={config.model}
          onChange={e => update({ model: e.target.value })}
          className="w-full bg-white/70 border border-neutral-300 rounded-lg px-3 py-2 focus:border-brand-500 focus:outline-none"
        >
          {backendConfig.models.map((m: string) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <label className="block font-medium tracking-wide text-neutral-700">Agent</label>
        <select
          value={config.agent}
          onChange={e => update({ agent: e.target.value })}
          className="w-full bg-white/70 border border-neutral-300 rounded-lg px-3 py-2 focus:border-brand-500 focus:outline-none"
        >
          {backendConfig.agents.map((a: string) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="block font-medium tracking-wide text-neutral-700">Tools</label>
        <div className="flex flex-wrap gap-2">
          {backendConfig.tools.map((tool: string) => {
            const active = config.tools.includes(tool);
            return (
              <button
                key={tool}
                type="button"
                onClick={() => toggleTool(tool)}
                className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors ${active ? 'bg-brand-600 text-white border-brand-500 shadow' : 'border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:text-neutral-900 bg-white/70'}`}
              >
                {tool}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
