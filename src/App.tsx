import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Conversation,
  ChatMessage,
  AppSettings,
  QuotaTracker,
  PromptTemplate,
} from './types/chat';
import {
  loadConversations,
  saveConversations,
  loadActiveConversationId,
  saveActiveConversationId,
  loadSettings,
  saveSettings,
  loadQuotaTracker,
  recordQuotaUsage,
  exportConversationsToJSON,
  exportSingleConversationAsMarkdown,
  clearAllLocalData,
} from './utils/storage';
import { sounds } from './utils/sound';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageBubble } from './components/MessageBubble';
import { MessageComposer } from './components/MessageComposer';
import { TemplatesModal } from './components/TemplatesModal';
import { UsageModal } from './components/UsageModal';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Sparkles, Bolt, CloudCheck, Terminal, Shield, Zap } from 'lucide-react';

export default function App() {
  // Primary State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [quotaTracker, setQuotaTracker] = useState<QuotaTracker>(loadQuotaTracker);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'templates' | 'usage'>('chat');
  const [latencyMs, setLatencyMs] = useState(142);

  // Modals
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDangerous?: boolean;
    confirmLabel?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // References
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollEnabled = useRef(true);

  // Initial load from LocalStorage (avoids SSR hydration issues)
  useEffect(() => {
    const loaded = loadConversations();
    setConversations(loaded);

    const savedId = loadActiveConversationId();
    if (savedId && loaded.some((c) => c.id === savedId)) {
      setActiveId(savedId);
    } else if (loaded.length > 0) {
      setActiveId(loaded[0].id);
    }

    // Default responsive sidebar
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  // Sync theme to document element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('pastel', 'dark', 'light');
    root.classList.add(settings.theme);
  }, [settings.theme]);

  // Save conversations to LocalStorage whenever modified
  const updateConversations = useCallback(
    (newConversations: Conversation[]) => {
      setConversations(newConversations);
      saveConversations(newConversations);
    },
    []
  );

  // Select active conversation
  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    saveActiveConversationId(id);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Active conversation object
  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  // Auto-scroll to bottom of chat
  const scrollToBottom = (smooth = true) => {
    if (chatScrollContainerRef.current && isAutoScrollEnabled.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [activeId]);

  // Global Keyboard Shortcuts (Ctrl+K = New Chat, Esc = Stop Generating)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      } else if (e.key === 'Escape' && isGenerating) {
        e.preventDefault();
        handleStopGenerating();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGenerating]);

  // 1. CREATE: Start a New Chat
  const handleNewChat = () => {
    setActiveId(null);
    saveActiveConversationId(null);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // 2. UPDATE: Rename Conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    const updated = conversations.map((conv) =>
      conv.id === id ? { ...conv, title: newTitle, updatedAt: Date.now() } : conv
    );
    updateConversations(updated);
  };

  // 3. DELETE: Delete Conversation
  const handleDeleteConversation = (id: string) => {
    const target = conversations.find((c) => c.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Delete Conversation',
      message: `Are you sure you want to permanently delete "${target?.title || 'this conversation'}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      isDangerous: true,
      onConfirm: () => {
        const updated = conversations.filter((c) => c.id !== id);
        updateConversations(updated);
        if (activeId === id) {
          const nextId = updated.length > 0 ? updated[0].id : null;
          setActiveId(nextId);
          saveActiveConversationId(nextId);
        }
      },
    });
  };

  // 4. CLEAR: Clear Active Conversation
  const handleClearChat = () => {
    if (!activeConversation || activeConversation.messages.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: 'Clear Conversation',
      message: `Clear all messages in "${activeConversation.title}"? The thread title will be kept.`,
      confirmLabel: 'Clear Chat',
      isDangerous: true,
      onConfirm: () => {
        const updated = conversations.map((c) =>
          c.id === activeConversation.id ? { ...c, messages: [], updatedAt: Date.now() } : c
        );
        updateConversations(updated);
      },
    });
  };

  // 5. DELETE: Delete single message
  const handleDeleteMessage = (msgId: string) => {
    if (!activeConversation) return;
    const updatedMessages = activeConversation.messages.filter((m) => m.id !== msgId);
    const updated = conversations.map((c) =>
      c.id === activeConversation.id
        ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
        : c
    );
    updateConversations(updated);
  };

  // 6. STOP GENERATING
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);

    // Turn off streaming flag on any currently streaming message
    if (activeConversation) {
      const updatedMessages = activeConversation.messages.map((m) =>
        m.isStreaming ? { ...m, isStreaming: false } : m
      );
      const updated = conversations.map((c) =>
        c.id === activeConversation.id ? { ...c, messages: updatedMessages } : c
      );
      updateConversations(updated);
    }
  };

  // 7. SEND MESSAGE & STREAMING RESPONSE
  const handleSendMessage = async (text: string, image?: string) => {
    if (!text && !image) return;
    if (isGenerating) return;

    sounds.playSend(settings.soundEnabled);

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      image,
      timestamp: Date.now(),
    };

    let targetConvId = activeId;
    let currentConv = activeConversation;

    // If starting a fresh chat, create the conversation container
    if (!currentConv) {
      const newTitle =
        text.length > 36 ? `${text.slice(0, 36).trim()}...` : text || 'Multimodal Image Query';
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        title: newTitle,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: settings.model,
        messages: [userMessage],
      };

      const updated = [newConv, ...conversations];
      updateConversations(updated);
      setActiveId(newConv.id);
      saveActiveConversationId(newConv.id);
      targetConvId = newConv.id;
      currentConv = newConv;
    } else {
      // Append user message to active conversation
      const updatedMessages = [...currentConv.messages, userMessage];
      const updated = conversations.map((c) =>
        c.id === currentConv!.id
          ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
          : c
      );
      updateConversations(updated);
    }

    // Prepare assistant placeholder message
    const assistantMessageId = `ast-${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      model: settings.model,
      isStreaming: true,
    };

    // Update state with assistant message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === targetConvId
          ? { ...c, messages: [...c.messages, initialAssistantMessage] }
          : c
      )
    );

    setIsGenerating(true);
    const startTime = performance.now();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Limit to recent 6 messages to keep requests lean and response speed blazing fast
      const historyToInclude = (currentConv?.messages || []).slice(-6);
      const payloadMessages = [...historyToInclude, userMessage].map((m) => ({
        role: m.role,
        content: m.content.length > 3000 ? m.content.slice(0, 3000) + '...' : m.content,
        image: m.image,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          model: settings.model,
          temperature: settings.temperature,
          systemInstruction: settings.systemInstruction,
          useSearch: settings.useSearch,
        }),
        signal: abortController.signal,
      });

      // Update latency estimate
      const elapsedLatency = Math.round(performance.now() - startTime);
      setLatencyMs(elapsedLatency);

      if (!res.ok) {
        let errorMsg = `Server responded with HTTP ${res.status}`;
        try {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const errorData = await res.json();
            if (errorData?.error) {
              errorMsg = errorData.error;
            }
          } else {
            const textData = await res.text();
            if (res.status === 404) {
              errorMsg =
                'API route /api/chat returned HTTP 404. Serverless functions in /api/chat.ts and vercel.json must be deployed to handle API requests.';
            } else if (textData && textData.length < 200) {
              errorMsg = textData.trim();
            }
          }
        } catch {
          // fallback to status error
        }
        throw new Error(errorMsg);
      }

      if (!res.body) {
        throw new Error('ReadableStream not supported by response');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedContent = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n\r?\n/);
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.chunk) {
                accumulatedContent += data.chunk;

                // Optimistically update the message stream
                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id !== targetConvId) return c;
                    const msgs = c.messages.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: accumulatedContent, isStreaming: true }
                        : m
                    );
                    return { ...c, messages: msgs };
                  })
                );

                scrollToBottom(true);
              }

              if (data.done) {
                // Done event
              }
            } catch (err: any) {
              if (err.message) throw err;
            }
          }
        }
      }

      // Finish streaming successfully
      const totalRuntime = ((performance.now() - startTime) / 1000).toFixed(1);
      const estimatedTokens = Math.ceil(accumulatedContent.length / 4);

      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== targetConvId) return c;
          const msgs = c.messages.map((m) =>
            m.id === assistantMessageId
              ? {
                  ...m,
                  content: accumulatedContent,
                  isStreaming: false,
                  tokens: estimatedTokens,
                  latencySeconds: parseFloat(totalRuntime),
                }
              : m
          );
          return { ...c, messages: msgs, updatedAt: Date.now() };
        });
        saveConversations(updated);
        return updated;
      });

      // Record quota usage
      const newQuota = recordQuotaUsage();
      setQuotaTracker(newQuota);

      sounds.playReceive(settings.soundEnabled);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User voluntarily stopped generation
        return;
      }

      console.error('Streaming error:', err);
      sounds.playError(settings.soundEnabled);

      const errorMsg =
        err.message || 'An error occurred while contacting Gemini API. Please try again.';

      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== targetConvId) return c;
          const msgs = c.messages.map((m) =>
            m.id === assistantMessageId
              ? {
                  ...m,
                  content: errorMsg,
                  isStreaming: false,
                  isError: true,
                }
              : m
          );
          return { ...c, messages: msgs, updatedAt: Date.now() };
        });
        saveConversations(updated);
        return updated;
      });
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // 8. EDIT USER MESSAGE & RE-GENERATE
  const handleEditUserMessage = (msgId: string, newText: string) => {
    if (!activeConversation) return;

    // Find message index
    const msgIdx = activeConversation.messages.findIndex((m) => m.id === msgId);
    if (msgIdx === -1) return;

    // Truncate messages after this point and submit the edited prompt
    const retainedMessages = activeConversation.messages.slice(0, msgIdx);
    const updated = conversations.map((c) =>
      c.id === activeConversation.id ? { ...c, messages: retainedMessages } : c
    );
    updateConversations(updated);

    handleSendMessage(newText);
  };

  // 9. REGENERATE LAST RESPONSE
  const handleRegenerateLast = () => {
    if (!activeConversation || activeConversation.messages.length === 0) return;

    // Find last user message
    let lastUserPrompt = '';
    let lastUserImage: string | undefined = undefined;

    for (let i = activeConversation.messages.length - 1; i >= 0; i--) {
      if (activeConversation.messages[i].role === 'user') {
        lastUserPrompt = activeConversation.messages[i].content;
        lastUserImage = activeConversation.messages[i].image;
        break;
      }
    }

    if (!lastUserPrompt && !lastUserImage) return;

    // Remove last assistant message if present
    const lastMsg = activeConversation.messages[activeConversation.messages.length - 1];
    if (lastMsg.role === 'assistant') {
      const retainedMessages = activeConversation.messages.slice(0, -1);
      const updated = conversations.map((c) =>
        c.id === activeConversation.id ? { ...c, messages: retainedMessages } : c
      );
      updateConversations(updated);
    }

    handleSendMessage(lastUserPrompt, lastUserImage);
  };

  // 10. APPLY TEMPLATE
  const handleApplyTemplate = (tmpl: PromptTemplate, startNewChat: boolean) => {
    if (startNewChat) {
      handleNewChat();
    }
    handleSendMessage(tmpl.prompt);
  };

  // 11. CLEAR ALL LOCAL DATA
  const handleClearAllData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset All Local Data',
      message:
        'This will wipe all conversations, custom history, and quota counters from this browser. This cannot be undone.',
      confirmLabel: 'Wipe Everything',
      isDangerous: true,
      onConfirm: () => {
        clearAllLocalData();
        setConversations([]);
        setActiveId(null);
        setQuotaTracker(loadQuotaTracker());
        setSettingsModalOpen(false);
      },
    });
  };

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden ${
        settings.theme === 'pastel'
          ? 'bg-[#faf5ff] text-[#2e1065]'
          : settings.theme === 'light'
          ? 'bg-[#f8fafc] text-[#0f172a]'
          : 'bg-[#121318] text-[#e3e1e9]'
      }`}
    >
      {/* 1. COLLAPSIBLE CHAT SIDEBAR */}
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onExportConversation={(conv) => exportSingleConversationAsMarkdown(conv)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        quotaTracker={quotaTracker}
        theme={settings.theme}
      />

      {/* 2. MAIN APPLICATION VIEWPORT */}
      <div
        className={`flex-1 flex flex-col h-full min-w-0 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:pl-[260px]' : 'pl-0'
        } ${
          settings.theme === 'pastel'
            ? 'bg-[#faf5ff] text-[#2e1065]'
            : settings.theme === 'light'
            ? 'bg-[#f8fafc] text-[#0f172a]'
            : 'bg-[#121318] text-[#e3e1e9]'
        }`}
      >
        {/* Sticky Header */}
        <ChatHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeModel={settings.model}
          onSelectModel={(m) => {
            const updated = { ...settings, model: m };
            setSettings(updated);
            saveSettings(updated);
          }}
          theme={settings.theme}
          onToggleTheme={() => {
            const nextTheme: 'pastel' | 'dark' | 'light' =
              settings.theme === 'pastel' ? 'dark' : settings.theme === 'dark' ? 'light' : 'pastel';
            const updated = { ...settings, theme: nextTheme };
            setSettings(updated);
            saveSettings(updated);
          }}
          onClearChat={handleClearChat}
          onExportChat={() => {
            if (activeConversation) {
              exportSingleConversationAsMarkdown(activeConversation);
            }
          }}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'templates') setTemplatesModalOpen(true);
            if (tab === 'usage') setUsageModalOpen(true);
          }}
        />

        {/* Ambient Top Glow Layer */}
        <div className="relative flex-1 flex flex-col overflow-hidden">
          <div
            className={`absolute inset-x-0 top-0 h-96 pointer-events-none blur-3xl -z-10 transition-colors ${
              settings.theme === 'pastel'
                ? 'bg-gradient-to-b from-[#e9d5ff]/50 via-[#f3e8ff]/30 to-transparent'
                : 'bg-gradient-to-b from-[#10b981]/10 via-[#06b6d4]/5 to-transparent'
            }`}
          />

          {/* Chat Feed Scroll Area */}
          <div
            ref={chatScrollContainerRef}
            className="flex-1 overflow-y-auto px-4 sm:px-6 pt-3 pb-48"
          >
            {/* Top Telemetry & Session Status Bar */}
            <div className="w-full max-w-4xl mx-auto pt-1 pb-4 flex flex-wrap items-center justify-between gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full shadow-xs border ${
                  settings.theme === 'pastel'
                    ? 'bg-[#ffffff] border-[#e9d5ff] text-[#2e1065]'
                    : 'bg-[#1e1f25] border-[#292a2f] text-[#e3e1e9]'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      settings.theme === 'pastel' ? 'bg-[#a855f7]' : 'bg-[#4edea3]'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      settings.theme === 'pastel' ? 'bg-[#a855f7]' : 'bg-[#4edea3]'
                    }`}
                  ></span>
                </span>
                <span className="font-mono text-xs">
                  {settings.model.replace('gemini-', 'Gemini ')}
                </span>
                <span className="text-xs opacity-50">•</span>
                <span className="font-mono text-xs opacity-70">15 RPM Free Tier Active</span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-xs border ${
                    settings.theme === 'pastel'
                      ? 'bg-[#ffffff] border-[#e9d5ff] text-[#7c3aed]'
                      : 'bg-[#1a1b21] border-[#292a2f] text-[#4cd7f6]'
                  }`}
                >
                  <Bolt className="w-3.5 h-3.5" />
                  <span className="font-mono text-xs">{latencyMs}ms Engine Latency</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-xs border ${
                    settings.theme === 'pastel'
                      ? 'bg-[#ffffff] border-[#e9d5ff] text-[#6b21a8]'
                      : 'bg-[#1a1b21] border-[#292a2f] text-[#86948a]'
                  }`}
                >
                  <CloudCheck
                    className={`w-3.5 h-3.5 ${
                      settings.theme === 'pastel' ? 'text-[#a855f7]' : 'text-[#4edea3]'
                    }`}
                  />
                  <span className="font-mono text-xs">Sync: LocalStorage</span>
                </div>
              </div>
            </div>

            {/* Main Chat Feed */}
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
              {!activeConversation || activeConversation.messages.length === 0 ? (
                /* Welcome Screen */
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 py-8">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-4 border ${
                      settings.theme === 'pastel'
                        ? 'bg-gradient-to-tr from-[#ede9fe] via-[#f3e8ff] to-[#fae8ff] border-[#d8b4fe]'
                        : 'bg-gradient-to-tr from-[#10b981]/25 via-[#06b6d4]/20 to-[#6366f1]/25 border-[#10b981]/30'
                    }`}
                  >
                    <Sparkles
                      className={`w-7 h-7 ${
                        settings.theme === 'pastel' ? 'text-[#9333ea]' : 'text-[#4edea3]'
                      }`}
                    />
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    What would you like to build today?
                  </h1>
                  <p
                    className={`text-sm max-w-md mt-2 leading-relaxed ${
                      settings.theme === 'pastel' ? 'text-[#6b5d7d]' : 'text-[#86948a]'
                    }`}
                  >
                    Powered by the free tier of the Google Gemini API with streaming responses, multimodal reasoning, and instant browser persistence.
                  </p>

                  {/* Capabilities Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
                        settings.theme === 'pastel'
                          ? 'bg-[#f3e8ff] border-[#e9d5ff] text-[#6b21a8]'
                          : 'bg-[#1e1f25] border-[#292a2f] text-[#bbcabf]'
                      }`}
                    >
                      <Terminal className="w-3 h-3 text-[#a855f7]" />
                      <span>Code Execution</span>
                    </span>
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
                        settings.theme === 'pastel'
                          ? 'bg-[#ede9fe] border-[#ddd6fe] text-[#5b21b6]'
                          : 'bg-[#1e1f25] border-[#292a2f] text-[#bbcabf]'
                      }`}
                    >
                      <Shield className="w-3 h-3 text-[#7c3aed]" />
                      <span>Zero-Leak Server Proxy</span>
                    </span>
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
                        settings.theme === 'pastel'
                          ? 'bg-[#fae8ff] border-[#f5d0fe] text-[#86198f]'
                          : 'bg-[#1e1f25] border-[#292a2f] text-[#bbcabf]'
                      }`}
                    >
                      <Zap className="w-3 h-3 text-[#c084fc]" />
                      <span>15 RPM / 1M TPM Free</span>
                    </span>
                  </div>

                  {/* Starter Prompt Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mt-8">
                    {[
                      {
                        title: 'Explain Next.js App Router',
                        subtitle: 'Deep-dive into streaming and server actions',
                        prompt:
                          'Explain how Next.js App Router streaming works with Suspense and how to implement progressive hydration with minimal layout shifts.',
                      },
                      {
                        title: 'TypeScript Hydration Bug',
                        subtitle: 'Debug server vs client mismatch',
                        prompt:
                          'How do I fix the "Text content does not match server-rendered HTML" hydration warning in React 19?',
                      },
                      {
                        title: 'Clean Architecture Pattern',
                        subtitle: 'Modular separation of concerns',
                        prompt:
                          'Show me an idiomatic pattern for separating business logic, state stores, and UI presentation components in TypeScript.',
                      },
                      {
                        title: 'Tailwind Design Tokens',
                        subtitle: 'Color schemes & typography cadence',
                        prompt:
                          'How do I organize Tailwind CSS v4 design tokens for lavender surfaces with purple pastel accents?',
                      },
                    ].map((card, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(card.prompt)}
                        className={`p-3.5 rounded-xl text-left transition-all cursor-pointer group shadow-xs border ${
                          settings.theme === 'pastel'
                            ? 'bg-[#ffffff] hover:bg-[#f5f0ff] border-[#e9d5ff] hover:border-[#c084fc]'
                            : 'bg-[#1e1f25] hover:bg-[#292a2f] border-[#292a2f] hover:border-[#10b981]/50'
                        }`}
                      >
                        <h4
                          className={`text-xs font-semibold transition-colors ${
                            settings.theme === 'pastel'
                              ? 'text-[#2e1065] group-hover:text-[#7c3aed]'
                              : 'text-[#e3e1e9] group-hover:text-[#4edea3]'
                          }`}
                        >
                          {card.title}
                        </h4>
                        <p
                          className={`text-[11px] mt-1 ${
                            settings.theme === 'pastel' ? 'text-[#8b799f]' : 'text-[#86948a]'
                          }`}
                        >
                          {card.subtitle}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Message Feed */
                activeConversation.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onRegenerate={
                      message.role === 'assistant' ? handleRegenerateLast : undefined
                    }
                    onEdit={
                      message.role === 'user' ? handleEditUserMessage : undefined
                    }
                    onDelete={handleDeleteMessage}
                    showLineNumbers={settings.showLineNumbers}
                    theme={settings.theme}
                  />
                ))
              )}
            </div>
          </div>

          {/* Floating Composer Docked at Bottom */}
          <MessageComposer
            onSendMessage={handleSendMessage}
            onStopGenerating={handleStopGenerating}
            isGenerating={isGenerating}
            activeModel={settings.model}
            useSearch={settings.useSearch}
            onToggleSearch={() => {
              const updated = { ...settings, useSearch: !settings.useSearch };
              setSettings(updated);
              saveSettings(updated);
            }}
            codeExecMode={settings.codeExecMode}
            onToggleCodeExec={() => {
              const updated = { ...settings, codeExecMode: !settings.codeExecMode };
              setSettings(updated);
              saveSettings(updated);
            }}
            theme={settings.theme}
          />
        </div>
      </div>

      {/* 3. MODALS */}
      <TemplatesModal
        isOpen={templatesModalOpen}
        onClose={() => {
          setTemplatesModalOpen(false);
          setActiveTab('chat');
        }}
        onApplyTemplate={handleApplyTemplate}
      />

      <UsageModal
        isOpen={usageModalOpen}
        onClose={() => {
          setUsageModalOpen(false);
          setActiveTab('chat');
        }}
        quotaTracker={quotaTracker}
        activeModel={settings.model}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={(s) => {
          setSettings(s);
          saveSettings(s);
        }}
        conversations={conversations}
        onExportAll={() => exportConversationsToJSON(conversations)}
        onImportConversations={(imported) => {
          const merged = [...imported, ...conversations];
          // Deduplicate by ID
          const uniqueMap = new Map();
          merged.forEach((item) => {
            if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
          });
          const deduplicated = Array.from(uniqueMap.values());
          updateConversations(deduplicated);
        }}
        onClearAllData={handleClearAllData}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        isDangerous={confirmModal.isDangerous}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
