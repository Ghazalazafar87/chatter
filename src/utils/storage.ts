import { Conversation, AppSettings, QuotaTracker } from '../types/chat';

const STORAGE_KEYS = {
  CONVERSATIONS: 'gemini_chat_conversations_v2',
  ACTIVE_ID: 'gemini_chat_active_id_v2',
  SETTINGS: 'gemini_chat_settings_v2',
  QUOTA: 'gemini_chat_quota_tracker_v2',
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'pastel',
  model: 'gemini-flash-lite-latest',
  temperature: 0.7,
  systemInstruction:
    'You are Gemini Lumina Synth, a sharp, helpful, and technically precise AI assistant. You provide clean, modern, and production-ready code with concise explanations. Structure responses with clear headings and well-formatted markdown code blocks.',
  useSearch: false,
  codeExecMode: false,
  showLineNumbers: true,
  soundEnabled: true,
  streamResponses: true,
};

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-sample-1',
    title: 'Architecture Blueprint Engine',
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    model: 'gemini-3.8-flash',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Can you show me how Next.js App Router API route handles streaming responses from the Google Gemini API with local fallback? Include error handling for rate limits.',
        timestamp: Date.now() - 1000 * 60 * 60 * 2,
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `Here is a battle-tested Next.js App Router route (\`app/api/chat/route.ts\`) using the native **@google/genai** SDK. It delivers chunked HTTP SSE streams via standard \`ReadableStream\`, catches 429 quota exhaustion gracefully, and seamlessly switches over to an offline cached buffer:

\`\`\`typescript
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    // Transform Gemini chunk generator into native ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of responseStream) {
          controller.enqueue(new TextEncoder().encode(chunk.text));
        }
        controller.close();
      },
    });

    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
  } catch (err: any) {
    // Fallback handling for 429 Rate Limits
    if (err?.status === 429) {
      return NextResponse.json({ error: 'Rate limit reached. Serving fallback cache.', cached: true }, { status: 429 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
\`\`\`

The fallback protocol returns a designated \`HTTP 429\` JSON payload, permitting client-side hooks to read the latest hydrated state straight from browser-local IndexedDB or localStorage snapshots.`,
        timestamp: Date.now() - 1000 * 60 * 60 * 2 + 1000 * 15,
        tokens: 342,
        latencySeconds: 0.8,
        model: 'gemini-3.8-flash',
      },
    ],
  },
  {
    id: 'conv-sample-2',
    title: 'Tailwind Design Tokens Refactor',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    model: 'gemini-3.8-flash',
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        content: 'How should I structure Tailwind CSS v4 design tokens with dark mode surfaces and high-contrast emerald accents?',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: `In Tailwind CSS v4, tokens are declared cleanly using CSS variables with \`@theme\` or standard CSS properties:

\`\`\`css
@theme {
  --color-surface-dim: #121318;
  --color-surface-container: #1e1f25;
  --color-surface-container-high: #292a2f;
  --color-primary: #10b981;
  --color-tertiary: #06b6d4;
  --font-sans: 'Geist', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
\`\`\`

This setup ensures zero-runtime CSS footprint and instantaneous dark-mode contrast.`,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 10,
        tokens: 180,
        latencySeconds: 0.6,
        model: 'gemini-3.8-flash',
      },
    ],
  },
  {
    id: 'conv-sample-3',
    title: 'Next.js App Router Scalability',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    model: 'gemini-3.8-flash',
    messages: [
      {
        id: 'msg-5',
        role: 'user',
        content: 'What are the main performance considerations when scaling Server Components in Next.js 15?',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 6,
      },
      {
        id: 'msg-6',
        role: 'assistant',
        content: `When scaling Server Components:
1. **Streaming with Suspense**: Wrap slow data fetching in \`<Suspense fallback={<Skeleton />}>\` to stream UI chunks immediately.
2. **Data Caching & Revalidation**: Use \`unstable_cache\` or \`fetch({ next: { revalidate: 60 } })\` to minimize backend round-trips.
3. **Parallel Routes & Intercepting**: Decouple modal routes and dashboard panels.`,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 6 + 1000 * 12,
        tokens: 154,
        latencySeconds: 0.5,
        model: 'gemini-3.8-flash',
      },
    ],
  },
  {
    id: 'conv-sample-4',
    title: 'Vector Search RAG Implementation',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
    model: 'gemini-3.8-flash',
    messages: [
      {
        id: 'msg-7',
        role: 'user',
        content: 'Explain cosine similarity vs dot product for normalized embeddings.',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 14,
      },
      {
        id: 'msg-8',
        role: 'assistant',
        content: `When embedding vectors are L2-normalized ($$||u|| = 1$$ and $$||v|| = 1$$):
- **Cosine similarity** is mathematically identical to the **dot product**:
$$\\cos(\\theta) = \\frac{u \\cdot v}{\\|u\\| \\|v\\|} = u \\cdot v$$
- Computing dot products on normalized vectors is significantly faster as it avoids square-root magnitude calculations during nearest-neighbor queries.`,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 14 + 1000 * 8,
        tokens: 140,
        latencySeconds: 0.4,
        model: 'gemini-3.8-flash',
      },
    ],
  },
];

