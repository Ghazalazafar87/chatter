export type Role = 'user' | 'assistant' | 'model';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  image?: string; // base64 data url if image was attached
  tokens?: number;
  latencySeconds?: number;
  model?: string;
  isStreaming?: boolean;
  isError?: boolean;
  groundingSources?: Array<{ title: string; url: string }>;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  model?: string;
  pinned?: boolean;
}

export interface AppSettings {
  theme: 'pastel' | 'dark' | 'light';
  model: string;
  temperature: number;
  systemInstruction: string;
  useSearch: boolean;
  codeExecMode: boolean;
  showLineNumbers: boolean;
  soundEnabled: boolean;
  streamResponses: boolean;
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Coding' | 'Architecture' | 'Debugging' | 'Writing' | 'Reasoning';
  prompt: string;
  systemInstruction?: string;
  icon: string;
}

export interface QuotaTracker {
  totalChatsCount: number;
  dailyRequestsCount: number;
  lastRequestDate: string; // YYYY-MM-DD
  maxDailyRequests: number;
}
