import React from 'react';
import { useChatStore } from '../../hooks/useChatStore';

export const ConfigView: React.FC = () => {
  const { config, setConfig, backendConfig } = useChatStore();

  if (!backendConfig) {
    return <div className="text-xs text-neutral-400">Loading config...</div>;
  }

  const update = (patch: Partial<typeof config>) => setConfig({ ...config, ...patch });

  const toggleTool = (tool: string) => {
    const tools = config.tools.includes(tool) ? config.tools.filter(t => t !== tool) : [...config.tools, tool];
    update({ tools });
  };

  return (
    <div className="space-y-4 text-xs">
      <div>
        <label className="block mb-1 font-medium">Model</label>
        <select
          value={config.model}
          onChange={e => update({ model: e.target.value })}
          className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1"
        >
          {backendConfig.models.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Agent</label>
        <select
          value={config.agent}
          onChange={e => update({ agent: e.target.value })}
          className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1"
        >
          {backendConfig.agents.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Tools</label>
        <div className="flex flex-wrap gap-2">
          {backendConfig.tools.map(tool => (
            <button
              key={tool}
              type="button"
              onClick={() => toggleTool(tool)}
              className={`px-2 py-1 rounded border text-xs ${config.tools.includes(tool) ? 'bg-brand-600 border-brand-500' : 'border-neutral-600'}`}
            >
              {tool}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