// Helper: safe local storage reading
function safeGetItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Failed to load key "${key}" from localStorage:`, e);
    return defaultValue;
  }
}

// Helper: safe local storage writing
function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save key "${key}" to localStorage:`, e);
  }
}

export function loadConversations(): Conversation[] {
  const data = safeGetItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  if (!data || data.length === 0) {
    saveConversations(INITIAL_CONVERSATIONS);
    return INITIAL_CONVERSATIONS;
  }
  return data;
}

export function saveConversations(conversations: Conversation[]): void {
  safeSetItem(STORAGE_KEYS.CONVERSATIONS, conversations);
}

export function loadActiveConversationId(): string | null {
  return safeGetItem<string | null>(STORAGE_KEYS.ACTIVE_ID, null);
}

export function saveActiveConversationId(id: string | null): void {
  safeSetItem(STORAGE_KEYS.ACTIVE_ID, id);
}

export function loadSettings(): AppSettings {
  const current = safeGetItem<Partial<AppSettings>>(STORAGE_KEYS.SETTINGS, {});
  const merged = { ...DEFAULT_SETTINGS, ...current };
  if (!current.theme || current.theme === 'dark') {
    merged.theme = 'pastel';
  }
  if (merged.model === 'gemini-3.8-flash' || merged.model === 'gemini-3.1-flash-lite') {
    merged.model = 'gemini-flash-lite-latest';
    safeSetItem(STORAGE_KEYS.SETTINGS, merged);
  }
  return merged;
}

export function saveSettings(settings: AppSettings): void {
  safeSetItem(STORAGE_KEYS.SETTINGS, settings);
}

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadQuotaTracker(): QuotaTracker {
  const today = getTodayDateString();
  const defaultQuota: QuotaTracker = {
    totalChatsCount: 42,
    dailyRequestsCount: 18,
    lastRequestDate: today,
    maxDailyRequests: 50,
  };

  const stored = safeGetItem<QuotaTracker>(STORAGE_KEYS.QUOTA, defaultQuota);
  if (stored.lastRequestDate !== today) {
    stored.dailyRequestsCount = 0;
    stored.lastRequestDate = today;
    safeSetItem(STORAGE_KEYS.QUOTA, stored);
  }
  return stored;
}

export function recordQuotaUsage(): QuotaTracker {
  const tracker = loadQuotaTracker();
  tracker.dailyRequestsCount += 1;
  tracker.totalChatsCount += 1;
  safeSetItem(STORAGE_KEYS.QUOTA, tracker);
  return tracker;
}

export function exportConversationsToJSON(conversations: Conversation[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(conversations, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `gemini-conversations-${getTodayDateString()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportSingleConversationAsMarkdown(conversation: Conversation): void {
  let md = `# ${conversation.title}\n`;
  md += `*Model: ${conversation.model || 'Gemini 3.8 Flash'} | Date: ${new Date(conversation.createdAt).toLocaleString()}*\n\n---\n\n`;

  conversation.messages.forEach((msg) => {
    const sender = msg.role === 'user' ? '### 👤 You' : '### ✦ Gemini';
    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    md += `${sender} (${time})\n\n${msg.content}\n\n---\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${conversation.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function clearAllLocalData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
  localStorage.removeItem(STORAGE_KEYS.QUOTA);
  // Keep settings for theme preference, or reset if requested
}
