'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type {
  CarModelType,
  PlayerVehicleState,
  MultiplayerRoomState,
  LeaderboardEntry,
} from '@/types/vehicle';
import type { ChatMessage, ActiveChatBubble } from '@/types/chat';

const MAX_ROOM_PLAYERS = 5;
const BROADCAST_INTERVAL_MS = 38; // ~26 updates/sec throttle
const STALE_PLAYER_TIMEOUT_MS = 6000;

interface UseMultiplayerProps {
  initialUsername?: string;
  initialModel?: CarModelType;
  initialColor?: string;
}

export function useMultiplayer({
  initialUsername = 'Pilot_01',
  initialModel = 'sport',
  initialColor = '#06b6d4',
}: UseMultiplayerProps = {}) {
  const [playerId, setPlayerId] = useState<string>('');
  const [username, setUsernameState] = useState<string>(initialUsername);
  const [carModel, setCarModelState] = useState<CarModelType>(initialModel);
  const [carColor, setCarColorState] = useState<string>(initialColor);
  const [activePlayerIds, setActivePlayerIds] = useState<string[]>([]);

  const [roomState, setRoomState] = useState<MultiplayerRoomState>({
    status: 'connecting',
    playerCount: 1,
    maxPlayers: MAX_ROOM_PLAYERS,
    isSpectator: false,
    players: {},
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastBroadcastTime = useRef<number>(0);
  const isSpectatorRef = useRef<boolean>(false);
  const remotePlayersRef = useRef<Record<string, PlayerVehicleState>>({});

  // Floating reaction emotes
  const [activeEmotes, setActiveEmotes] = useState<Record<string, { text: string; expiresAt: number }>>({});
  const [selfEmote, setSelfEmote] = useState<{ text: string; expiresAt: number } | null>(null);

  // Real-time Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeChatBubbles, setActiveChatBubbles] = useState<Record<string, ActiveChatBubble>>({});
  const [selfChatBubble, setSelfChatBubble] = useState<ActiveChatBubble | null>(null);
  const lastChatTimeRef = useRef<number>(0);

  // 1. Initialize Player Identity & load saved preferences from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let id = sessionStorage.getItem('playground_player_id');
    if (!id) {
      id = `pilot_${Math.random().toString(36).substring(2, 7)}_${Math.floor(Math.random() * 90 + 10)}`;
      sessionStorage.setItem('playground_player_id', id);
    }
    setPlayerId(id);

    const savedName = localStorage.getItem('playground_username');
    if (savedName) setUsernameState(savedName);
    else {
      const defaultName = `Pilot_${Math.floor(Math.random() * 90 + 10)}`;
      setUsernameState(defaultName);
      localStorage.setItem('playground_username', defaultName);
    }

    const savedModel = localStorage.getItem('playground_car_model') as CarModelType | null;
    if (savedModel && ['sport', 'truck', 'buggy'].includes(savedModel)) {
      setCarModelState(savedModel);
    }

    const savedColor = localStorage.getItem('playground_car_color');
    if (savedColor) setCarColorState(savedColor);
  }, []);

  // 2. Connect to Supabase Realtime Channel (Broadcast & Presence)
  useEffect(() => {
    if (!playerId) return;

    let channel: RealtimeChannel | null = null;
    let cleanupInterval: NodeJS.Timeout | null = null;

    try {
      const supabase = getSupabase();
      if (!supabase) {
        setRoomState((prev) => ({ ...prev, status: 'offline' }));
        return;
      }

      const joinedAt = Date.now();
      const channelName = 'playground_arena_room';

      channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: playerId },
        },
      });

      channelRef.current = channel;

      // Handle presence sync (Determine driver vs spectator based on 5-player cap)
      channel.on('presence', { event: 'sync' }, () => {
        if (!channel) return;
        const presenceState = channel.presenceState();
        const allPresences: { id: string; joinedAt: number }[] = [];

        Object.keys(presenceState).forEach((key) => {
          const list = presenceState[key] as any[];
          if (list && list[0]) {
            allPresences.push({
              id: key,
              joinedAt: list[0].joinedAt || joinedAt,
            });
          }
        });

        // Sort by join time
        allPresences.sort((a, b) => a.joinedAt - b.joinedAt);

        const myIndex = allPresences.findIndex((p) => p.id === playerId);
        const isSpectator = myIndex >= MAX_ROOM_PLAYERS;
        isSpectatorRef.current = isSpectator;

        const activeCount = Math.min(allPresences.length, MAX_ROOM_PLAYERS);

        setRoomState((prev) => ({
          ...prev,
          status: isSpectator ? 'full' : 'connected',
          playerCount: activeCount,
          isSpectator,
        }));
      });

      // Handle presence leave
      channel.on('presence', { event: 'leave' }, ({ key }) => {
        if (key && remotePlayersRef.current[key]) {
          delete remotePlayersRef.current[key];
          setActivePlayerIds((prev) => prev.filter((id) => id !== key));
          setRoomState((prev) => {
            const nextPlayers = { ...prev.players };
            delete nextPlayers[key];
            return { ...prev, players: nextPlayers };
          });
        }
      });

      // Handle incoming real-time car state broadcast
      channel.on('broadcast', { event: 'car_state' }, ({ payload }) => {
        if (!payload || payload.id === playerId) return;

        const isNew = !remotePlayersRef.current[payload.id];

        const incomingPlayer: PlayerVehicleState = {
          id: payload.id,
          username: payload.username || 'Pilot',
          model: payload.model || 'sport',
          color: payload.color || '#06b6d4',
          x: payload.x ?? 0,
          z: payload.z ?? 0,
          heading: payload.heading ?? 0,
          speed: payload.speed ?? 0,
          steerAngle: payload.steerAngle ?? 0,
          isDrifting: Boolean(payload.isDrifting),
          isBraking: Boolean(payload.isBraking),
          role: payload.role || 'driver',
          currentLap: typeof payload.currentLap === 'number' ? payload.currentLap : 1,
          checkpointIndex: typeof payload.checkpointIndex === 'number' ? payload.checkpointIndex : 0,
          currentLapTime: typeof payload.currentLapTime === 'number' ? payload.currentLapTime : 0,
          bestLapTime: typeof payload.bestLapTime === 'number' ? payload.bestLapTime : 0,
          isFinished: Boolean(payload.isFinished),
          lastUpdated: Date.now(),
        };

        remotePlayersRef.current[payload.id] = incomingPlayer;

        if (isNew) {
          setActivePlayerIds((prev) => (prev.includes(payload.id) ? prev : [...prev, payload.id]));
        }
      });

      // Handle incoming floating reaction emote broadcast
      channel.on('broadcast', { event: 'player_emote' }, ({ payload }) => {
        if (!payload || !payload.id || !payload.emote) return;
        setActiveEmotes((prev) => ({
          ...prev,
          [payload.id]: {
            text: payload.emote,
            expiresAt: Date.now() + 2500,
          },
        }));
      });

      // Handle incoming real-time chat broadcast
      channel.on('broadcast', { event: 'player_chat' }, ({ payload }) => {
        if (!payload || !payload.id || !payload.message) return;
        const cleanMsg = String(payload.message).trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '').slice(0, 60);
        if (!cleanMsg) return;

        const now = Date.now();
        const msgId = payload.msgId || `msg_${now}_${Math.random().toString(36).substring(2, 6)}`;

        const incomingMsg: ChatMessage = {
          id: msgId,
          senderId: payload.id,
          username: payload.username || 'Pilot',
          message: cleanMsg,
          timestamp: payload.timestamp || now,
          color: payload.color || '#38bdf8',
          isSelf: payload.id === playerId,
        };

        setChatMessages((prev) => [...prev.slice(-25), incomingMsg]);

        setActiveChatBubbles((prev) => ({
          ...prev,
          [payload.id]: {
            message: cleanMsg,
            timestamp: now,
            expiresAt: now + 5000,
          },
        }));
      });

      // Subscribe and register presence
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel?.track({
            id: playerId,
            username,
            model: carModel,
            color: carColor,
            joinedAt,
          });

          setRoomState((prev) => ({
            ...prev,
            status: 'connected',
          }));
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setRoomState((prev) => ({
            ...prev,
            status: 'offline',
          }));
        }
      });

      // Periodic cleanup of stale remote players (e.g. disconnected without leave event)
      cleanupInterval = setInterval(() => {
        const now = Date.now();
        let changed = false;
        Object.keys(remotePlayersRef.current).forEach((id) => {
          if (now - remotePlayersRef.current[id].lastUpdated > STALE_PLAYER_TIMEOUT_MS) {
            delete remotePlayersRef.current[id];
            changed = true;
          }
        });

        if (changed) {
          setActivePlayerIds(Object.keys(remotePlayersRef.current));
          setRoomState((prev) => ({
            ...prev,
            players: { ...remotePlayersRef.current },
          }));
        }
      }, 2500);
    } catch (err) {
      console.warn('Supabase multiplayer init failed, running in local/offline mode:', err);
      setRoomState((prev) => ({ ...prev, status: 'offline' }));
    }

    return () => {
      if (cleanupInterval) clearInterval(cleanupInterval);
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [playerId]);

  // 3. Broadcast local vehicle state (throttled to ~26 FPS)
  const broadcastCarState = useCallback(
    (state: {
      x: number;
      z: number;
      heading: number;
      speed: number;
      steerAngle: number;
      isDrifting: boolean;
      isBraking: boolean;
      currentLap?: number;
      checkpointIndex?: number;
      currentLapTime?: number;
      bestLapTime?: number;
      isFinished?: boolean;
    }) => {
      // Spectators do not broadcast their car
      if (isSpectatorRef.current || !channelRef.current || !playerId) return;

      const now = performance.now();
      if (now - lastBroadcastTime.current < BROADCAST_INTERVAL_MS) {
        return;
      }
      lastBroadcastTime.current = now;

      channelRef.current.send({
        type: 'broadcast',
        event: 'car_state',
        payload: {
          id: playerId,
          username,
          model: carModel,
          color: carColor,
          x: Math.round(state.x * 100) / 100,
          z: Math.round(state.z * 100) / 100,
          heading: Math.round(state.heading * 1000) / 1000,
          speed: Math.round(state.speed * 10) / 10,
          steerAngle: Math.round(state.steerAngle * 100) / 100,
          isDrifting: state.isDrifting,
          isBraking: state.isBraking,
          currentLap: state.currentLap ?? 1,
          checkpointIndex: state.checkpointIndex ?? 0,
          currentLapTime: state.currentLapTime ? Math.round(state.currentLapTime * 10) / 10 : 0,
          bestLapTime: state.bestLapTime ? Math.round(state.bestLapTime * 10) / 10 : 0,
          isFinished: Boolean(state.isFinished),
          role: 'driver',
          timestamp: Date.now(),
        },
      });
    },
    [playerId, username, carModel, carColor]
  );

  // 4. Update Customization (Car Model, Color, Username) & Re-track presence
  const setUsername = useCallback(
    (name: string) => {
      const cleanName = name.trim().slice(0, 14);
      setUsernameState(cleanName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('playground_username', cleanName);
      }
      if (channelRef.current && playerId) {
        channelRef.current.track({
          id: playerId,
          username: cleanName,
          model: carModel,
          color: carColor,
          joinedAt: Date.now(),
        });
      }
    },
    [playerId, carModel, carColor]
  );

  const setCarModel = useCallback(
    (model: CarModelType) => {
      setCarModelState(model);
      if (typeof window !== 'undefined') {
        localStorage.setItem('playground_car_model', model);
      }
      if (channelRef.current && playerId) {
        channelRef.current.track({
          id: playerId,
          username,
          model,
          color: carColor,
          joinedAt: Date.now(),
        });
      }
    },
    [playerId, username, carColor]
  );

  const setCarColor = useCallback(
    (color: string) => {
      setCarColorState(color);
      if (typeof window !== 'undefined') {
        localStorage.setItem('playground_car_color', color);
      }
      if (channelRef.current && playerId) {
        channelRef.current.track({
          id: playerId,
          username,
          model: carModel,
          color,
          joinedAt: Date.now(),
        });
      }
    },
    [playerId, username, carModel]
  );

  // 5. Compute real-time leaderboard sorted by finish status, lap, checkpoint & best lap time
  const getLeaderboard = useCallback(
    (selfTelemetry: {
      currentLap: number;
      checkpointIndex: number;
      currentLapTime: number;
      bestLapTime: number;
      isFinished: boolean;
    }): LeaderboardEntry[] => {
      const entries: LeaderboardEntry[] = [
        {
          id: playerId || 'self',
          username,
          isSelf: true,
          color: carColor,
          model: carModel,
          currentLap: selfTelemetry.currentLap,
          checkpointIndex: selfTelemetry.checkpointIndex,
          bestLapTime: selfTelemetry.bestLapTime,
          currentLapTime: selfTelemetry.currentLapTime,
          isFinished: selfTelemetry.isFinished,
        },
      ];

      Object.values(remotePlayersRef.current).forEach((p) => {
        entries.push({
          id: p.id,
          username: p.username || 'Pilot',
          isSelf: false,
          color: p.color || '#06b6d4',
          model: p.model || 'sport',
          currentLap: p.currentLap ?? 1,
          checkpointIndex: p.checkpointIndex ?? 0,
          bestLapTime: p.bestLapTime ?? 0,
          currentLapTime: p.currentLapTime ?? 0,
          isFinished: Boolean(p.isFinished),
        });
      });

      return entries.sort((a, b) => {
        // 1. Finished players come first
        if (a.isFinished && !b.isFinished) return -1;
        if (!a.isFinished && b.isFinished) return 1;
        if (a.isFinished && b.isFinished) {
          if (a.bestLapTime > 0 && b.bestLapTime > 0) return a.bestLapTime - b.bestLapTime;
          return 0;
        }
        // 2. Higher lap comes first
        if (a.currentLap !== b.currentLap) {
          return b.currentLap - a.currentLap;
        }
        // 3. Higher checkpoint on same lap comes first
        if (a.checkpointIndex !== b.checkpointIndex) {
          return b.checkpointIndex - a.checkpointIndex;
        }
        // 4. If same checkpoint, compare bestLapTime if available
        if (a.bestLapTime > 0 && b.bestLapTime > 0) {
          return a.bestLapTime - b.bestLapTime;
        }
        return 0;
      });
    },
    [playerId, username, carColor, carModel]
  );

  // Send floating emote reaction via Realtime Broadcast
  const sendQuickEmote = useCallback(
    (emoteText: string) => {
      const now = Date.now();
      setSelfEmote({ text: emoteText, expiresAt: now + 2500 });
      if (channelRef.current && playerId) {
        channelRef.current
          .send({
            type: 'broadcast',
            event: 'player_emote',
            payload: {
              id: playerId,
              emote: emoteText,
              timestamp: now,
            },
          })
          .catch(() => {});
      }
    },
    [playerId]
  );

  // Send in-game text chat message via Realtime Broadcast
  const sendChatMessage = useCallback(
    (rawMessage: string): { success: boolean; reason?: string } => {
      const now = Date.now();
      if (now - lastChatTimeRef.current < 1000) {
        return { success: false, reason: 'cooldown' };
      }

      const clean = rawMessage
        .trim()
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .slice(0, 60);

      if (!clean) {
        return { success: false, reason: 'empty' };
      }

      lastChatTimeRef.current = now;
      const msgId = `msg_${now}_${Math.random().toString(36).substring(2, 7)}`;
      const expiresAt = now + 5000;

      const localMsg: ChatMessage = {
        id: msgId,
        senderId: playerId || 'self',
        username,
        message: clean,
        timestamp: now,
        color: carColor,
        isSelf: true,
      };

      setChatMessages((prev) => [...prev.slice(-25), localMsg]);
      setSelfChatBubble({
        message: clean,
        timestamp: now,
        expiresAt,
      });

      if (channelRef.current && playerId) {
        channelRef.current
          .send({
            type: 'broadcast',
            event: 'player_chat',
            payload: {
              msgId,
              id: playerId,
              username,
              message: clean,
              color: carColor,
              timestamp: now,
            },
          })
          .catch(() => {});
      }

      return { success: true };
    },
    [playerId, username, carColor]
  );

  return {
    playerId,
    username,
    setUsername,
    carModel,
    setCarModel,
    carColor,
    setCarColor,
    roomState,
    activePlayerIds,
    remotePlayersRef,
    broadcastCarState,
    getLeaderboard,
    selfEmote,
    activeEmotes,
    sendQuickEmote,
    chatMessages,
    activeChatBubbles,
    selfChatBubble,
    sendChatMessage,
  };
}
