export interface Player {
  id: number;
  name: string;
  handicap: number;
  team: string | null;
  captain?: boolean;
  scores?: number[];
}

export const TEAM_RWB = 'Team Red, White, & Blue';
export const TEAM_GWR = 'Team Green, White, & Red';

export const teams = [TEAM_RWB, TEAM_GWR];

export const players: Player[] = [
  { id: 1,  name: 'Ryan Parker',      handicap: 6,  team: TEAM_RWB, captain: true },
  { id: 2,  name: 'Cole Dominguez',   handicap: 2,  team: TEAM_GWR, captain: true },
  { id: 3,  name: 'Parker Helmig',    handicap: 9,  team: null },
  { id: 4,  name: 'Layne Pickens',    handicap: 9,  team: null },
  { id: 5,  name: 'Ty Walsh',         handicap: 11, team: null },
  { id: 6,  name: 'Jared Janczak',    handicap: 11, team: null },
  { id: 7,  name: 'Beau Heitmiller',  handicap: 12, team: null },
  { id: 8,  name: 'Tyler Pate',       handicap: 13, team: null },
  { id: 9,  name: 'Durham Smythe',    handicap: 16, team: null },
  { id: 10, name: 'Brady Allison',    handicap: 16, team: null },
  { id: 11, name: 'Luke Boren',       handicap: 17, team: null },
  { id: 12, name: 'Patrick Walls',    handicap: 17, team: null },
  { id: 13, name: 'Austin Maldonado', handicap: 19, team: null },
  { id: 14, name: 'Sage Shorey',      handicap: 19, team: null },
  { id: 15, name: 'Joey Zembo',       handicap: 27, team: null },
  { id: 16, name: 'Tyler Bradford',   handicap: 29, team: null },
];
