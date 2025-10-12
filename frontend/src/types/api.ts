export interface Message { role: 'user' | 'assistant'; content: string; }
export interface ChatConfig { model: string; agent: string; tools: string[]; mcp_urls?: string[] }

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  config: ChatConfig;
}

export interface ChatSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
}

export interface PlanTask { number: number; description: string; status: 'pending' | 'in_progress' | 'completed' | 'failed'; note?: string }
export interface Plan { objective: string; tasks: PlanTask[] }

// Added: configuration options exposed by backend (derived from suzent.config.Config)
export interface ConfigOptions {
  title: string;
  models: string[];
  agents: string[];
  tools: string[];        // full list of tool options
  defaultTools: string[]; // default enabled tools
  codeTag: string;        // CODE_TAG (e.g. <code>) so frontend can parse blocks consistently
}
