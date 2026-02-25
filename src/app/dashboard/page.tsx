'use client';

import { useState, useEffect } from 'react';
import { TEAMS, TeamId } from '@/data/ryder-cup';

const STORAGE_KEY = 'rgao-2026-leaderboard-v1';
const TOTAL_PTS = 20;
const WIN_TARGET = 10.5;

interface RoundDef {
  id: number;
  course: string;
  teeBox?: string;
  yardage?: string;
  par?: number;
  format: string;
  scoring: string;
  day: string;
  time: string;
  ptsAvailable: number;
  rules: string[];
}

const ROUNDS: RoundDef[] = [
  {
    id: 1,
    course: 'El Cardonal at Diamante',
    teeBox: 'Tee Box III',
    yardage: '6,291 yds',
    par: 72,
    format: '2v2 Cart Score',
    scoring: 'Net',
    day: 'Thursday',
    time: '1:00 PM',
    ptsAvailable: 4,
    rules: [
      'Cart partners play their own ball throughout the round.',
      'Each hole: the combined net score of both cart partners determines the winner.',
      '2 matches · each match worth 2 pts · halved match = 1 pt each team.',
    ],
  },
  {
    id: 2,
    course: 'The Oasis Short Course',
    format: '2v2 Scramble',
    scoring: 'Gross',
    day: 'Friday',
    time: '9:00 AM',
    ptsAvailable: 4,
    rules: [
      'Both players tee off; the team selects the best shot.',
      'Both players play from the chosen spot — repeat until holed.',
      '2 matches · each match worth 2 pts · halved match = 1 pt each team.',
    ],
  },
  {
    id: 3,
    course: 'The Dunes Course at Diamante',
    teeBox: 'Tee Box III',
    yardage: '6,427 yds',
    par: 72,
    format: '2v2 Best Ball',
    scoring: 'Net',
    day: 'Friday',
    time: '1:00 PM',
    ptsAvailable: 4,
    rules: [
      'Each player plays their own ball for the entire round.',
      'The best net score from the pair counts on each hole.',
      '2 matches · each match worth 2 pts · halved match = 1 pt each team.',
    ],
  },
  {
    id: 4,
    course: 'Solmar Golf Links',
    teeBox: 'Blue Tees',
    yardage: '6,311 yds',
    par: 72,
    format: '1v1 Match Play',
    scoring: 'Net',
    day: 'Saturday',
    time: '8:10 AM',
    ptsAvailable: 8,
    rules: [
      '8 individual singles matches using net strokes.',
      'Win a hole = 1 up; player who wins the most holes wins the match.',
      '1 pt per match · halved match = 0.5 pts each team.',
    ],
  },
];

interface RoundScore {
  rwb: string;
  gwr: string;
}

const DEFAULT_SCORES: RoundScore[] = ROUNDS.map(() => ({ rwb: '', gwr: '' }));

