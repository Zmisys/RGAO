export interface TournamentRecord {
  year: number;
  champion: string | null;
  score: string | null;
  total: number | null;
  notes?: string;
}

export const tournamentRecords: TournamentRecord[] = [
  { year: 2023, champion: 'John "Eagle Eye" Adams', score: '-14', total: 274 },
  { year: 2022, champion: 'Charles "Bogey" Jefferson', score: '-10', total: 278 },
  { year: 2021, champion: 'Robert "Birdie" Thompson', score: '-8', total: 280 },
  { year: 2020, champion: null, score: null, total: null, notes: 'Cancelled - COVID-19' },
  { year: 2019, champion: 'William "Par" Harrison', score: '-12', total: 276 },
  { year: 2018, champion: 'George "Chip" Washington', score: '-6', total: 282 },
  { year: 2017, champion: 'Thomas "Links" Madison', score: '-9', total: 279 },
];

export const notableRecords = [
  { record: 'Lowest Single Round', holder: 'John "Eagle Eye" Adams', value: '62 (-10)', year: 2023 },
  { record: 'Lowest Tournament Total', holder: 'John "Eagle Eye" Adams', value: '274 (-14)', year: 2023 },
  { record: 'Most Championships', holder: 'John "Eagle Eye" Adams', value: '2 titles', year: 2023 },
  { record: 'Best Comeback', holder: 'Charles "Bogey" Jefferson', value: '7 shots back (Day 3)', year: 2022 },
];
