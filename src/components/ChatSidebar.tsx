import React, { useState, useMemo } from 'react';
import { Conversation, QuotaTracker } from '../types/chat';
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  FileDown,
  Settings,
  PanelLeftClose,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onExportConversation: (conv: Conversation) => void;
  onOpenSettings: () => void;
  quotaTracker: QuotaTracker;
  theme?: 'pastel' | 'dark' | 'light';
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeId,
  isOpen,
  onToggle,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onExportConversation,
  onOpenSettings,
  quotaTracker,
  theme = 'pastel',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  // Group conversations chronologically
  const groupedConversations = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;
    const thirtyDays = 30 * oneDay;

    const today: Conversation[] = [];
    const previous7Days: Conversation[] = [];
    const previous30Days: Conversation[] = [];

    filteredConversations.forEach((conv) => {
      const age = now - (conv.updatedAt || conv.createdAt);
      if (age < oneDay) {
        today.push(conv);
      } else if (age < sevenDays) {
        previous7Days.push(conv);
      } else {
        previous30Days.push(conv);
      }
    });

    return { today, previous7Days, previous30Days };
  }, [filteredConversations]);

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setMenuOpenId(null);
  };

  const handleFinishRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  // Quota percentage
  const quotaPercent = Math.min(
    100,
    Math.round((quotaTracker.dailyRequestsCount / quotaTracker.maxDailyRequests) * 100)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-[260px] z-50 flex flex-col justify-between border-r shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          theme === 'pastel'
            ? 'bg-[#ffffff] border-[#e9d5ff] text-[#2e1065]'
            : 'bg-[#1a1b21] border-[#292a2f] text-[#e3e1e9]'
        }`}
      >
        <div className="flex flex-col h-[calc(100%-84px)]">
          {/* Top Brand & Collapse Bar */}
          <div
            className={`h-16 px-4 flex items-center justify-between border-b ${
              theme === 'pastel' ? 'border-[#e9d5ff]' : 'border-[#292a2f]/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg p-0.5 flex items-center justify-center shadow-md ${
                  theme === 'pastel'
                    ? 'bg-gradient-to-br from-[#d8b4fe] via-[#c084fc] to-[#e879f9]'
                    : 'bg-gradient-to-br from-[#10b981] via-[#06b6d4] to-[#6366f1]'
                }`}
              >
                <div
                  className={`w-full h-full rounded-[6px] flex items-center justify-center ${
                    theme === 'pastel' ? 'bg-[#ffffff]' : 'bg-[#121318]'
                  }`}
                >
                  <Sparkles
                    className={`w-4 h-4 ${
                      theme === 'pastel' ? 'text-[#9333ea]' : 'text-[#4edea3]'
                    }`}
                  />
                </div>
              </div>
              <span className="font-semibold text-lg tracking-tight">Gemini</span>
              <span
                className={`px-1.5 py-0.5 text-[10px] font-mono uppercase rounded border ${
                  theme === 'pastel'
                    ? 'bg-[#f3e8ff] text-[#6b21a8] border-[#d8b4fe]'
                    : 'bg-[#10b981]/15 text-[#4edea3] border-[#10b981]/30'
                }`}
              >
                Pastel
              </span>
            </div>
            <button
              onClick={onToggle}
              className={`p-1.5 rounded-lg transition-colors ${
                theme === 'pastel'
                  ? 'text-[#6b21a8] hover:text-[#2e1065] hover:bg-[#f3e8ff]'
                  : 'text-[#bbcabf] hover:text-[#e3e1e9] hover:bg-[#292a2f]'
              }`}
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="px-3.5 pt-3.5 pb-2">
            <button
              onClick={onNewChat}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all group border shadow-xs ${
                theme === 'pastel'
                  ? 'bg-[#f3e8ff] hover:bg-[#ede9fe] text-[#581c87] border-[#d8b4fe]'
                  : 'bg-[#1e1f25] hover:bg-[#292a2f] text-[#e3e1e9] border-[#292a2f] hover:border-[#10b981]/40'
              }`}
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <Plus
                  className={`w-4 h-4 group-hover:scale-110 transition-transform ${
                    theme === 'pastel' ? 'text-[#9333ea]' : 'text-[#4edea3]'
                  }`}
                />
                <span className="text-sm font-semibold">New Chat</span>
              </div>
              <span
                className={`font-mono text-[11px] px-1.5 py-0.5 rounded transition-colors ${
                  theme === 'pastel'
                    ? 'bg-[#ffffff] text-[#6b21a8] border border-[#e9d5ff]'
                    : 'bg-[#34343a] text-[#bbcabf] group-hover:text-white'
                }`}
              >
                Ctrl+K
              </span>
            </button>
          </div>

          {/* Search Threads Input */}
          <div className="px-3.5 py-1.5">
            <div className="relative flex items-center">
              <Search
                className={`absolute left-3 w-3.5 h-3.5 pointer-events-none ${
                  theme === 'pastel' ? 'text-[#8b799f]' : 'text-[#86948a]'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search threads..."
                className={`w-full text-xs pl-8 pr-3 py-2 rounded-lg border focus:outline-none transition-colors ${
                  theme === 'pastel'
                    ? 'bg-[#f5f0ff] text-[#2e1065] placeholder:text-[#8b799f] border-[#e9d5ff] focus:border-[#a855f7]'
                    : 'bg-[#0d0e13] text-[#e3e1e9] placeholder:text-[#86948a] border-[#292a2f] focus:border-[#10b981]/60'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-xs opacity-60 hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Conversation List Feed */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
            {filteredConversations.length === 0 ? (
              <div
                className={`text-center py-8 px-4 text-xs ${
                  theme === 'pastel' ? 'text-[#8b799f]' : 'text-[#86948a]'
                }`}
              >
                {searchQuery ? 'No conversations found' : 'No saved conversations'}
              </div>
            ) : (
              <>
                {/* TODAY */}
                {groupedConversations.today.length > 0 && (
                  <div>
                    <div
                      className={`font-mono text-[11px] uppercase tracking-wider px-3 mb-1 font-semibold ${
                        theme === 'pastel' ? 'text-[#8b799f]' : 'text-[#86948a]'
                      }`}
                    >
                      Today
                    </div>
                    <div className="space-y-0.5">
                      {groupedConversations.today.map((conv) => renderConversationItem(conv))}
                    </div>
                  </div>
                )}

                {/* PREVIOUS 7 DAYS */}
                {groupedConversations.previous7Days.length > 0 && (
                  <div>
                    <div
                      className={`font-mono text-[11px] uppercase tracking-wider px-3 mb-1 font-semibold ${
                        theme === 'pastel' ? 'text-[#8b799f]' : 'text-[#86948a]'
                      }`}
                    >
                      Previous 7 Days
                    </div>
                    <div className="space-y-0.5">
                      {groupedConversations.previous7Days.map((conv) =>
                        renderConversationItem(conv)
                      )}
                    </div>
                  </div>
                )}

                {/* PREVIOUS 30 DAYS */}
                {groupedConversations.previous30Days.length > 0 && (
                  <div>
                    <div
                      className={`font-mono text-[11px] uppercase tracking-wider px-3 mb-1 font-semibold ${
                        theme === 'pastel' ? 'text-[#8b799f]' : 'text-[#86948a]'
                      }`}
                    >
                      Previous 30 Days
                    </div>
                    <div className="space-y-0.5">
                      {groupedConversations.previous30Days.map((conv) =>
                        renderConversationItem(conv)
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom User Profile & Quota Meter */}
        <div
          className={`h-20 px-4 py-2.5 border-t flex flex-col justify-center gap-1.5 ${
            theme === 'pastel'
              ? 'bg-[#faf5ff] border-[#e9d5ff]'
              : 'bg-[#1e1f25] border-[#292a2f]'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span
              className={`font-mono text-[11px] ${
                theme === 'pastel' ? 'text-[#6b21a8]' : 'text-[#bbcabf]'
              }`}
            >
              Free Quota ({quotaPercent}%)
            </span>
            <span
              className={`font-mono text-[11px] font-medium ${
                theme === 'pastel' ? 'text-[#7c3aed]' : 'text-[#4edea3]'
              }`}
            >
              {quotaTracker.dailyRequestsCount} / {quotaTracker.maxDailyRequests} chats
            </span>
          </div>

          {/* Progress Bar */}
          <div
            className={`w-full h-1.5 rounded-full overflow-hidden ${
              theme === 'pastel' ? 'bg-[#ede9fe]' : 'bg-[#34343a]'
            }`}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                quotaPercent > 90
                  ? 'bg-[#f87171]'
                  : quotaPercent > 75
                  ? 'bg-amber-300'
                  : theme === 'pastel'
                  ? 'bg-[#a855f7]'
                  : 'bg-[#4edea3]'
              }`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>

          {/* User Workspace Info & Settings Trigger */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shadow-sm shrink-0 ${
                  theme === 'pastel'
                    ? 'bg-gradient-to-tr from-[#e9d5ff] to-[#c084fc] text-[#3b0764]'
                    : 'bg-gradient-to-tr from-[#10b981] to-[#6366f1] text-white'
                }`}
              >
                DW
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium truncate leading-tight">
                  Dev Workspace
                </span>
                <span
                  className={`text-[10px] font-mono truncate ${
                    theme === 'pastel' ? 'text-[#8b799f]' : 'text-[#86948a]'
                  }`}
                >
                  Pastel Purple Edition
                </span>
              </div>
            </div>
            <button
              onClick={onOpenSettings}
              className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                theme === 'pastel'
                  ? 'text-[#6b21a8] hover:text-[#2e1065] hover:bg-[#ede9fe]'
                  : 'text-[#bbcabf] hover:text-[#e3e1e9] hover:bg-[#292a2f]'
              }`}
              title="Open Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );

  function renderConversationItem(conv: Conversation) {
    const isActive = conv.id === activeId;
    const isMenuOpen = menuOpenId === conv.id;
    const isEditing = editingId === conv.id;

    return (
      <div
        key={conv.id}
        onClick={() => onSelectConversation(conv.id)}
        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer transition-all border ${
          isActive
            ? theme === 'pastel'
              ? 'bg-gradient-to-r from-[#f3e8ff] to-[#ede9fe] text-[#581c87] font-semibold border-[#d8b4fe] shadow-xs'
              : 'bg-[#1e1f25] text-white font-medium border-[#292a2f]'
            : theme === 'pastel'
            ? 'text-[#645579] hover:text-[#2e1065] hover:bg-[#f5f0ff] border-transparent'
            : 'text-[#bbcabf] hover:text-[#e3e1e9] hover:bg-[#1e1f25]/60 border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <MessageSquare
            className={`w-3.5 h-3.5 shrink-0 ${
              isActive
                ? theme === 'pastel'
                  ? 'text-[#9333ea]'
                  : 'text-[#4edea3]'
                : 'text-[#86948a] group-hover:text-[#bbcabf]'
            }`}
          />
          {isEditing ? (
            <input
              type="text"
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => handleFinishRename(conv.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinishRename(conv.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className={`text-xs px-1.5 py-0.5 rounded outline-none border w-full ${
                theme === 'pastel'
                  ? 'bg-white text-[#2e1065] border-[#c084fc]'
                  : 'bg-[#0d0e13] text-white border-[#10b981]'
              }`}
            />
          ) : (
            <span className="text-xs truncate flex-1 leading-snug">{conv.title}</span>
          )}
        </div>

        {/* Thread Action Trigger */}
        {!isEditing && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(isMenuOpen ? null : conv.id);
              }}
              className={`p-1 rounded transition-opacity ${
                isActive || isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              } ${
                theme === 'pastel'
                  ? 'text-[#8b799f] hover:text-[#2e1065] hover:bg-[#ede9fe]'
                  : 'text-[#86948a] hover:text-white hover:bg-[#292a2f]'
              }`}
              title="Thread Actions"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {/* Context Dropdown */}
            {isMenuOpen && (
              <div
                className={`absolute right-0 top-6 w-36 rounded-lg shadow-2xl py-1 z-30 font-normal text-xs border ${
                  theme === 'pastel'
                    ? 'bg-[#ffffff] border-[#e9d5ff] text-[#2e1065]'
                    : 'bg-[#1a1b21] border-[#292a2f] text-[#e3e1e9]'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => handleStartRename(conv, e)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 transition-colors ${
                    theme === 'pastel'
                      ? 'hover:bg-[#f3e8ff] text-[#2e1065]'
                      : 'hover:bg-[#292a2f] text-[#e3e1e9]'
                  }`}
                >
                  <Edit2 className="w-3 h-3 text-[#a855f7]" />
                  <span>Rename</span>
                </button>
                <button
                  onClick={() => {
                    onExportConversation(conv);
                    setMenuOpenId(null);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 transition-colors ${
                    theme === 'pastel'
                      ? 'hover:bg-[#f3e8ff] text-[#2e1065]'
                      : 'hover:bg-[#292a2f] text-[#e3e1e9]'
                  }`}
                >
                  <FileDown className="w-3 h-3 text-[#c084fc]" />
                  <span>Export MD</span>
                </button>
                <div
                  className={`my-1 border-t ${
                    theme === 'pastel' ? 'border-[#e9d5ff]' : 'border-[#292a2f]'
                  }`}
                />
                <button
                  onClick={() => {
                    onDeleteConversation(conv.id);
                    setMenuOpenId(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#ffdad6]/20 text-[#e11d48]"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
};