function toNum(v: string): number {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function fmtPts(v: string): string {
  if (v === '') return '—';
  const n = toNum(v);
  return n % 1 === 0 ? n.toString() : n.toFixed(1);
}

function fmtTotal(n: number): string {
  return n % 1 === 0 ? n.toString() : n.toFixed(1);
}

export default function LeaderboardPage() {
  const [scores, setScores] = useState<RoundScore[]>(DEFAULT_SCORES);
  const [editMode, setEditMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setScores(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const save = (next: RoundScore[]) => {
    setScores(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const updateScore = (roundIdx: number, team: 'rwb' | 'gwr', value: string) => {
    save(scores.map((s, i) => (i === roundIdx ? { ...s, [team]: value } : s)));
  };

  const rwbTotal = scores.reduce((sum, s) => sum + toNum(s.rwb), 0);
  const gwrTotal = scores.reduce((sum, s) => sum + toNum(s.gwr), 0);
  const anyScores = rwbTotal > 0 || gwrTotal > 0;
  const rwbWon = rwbTotal >= WIN_TARGET;
  const gwrWon = gwrTotal >= WIN_TARGET;
  const leader: TeamId | null = rwbTotal > gwrTotal ? 'rwb' : gwrTotal > rwbTotal ? 'gwr' : null;

  if (!hydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-[#1a4731]/40 text-sm">
        Loading leaderboard...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ── Page Header ── */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[#c9a84c] font-semibold uppercase tracking-widest text-xs mb-1">
            RGAO · 2026 · Cabo
          </div>
          <h1 className="text-3xl font-bold text-[#1a4731] leading-tight">Tournament Leaderboard</h1>
          <p className="text-[#1a4731]/45 text-sm mt-0.5">
            First to {WIN_TARGET} pts wins the championship · {TOTAL_PTS} pts available
          </p>
        </div>
        <button
          onClick={() => setEditMode(e => !e)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            editMode
              ? 'bg-[#c9a84c] text-[#1a4731] hover:bg-[#b8983c]'
              : 'border border-[#1a4731]/20 text-[#1a4731]/60 hover:text-[#1a4731] hover:border-[#1a4731]/40'
          }`}
        >
          {editMode ? '✓ Done Editing' : '✏ Edit Scores'}
        </button>
      </div>

      {/* ── Live Score Banner ── */}
      <div className="mb-6 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-[#1a4731] px-6 py-6">
          <div className="flex items-center justify-between gap-4">

            {/* Team RWB */}
            <div className="flex-1 text-center sm:text-left">
              <div className="text-white/45 text-xs uppercase tracking-widest mb-1">Team RP</div>
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <span className="text-3xl">🇺🇸</span>
                <span className={`text-5xl font-bold tabular-nums leading-none ${
                  rwbWon || (anyScores && leader === 'rwb') ? 'text-[#c9a84c]' : 'text-white'
                }`}>
                  {fmtTotal(rwbTotal)}
                </span>
              </div>
              <div className="text-white/35 text-xs mt-1.5">Capt. {TEAMS.rwb.captain}</div>
            </div>

            {/* Center */}
            <div className="text-center shrink-0">
              {rwbWon || gwrWon ? (
                <div>
                  <div className="text-[#c9a84c] font-bold text-2xl">🏆</div>
                  <div className="text-[#c9a84c] font-bold text-sm">
                    {rwbWon ? 'Team RP Wins' : 'Team Dom Wins'}
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-white/25 text-2xl font-light">vs</div>
                  <div className="text-white/20 text-xs mt-1">first to {WIN_TARGET}</div>
                </>
              )}
            </div>

            {/* Team GWR */}
            <div className="flex-1 text-center sm:text-right">
              <div className="text-white/45 text-xs uppercase tracking-widest mb-1">Team Dom</div>
              <div className="flex items-center gap-3 justify-center sm:justify-end">
                <span className={`text-5xl font-bold tabular-nums leading-none ${
                  gwrWon || (anyScores && leader === 'gwr') ? 'text-[#c9a84c]' : 'text-white'
                }`}>
                  {fmtTotal(gwrTotal)}
                </span>
                <span className="text-3xl">🇲🇽</span>
              </div>
              <div className="text-white/35 text-xs mt-1.5">Capt. {TEAMS.gwr.captain}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 h-2.5 rounded-full overflow-hidden bg-white/10 flex">
            <div
              className="bg-blue-500 transition-all duration-500 rounded-l-full"
              style={{ width: `${Math.min((rwbTotal / TOTAL_PTS) * 100, 100)}%` }}
            />
            <div className="flex-1" />
            <div
              className="bg-green-500 transition-all duration-500 rounded-r-full"
              style={{ width: `${Math.min((gwrTotal / TOTAL_PTS) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-white/25 text-xs mt-1">
            <span>{fmtTotal(rwbTotal)} pts</span>
            <span className="text-white/15">— {TOTAL_PTS} total —</span>
            <span>{fmtTotal(gwrTotal)} pts</span>
          </div>
        </div>
      </div>

      {/* ── Official Scorecard ── */}
      <div className="mb-8 bg-white rounded-2xl shadow-sm border border-[#c9a84c]/20 overflow-hidden">
        <div className="bg-[#1a4731] px-5 py-3 flex items-center justify-between">
          <h2 className="text-[#c9a84c] font-bold text-sm uppercase tracking-wider">Official Scorecard</h2>
          <span className="text-white/35 text-xs">{TOTAL_PTS} pts available</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f0e8] border-b border-[#c9a84c]/20">
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#1a4731]/55 uppercase tracking-wider min-w-40">
                  Team
                </th>
                {ROUNDS.map(r => (
                  <th key={r.id} className="px-4 py-3 text-center text-xs font-semibold text-[#1a4731]/55 uppercase tracking-wider">
                    R{r.id}
                    <div className="text-[#1a4731]/30 font-normal normal-case tracking-normal">{r.ptsAvailable} pts</div>
                  </th>
                ))}
                <th className="px-5 py-3 text-center text-xs font-semibold text-[#1a4731]/55 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {(['rwb', 'gwr'] as TeamId[]).map(teamId => {
                const teamTotal = teamId === 'rwb' ? rwbTotal : gwrTotal;
                const hasWon = teamId === 'rwb' ? rwbWon : gwrWon;
                const isLeading = anyScores && leader === teamId;
                return (
                  <tr
                    key={teamId}
                    className={`border-b border-[#f5f0e8] transition-colors ${isLeading ? 'bg-[#c9a84c]/10' : ''}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{teamId === 'rwb' ? '🇺🇸' : '🇲🇽'}</span>
                        <div>
                          <div className="font-bold text-[#1a4731] text-sm leading-tight">
                            Team {teamId === 'rwb' ? 'RP' : 'Dom'}
                          </div>
                          <div className="text-[#1a4731]/40 text-xs">
                            {TEAMS[teamId].captain}
                          </div>
                        </div>
                      </div>
                    </td>
                    {scores.map((roundScore, idx) => {
                      const val = teamId === 'rwb' ? roundScore.rwb : roundScore.gwr;
                      return (
                        <td key={idx} className="px-4 py-4 text-center">
                          {editMode ? (
                            <input
                              type="number"
                              min="0"
                              max={ROUNDS[idx].ptsAvailable}
                              step="0.5"
                              value={val}
                              onChange={e => updateScore(idx, teamId, e.target.value)}
                              className="w-16 text-center border border-[#c9a84c]/40 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#1a4731] bg-[#f5f0e8] focus:outline-none focus:border-[#c9a84c]"
                              placeholder="0"
                            />
                          ) : (
                            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${
                              val === '' ? 'text-[#1a4731]/20' : 'bg-[#1a4731] text-white'
                            }`}>
                              {fmtPts(val)}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-5 py-4 text-center">
                      <span className={`text-xl font-bold tabular-nums ${
                        hasWon ? 'text-[#c9a84c]' : isLeading ? 'text-[#1a4731]' : 'text-[#1a4731]/45'
                      }`}>
                        {fmtTotal(teamTotal)}
                        {hasWon && ' 🏆'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Round Details ── */}
      <h2 className="text-xl font-bold text-[#1a4731] mb-4">Round Details &amp; Rules</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {ROUNDS.map(round => (
          <div key={round.id} className="bg-white rounded-2xl border border-[#c9a84c]/20 shadow-sm overflow-hidden">
            <div className="bg-[#1a4731] px-5 py-3 flex items-center justify-between">
              <div className="text-[#c9a84c] font-bold text-sm uppercase tracking-wider">
                Round {round.id}
              </div>
              <span className="bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {round.ptsAvailable} pts
              </span>
            </div>
            <div className="px-5 py-4">
              <div className="font-bold text-[#1a4731] text-base leading-tight mb-2">
                {round.course}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="bg-[#f5f0e8] text-[#1a4731]/65 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {round.format}
                </span>
                <span className="bg-[#f5f0e8] text-[#1a4731]/65 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {round.scoring} Scoring
                </span>
                {round.teeBox && (
                  <span className="bg-[#f5f0e8] text-[#1a4731]/65 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {round.teeBox}
                  </span>
                )}
                {round.yardage && (
                  <span className="bg-[#f5f0e8] text-[#1a4731]/65 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {round.yardage}
                  </span>
                )}
                {round.par && (
                  <span className="bg-[#f5f0e8] text-[#1a4731]/65 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Par {round.par}
                  </span>
                )}
              </div>
              <div className="text-[#c9a84c] font-semibold text-sm mb-3">
                📅 {round.day} · {round.time}
              </div>
              <ul className="space-y-1.5">
                {round.rules.map((rule, i) => (
                  <li key={i} className="text-[#1a4731]/60 text-xs flex gap-2">
                    <span className="text-[#c9a84c] shrink-0 mt-0.5">›</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
