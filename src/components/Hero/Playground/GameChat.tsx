'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LuMessageSquare, LuSend, LuX } from 'react-icons/lu';
import toast from 'react-hot-toast';
import type { ChatMessage } from '@/types/chat';
import { useLanguage } from '@/context/LanguageContext';
import { playTabClickSound } from '@/lib/circuitAudio';

export interface GameChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => { success: boolean; reason?: string };
  isChatFocused: boolean;
  onFocusChange: (focused: boolean) => void;
  visible?: boolean;
  selfUsername?: string;
}

/**
 * Hook to manage global keyboard shortcuts for the game chat:
 * - 'Enter' or 'T' opens and focuses chat input.
 * - 'Escape' closes chat.
 */
export function useGameChatKeyboard(
  isChatFocused: boolean,
  onFocusChange: (focused: boolean) => void,
  isChatOpen: boolean,
  onOpenChange: (open: boolean) => void,
  visible: boolean = true
) {
  useEffect(() => {
    if (!visible || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTypingElsewhere =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true');

      // 1. If not typing anywhere else: 'Enter' or 'T' opens and focuses chat
      if (!isChatFocused) {
        if (isTypingElsewhere) return;

        if (e.code === 'KeyT' || e.code === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          onOpenChange(true);
          onFocusChange(true);
        }
      } else {
        // 2. If chat is active: 'Escape' cancels and closes chat
        if (e.code === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          onFocusChange(false);
          onOpenChange(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isChatFocused, onFocusChange, isChatOpen, onOpenChange, visible]);
}

/**
 * GameChat: In-game real-time multiplayer chat system
 * Features:
 * - Can be closed / minimized into a compact floating button to clear screen view
 * - Header with dedicated Close [X] button
 * - Global shortcut 'Enter' / 'T' to open, 'Enter' to send, 'Escape' to close
 * - Car control lock when typing (handled via onFocusChange)
 * - Translucent HUD message log with auto-dim after 6s of inactivity
 * - Unread message counter badge when closed
 * - 60-character limit with sanitize & 1s cooldown
 */
export default function GameChat({
  messages,
  onSendMessage,
  isChatFocused,
  onFocusChange,
  visible = true,
  selfUsername = 'Pilot_01',
}: GameChatProps) {
  const { dictionary } = useLanguage();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isDimmed, setIsDimmed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const lastActivityTimeRef = useRef<number>(Date.now());
  const dimTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use modular keyboard shortcuts
  useGameChatKeyboard(isChatFocused, onFocusChange, isChatOpen, setIsChatOpen, visible);

  // Auto-focus input when opened
  useEffect(() => {
    if (isChatFocused) {
      setIsDimmed(false);
      setUnreadCount(0);
      lastActivityTimeRef.current = Date.now();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 30);
    } else {
      inputRef.current?.blur();
    }
  }, [isChatFocused]);

  // Keep chat log pinned to latest message and track unread count when closed
  useEffect(() => {
    lastActivityTimeRef.current = Date.now();
    setIsDimmed(false);

    if (!isChatOpen) {
      setUnreadCount((c) => Math.min(c + 1, 9));
    }

    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [messages, isChatOpen]);

  // Inactivity auto-dim timer (dimmed after 6 seconds of no chat or interaction)
  useEffect(() => {
    const checkDim = () => {
      if (isChatFocused) {
        setIsDimmed(false);
        return;
      }
      const elapsed = Date.now() - lastActivityTimeRef.current;
      if (elapsed >= 6000) {
        setIsDimmed(true);
      }
    };

    dimTimerRef.current = setInterval(checkDim, 1000);
    return () => {
      if (dimTimerRef.current) clearInterval(dimTimerRef.current);
    };
  }, [isChatFocused]);

  const handleSend = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      onFocusChange(false);
      return;
    }

    const res = onSendMessage(trimmed);
    if (!res.success) {
      if (res.reason === 'cooldown') {
        toast('⏳ Tunggu 1 detik sebelum chat lagi!', { id: 'chat-cooldown', duration: 1800 });
      }
      return;
    }

    setInputText('');
    onFocusChange(false);
  }, [inputText, onSendMessage, onFocusChange]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Stop car controls from capturing any keys while typing
    e.stopPropagation();

    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onFocusChange(false);
      setIsChatOpen(false);
    }
  };

  const handleBoxInteraction = () => {
    lastActivityTimeRef.current = Date.now();
    setIsDimmed(false);
  };

  const handleOpenChat = () => {
    try {
      playTabClickSound();
    } catch {
      // ignore
    }
    setIsChatOpen(true);
    setUnreadCount(0);
    onFocusChange(true);
  };

  const handleCloseChat = () => {
    try {
      playTabClickSound();
    } catch {
      // ignore
    }
    setIsChatOpen(false);
    onFocusChange(false);
  };

  if (!visible) return null;

  // ─────────────────────────────────────────────────────────────
  // 1. CLOSED / MINIMIZED STATE: Floating Sleek Button
  // ─────────────────────────────────────────────────────────────
  if (!isChatOpen) {
    return (
      <div className="absolute bottom-20 sm:bottom-24 left-3 sm:left-6 z-40 pointer-events-auto select-none animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={handleOpenChat}
          title={`${dictionary.game_chat_open} (Enter / T)`}
          aria-label={dictionary.game_chat_open}
          className="group flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-2xl bg-neutral-950/90 hover:bg-neutral-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-400 hover:text-white backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.65)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <LuMessageSquare className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-cyan-400 text-black text-[9px] font-black flex items-center justify-center animate-pulse shadow-sm">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-gray-200 group-hover:text-white">
            Chat
          </span>
          <span className="hidden sm:inline text-[10px] text-gray-500 font-mono">
            [T]
          </span>
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. OPEN STATE: Full Chat Window with Close [X] Button
  // ─────────────────────────────────────────────────────────────
  const recentMessages = messages.slice(-7);

  return (
    <div
      onMouseEnter={handleBoxInteraction}
      onTouchStart={handleBoxInteraction}
      className={`absolute bottom-20 sm:bottom-24 left-3 sm:left-6 z-40 flex flex-col pointer-events-auto transition-opacity duration-300 ease-out select-none animate-in fade-in zoom-in-95 duration-200 ${
        isDimmed && !isChatFocused ? 'opacity-40 hover:opacity-100' : 'opacity-100'
      }`}
      style={{
        maxWidth: 'calc(100vw - 24px)',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          HEADER BAR with Title and Dedicated Close Button [X]
      ───────────────────────────────────────────────────────────── */}
      <div className="w-[270px] sm:w-[330px] md:w-[360px] flex items-center justify-between px-3 py-1.5 mb-1.5 rounded-xl bg-neutral-950/90 border border-cyan-500/35 backdrop-blur-xl shadow-md">
        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
          <LuMessageSquare className="w-3.5 h-3.5" />
          <span>{dictionary.game_chat_title}</span>
        </div>
        <button
          type="button"
          onClick={handleCloseChat}
          title={`${dictionary.game_chat_close} (Esc)`}
          aria-label={dictionary.game_chat_close}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-neutral-800 transition active:scale-95 cursor-pointer"
        >
          <LuX className="w-4 h-4" />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CHAT HISTORY LOG PANEL (Translucent Cyberpunk HUD)
      ───────────────────────────────────────────────────────────── */}
      <div
        ref={logContainerRef}
        className="w-[270px] sm:w-[330px] md:w-[360px] max-h-[140px] sm:max-h-[165px] overflow-y-auto overflow-x-hidden flex flex-col justify-end gap-1.5 p-2.5 rounded-2xl bg-neutral-950/80 border border-cyan-500/25 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.65)] scrollbar-none"
      >
        {recentMessages.length === 0 ? (
          <div className="text-[11px] font-mono text-gray-500/80 italic px-1.5 py-1">
            Belum ada chat. Tekan <span className="text-cyan-400 font-bold">[Enter]</span> atau{' '}
            <span className="text-cyan-400 font-bold">[T]</span> untuk menyapa!
          </div>
        ) : (
          recentMessages.map((msg) => {
            const isSelf = msg.isSelf || msg.username === selfUsername;
            return (
              <div
                key={msg.id}
                className="flex items-start gap-1.5 text-[11px] sm:text-xs leading-snug px-2 py-1 rounded-xl bg-neutral-900/60 border border-white/5 animate-in fade-in duration-200"
              >
                {/* User badge */}
                <span
                  className={`font-bold shrink-0 flex items-center gap-1 ${
                    isSelf ? 'text-cyan-300' : 'text-gray-200'
                  }`}
                  style={{ color: msg.color || (isSelf ? '#22d3ee' : '#e2e8f0') }}
                >
                  {isSelf && (
                    <span className="px-1 py-0.2 rounded text-[8px] font-black bg-cyan-500 text-black uppercase">
                      YOU
                    </span>
                  )}
                  <span>[{msg.username}]:</span>
                </span>

                {/* Message body */}
                <span className="text-gray-100 font-medium break-words word-break flex-1 select-text">
                  {msg.message}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CHAT INPUT BAR (Expands when active / shortcut triggered)
      ───────────────────────────────────────────────────────────── */}
      <div className="mt-2 w-[270px] sm:w-[330px] md:w-[360px]">
        {isChatFocused ? (
          /* Active Input Box */
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-950/95 border border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, 60))}
              onKeyDown={handleInputKeyDown}
              placeholder={dictionary.game_chat_placeholder}
              maxLength={60}
              className="flex-1 bg-transparent border-none outline-none text-white text-xs sm:text-sm px-2.5 py-1 font-medium placeholder-gray-500"
            />

            {/* Char count */}
            <span
              className={`text-[10px] font-mono px-1 select-none ${
                inputText.length >= 50 ? 'text-amber-400 font-bold' : 'text-gray-500'
              }`}
            >
              {inputText.length}/60
            </span>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              title="Kirim Pesan"
              className="p-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-black transition active:scale-95 cursor-pointer shrink-0"
            >
              <LuSend className="w-3.5 h-3.5" />
            </button>

            {/* Close / Cancel Button */}
            <button
              onClick={handleCloseChat}
              title={`${dictionary.game_chat_close} (Esc)`}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-neutral-800 transition active:scale-95 cursor-pointer shrink-0"
            >
              <LuX className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Closed / Compact Bar with Quick Focus Trigger */
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFocusChange(true)}
              className="group flex items-center justify-between w-full px-3 py-1.5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-900 border border-cyan-500/30 hover:border-cyan-400 text-gray-300 hover:text-white text-xs font-semibold backdrop-blur-xl shadow-lg transition active:scale-95 cursor-pointer"
            >
              <span className="text-gray-400 group-hover:text-gray-200">
                {dictionary.game_chat_placeholder}
              </span>
              <span className="font-mono text-cyan-400 font-bold text-[10px]">[Enter]</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
