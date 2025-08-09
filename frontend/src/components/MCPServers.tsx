import React, { useState } from 'react';
import { useChatStore } from '../hooks/useChatStore';

interface MCPServer { name: string; url: string; enabled: boolean }

export const MCPServers: React.FC = () => {
  const { config, setConfig } = useChatStore();
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const add = () => {
    if (!name || !url) return;
    setServers(prev => [...prev, { name, url, enabled: true }]);
    setName(''); setUrl('');
  };

  const toggle = (i: number) => setServers(prev => prev.map((s, idx) => idx === i ? { ...s, enabled: !s.enabled } : s));
  const remove = (i: number) => setServers(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3 text-xs">
      <div className="font-medium">MCP Servers</div>
      <div className="flex gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-2 py-1" />
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL" className="flex-[2] bg-neutral-800 border border-neutral-700 rounded px-2 py-1" />
        <button onClick={add} className="bg-brand-600 px-2 rounded">Add</button>
      </div>
      <ul className="space-y-2">
        {servers.map((s, i) => (
          <li key={i} className="flex items-center gap-2 bg-neutral-800 rounded p-2">
            <input type="checkbox" checked={s.enabled} onChange={() => toggle(i)} />
            <div className="flex-1">
              <div className="font-semibold">{s.name}</div>
              <div className="text-neutral-400">{s.url}</div>
            </div>
            <button onClick={() => remove(i)} className="text-neutral-400 hover:text-red-400">✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
