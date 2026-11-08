import React from 'react';
import { Volume2, Terminal, User, Cpu, Copy, Check } from 'lucide-react';
import { JarvisMessage } from '../types';
import { sounds, speakText } from '../utils/soundEffects';

interface ChatFeedProps {
  messages: JarvisMessage[];
  onOpenCodeSnippet?: (snippet: NonNullable<JarvisMessage['codeSnippet']>) => void;
  onOpenApkDetails?: (details: NonNullable<JarvisMessage['apkDetails']>) => void;
  speechLanguage: string;
}

export const ChatFeed: React.FC<ChatFeedProps> = ({
  messages,
  onOpenCodeSnippet,
  onOpenApkDetails,
  speechLanguage,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleSpeak = (text: string) => {
    sounds.playClick();
    speakText(text, { lang: speechLanguage });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    sounds.playConfirm();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 my-6 px-4">
      <div className="flex items-center justify-between pb-2 border-b border-sky-950/60 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-400" />
          <span>DIRECTIVE & INTERACTION LEDGER</span>
        </div>
        <span>{messages.length} exchanges</span>
      </div>

      <div className="space-y-4">
        {messages.map((msg) => {
          const isJarvis = msg.sender === 'jarvis';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs md:text-sm animate-fade-in ${
                isJarvis ? 'justify-start' : 'justify-end'
              }`}
            >
              {isJarvis && (
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Cpu className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 transition-all ${
                  isJarvis
                    ? 'bg-slate-900/90 border border-sky-500/25 text-slate-200 shadow-xl'
                    : 'bg-sky-600/30 border border-sky-500/40 text-slate-100 shadow-md'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-800 text-[11px] font-mono opacity-80">
                  <span className="font-bold text-sky-400">
                    {isJarvis ? 'JARVIS CORE' : 'USER'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Formatted Text Content */}
                <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs md:text-sm">
                  {msg.text}
                </div>

                {/* Code Snippet attachment preview */}
                {msg.codeSnippet && (
                  <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs text-sky-300 font-bold">
                        {msg.codeSnippet.filename || 'generated_script.py'}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">
                        {msg.codeSnippet.language}
                      </span>
                    </div>
                    <pre className="text-[11px] font-mono text-sky-200/80 line-clamp-3 overflow-hidden bg-black/40 p-2 rounded">
                      {msg.codeSnippet.code}
                    </pre>
                    {onOpenCodeSnippet && (
                      <button
                        onClick={() => onOpenCodeSnippet(msg.codeSnippet!)}
                        className="mt-2 text-xs text-sky-400 hover:text-sky-300 font-mono underline"
                      >
                        Inspect in Code Studio &gt;&gt;
                      </button>
                    )}
                  </div>
                )}

                {/* APK Details preview */}
                {msg.apkDetails && (
                  <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">{msg.apkDetails.appName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{msg.apkDetails.packageName} · v{msg.apkDetails.version}</div>
                    </div>
                    {onOpenApkDetails && (
                      <button
                        onClick={() => onOpenApkDetails(msg.apkDetails!)}
                        className="text-xs px-2.5 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-lg hover:bg-sky-500/30"
                      >
                        Open APK Studio
                      </button>
                    )}
                  </div>
                )}

                {/* Actions footer for JARVIS messages */}
                {isJarvis && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSpeak(msg.text)}
                        className="p-1 rounded-md hover:bg-slate-800 text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 text-[11px]"
                        title="Vocalize response"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Vocalize</span>
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 text-[11px]"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {msg.action && msg.action !== 'chat' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800">
                        ACT: {msg.action.toUpperCase()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {!isJarvis && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
