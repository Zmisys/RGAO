'use client';

import { useState, useEffect } from 'react';
import {
  TeamId,
  TournamentRound,
  LeaderboardState,
  createInitialState,
  getRoundPoints,
  getTotalPoints,
  getPlayerRecord,
  formatPoints,
} from '@/data/players';

const STORAGE_KEY = 'rgao-leaderboard-v2';
const DRAFT_KEY = 'rgao-ryder-cup-draft-v1';

function deepClone(s: LeaderboardState): LeaderboardState {
  return JSON.parse(JSON.stringify(s));
}

export default function DashboardPage() {
  const [hydrated, setHydrated] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [state, setState] = useState<LeaderboardState>(() => createInitialState());
  const [editState, setEditState] = useState<LeaderboardState>(() => createInitialState());

  useEffect(() => {
    let loaded: LeaderboardState | null = null;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) loaded = JSON.parse(saved) as LeaderboardState;
    } catch { /* ignore */ }

    if (!loaded) {
      loaded = createInitialState();
      try {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) {
          const draftState = JSON.parse(draft);
          if (draftState.players) {
            for (const dp of draftState.players) {
              const player = loaded.players.find(p => p.name === dp.name);
              if (player && dp.team) {
                player.team = dp.team === 'rwb' ? 'rp' : dp.team === 'gwr' ? 'dom' : null;
              }
            }
          }
        }
      } catch { /* ignore */ }
    }

    setState(loaded);
    setEditState(deepClone(loaded));
    setHydrated(true);
  }, []);

  /* ── handlers ── */
  const handleEnterEdit = () => {
    setEditState(deepClone(state));
    setEditMode(true);
  };
  const handleSave = () => {
    setState(editState);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(editState)); } catch { /* ignore */ }
    setEditMode(false);
  };
  const handleCancel = () => {
    setEditState(deepClone(state));
    setEditMode(false);
  };
  const handleSyncDraft = () => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (!draft) return;
      const draftState = JSON.parse(draft);
      if (!draftState.players) return;
      setEditState(prev => {
        const next = deepClone(prev);
        for (const dp of draftState.players) {
          const player = next.players.find(p => p.name === dp.name);
          if (player && dp.team) {
            player.team = dp.team === 'rwb' ? 'rp' : dp.team === 'gwr' ? 'dom' : null;
          }
        }
        return next;
      });
    } catch { /* ignore */ }
  };

  const updateMatchupPlayer = (
    ri: number, mi: number, side: TeamId, si: number, name: string,
  ) => {
    setEditState(prev => {
      const next = deepClone(prev);
      const arr = side === 'rp'
        ? next.rounds[ri].matchups[mi].rpPlayers
        : next.rounds[ri].matchups[mi].domPlayers;
      arr[si] = name;
      return next;
    });
  };

  const updateMatchupWinner = (
    ri: number, mi: number, winner: TeamId | 'halved' | null,
  ) => {
    setEditState(prev => {
      const next = deepClone(prev);
      next.rounds[ri].matchups[mi].winner = winner;
      return next;
    });
  };

  const updateMatchupResult = (ri: number, mi: number, result: string) => {
    setEditState(prev => {
      const next = deepClone(prev);
      next.rounds[ri].matchups[mi].result = result;
      return next;
    });
  };

  /* ── derived ── */
  const current = editMode ? editState : state;
  const { players, rounds } = current;
  const totalPts = getTotalPoints(rounds);

  const sortTeam = (tid: TeamId) =>
    players
      .filter(p => p.team === tid)
      .sort((a, b) => (a.isCaptain ? -1 : b.isCaptain ? 1 : a.handicap - b.handicap));

  const rpPlayers = sortTeam('rp');
  const domPlayers = sortTeam('dom');

  const getAvailable = (ri: number, mi: number, side: TeamId, si: number): string[] => {
    const round = current.rounds[ri];
    const teamNames = current.players.filter(p => p.team === side).map(p => p.name);
    const used = new Set<string>();
    round.matchups.forEach((m, mIdx) => {
      const names = side === 'rp' ? m.rpPlayers : m.domPlayers;
      names.forEach((n, sIdx) => {
        if (n && !(mIdx === mi && sIdx === si)) used.add(n);
      });
    });
    return teamNames.filter(n => !used.has(n));
  };

  const winner = totalPts.rp >= 10.5 ? 'rp' : totalPts.dom >= 10.5 ? 'dom' : null;

  if (!hydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-[#1a4731]/40 text-sm">
        Loading leaderboard&hellip;
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* ═══════════════ HEADER ═══════════════ */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[#c9a84c] font-semibold uppercase tracking-widest text-sm mb-2">
            2026 RGAO &mdash; Cabo San Lucas
          </div>
          <h1 className="text-4xl font-bold text-[#1a4731] mb-1">Team Leaderboard</h1>
          <p className="text-[#1a4731]/60">16 Players &middot; 4 Rounds &middot; 20 Points &middot; First to 10.5 Wins</p>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <button onClick={handleCancel} className="px-4 py-2 text-sm font-semibold rounded-lg border border-[#1a4731]/20 text-[#1a4731]/60 hover:border-[#1a4731]/40 hover:text-[#1a4731] transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#1a4731] text-[#c9a84c] hover:bg-[#1a4731]/90 transition-colors">
                Save Changes
              </button>
            </>
          ) : (
            <button onClick={handleEnterEdit} className="px-4 py-2 text-sm font-semibold rounded-lg border border-[#c9a84c]/40 text-[#1a4731] hover:bg-[#c9a84c]/10 transition-colors">
              Edit Leaderboard
            </button>
          )}
        </div>
      </div>

      {editMode && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex flex-wrap items-center justify-between gap-2">
          <span><strong>Edit Mode on.</strong> Update matchups and results below, then click <strong>Save Changes</strong>.</span>
          <button onClick={handleSyncDraft} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1a4731] text-[#c9a84c] hover:bg-[#1a4731]/90 transition-colors">
            Sync Teams from Draft
          </button>
        </div>
      )}

      {/* ═══════════════ SCORE BANNER ═══════════════ */}
      <div className="bg-[#1a4731] rounded-2xl p-6 md:p-8 mb-8 shadow-lg">
        {winner && (
          <div className="text-center mb-4">
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
              winner === 'rp' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}>
              {winner === 'rp' ? 'TEAM RP' : 'TEAM DOM'} WINS THE CHAMPIONSHIP
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <div className="text-red-400 font-bold text-xs uppercase tracking-widest mb-1">Team RP</div>
            <div className="text-white text-5xl md:text-6xl font-black">{formatPoints(totalPts.rp)}</div>
            <div className="text-white/40 text-xs mt-1">Ryan Parker</div>
          </div>
          <div className="text-center px-4">
            <div className="text-[#c9a84c] text-xl font-black">VS</div>
            {!winner && (
              <div className="text-white/30 text-[10px] mt-1 leading-tight">FIRST TO<br />10.5 WINS</div>
            )}
          </div>
          <div className="text-center flex-1">
            <div className="text-green-400 font-bold text-xs uppercase tracking-widest mb-1">Team Dom</div>
            <div className="text-white text-5xl md:text-6xl font-black">{formatPoints(totalPts.dom)}</div>
            <div className="text-white/40 text-xs mt-1">Cole Dominguez</div>
          </div>
        </div>

        {/* progress bar */}
        <div className="relative h-5 bg-white/10 rounded-full overflow-hidden">
          {totalPts.rp > 0 && (
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500"
              style={{ width: `${(totalPts.rp / 20) * 100}%` }}
            />
          )}
          {totalPts.dom > 0 && (
            <div
              className="absolute right-0 top-0 h-full bg-gradient-to-l from-green-600 to-green-500 transition-all duration-500"
              style={{ width: `${(totalPts.dom / 20) * 100}%` }}
            />
          )}
          <div className="absolute top-0 h-full w-0.5 bg-[#c9a84c]" style={{ left: '52.5%' }} />
        </div>
        <div className="flex justify-between text-[10px] text-white/30 mt-1.5 px-1">
          <span>0</span>
          <span className="text-[#c9a84c]/60">10.5</span>
          <span>20</span>
        </div>
      </div>

      {/* ═══════════════ TOURNAMENT SCORECARD ═══════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#c9a84c]/20 overflow-hidden mb-8">
        <div className="bg-[#1a4731] px-6 py-3">
          <h2 className="text-[#c9a84c] font-bold text-lg">Tournament Scorecard</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f0e8] border-b border-[#c9a84c]/20">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">Round</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">Course</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">Format</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">Pts Avail</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-red-500/80 uppercase tracking-wider">Team RP</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-green-600/80 uppercase tracking-wider">Team Dom</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map(round => {
                const pts = getRoundPoints(round);
                return (
                  <tr key={round.id} className="border-b border-[#f5f0e8] hover:bg-[#f5f0e8]/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-[#1a4731]">{round.name}</td>
                    <td className="px-4 py-3 text-sm text-[#1a4731]/70">{round.course}</td>
                    <td className="px-4 py-3 text-sm text-[#1a4731]/70">{round.format}</td>
                    <td className="px-4 py-3 text-center text-sm text-[#1a4731]/50">{round.pointsAvailable}</td>
                    <td className="px-4 py-3 text-center font-bold text-red-600">{formatPoints(pts.rp)}</td>
                    <td className="px-4 py-3 text-center font-bold text-green-600">{formatPoints(pts.dom)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#1a4731]">
                <td colSpan={3} className="px-4 py-3 text-sm font-bold text-[#c9a84c]">TOURNAMENT TOTAL</td>
                <td className="px-4 py-3 text-center text-sm font-bold text-[#c9a84c]/60">20</td>
                <td className="px-4 py-3 text-center text-xl font-black text-red-400">{formatPoints(totalPts.rp)}</td>
                <td className="px-4 py-3 text-center text-xl font-black text-green-400">{formatPoints(totalPts.dom)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ═══════════════ TEAM ROSTERS ═══════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Team RP */}
        <div className="rounded-2xl border-2 border-red-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4 flex items-center justify-between">
            <h3 className="font-bold text-xl text-white">TEAM RP</h3>
            <span className="text-white/80 text-sm font-medium">{rpPlayers.length} players</span>
          </div>
          <div className="bg-red-50/50 p-3 space-y-2">
            {rpPlayers.length === 0 ? (
              <div className="text-center py-6 text-red-400 text-sm">No players assigned yet</div>
            ) : rpPlayers.map(player => {
              const record = getPlayerRecord(player.name, rounds);
              const played = record.w + record.l + record.h;
              return (
                <div
                  key={player.id}
                  className={`px-4 py-3 rounded-xl flex items-center justify-between ${
                    player.isCaptain
                      ? 'bg-red-600 text-white'
                      : 'bg-white border border-red-100'
                  }`}
                >
                  <div>
                    <div className={`font-semibold ${player.isCaptain ? '' : 'text-[#1a4731]'}`}>
                      {player.isCaptain && <span className="text-xs font-bold mr-1.5 opacity-80">CPT</span>}
                      {player.name}
                    </div>
                    {played > 0 && !player.isCaptain && (
                      <div className="text-xs text-[#1a4731]/40 mt-0.5">
                        Record: {record.w}-{record.l}-{record.h} &middot; {formatPoints(record.pts)} pts
                      </div>
                    )}
                    {played > 0 && player.isCaptain && (
                      <div className="text-xs text-white/60 mt-0.5">
                        Record: {record.w}-{record.l}-{record.h} &middot; {formatPoints(record.pts)} pts
                      </div>
                    )}
                  </div>
                  <div className={`text-sm font-medium ${player.isCaptain ? 'text-white/70' : 'text-[#1a4731]/50'}`}>
                    HCP {player.handicap}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Dom */}
        <div className="rounded-2xl border-2 border-green-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 flex items-center justify-between">
            <h3 className="font-bold text-xl text-white">TEAM DOM</h3>
            <span className="text-white/80 text-sm font-medium">{domPlayers.length} players</span>
          </div>
          <div className="bg-green-50/50 p-3 space-y-2">
            {domPlayers.length === 0 ? (
              <div className="text-center py-6 text-green-400 text-sm">No players assigned yet</div>
            ) : domPlayers.map(player => {
              const record = getPlayerRecord(player.name, rounds);
              const played = record.w + record.l + record.h;
              return (
                <div
                  key={player.id}
                  className={`px-4 py-3 rounded-xl flex items-center justify-between ${
                    player.isCaptain
                      ? 'bg-green-600 text-white'
                      : 'bg-white border border-green-100'
                  }`}
                >
                  <div>
                    <div className={`font-semibold ${player.isCaptain ? '' : 'text-[#1a4731]'}`}>
                      {player.isCaptain && <span className="text-xs font-bold mr-1.5 opacity-80">CPT</span>}
                      {player.name}
                    </div>
                    {played > 0 && !player.isCaptain && (
                      <div className="text-xs text-[#1a4731]/40 mt-0.5">
                        Record: {record.w}-{record.l}-{record.h} &middot; {formatPoints(record.pts)} pts
                      </div>
                    )}
                    {played > 0 && player.isCaptain && (
                      <div className="text-xs text-white/60 mt-0.5">
                        Record: {record.w}-{record.l}-{record.h} &middot; {formatPoints(record.pts)} pts
                      </div>
                    )}
                  </div>
                  <div className={`text-sm font-medium ${player.isCaptain ? 'text-white/70' : 'text-[#1a4731]/50'}`}>
                    HCP {player.handicap}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════ ROUND CARDS ═══════════════ */}
      {rounds.map((round, ri) => {
        const pts = getRoundPoints(round);
        return (
          <div key={round.id} className="bg-white rounded-2xl shadow-sm border border-[#c9a84c]/20 overflow-hidden mb-6">
            {/* round header */}
            <div className="bg-[#1a4731] px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-[#c9a84c] font-bold text-lg">{round.name}: {round.course}</h3>
                  <div className="text-white/50 text-sm mt-0.5">
                    {round.format} &middot; {round.day} {round.time}
                    {round.teeBox && <> &middot; Tee&nbsp;Box&nbsp;{round.teeBox}</>}
                    {round.yardage && <> &middot; {round.yardage}&nbsp;yards</>}
                  </div>
                </div>
                <div className="text-[#c9a84c]/60 text-sm font-medium">{round.pointsAvailable} points available</div>
              </div>
            </div>

            {/* matchup table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f5f0e8] border-b border-[#c9a84c]/20">
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-[#1a4731]/40 uppercase w-10">#</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-red-500/80 uppercase tracking-wider">Team RP</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider w-36">Result</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-green-600/80 uppercase tracking-wider">Team Dom</th>
                  </tr>
                </thead>
                <tbody>
                  {round.matchups.map((matchup, mi) => (
                    <tr key={mi} className="border-b border-[#f5f0e8] hover:bg-[#f5f0e8]/30 transition-colors">
                      <td className="px-4 py-3 text-center text-xs text-[#1a4731]/30 font-medium">{mi + 1}</td>

                      {/* RP side */}
                      <td className="px-4 py-3 text-left">
                        {editMode ? (
                          <div className="flex flex-wrap gap-1.5">
                            {matchup.rpPlayers.map((_, si) => {
                              const val = editState.rounds[ri].matchups[mi].rpPlayers[si];
                              const avail = getAvailable(ri, mi, 'rp', si);
                              const opts = val && !avail.includes(val) ? [val, ...avail] : avail;
                              return (
                                <select
                                  key={si}
                                  value={val}
                                  onChange={e => updateMatchupPlayer(ri, mi, 'rp', si, e.target.value)}
                                  className="text-sm border border-red-200 rounded-lg px-2 py-1.5 bg-red-50 text-[#1a4731] focus:outline-none focus:ring-1 focus:ring-red-400 min-w-[140px]"
                                >
                                  <option value="">Select player</option>
                                  {opts.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="font-medium text-[#1a4731]">
                            {matchup.rpPlayers.filter(Boolean).join(' & ') || <span className="text-[#1a4731]/20">TBD</span>}
                          </div>
                        )}
                      </td>

                      {/* Result */}
                      <td className="px-4 py-3 text-center">
                        {editMode ? (
                          <div className="flex flex-col items-center gap-1">
                            <select
                              value={editState.rounds[ri].matchups[mi].winner ?? ''}
                              onChange={e => {
                                const v = e.target.value;
                                updateMatchupWinner(ri, mi, v === 'rp' || v === 'dom' || v === 'halved' ? v as TeamId | 'halved' : null);
                              }}
                              className="text-xs border border-[#c9a84c]/30 rounded-lg px-2 py-1.5 bg-white text-[#1a4731] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] w-full max-w-[130px]"
                            >
                              <option value="">Not played</option>
                              <option value="rp">Team RP Win</option>
                              <option value="halved">Halved</option>
                              <option value="dom">Team Dom Win</option>
                            </select>
                            <input
                              value={editState.rounds[ri].matchups[mi].result}
                              onChange={e => updateMatchupResult(ri, mi, e.target.value)}
                              placeholder="e.g. 2&1"
                              className="text-xs border border-[#c9a84c]/20 rounded-lg px-2 py-1 bg-white text-[#1a4731] text-center focus:outline-none focus:ring-1 focus:ring-[#c9a84c] w-full max-w-[130px]"
                            />
                          </div>
                        ) : (
                          <ResultBadge matchup={matchup} />
                        )}
                      </td>

                      {/* Dom side */}
                      <td className="px-4 py-3 text-right">
                        {editMode ? (
                          <div className="flex flex-wrap gap-1.5 justify-end">
                            {matchup.domPlayers.map((_, si) => {
                              const val = editState.rounds[ri].matchups[mi].domPlayers[si];
                              const avail = getAvailable(ri, mi, 'dom', si);
                              const opts = val && !avail.includes(val) ? [val, ...avail] : avail;
                              return (
                                <select
                                  key={si}
                                  value={val}
                                  onChange={e => updateMatchupPlayer(ri, mi, 'dom', si, e.target.value)}
                                  className="text-sm border border-green-200 rounded-lg px-2 py-1.5 bg-green-50 text-[#1a4731] focus:outline-none focus:ring-1 focus:ring-green-400 min-w-[140px]"
                                >
                                  <option value="">Select player</option>
                                  {opts.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="font-medium text-[#1a4731]">
                            {matchup.domPlayers.filter(Boolean).join(' & ') || <span className="text-[#1a4731]/20">TBD</span>}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* round points footer */}
            <div className="flex items-center border-t border-[#c9a84c]/20">
              <div className="flex-1 px-6 py-3 text-center">
                <span className="text-xs text-[#1a4731]/40 uppercase tracking-wider mr-2">Team RP</span>
                <span className="font-bold text-lg text-red-600">{formatPoints(pts.rp)}</span>
              </div>
              <div className="h-8 w-px bg-[#c9a84c]/20" />
              <div className="flex-1 px-6 py-3 text-center">
                <span className="text-xs text-[#1a4731]/40 uppercase tracking-wider mr-2">Team Dom</span>
                <span className="font-bold text-lg text-green-600">{formatPoints(pts.dom)}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* ═══════════════ INDIVIDUAL LEADERBOARD ═══════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#c9a84c]/20 overflow-hidden mb-8">
        <div className="bg-[#1a4731] px-6 py-4">
          <h2 className="text-[#c9a84c] font-bold text-lg">Individual Leaderboard</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f0e8] border-b border-[#c9a84c]/20">
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider w-10">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">Player</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">Team</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">HCP</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">W</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">L</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">H</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">Pts</th>
              </tr>
            </thead>
            <tbody>
              {players
                .filter(p => p.team)
                .map(p => ({ ...p, record: getPlayerRecord(p.name, rounds) }))
                .sort((a, b) => b.record.pts - a.record.pts || a.record.l - b.record.l || a.handicap - b.handicap)
                .map((player, idx) => (
                  <tr key={player.id} className="border-b border-[#f5f0e8] hover:bg-[#f5f0e8]/50 transition-colors">
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                        idx === 0 ? 'bg-[#c9a84c] text-[#1a4731]' :
                        idx === 1 ? 'bg-gray-300 text-gray-700' :
                        idx === 2 ? 'bg-amber-700 text-white' :
                        'text-[#1a4731]/40'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-[#1a4731]">{player.name}</span>
                      {player.isCaptain && <span className="ml-1.5 text-[10px] font-bold text-[#c9a84c] bg-[#c9a84c]/10 px-1.5 py-0.5 rounded">CPT</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        player.team === 'rp' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {player.team === 'rp' ? 'RP' : 'DOM'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-[#1a4731]/60">{player.handicap}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-green-600">{player.record.w}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-red-500">{player.record.l}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-[#c9a84c]">{player.record.h}</td>
                    <td className="px-4 py-3 text-center font-bold text-[#1a4731]">{formatPoints(player.record.pts)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Result Badge ── */
function ResultBadge({ matchup }: { matchup: { winner: string | null; result: string; rpPlayers: string[]; domPlayers: string[] } }) {
  if (!matchup.winner) {
    const hasPlayers = matchup.rpPlayers.some(Boolean) || matchup.domPlayers.some(Boolean);
    return <span className="text-[#1a4731]/20 text-sm">{hasPlayers ? 'Pending' : '---'}</span>;
  }

  const label = matchup.result || (matchup.winner === 'halved' ? 'AS' : matchup.winner === 'rp' ? 'RP' : 'DOM');

  const colors =
    matchup.winner === 'rp'
      ? 'bg-red-100 text-red-700 border-red-200'
      : matchup.winner === 'dom'
        ? 'bg-green-100 text-green-700 border-green-200'
        : 'bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/30';

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${colors}`}>
      {label}
    </span>
  );
}
