import React, { useState, useRef } from 'react';
import { AppSettings, Conversation } from '../types/chat';
import {
  X,
  Settings,
  Sliders,
  Database,
  Download,
  Upload,
  Trash2,
  Check,
  Moon,
  Sun,
  Palette,
  Volume2,
  Code,
  Sparkles,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  conversations: Conversation[];
  onExportAll: () => void;
  onImportConversations: (imported: Conversation[]) => void;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  conversations,
  onExportAll,
  onImportConversations,
  onClearAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'model' | 'data'>('general');
  const [currentSettings, setCurrentSettings] = useState<AppSettings>(settings);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...currentSettings, [key]: value };
    setCurrentSettings(updated);
    onSaveSettings(updated);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportConversations(parsed);
          setImportStatus(`Successfully imported ${parsed.length} conversations!`);
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Invalid JSON format. Expected an array of conversations.');
        }
      } catch (err) {
        setImportStatus('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const isPastel = currentSettings.theme === 'pastel';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors ${
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
              className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                isPastel
                  ? 'bg-[#f3e8ff] border-[#d8b4fe] text-[#7c3aed]'
                  : 'bg-[#6366f1]/15 border-[#6366f1]/30 text-[#c0c1ff]'
              }`}
            >
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Preferences & Settings</h2>
              <p className={`text-xs ${isPastel ? 'text-[#8b799f]' : 'text-[#86948a]'}`}>
                Customize workspace, model, and storage parameters
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

        {/* Tab Navigation */}
        <div
          className={`flex items-center gap-2 px-6 pt-3 border-b ${
            isPastel ? 'bg-[#faf5ff] border-[#e9d5ff]' : 'bg-[#161922] border-[#292a2f]'
          }`}
        >
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'general'
                ? isPastel
                  ? 'border-[#a855f7] text-[#7c3aed]'
                  : 'border-[#10b981] text-[#4edea3]'
                : isPastel
                ? 'border-transparent text-[#8b799f] hover:text-[#2e1065]'
                : 'border-transparent text-[#86948a] hover:text-[#e3e1e9]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>General</span>
          </button>
          <button
            onClick={() => setActiveTab('model')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'model'
                ? isPastel
                  ? 'border-[#a855f7] text-[#7c3aed]'
                  : 'border-[#10b981] text-[#4edea3]'
                : isPastel
                ? 'border-transparent text-[#8b799f] hover:text-[#2e1065]'
                : 'border-transparent text-[#86948a] hover:text-[#e3e1e9]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Model & AI</span>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'data'
                ? isPastel
                  ? 'border-[#a855f7] text-[#7c3aed]'
                  : 'border-[#10b981] text-[#4edea3]'
                : isPastel
                ? 'border-transparent text-[#8b799f] hover:text-[#2e1065]'
                : 'border-transparent text-[#86948a] hover:text-[#e3e1e9]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Storage & Backup</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Theme Toggle */}
              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border rounded-xl ${
                  isPastel
                    ? 'bg-[#f5f0ff] border-[#e9d5ff]'
                    : 'bg-[#1e1f25] border-[#292a2f]'
                }`}
              >
                <div>
                  <h4 className="text-xs font-semibold">Interface Theme</h4>
                  <p className={`text-[11px] ${isPastel ? 'text-[#8b799f]' : 'text-[#86948a]'}`}>
                    Choose your workspace aesthetic
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1 p-1 rounded-lg border ${
                    isPastel ? 'bg-[#ffffff] border-[#e9d5ff]' : 'bg-[#0d0e13] border-[#292a2f]'
                  }`}
                >
                  <button
                    onClick={() => handleChange('theme', 'pastel')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      currentSettings.theme === 'pastel'
                        ? 'bg-[#ede9fe] text-[#7c3aed] shadow-xs font-semibold border border-[#d8b4fe]'
                        : 'text-[#8b799f] hover:text-[#2e1065]'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Pastel</span>
                  </button>
                  <button
                    onClick={() => handleChange('theme', 'dark')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      currentSettings.theme === 'dark'
                        ? 'bg-[#1e1f25] text-[#4edea3] shadow-xs'
                        : isPastel
                        ? 'text-[#8b799f] hover:text-[#2e1065]'
                        : 'text-[#86948a] hover:text-[#e3e1e9]'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => handleChange('theme', 'light')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      currentSettings.theme === 'light'
                        ? 'bg-[#ffffff] text-amber-600 shadow-xs'
                        : isPastel
                        ? 'text-[#8b799f] hover:text-[#2e1065]'
                        : 'text-[#86948a] hover:text-[#e3e1e9]'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light</span>
                  </button>
                </div>
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between p-3.5 bg-[#1e1f25] border border-[#292a2f] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#292a2f] text-[#c0c1ff]">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#e3e1e9]">Synthesized Sound Effects</h4>
                    <p className="text-[11px] text-[#86948a]">Audio cues on message send, streaming, and completion</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentSettings.soundEnabled}
                    onChange={(e) => handleChange('soundEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#34343a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10b981]"></div>
                </label>
              </div>

              {/* Line Numbers Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-[#1e1f25] border border-[#292a2f] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#292a2f] text-[#4edea3]">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#e3e1e9]">Code Block Line Numbers</h4>
                    <p className="text-[11px] text-[#86948a]">Display 01, 02 line indices beside rendered code blocks</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentSettings.showLineNumbers}
                    onChange={(e) => handleChange('showLineNumbers', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#34343a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10b981]"></div>
                </label>
              </div>

              {/* Stream Responses Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-[#1e1f25] border border-[#292a2f] rounded-xl">
                <div>
                  <h4 className="text-xs font-semibold text-[#e3e1e9]">Real-Time Token Streaming</h4>
                  <p className="text-[11px] text-[#86948a]">Receive chunks incrementally as Gemini generates them</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentSettings.streamResponses}
                    onChange={(e) => handleChange('streamResponses', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#34343a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10b981]"></div>
                </label>
              </div>
            </div>
          )}

          {/* MODEL TAB */}
          {activeTab === 'model' && (
            <div className="space-y-4">
              {/* Default Model */}
              <div>
                <label className="block text-xs font-semibold text-[#e3e1e9] mb-1.5">
                  Default Gemini Free Tier Model
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'gemini-flash-lite-latest', title: 'Gemini Flash Lite (Ultra Fast)', desc: 'Lowest Latency (~1.4s) • Instantaneous streaming • High throughput' },
                    { id: 'gemini-3.5-flash-lite', title: 'Gemini 3.5 Flash Lite', desc: 'Fast execution • High availability • Great for coding' },
                    { id: 'gemini-3.1-flash-lite', title: 'Gemini 3.1 Flash Lite', desc: 'Compact developer model for technical discussions' },
                    { id: 'gemini-flash-latest', title: 'Gemini Flash Latest', desc: 'Continuous release for large context analysis' },
                  ].map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        currentSettings.model === m.id
                          ? 'bg-[#10b981]/15 border-[#10b981]/40 text-[#4edea3]'
                          : 'bg-[#1e1f25] border-[#292a2f] text-[#bbcabf] hover:bg-[#292a2f]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="model"
                        value={m.id}
                        checked={currentSettings.model === m.id}
                        onChange={(e) => handleChange('model', e.target.value)}
                        className="mt-0.5 text-[#10b981] focus:ring-0"
                      />
                      <div>
                        <div className="text-xs font-semibold text-[#e3e1e9]">{m.title}</div>
                        <div className="text-[11px] text-[#86948a] mt-0.5">{m.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="p-3.5 bg-[#1e1f25] border border-[#292a2f] rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#e3e1e9]">Temperature</span>
                  <span className="font-mono text-[#4edea3] font-bold">
                    {currentSettings.temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={currentSettings.temperature}
                  onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                  className="w-full accent-[#10b981] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#86948a] font-mono">
                  <span>0.0 (Precise / Code)</span>
                  <span>0.7 (Balanced)</span>
                  <span>2.0 (Creative)</span>
                </div>
              </div>

              {/* System Instructions */}
              <div>
                <label className="block text-xs font-semibold text-[#e3e1e9] mb-1">
                  Global System Instruction
                </label>
                <textarea
                  value={currentSettings.systemInstruction}
                  onChange={(e) => handleChange('systemInstruction', e.target.value)}
                  rows={4}
                  className="w-full bg-[#0d0e13] border border-[#292a2f] rounded-xl p-3 text-xs text-[#e3e1e9] outline-none focus:border-[#10b981]/50 transition-colors leading-relaxed font-sans"
                  placeholder="Set custom role, formatting guidelines, or instructions for Gemini..."
                />
              </div>
            </div>
          )}

          {/* DATA TAB */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#1e1f25] border border-[#292a2f] rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#e3e1e9]">Active Storage Count</h4>
                  <p className="text-[11px] text-[#86948a]">Stored locally in your browser's persistent storage</p>
                </div>
                <span className="font-mono text-sm font-bold text-[#4edea3] bg-[#0d0e13] px-3 py-1 rounded-lg border border-[#292a2f]">
                  {conversations.length} Threads
                </span>
              </div>

              {importStatus && (
                <div className="p-3 rounded-lg bg-[#10b981]/15 border border-[#10b981]/30 text-xs text-[#4edea3] flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{importStatus}</span>
                </div>
              )}

              {/* Export & Import Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={onExportAll}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#292a2f] hover:bg-[#34343a] text-xs font-medium text-[#e3e1e9] rounded-xl border border-[#34343a] transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#4edea3]" />
                  <span>Export All (JSON)</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportFile}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#292a2f] hover:bg-[#34343a] text-xs font-medium text-[#e3e1e9] rounded-xl border border-[#34343a] transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#4cd7f6]" />
                  <span>Import From JSON</span>
                </button>
              </div>

              {/* Danger Zone: Clear all conversations */}
              <div className="p-4 bg-[#ffdad6]/5 border border-[#ffb4ab]/20 rounded-xl space-y-2">
                <h4 className="text-xs font-semibold text-[#ffb4ab]">Danger Zone</h4>
                <p className="text-[11px] text-[#86948a]">
                  Permanently delete all conversations, messages, and quota counts stored in this browser session.
                </p>
                <button
                  onClick={onClearAllData}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#ffb4ab]/20 hover:bg-[#ffb4ab]/30 text-[#ffb4ab] text-xs font-medium rounded-lg transition-colors cursor-pointer mt-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Local Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
