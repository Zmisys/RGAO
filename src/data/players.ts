export interface Player {
  id: number;
  name: string;
  nickname: string;
  handicap: number;
  team: string | null;
  scores?: number[];
}

export const players: Player[] = [
  { id: 1, name: 'John Adams', nickname: 'Eagle Eye', handicap: 5, team: null, scores: [68, 71, 69, 66] },
  { id: 2, name: 'Robert Thompson', nickname: 'Birdie', handicap: 8, team: null, scores: [70, 72, 71, 67] },
  { id: 3, name: 'William Harrison', nickname: 'Par', handicap: 12, team: null, scores: [72, 74, 70, 68] },
  { id: 4, name: 'Charles Jefferson', nickname: 'Bogey', handicap: 3, team: null, scores: [69, 70, 72, 67] },
  { id: 5, name: 'George Washington', nickname: 'Chip', handicap: 15, team: null, scores: [73, 75, 72, 70] },
  { id: 6, name: 'Thomas Madison', nickname: 'Links', handicap: 7, team: null, scores: [71, 72, 70, 68] },
  { id: 7, name: 'James Monroe', nickname: 'Iron', handicap: 10, team: null, scores: [72, 73, 71, 69] },
  { id: 8, name: 'Andrew Jackson', nickname: 'Putt', handicap: 6, team: null, scores: [70, 71, 70, 67] },
  { id: 9, name: 'Henry Clay', nickname: 'Drive', handicap: 9, team: null, scores: [71, 73, 72, 70] },
  { id: 10, name: 'Daniel Webster', nickname: 'Wedge', handicap: 11, team: null, scores: [73, 74, 72, 71] },
  { id: 11, name: 'John Quincy', nickname: 'Eagle', handicap: 4, team: null, scores: [69, 70, 68, 65] },
  { id: 12, name: 'Martin Van Buren', nickname: 'Hook', handicap: 13, team: null, scores: [74, 75, 73, 72] },
];

export const teams = ['The Eagles', 'The Birdies', 'The Bogeys', 'The Pars'];
