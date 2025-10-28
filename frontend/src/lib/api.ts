// MCP server management API
export async function fetchMcpServers() {
  const res = await fetch('/api/mcp_servers');
  if (!res.ok) throw new Error('Failed to fetch MCP servers');
  return res.json();
}


// Add MCP server (URL or stdio)
export async function addMcpServer(name: string, url?: string, stdio?: { command: string, args?: string[], env?: Record<string, string> }) {
  const body: any = { name };
  if (url) body.url = url;
  if (stdio) body.stdio = stdio;
  const res = await fetch('/api/mcp_servers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('Failed to add MCP server');
  return res.json();
}

export async function removeMcpServer(name: string) {
  const res = await fetch('/api/mcp_servers/remove', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Failed to remove MCP server');
  return res.json();
}

export async function setMcpServerEnabled(name: string, enabled: boolean) {
  const res = await fetch('/api/mcp_servers/enabled', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, enabled })
  });
  if (!res.ok) throw new Error('Failed to update MCP server');
  return res.json();
}
import { ConfigOptions } from '../types/api';

export async function fetchBackendConfig(): Promise<ConfigOptions | null> {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
