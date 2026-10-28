import React, { useState } from 'react';
import {
  Menu,
  ChevronDown,
  Trash2,
  Share2,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Palette,
} from 'lucide-react';

interface ChatHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeModel: string;
  onSelectModel: (model: string) => void;
  theme: 'pastel' | 'dark' | 'light';
  onToggleTheme: () => void;
  onClearChat: () => void;
  onExportChat: () => void;
  activeTab: 'chat' | 'templates' | 'usage';
  onSelectTab: (tab: 'chat' | 'templates' | 'usage') => void;
}

const MODELS = [
  {
    id: 'gemini-flash-lite-latest',
    name: 'Gemini Flash Lite',
    tag: '⚡ Ultra Fast • 1.4s',
    desc: 'Lowest Latency & Instant Response (Recommended)',
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash Lite',
    tag: 'Free Tier • Fast',
    desc: 'High Throughput & Balanced Reasoning',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    tag: 'Free Tier • Stable',
    desc: 'High Availability & Developer Reasoning',
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash Latest',
    tag: 'Free Tier • Standard',
    desc: 'Continuous Flash Release for Large Contexts',
  },
];

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  activeModel,
  onSelectModel,
  theme,
  onToggleTheme,
  onClearChat,
  onExportChat,
  activeTab,
  onSelectTab,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const currentModelObj = MODELS.find((m) => m.id === activeModel) || MODELS[0];

  return (
    <header
      className={`h-16 backdrop-blur-xl border-b flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-colors ${
        theme === 'pastel'
          ? 'bg-[#ffffff]/90 border-[#e9d5ff] text-[#2e1065]'
          : theme === 'light'
          ? 'bg-[#ffffff]/90 border-[#e2e8f0] text-[#0f172a]'
          : 'bg-[#121318]/90 border-[#292a2f] text-[#e3e1e9]'
      }`}
    >
      {/* Left Area: Sidebar Toggle & Model Pill */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'pastel'
              ? 'text-[#6b21a8] hover:text-[#2e1065] hover:bg-[#f3e8ff]'
              : 'text-[#bbcabf] hover:text-[#e3e1e9] hover:bg-[#1e1f25]'
          }`}
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Model Selector Dropdown Pill */}
        <div className="relative">
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer text-xs sm:text-sm font-medium border ${
              theme === 'pastel'
                ? 'bg-[#f3e8ff] hover:bg-[#ede9fe] border-[#d8b4fe] text-[#3b0764]'
                : theme === 'light'
                ? 'bg-[#f1f5f9] hover:bg-[#e2e8f0] border-[#e2e8f0] text-[#0f172a]'
                : 'bg-[#1e1f25] hover:bg-[#292a2f] border-[#292a2f] text-[#e3e1e9]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                theme === 'pastel'
                  ? 'bg-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,0.7)]'
                  : 'bg-[#4edea3] shadow-[0_0_8px_rgba(78,222,163,0.6)]'
              }`}
            />
            <span>{currentModelObj.name}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {modelDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setModelDropdownOpen(false)}
              />
              <div
                className={`absolute left-0 top-11 w-72 rounded-xl shadow-2xl p-1.5 z-50 text-xs border ${
                  theme === 'pastel'
                    ? 'bg-[#ffffff] border-[#e9d5ff] text-[#2e1065]'
                    : 'bg-[#1a1b21] border-[#292a2f] text-[#e3e1e9]'
                }`}
              >
                <div
                  className={`px-3 py-1.5 font-mono text-[10px] uppercase font-semibold border-b mb-1 ${
                    theme === 'pastel'
                      ? 'text-[#8b799f] border-[#e9d5ff]'
                      : 'text-[#86948a] border-[#292a2f]'
                  }`}
                >
                  Available Free Tier Models
                </div>
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectModel(m.id);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg transition-colors flex flex-col gap-0.5 ${
                      m.id === activeModel
                        ? theme === 'pastel'
                          ? 'bg-[#f3e8ff] text-[#6b21a8] border border-[#d8b4fe]'
                          : 'bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30'
                        : theme === 'pastel'
                        ? 'hover:bg-[#f5f0ff] text-[#2e1065]'
                        : 'hover:bg-[#292a2f] text-[#e3e1e9]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span>{m.name}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          theme === 'pastel'
                            ? 'bg-[#ede9fe] text-[#6b21a8]'
                            : 'text-[#4cd7f6]'
                        }`}
                      >
                        {m.tag}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-normal leading-tight ${
                        theme === 'pastel' ? 'text-[#8b799f]' : 'text-[#86948a]'
                      }`}
                    >
                      {m.desc}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center Tabs: Chat / Templates / Usage */}
      <nav
        className={`hidden md:flex items-center gap-1 p-1 rounded-xl border ${
          theme === 'pastel'
            ? 'bg-[#f5f0ff] border-[#e9d5ff]'
            : 'bg-[#1e1f25]/80 border-[#292a2f]'
        }`}
      >
        <button
          onClick={() => onSelectTab('chat')}
          className={`px-3.5 py-1 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'chat'
              ? theme === 'pastel'
                ? 'bg-[#8b5cf6] text-white shadow-xs font-semibold'
                : 'bg-[#10b981] text-[#003824] shadow-xs'
              : theme === 'pastel'
              ? 'text-[#7c6f8f] hover:text-[#4c1d95]'
              : 'text-[#bbcabf] hover:text-[#e3e1e9]'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => onSelectTab('templates')}
          className={`px-3.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'templates'
              ? theme === 'pastel'
                ? 'bg-[#8b5cf6] text-white shadow-xs font-semibold'
                : 'bg-[#10b981] text-[#003824] shadow-xs'
              : theme === 'pastel'
              ? 'text-[#7c6f8f] hover:text-[#4c1d95]'
              : 'text-[#bbcabf] hover:text-[#e3e1e9]'
          }`}
        >
          <Sparkles className={`w-3 h-3 ${theme === 'pastel' ? 'text-[#e9d5ff]' : 'text-[#f472b6]'}`} />
          <span>Templates</span>
        </button>
        <button
          onClick={() => onSelectTab('usage')}
          className={`px-3.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'usage'
              ? theme === 'pastel'
                ? 'bg-[#8b5cf6] text-white shadow-xs font-semibold'
                : 'bg-[#10b981] text-[#003824] shadow-xs'
              : theme === 'pastel'
              ? 'text-[#7c6f8f] hover:text-[#4c1d95]'
              : 'text-[#bbcabf] hover:text-[#e3e1e9]'
          }`}
        >
          <Zap className={`w-3 h-3 ${theme === 'pastel' ? 'text-[#c084fc]' : 'text-[#38bdf8]'}`} />
          <span>Usage</span>
        </button>
      </nav>

      {/* Right Area: Status Indicator & Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Status Indicator */}
        <div
          className={`hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border ${
            theme === 'pastel'
              ? 'bg-[#f5f0ff] border-[#e9d5ff]'
              : 'bg-[#1a1b21] border-[#292a2f]'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              theme === 'pastel' ? 'bg-[#a855f7]' : 'bg-[#4edea3]'
            }`}
          />
          <span
            className={`font-mono text-xs ${
              theme === 'pastel' ? 'text-[#6b21a8]' : 'text-[#bbcabf]'
            }`}
          >
            API Connected • 15 RPM Free Tier
          </span>
        </div>

        {/* Clear Chat */}
        <button
          onClick={onClearChat}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'pastel'
              ? 'text-[#6b21a8] hover:text-rose-500 hover:bg-[#f3e8ff]'
              : 'text-[#bbcabf] hover:text-[#ffb4ab] hover:bg-[#1e1f25]'
          }`}
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Export Chat */}
        <button
          onClick={onExportChat}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'pastel'
              ? 'text-[#6b21a8] hover:text-[#2e1065] hover:bg-[#f3e8ff]'
              : 'text-[#bbcabf] hover:text-[#e3e1e9] hover:bg-[#1e1f25]'
          }`}
          title="Export Conversation"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Theme Toggle (Cycles Pastel -> Dark -> Light -> Pastel) */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            theme === 'pastel'
              ? 'text-[#6b21a8] hover:text-[#2e1065] bg-[#f3e8ff] hover:bg-[#ede9fe] border border-[#d8b4fe]'
              : 'text-[#bbcabf] hover:text-[#e3e1e9] hover:bg-[#1e1f25]'
          }`}
          title={`Active Theme: ${theme.toUpperCase()} (Click to cycle)`}
        >
          {theme === 'pastel' ? (
            <Palette className="w-4 h-4 text-[#a855f7]" />
          ) : theme === 'dark' ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </button>
      </div>
    </header>
  );
};
