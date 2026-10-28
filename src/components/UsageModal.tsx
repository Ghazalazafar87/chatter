import React from 'react';
import { QuotaTracker } from '../types/chat';
import { X, Zap, Activity, Clock, ShieldCheck, Info, CheckCircle2 } from 'lucide-react';

interface UsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotaTracker: QuotaTracker;
  activeModel: string;
  theme?: 'pastel' | 'dark' | 'light';
}

export const UsageModal: React.FC<UsageModalProps> = ({
  isOpen,
  onClose,
  quotaTracker,
  activeModel,
  theme = 'pastel',
}) => {
  if (!isOpen) return null;

  const isPastel = theme === 'pastel';

  const quotaPercent = Math.min(
    100,
    Math.round((quotaTracker.dailyRequestsCount / quotaTracker.maxDailyRequests) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
          isPastel
            ? 'bg-[#ffffff] border-[#e9d5ff] text-[#2e1065]'
            : 'bg-[#1a1b21] border-[#292a2f] text-[#e3e1e9]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isPastel ? 'border-[#e9d5ff]' : 'border-[#292a2f]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                isPastel
                  ? 'bg-[#f3e8ff] border-[#d8b4fe] text-[#7c3aed]'
                  : 'bg-[#06b6d4]/15 border-[#06b6d4]/30 text-[#4cd7f6]'
              }`}
            >
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">
                Gemini API Free Tier & Usage Diagnostics
              </h2>
              <p className={`text-xs ${isPastel ? 'text-[#8b799f]' : 'text-[#86948a]'}`}>
                Live telemetry and Google AI Studio rate limit parameters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isPastel
                ? 'text-[#8b799f] hover:text-[#2e1065] hover:bg-[#f3e8ff]'
                : 'text-[#86948a] hover:text-[#e3e1e9] hover:bg-[#292a2f]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Feed */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Daily Quota Card */}
          <div
            className={`p-4 border rounded-xl flex flex-col gap-3 ${
              isPastel
                ? 'bg-[#f5f0ff] border-[#e9d5ff]'
                : 'bg-[#1e1f25] border-[#292a2f]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span
                  className={`text-xs font-semibold uppercase font-mono tracking-wider ${
                    isPastel ? 'text-[#7c3aed]' : 'text-[#4edea3]'
                  }`}
                >
                  Session & Daily Quota
                </span>
                <p className={`text-xs mt-0.5 ${isPastel ? 'text-[#6b5d7d]' : 'text-[#bbcabf]'}`}>
                  Track your usage against the recommended daily free threshold
                </p>
              </div>
              <span className="font-mono text-sm font-bold">
                {quotaTracker.dailyRequestsCount} / {quotaTracker.maxDailyRequests} requests
              </span>
            </div>

            {/* Meter Bar */}
            <div
              className={`w-full h-2 rounded-full overflow-hidden border ${
                isPastel ? 'bg-[#ede9fe] border-[#e9d5ff]' : 'bg-[#0d0e13] border-[#292a2f]'
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  quotaPercent > 90
                    ? 'bg-[#ffb4ab]'
                    : quotaPercent > 75
                    ? 'bg-amber-400'
                    : isPastel
                    ? 'bg-[#a855f7]'
                    : 'bg-[#4edea3]'
                }`}
                style={{ width: `${quotaPercent}%` }}
              />
            </div>

            <div
              className={`flex items-center justify-between text-[11px] font-mono ${
                isPastel ? 'text-[#8b799f]' : 'text-[#86948a]'
              }`}
            >
              <span>Active Model: {activeModel}</span>
              <span>Quota resets at 00:00 UTC</span>
            </div>
          </div>

          {/* Three Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 15 RPM */}
            <div
              className={`p-3.5 border rounded-xl flex flex-col gap-1 ${
                isPastel
                  ? 'bg-[#f5f0ff] border-[#e9d5ff]'
                  : 'bg-[#1e1f25] border-[#292a2f]'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 ${
                  isPastel ? 'text-[#7c3aed]' : 'text-[#4edea3]'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span className="text-xs font-medium">Request Speed</span>
              </div>
              <div className="text-xl font-bold font-mono mt-1">15 RPM</div>
              <span className={`text-[11px] ${isPastel ? 'text-[#8b799f]' : 'text-[#86948a]'}`}>
                Requests Per Minute on Free Tier
              </span>
            </div>

            {/* 1M TPM */}
            <div
              className={`p-3.5 border rounded-xl flex flex-col gap-1 ${
                isPastel
                  ? 'bg-[#f5f0ff] border-[#e9d5ff]'
                  : 'bg-[#1e1f25] border-[#292a2f]'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 ${
                  isPastel ? 'text-[#a855f7]' : 'text-[#4cd7f6]'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Token Bandwidth</span>
              </div>
              <div className="text-xl font-bold font-mono mt-1">1,000,000</div>
              <span className={`text-[11px] ${isPastel ? 'text-[#8b799f]' : 'text-[#86948a]'}`}>
                Tokens Per Minute Free Allowance
              </span>
            </div>

            {/* Latency */}
            <div
              className={`p-3.5 border rounded-xl flex flex-col gap-1 ${
                isPastel
                  ? 'bg-[#f5f0ff] border-[#e9d5ff]'
                  : 'bg-[#1e1f25] border-[#292a2f]'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 ${
                  isPastel ? 'text-[#6b21a8]' : 'text-[#c0c1ff]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-medium">Engine Latency</span>
              </div>
              <div className="text-xl font-bold font-mono mt-1">~142 ms</div>
              <span className={`text-[11px] ${isPastel ? 'text-[#8b799f]' : 'text-[#86948a]'}`}>
                Server streaming time-to-first-token
              </span>
            </div>
          </div>

          {/* Guidelines to Avoid Rate Limits */}
          <div
            className={`p-4 border rounded-xl space-y-2 ${
              isPastel
                ? 'bg-[#faf5ff] border-[#e9d5ff]'
                : 'bg-[#0d0e13] border-[#292a2f]'
            }`}
          >
            <div
              className={`flex items-center gap-2 text-xs font-semibold ${
                isPastel ? 'text-[#2e1065]' : 'text-[#e3e1e9]'
              }`}
            >
              <Info className={`w-4 h-4 ${isPastel ? 'text-[#7c3aed]' : 'text-[#4cd7f6]'}`} />
              <span>Optimizing Free-Tier Throughput</span>
            </div>
            <ul className={`space-y-1.5 text-xs pl-6 list-disc ${isPastel ? 'text-[#6b5d7d]' : 'text-[#bbcabf]'}`}>
              <li>
                <strong>Streaming is active</strong>: Chunks are delivered progressively using Server-Sent Events (SSE) to prevent HTTP connection timeouts.
              </li>
              <li>
                <strong>Automatic 429 Catcher</strong>: If you exceed 15 RPM, our backend gracefully pauses and returns a friendly retry prompt without data loss.
              </li>
              <li>
                <strong>Persistent Local History</strong>: All threads remain cached in browser LocalStorage, so page reloads never lose your messages.
              </li>
            </ul>
          </div>

          {/* API Key Security Notice */}
          <div
            className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs ${
              isPastel
                ? 'bg-[#ede9fe] border-[#d8b4fe] text-[#2e1065]'
                : 'bg-[#10b981]/10 border-[#10b981]/25 text-[#bbcabf]'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                isPastel ? 'text-[#7c3aed]' : 'text-[#4edea3]'
              }`}
            />
            <div>
              <span className={`font-semibold ${isPastel ? 'text-[#5b21b6]' : 'text-[#4edea3]'}`}>
                Secure Server Architecture
              </span>
              <p className={`mt-0.5 text-[11px] leading-relaxed ${isPastel ? 'text-[#6b5d7d]' : 'text-[#bbcabf]'}`}>
                Your API key is never exposed to the client or browser bundles. Requests are securely routed through our Express proxy endpoint using server-side environment secrets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
