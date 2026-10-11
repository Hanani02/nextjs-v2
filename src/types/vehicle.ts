export type CarModelType = 'sport' | 'truck' | 'buggy';

export interface CarColorOption {
  id: string;
  name: string;
  hex: string;
  glowHex: string;
}

export const CAR_COLORS: CarColorOption[] = [
  { id: 'cyan', name: 'Neon Cyan', hex: '#06b6d4', glowHex: '#22d3ee' },
  { id: 'purple', name: 'Cyber Purple', hex: '#a855f7', glowHex: '#c084fc' },
  { id: 'orange', name: 'Sunset Orange', hex: '#f97316', glowHex: '#fb923c' },
  { id: 'green', name: 'Matrix Green', hex: '#10b981', glowHex: '#34d399' },
  { id: 'crimson', name: 'Laser Crimson', hex: '#f43f5e', glowHex: '#fb7185' },
];

export interface PlayerVehicleState {
  id: string;
  username: string;
  model: CarModelType;
  color: string;
  x: number;
  z: number;
  heading: number;
  speed: number;
  steerAngle: number;
  isDrifting: boolean;
  isBraking: boolean;
  role: 'driver' | 'spectator';
  lastUpdated: number;
  // Racing circuit & lap telemetry
  currentLap?: number;
  checkpointIndex?: number;
  currentLapTime?: number;
  bestLapTime?: number;
  isFinished?: boolean;
}

export interface MultiplayerRoomState {
  status: 'connecting' | 'connected' | 'offline' | 'full';
  playerCount: number;
  maxPlayers: number;
  isSpectator: boolean;
  players: Record<string, PlayerVehicleState>;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  isSelf: boolean;
  color: string;
  model: CarModelType;
  currentLap: number;
  checkpointIndex: number;
  bestLapTime: number;
  currentLapTime: number;
  isFinished: boolean;
}

export interface RaceCheckpoint {
  id: number;
  name: string;
  center: [number, number]; // [x, z]
  width: number;
  depth: number;
}
