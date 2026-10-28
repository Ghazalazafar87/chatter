import React, { useState } from 'react';
import { ChatMessage } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Copy,
  Check,
  RotateCw,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Trash2,
  User,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  onEdit?: (messageId: string, newText: string) => void;
  onDelete?: (messageId: string) => void;
  showLineNumbers?: boolean;
  theme?: 'pastel' | 'dark' | 'light';
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onRegenerate,
  onEdit,
  onDelete,
  showLineNumbers = true,
  theme = 'pastel',
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  const handleCopy = () => {
    navigator.clipboard?.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveEdit = () => {
    if (onEdit && editText.trim()) {
      onEdit(message.id, editText.trim());
      setIsEditing(false);
    }
  };

  // USER MESSAGE
  if (message.role === 'user') {
    return (
      <div className="flex flex-col items-end gap-1.5 pl-6 sm:pl-16 group">
        <div className="flex items-center gap-2 pr-1">
          <span
            className={`font-mono text-[11px] ${
              theme === 'pastel' ? 'text-[#8b799f]' : 'text-[#86948a]'
            }`}
          >
            You
          </span>
          <span
            className={`font-mono text-[11px] ${
              theme === 'pastel' ? 'text-[#8b799f]' : 'text-[#86948a]'
            }`}
          >
            •
          </span>
          <span
            className={`font-mono text-[11px] ${
              theme === 'pastel' ? 'text-[#8b799f]' : 'text-[#86948a]'
            }`}
          >
            {formattedTime}
          </span>
        </div>

        <div className="flex items-start gap-2.5 max-w-2xl flex-row-reverse">
          {/* User Avatar */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
              theme === 'pastel'
                ? 'bg-[#ede9fe] border border-[#d8b4fe] text-[#7c3aed]'
                : theme === 'light'
                ? 'bg-[#e2e8f0] border border-[#cbd5e1] text-[#334155]'
                : 'bg-[#292a2f] border border-[#34343a] text-[#e3e1e9]'
            }`}
          >
            <User className="w-4 h-4" />
          </div>

          {/* User Bubble */}
          <div className="flex flex-col items-end gap-1">
            {/* Attached Image Thumbnail */}
            {message.image && (
              <div
                className={`mb-1 rounded-xl overflow-hidden max-w-xs shadow-md border ${
                  theme === 'pastel' ? 'border-[#e9d5ff]' : 'border-[#292a2f]'
                }`}
              >
                <img
                  src={message.image}
                  alt="Attached preview"
                  className="w-full h-auto max-h-48 object-cover"
                />
              </div>
            )}

            {isEditing ? (
              <div
                className={`w-full min-w-[280px] sm:min-w-[380px] rounded-2xl p-2.5 flex flex-col gap-2 border ${
                  theme === 'pastel'
                    ? 'bg-[#ffffff] border-[#c084fc] shadow-md'
                    : 'bg-[#1e1f25] border-[#10b981]'
                }`}
              >
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className={`w-full bg-transparent text-sm outline-none resize-none ${
                    theme === 'pastel' ? 'text-[#2e1065]' : 'text-[#e3e1e9]'
                  }`}
                  rows={3}
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className={`px-2.5 py-1 text-xs ${
                      theme === 'pastel'
                        ? 'text-[#8b799f] hover:text-[#2e1065]'
                        : 'text-[#86948a] hover:text-[#e3e1e9]'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                      theme === 'pastel'
                        ? 'bg-[#a855f7] text-white hover:bg-[#9333ea]'
                        : 'bg-[#10b981] text-[#003824] hover:bg-[#4edea3]'
                    }`}
                  >
                    Save & Resubmit
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`px-4 py-2.5 rounded-2xl rounded-tr-none shadow-sm text-[15px] leading-relaxed break-words whitespace-pre-wrap ${
                  theme === 'pastel'
                    ? 'bg-gradient-to-r from-[#ede9fe] to-[#f3e8ff] text-[#2e1065] border border-[#d8b4fe]'
                    : theme === 'light'
                    ? 'bg-[#f1f5f9] text-[#0f172a] border border-[#cbd5e1]'
                    : 'bg-[#1e1f25] text-[#e3e1e9] border border-[#292a2f]'
                }`}
              >
                {message.content}
              </div>
            )}

            {/* User message hover actions */}
            {!isEditing && (
              <div
                className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-0.5 ${
                  theme === 'pastel' ? 'text-[#8b799f]' : 'text-[#86948a]'
                }`}
              >
                {onEdit && (
                  <button
                    onClick={() => {
                      setEditText(message.content);
                      setIsEditing(true);
                    }}
                    className={`p-1 rounded ${
                      theme === 'pastel'
                        ? 'hover:text-[#2e1065] hover:bg-[#ede9fe]'
                        : 'hover:text-[#e3e1e9] hover:bg-[#292a2f]'
                    }`}
                    title="Edit prompt"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(message.id)}
                    className="p-1 hover:text-[#ffb4ab] rounded"
                    title="Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ASSISTANT MESSAGE
  return (
    <div className="flex flex-col items-start gap-1.5 pr-4 sm:pr-12 group">
      {/* AI Header Badge */}
      <div className="flex items-center gap-2 pl-1">
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-xs border ${
            theme === 'pastel'
              ? 'bg-[#f3e8ff] border-[#d8b4fe]'
              : 'bg-gradient-to-br from-[#10b981]/20 to-[#06b6d4]/20 border-[#10b981]/30'
          }`}
        >
          <Sparkles
            className={`w-3.5 h-3.5 ${
              theme === 'pastel' ? 'text-[#9333ea]' : 'text-[#4edea3]'
            }`}
          />
        </div>
        <span
          className={`font-mono text-xs font-semibold ${
            theme === 'pastel' ? 'text-[#7c3aed]' : 'text-[#4edea3]'
          }`}
        >
          {message.model || 'Gemini Flash'}
        </span>
        <span
          className={`text-xs ${
            theme === 'pastel' ? 'text-[#8b799f]' : 'text-[#86948a]'
          }`}
        >
          •
        </span>
        <span
          className={`font-mono text-xs ${
            theme === 'pastel' ? 'text-[#8b799f]' : 'text-[#86948a]'
          }`}
        >
          {message.isStreaming ? (
            <span
              className={`animate-pulse ${
                theme === 'pastel' ? 'text-[#9333ea]' : 'text-[#4cd7f6]'
              }`}
            >
              Streaming tokens...
            </span>
          ) : (
            formattedTime
          )}
        </span>
        {!message.isStreaming && (
          <span
            className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
              theme === 'pastel'
                ? 'bg-[#faf5ff] text-[#6b21a8] border-[#e9d5ff]'
                : 'bg-[#292a2f] text-[#bbcabf] border-[#34343a]'
            }`}
          >
            Flash Engine
          </span>
        )}
      </div>

      {/* AI Content Body */}
      <div className="w-full flex items-start gap-3 pl-1">
        <div className="flex-1 flex flex-col gap-2">
          {message.isError ? (
            <div className="p-3.5 rounded-xl bg-[#ffdad6]/10 border border-[#ffb4ab]/30 flex items-start gap-3 text-[#ffb4ab]">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-0.5">Model Status Notice</p>
                <p className="text-xs text-[#ffb4ab]/90 leading-relaxed">
                  {(() => {
                    try {
                      const p = JSON.parse(message.content);
                      if (p.error?.message) {
                        try {
                          const n = JSON.parse(p.error.message);
                          if (n.error?.message) return n.error.message;
                        } catch {}
                        return p.error.message;
                      }
                    } catch {}
                    return message.content;
                  })()}
                </p>
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="mt-2.5 px-3 py-1 bg-[#ffb4ab]/20 hover:bg-[#ffb4ab]/30 rounded-lg text-xs font-medium flex items-center gap-1.5 text-white transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Retry Request</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <MarkdownRenderer
              content={message.content}
              isStreaming={message.isStreaming}
              showLineNumbers={showLineNumbers}
            />
          )}

          {/* Action Ribbon & Telemetry Bar */}
          {!message.isStreaming && !message.isError && (
            <div
              className={`w-full flex flex-wrap items-center justify-between gap-2 mt-2 pt-1 border-t ${
                theme === 'pastel'
                  ? 'border-[#e9d5ff] text-[#8b799f]'
                  : 'border-[#292a2f]/40 text-[#86948a]'
              }`}
            >
              <div className="flex items-center gap-1">
                {/* Copy */}
                <button
                  onClick={handleCopy}
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                    theme === 'pastel'
                      ? 'hover:bg-[#f3e8ff] hover:text-[#581c87]'
                      : 'hover:bg-[#1e1f25] hover:text-[#e3e1e9]'
                  }`}
                  title="Copy full response"
                >
                  {copied ? (
                    <Check
                      className={`w-4 h-4 ${
                        theme === 'pastel' ? 'text-[#9333ea]' : 'text-[#4edea3]'
                      }`}
                    />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                {/* Regenerate */}
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className={`p-1.5 rounded-lg transition-colors ${
                      theme === 'pastel'
                        ? 'hover:bg-[#f3e8ff] hover:text-[#581c87]'
                        : 'hover:bg-[#1e1f25] hover:text-[#e3e1e9]'
                    }`}
                    title="Regenerate response"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                )}

                {/* Text to Speech */}
                <button
                  onClick={handleSpeak}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isSpeaking
                      ? theme === 'pastel'
                        ? 'text-[#9333ea] bg-[#ede9fe]'
                        : 'text-[#4edea3]'
                      : theme === 'pastel'
                      ? 'hover:bg-[#f3e8ff] hover:text-[#581c87]'
                      : 'hover:bg-[#1e1f25] hover:text-[#e3e1e9]'
                  }`}
                  title={isSpeaking ? 'Stop reading' : 'Read aloud'}
                >
                  {isSpeaking ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                <div
                  className={`h-4 w-px mx-1 ${
                    theme === 'pastel' ? 'bg-[#e9d5ff]' : 'bg-[#292a2f]'
                  }`}
                />

                {/* Thumbs Up / Down */}
                <button
                  onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    feedback === 'up'
                      ? theme === 'pastel'
                        ? 'text-[#9333ea] bg-[#f3e8ff]'
                        : 'text-[#4edea3]'
                      : theme === 'pastel'
                      ? 'hover:bg-[#f3e8ff] hover:text-[#9333ea]'
                      : 'hover:bg-[#1e1f25] hover:text-[#4edea3]'
                  }`}
                  title="Helpful response"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    feedback === 'down'
                      ? 'text-[#ffb4ab]'
                      : theme === 'pastel'
                      ? 'hover:bg-[#f3e8ff] hover:text-[#ffb4ab]'
                      : 'hover:bg-[#1e1f25] hover:text-[#ffb4ab]'
                  }`}
                  title="Needs improvement"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>

                {onDelete && (
                  <button
                    onClick={() => onDelete(message.id)}
                    className={`p-1.5 rounded-lg transition-colors ml-1 ${
                      theme === 'pastel'
                        ? 'hover:bg-[#f3e8ff] hover:text-[#ffb4ab]'
                        : 'hover:bg-[#1e1f25] hover:text-[#ffb4ab]'
                    }`}
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Telemetry Metrics */}
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full border ${
                    theme === 'pastel'
                      ? 'bg-[#faf5ff] text-[#6b21a8] border-[#e9d5ff]'
                      : 'bg-[#1e1f25] text-[#bbcabf] border-[#292a2f]'
                  }`}
                >
                  {message.tokens || Math.ceil(message.content.length / 4)} tokens
                </span>
                <span
                  className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full border ${
                    theme === 'pastel'
                      ? 'bg-[#ede9fe] text-[#7c3aed] border-[#d8b4fe]'
                      : 'bg-[#1e1f25] text-[#4edea3] border-[#292a2f]'
                  }`}
                >
                  {message.latencySeconds
                    ? `${message.latencySeconds}s runtime`
                    : '0.8s runtime'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
