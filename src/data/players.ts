export type TeamId = 'rp' | 'dom';

export interface TournamentPlayer {
  id: number;
  name: string;
  handicap: number;
  team: TeamId | null;
  isCaptain: boolean;
}

export interface Matchup {
  rpPlayers: string[];
  domPlayers: string[];
  result: string;
  winner: TeamId | 'halved' | null;
}

export interface TournamentRound {
  id: number;
  name: string;
  course: string;
  format: string;
  day: string;
  time: string;
  pointsAvailable: number;
  matchupSize: number;
  matchupCount: number;
  teeBox: string;
  yardage: string;
  matchups: Matchup[];
}

export interface LeaderboardState {
  players: TournamentPlayer[];
  rounds: TournamentRound[];
}

export const TOURNAMENT_PLAYERS: TournamentPlayer[] = [
  { id: 1,  name: 'Cole Dominguez',   handicap: 2,  team: 'dom', isCaptain: true },
  { id: 2,  name: 'Ryan Parker',      handicap: 6,  team: 'rp',  isCaptain: true },
  { id: 3,  name: 'Parker Helmig',    handicap: 9,  team: null,  isCaptain: false },
  { id: 4,  name: 'Layne Pickens',    handicap: 9,  team: null,  isCaptain: false },
  { id: 5,  name: 'Ty Walsh',         handicap: 11, team: null,  isCaptain: false },
  { id: 6,  name: 'Jared Janczak',    handicap: 11, team: null,  isCaptain: false },
  { id: 7,  name: 'Beau Heitmiller',  handicap: 12, team: null,  isCaptain: false },
  { id: 8,  name: 'Tyler Pate',       handicap: 13, team: null,  isCaptain: false },
  { id: 9,  name: 'Durham Smythe',    handicap: 16, team: null,  isCaptain: false },
  { id: 10, name: 'Brady Allison',    handicap: 16, team: null,  isCaptain: false },
  { id: 11, name: 'Luke Boren',       handicap: 17, team: null,  isCaptain: false },
  { id: 12, name: 'Patrick Walls',    handicap: 17, team: null,  isCaptain: false },
  { id: 13, name: 'Austin Maldonado', handicap: 19, team: null,  isCaptain: false },
  { id: 14, name: 'Sage Shorey',      handicap: 19, team: null,  isCaptain: false },
  { id: 15, name: 'Joey Zembo',       handicap: 27, team: null,  isCaptain: false },
  { id: 16, name: 'Tyler Bradford',   handicap: 29, team: null,  isCaptain: false },
];

function createEmptyMatchups(count: number, size: number): Matchup[] {
  return Array.from({ length: count }, () => ({
    rpPlayers: Array.from({ length: size }, () => ''),
    domPlayers: Array.from({ length: size }, () => ''),
    result: '',
    winner: null,
  }));
}

export const TOURNAMENT_ROUNDS: TournamentRound[] = [
  {
    id: 1,
    name: 'Round 1',
    course: 'El Cardonal',
    format: '2v2 Cart Score (net)',
    day: 'Thursday',
    time: '1:00 PM',
    pointsAvailable: 4,
    matchupSize: 2,
    matchupCount: 4,
    teeBox: 'III',
    yardage: '6,291',
    matchups: createEmptyMatchups(4, 2),
  },
  {
    id: 2,
    name: 'Round 2',
    course: 'The Oasis Short Course',
    format: '2v2 Scramble',
    day: 'Friday',
    time: '9:00 AM',
    pointsAvailable: 4,
    matchupSize: 2,
    matchupCount: 4,
    teeBox: '',
    yardage: '',
    matchups: createEmptyMatchups(4, 2),
  },
  {
    id: 3,
    name: 'Round 3',
    course: 'The Dunes Course',
    format: '2v2 Best Ball (net)',
    day: 'Friday',
    time: '1:00 PM',
    pointsAvailable: 4,
    matchupSize: 2,
    matchupCount: 4,
    teeBox: 'III',
    yardage: '6,427',
    matchups: createEmptyMatchups(4, 2),
  },
  {
    id: 4,
    name: 'Round 4 — SINGLES',
    course: 'Solmar Golf Links',
    format: '1v1 Match Play (net)',
    day: 'Saturday',
    time: '8:10 AM',
    pointsAvailable: 8,
    matchupSize: 1,
    matchupCount: 8,
    teeBox: 'Blue',
    yardage: '6,311',
    matchups: createEmptyMatchups(8, 1),
  },
];

export function createInitialState(): LeaderboardState {
  return {
    players: TOURNAMENT_PLAYERS.map(p => ({ ...p })),
    rounds: TOURNAMENT_ROUNDS.map(r => ({
      ...r,
      matchups: r.matchups.map(m => ({
        rpPlayers: [...m.rpPlayers],
        domPlayers: [...m.domPlayers],
        result: m.result,
        winner: m.winner,
      })),
    })),
  };
}

export function getRoundPoints(round: TournamentRound): { rp: number; dom: number } {
  let rp = 0;
  let dom = 0;
  for (const m of round.matchups) {
    if (m.winner === 'rp') rp += 1;
    else if (m.winner === 'dom') dom += 1;
    else if (m.winner === 'halved') { rp += 0.5; dom += 0.5; }
  }
  return { rp, dom };
}

export function getTotalPoints(rounds: TournamentRound[]): { rp: number; dom: number } {
  return rounds.reduce(
    (acc, r) => {
      const pts = getRoundPoints(r);
      return { rp: acc.rp + pts.rp, dom: acc.dom + pts.dom };
    },
    { rp: 0, dom: 0 },
  );
}

export function getPlayerRecord(
  name: string,
  rounds: TournamentRound[],
): { w: number; l: number; h: number; pts: number } {
  let w = 0;
  let l = 0;
  let h = 0;
  for (const round of rounds) {
    for (const m of round.matchups) {
      const onRp = m.rpPlayers.includes(name);
      const onDom = m.domPlayers.includes(name);
      if (!onRp && !onDom) continue;
      if (!m.winner) continue;
      if (m.winner === 'halved') h++;
      else if ((onRp && m.winner === 'rp') || (onDom && m.winner === 'dom')) w++;
      else l++;
    }
  }
  return { w, l, h, pts: w + h * 0.5 };
}

export function formatPoints(pts: number): string {
  if (pts % 1 === 0) return pts.toString();
  return `${Math.floor(pts)}½`;
}
