export type TeamId = 'rwb' | 'gwr';

export interface DraftPlayer {
  id: number;
  name: string;
  handicap: number;
  captain: boolean;
  captainOf: TeamId | null;
  team: TeamId | null;
  pickNumber: number | null;
}

export interface LogEntry {
  pick: number;
  team: TeamId;
  playerName: string;
  handicap: number;
  timestamp: string;
}

export interface DraftState {
  players: DraftPlayer[];
  log: LogEntry[];
  firstTeam: TeamId | null;
  coinFlipDone: boolean;
}

export const TEAMS: Record<TeamId, { name: string; shortName: string; captain: string }> = {
  rwb: {
    name: 'Team Red, White, & Blue',
    shortName: 'RWB',
    captain: 'Ryan Parker',
  },
  gwr: {
    name: 'Team Green, White, & Red',
    shortName: 'GWR',
    captain: 'Cole Dominguez',
  },
};

export const INITIAL_PLAYERS: DraftPlayer[] = [
  { id: 1,  name: 'Cole Dominguez',   handicap: 2,  captain: true,  captainOf: 'gwr', team: null, pickNumber: null },
  { id: 2,  name: 'Ryan Parker',      handicap: 6,  captain: true,  captainOf: 'rwb', team: null, pickNumber: null },
  { id: 3,  name: 'Parker Helmig',    handicap: 9,  captain: false, captainOf: null,  team: null, pickNumber: null },
  { id: 4,  name: 'Layne Pickens',    handicap: 9,  captain: false, captainOf: null,  team: null, pickNumber: null },
  { id: 5,  name: 'Ty Walsh',         handicap: 11, captain: false, captainOf: null,  team: null, pickNumber: null },
  { id: 6,  name: 'Jared Janczak',    handicap: 11, captain: false, captainOf: null,  team: null, pickNumber: null },
  { id: 7,  name: 'Beau Heitmiller',  handicap: 12, captain: false, captainOf: null,  team: null, pickNumber: null },
  { id: 8,  name: 'Tyler Pate',       handicap: 13, captain: false, captainOf: null,  team: null, pickNumber: null },
  { id: 9,  name: 'Durham Smythe',    handicap: 16, captain: false, captainOf: null,  team: null, pickNumber: null },
  { id: 10, name: 'Brady Allison',    handicap: 16, captain: false, captainOf: null,  team: null, pickNumber: null },
  { id: 11, name: 'Luke Boren',       handicap: 17, captain: false, captainOf: null,  team: null, pickNumber: null },
  { id: 12, name: 'Patrick Walls',    handicap: 17, captain: false, captainOf: null,  team: null, pickNumber: null },
  { id: 13, name: 'Austin Maldonado', handicap: 19, captain: false, captainOf: null,  team: null, pickNumber: null },
  { id: 14, name: 'Sage Shorey',      handicap: 19, captain: false, captainOf: null,  team: null, pickNumber: null },
  { id: 15, name: 'Joey Zembo',       handicap: 27, captain: false, captainOf: null,  team: null, pickNumber: null },
  { id: 16, name: 'Tyler Bradford',   handicap: 29, captain: false, captainOf: null,  team: null, pickNumber: null },
];

export const TOTAL_PLAYERS = 16;
export const PICKS_PER_TEAM = 8;
export const STORAGE_KEY = 'rgao-ryder-cup-draft-v1';

export function getInitialDraftState(): DraftState {
  return {
    players: INITIAL_PLAYERS.map(p => ({ ...p })),
    log: [],
    firstTeam: null,
    coinFlipDone: false,
  };
}

/** Returns which team picks at a given draftedCount (0-based picks made so far). Non-snake. */
export function getCurrentPickTeam(draftedCount: number, firstTeam: TeamId): TeamId {
  const pickNumber = draftedCount + 1; // 1-indexed
  const secondTeam: TeamId = firstTeam === 'rwb' ? 'gwr' : 'rwb';
  return pickNumber % 2 === 1 ? firstTeam : secondTeam;
}
