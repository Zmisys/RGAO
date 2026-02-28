'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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

const POLL_INTERVAL = 10_000; // refresh every 10 seconds for live updates

function deepClone(s: LeaderboardState): LeaderboardState {
  return JSON.parse(JSON.stringify(s));
}

const FORMAT_PRESETS = [
  { label: '2v2 Cart Score (net)', matchupSize: 2, matchupCount: 4 },
  { label: '2v2 Scramble', matchupSize: 2, matchupCount: 4 },
  { label: '2v2 Best Ball (net)', matchupSize: 2, matchupCount: 4 },
  { label: '2v2 Alternate Shot', matchupSize: 2, matchupCount: 4 },
  { label: '2v2 Shamble', matchupSize: 2, matchupCount: 4 },
  { label: '1v1 Match Play (net)', matchupSize: 1, matchupCount: 8 },
  { label: '1v1 Stroke Play (net)', matchupSize: 1, matchupCount: 8 },
  { label: '1v1 Stroke Play (gross)', matchupSize: 1, matchupCount: 8 },
];

export default function DashboardPage() {
  const [hydrated, setHydrated] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [state, setState] = useState<LeaderboardState>(() => createInitialState());
  const [editState, setEditState] = useState<LeaderboardState>(() => createInitialState());
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const editModeRef = useRef(false);
  editModeRef.current = editMode;

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = (await res.json()) as LeaderboardState;
        return data;
      }
    } catch { /* ignore fetch errors */ }
    return null;
  }, []);

  // Initial load from server
  useEffect(() => {
    fetchLeaderboard().then(data => {
      const loaded = data ?? createInitialState();
      setState(loaded);
      setEditState(deepClone(loaded));
      setHydrated(true);
    });
  }, [fetchLeaderboard]);

  // Auto-poll for live updates when not in edit mode
  useEffect(() => {
    const interval = setInterval(async () => {
      if (editModeRef.current) return; // don't overwrite while admin is editing
      const data = await fetchLeaderboard();
      if (data) setState(data);
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  /* ── handlers ── */
  const handleEnterEdit = () => {
    // If already authenticated this session, go straight to edit mode
    if (adminPassword) {
      setEditState(deepClone(state));
      setEditMode(true);
    } else {
      setShowPasswordPrompt(true);
      setPasswordError('');
    }
  };
  const handlePasswordSubmit = async () => {
    // Verify password against the server with a lightweight test request
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify(state), // send current state (no-op save, just to verify)
      });
      if (res.status === 401) {
        setPasswordError('Incorrect password');
        return;
      }
    } catch {
      setPasswordError('Could not verify — try again');
      return;
    }
    setShowPasswordPrompt(false);
    setPasswordError('');
    setEditState(deepClone(state));
    setEditMode(true);
  };
  const handleSave = async () => {
    setState(editState);
    setEditMode(false);
    // Persist to server so all visitors see the update immediately
    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify(editState),
      });
    } catch { /* ignore */ }
  };
  const handleCancel = () => {
    setEditState(deepClone(state));
    setEditMode(false);
  };
  const handleSyncDraft = async () => {
    try {
      const res = await fetch('/api/draft');
      if (!res.ok) return;
      const draftState = await res.json();
      if (!draftState.players) return;
      setEditState(prev => {
        const next = deepClone(prev);
        for (const dp of draftState.players) {
          const player = next.players.find((p: { name: string }) => p.name === dp.name);
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

  const updateRoundField = (ri: number, field: keyof TournamentRound, value: string | number) => {
    setEditState(prev => {
      const next = deepClone(prev);
      (next.rounds[ri] as unknown as Record<string, unknown>)[field] = value;
      return next;
    });
  };

  const updateRoundFormat = (ri: number, formatLabel: string) => {
    setEditState(prev => {
      const next = deepClone(prev);
      const round = next.rounds[ri];
      const preset = FORMAT_PRESETS.find(p => p.label === formatLabel);
      if (preset) {
        const structureChanged = round.matchupSize !== preset.matchupSize || round.matchupCount !== preset.matchupCount;
        round.format = preset.label;
        if (structureChanged) {
          round.matchupSize = preset.matchupSize;
          round.matchupCount = preset.matchupCount;
          round.pointsAvailable = preset.matchupCount;
          round.matchups = Array.from({ length: preset.matchupCount }, () => ({
            rpPlayers: Array.from({ length: preset.matchupSize }, () => ''),
            domPlayers: Array.from({ length: preset.matchupSize }, () => ''),
            result: '',
            winner: null,
          }));
        }
      }
      return next;
    });
  };

  const updateMatchupStructure = (ri: number, newSize: number, newCount: number) => {
    setEditState(prev => {
      const next = deepClone(prev);
      const round = next.rounds[ri];
      round.matchupSize = newSize;
      round.matchupCount = newCount;
      round.pointsAvailable = newCount;
      round.matchups = Array.from({ length: newCount }, () => ({
        rpPlayers: Array.from({ length: newSize }, () => ''),
        domPlayers: Array.from({ length: newSize }, () => ''),
        result: '',
        winner: null,
      }));
      return next;
    });
  };

  /* ── derived ── */
  const current = editMode ? editState : state;
  const { players, rounds } = current;
  const totalPts = getTotalPoints(rounds);
  const totalPointsAvailable = rounds.reduce((s, r) => s + r.pointsAvailable, 0);
  const winTarget = totalPointsAvailable > 0 ? Math.floor(totalPointsAvailable / 2) + 0.5 : 10.5;

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

  const winner = totalPts.rp >= winTarget ? 'rp' : totalPts.dom >= winTarget ? 'dom' : null;

  if (!hydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-[#1a4731]/40 text-sm">
        Loading leaderboard&hellip;
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* ═══════════════ ADMIN PASSWORD MODAL ═══════════════ */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-bold text-[#1a4731] mb-1">Admin Login</h2>
            <p className="text-sm text-[#1a4731]/60 mb-4">Enter the admin password to edit the leaderboard.</p>
            <input
              type="password"
              autoFocus
              value={adminPassword}
              onChange={e => { setAdminPassword(e.target.value); setPasswordError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handlePasswordSubmit(); }}
              placeholder="Password"
              className="w-full px-4 py-2 border border-[#1a4731]/20 rounded-lg text-[#1a4731] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/60 mb-2"
            />
            {passwordError && <p className="text-red-600 text-sm mb-2">{passwordError}</p>}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { setShowPasswordPrompt(false); setAdminPassword(''); setPasswordError(''); }}
                className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg border border-[#1a4731]/20 text-[#1a4731]/60 hover:text-[#1a4731] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-[#1a4731] text-[#c9a84c] hover:bg-[#1a4731]/90 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ HEADER ═══════════════ */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[#c9a84c] font-semibold uppercase tracking-widest text-sm mb-2">
            2026 RGAO &mdash; Cabo San Lucas
          </div>
          <h1 className="text-4xl font-bold text-[#1a4731] mb-1">Team Leaderboard</h1>
          <p className="text-[#1a4731]/60">{players.length} Players &middot; {rounds.length} Rounds &middot; {totalPointsAvailable} Points &middot; First to {formatPoints(winTarget)} Wins</p>
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
              <div className="text-white/30 text-[10px] mt-1 leading-tight">FIRST TO<br />{formatPoints(winTarget)} WINS</div>
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
              style={{ width: `${(totalPts.rp / (totalPointsAvailable || 20)) * 100}%` }}
            />
          )}
          {totalPts.dom > 0 && (
            <div
              className="absolute right-0 top-0 h-full bg-gradient-to-l from-green-600 to-green-500 transition-all duration-500"
              style={{ width: `${(totalPts.dom / (totalPointsAvailable || 20)) * 100}%` }}
            />
          )}
          <div className="absolute top-0 h-full w-0.5 bg-[#c9a84c]" style={{ left: `${totalPointsAvailable > 0 ? (winTarget / totalPointsAvailable) * 100 : 52.5}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-white/30 mt-1.5 px-1">
          <span>0</span>
          <span className="text-[#c9a84c]/60">{formatPoints(winTarget)}</span>
          <span>{totalPointsAvailable}</span>
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
                <td className="px-4 py-3 text-center text-sm font-bold text-[#c9a84c]/60">{totalPointsAvailable}</td>
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
              {editMode ? (
                <div className="space-y-3">
                  {/* Row 1: Round name + Course */}
                  <div className="flex flex-wrap gap-3">
                    <input
                      value={editState.rounds[ri].name}
                      onChange={e => updateRoundField(ri, 'name', e.target.value)}
                      className="text-[#c9a84c] font-bold text-lg bg-white/10 rounded-lg px-3 py-1.5 border border-[#c9a84c]/30 focus:outline-none focus:ring-1 focus:ring-[#c9a84c] flex-1 min-w-[120px] placeholder-[#c9a84c]/30"
                      placeholder="Round name"
                    />
                    <input
                      value={editState.rounds[ri].course}
                      onChange={e => updateRoundField(ri, 'course', e.target.value)}
                      className="text-white font-medium bg-white/10 rounded-lg px-3 py-1.5 border border-white/20 focus:outline-none focus:ring-1 focus:ring-[#c9a84c] flex-[2] min-w-[180px] placeholder-white/30"
                      placeholder="Course name"
                    />
                  </div>
                  {/* Row 2: Format selector */}
                  <div className="flex flex-wrap gap-3 items-center">
                    <label className="text-white/50 text-xs uppercase tracking-wider shrink-0">Format</label>
                    <select
                      value={FORMAT_PRESETS.some(p => p.label === editState.rounds[ri].format) ? editState.rounds[ri].format : '__custom__'}
                      onChange={e => {
                        if (e.target.value !== '__custom__') {
                          updateRoundFormat(ri, e.target.value);
                        }
                      }}
                      className="text-sm bg-white/10 text-white rounded-lg px-3 py-1.5 border border-white/20 focus:outline-none focus:ring-1 focus:ring-[#c9a84c] flex-1 min-w-[200px]"
                    >
                      {FORMAT_PRESETS.map(p => (
                        <option key={p.label} value={p.label} className="text-[#1a4731]">{p.label}</option>
                      ))}
                      <option value="__custom__" className="text-[#1a4731]">Custom...</option>
                    </select>
                    {!FORMAT_PRESETS.some(p => p.label === editState.rounds[ri].format) && (
                      <input
                        value={editState.rounds[ri].format}
                        onChange={e => updateRoundField(ri, 'format', e.target.value)}
                        className="text-sm bg-white/10 text-white rounded-lg px-3 py-1.5 border border-white/20 focus:outline-none focus:ring-1 focus:ring-[#c9a84c] flex-1 min-w-[180px] placeholder-white/30"
                        placeholder="Custom format name"
                      />
                    )}
                  </div>
                  {/* Row 3: Day, Time, Tee Box, Yardage */}
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5">
                      <label className="text-white/50 text-xs uppercase tracking-wider">Day</label>
                      <input
                        value={editState.rounds[ri].day}
                        onChange={e => updateRoundField(ri, 'day', e.target.value)}
                        className="text-sm bg-white/10 text-white rounded-lg px-2 py-1.5 border border-white/20 focus:outline-none focus:ring-1 focus:ring-[#c9a84c] w-28 placeholder-white/30"
                        placeholder="Day"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="text-white/50 text-xs uppercase tracking-wider">Time</label>
                      <input
                        value={editState.rounds[ri].time}
                        onChange={e => updateRoundField(ri, 'time', e.target.value)}
                        className="text-sm bg-white/10 text-white rounded-lg px-2 py-1.5 border border-white/20 focus:outline-none focus:ring-1 focus:ring-[#c9a84c] w-24 placeholder-white/30"
                        placeholder="Time"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="text-white/50 text-xs uppercase tracking-wider">Tee Box</label>
                      <input
                        value={editState.rounds[ri].teeBox}
                        onChange={e => updateRoundField(ri, 'teeBox', e.target.value)}
                        className="text-sm bg-white/10 text-white rounded-lg px-2 py-1.5 border border-white/20 focus:outline-none focus:ring-1 focus:ring-[#c9a84c] w-20 placeholder-white/30"
                        placeholder="Tee"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="text-white/50 text-xs uppercase tracking-wider">Yardage</label>
                      <input
                        value={editState.rounds[ri].yardage}
                        onChange={e => updateRoundField(ri, 'yardage', e.target.value)}
                        className="text-sm bg-white/10 text-white rounded-lg px-2 py-1.5 border border-white/20 focus:outline-none focus:ring-1 focus:ring-[#c9a84c] w-24 placeholder-white/30"
                        placeholder="Yards"
                      />
                    </div>
                  </div>
                  {/* Row 4: Matchup structure + Points */}
                  <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-1.5">
                      <label className="text-white/50 text-xs uppercase tracking-wider">Type</label>
                      <div className="flex rounded-lg overflow-hidden border border-white/20">
                        <button
                          type="button"
                          onClick={() => {
                            if (editState.rounds[ri].matchupSize !== 2) {
                              updateMatchupStructure(ri, 2, Math.max(Math.ceil(editState.rounds[ri].matchupCount / 2), 1));
                            }
                          }}
                          className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                            editState.rounds[ri].matchupSize === 2
                              ? 'bg-[#c9a84c] text-[#1a4731]'
                              : 'bg-white/10 text-white/50 hover:bg-white/20'
                          }`}
                        >
                          2v2
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (editState.rounds[ri].matchupSize !== 1) {
                              updateMatchupStructure(ri, 1, editState.rounds[ri].matchupCount * 2);
                            }
                          }}
                          className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                            editState.rounds[ri].matchupSize === 1
                              ? 'bg-[#c9a84c] text-[#1a4731]'
                              : 'bg-white/10 text-white/50 hover:bg-white/20'
                          }`}
                        >
                          1v1
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="text-white/50 text-xs uppercase tracking-wider">Matches</label>
                      <input
                        type="number"
                        min={1}
                        max={16}
                        value={editState.rounds[ri].matchupCount}
                        onChange={e => {
                          const count = Math.max(1, Math.min(16, parseInt(e.target.value) || 1));
                          updateMatchupStructure(ri, editState.rounds[ri].matchupSize, count);
                        }}
                        className="text-sm bg-white/10 text-white rounded-lg px-2 py-1.5 border border-white/20 focus:outline-none focus:ring-1 focus:ring-[#c9a84c] w-16 text-center"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="text-white/50 text-xs uppercase tracking-wider">Points</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={editState.rounds[ri].pointsAvailable}
                        onChange={e => updateRoundField(ri, 'pointsAvailable', Math.max(1, parseInt(e.target.value) || 1))}
                        className="text-sm bg-white/10 text-white rounded-lg px-2 py-1.5 border border-white/20 focus:outline-none focus:ring-1 focus:ring-[#c9a84c] w-16 text-center"
                      />
                    </div>
                  </div>
                </div>
              ) : (
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
              )}
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
                              return (
                                <div key={si} className="relative">
                                  <input
                                    list={`rp-${ri}-${mi}-${si}`}
                                    value={val}
                                    onChange={e => updateMatchupPlayer(ri, mi, 'rp', si, e.target.value)}
                                    placeholder="Type or select player"
                                    className="text-sm border border-red-200 rounded-lg px-2 py-1.5 bg-red-50 text-[#1a4731] focus:outline-none focus:ring-1 focus:ring-red-400 min-w-[140px] w-full"
                                  />
                                  <datalist id={`rp-${ri}-${mi}-${si}`}>
                                    {avail.map(n => <option key={n} value={n} />)}
                                  </datalist>
                                </div>
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
                              return (
                                <div key={si} className="relative">
                                  <input
                                    list={`dom-${ri}-${mi}-${si}`}
                                    value={val}
                                    onChange={e => updateMatchupPlayer(ri, mi, 'dom', si, e.target.value)}
                                    placeholder="Type or select player"
                                    className="text-sm border border-green-200 rounded-lg px-2 py-1.5 bg-green-50 text-[#1a4731] focus:outline-none focus:ring-1 focus:ring-green-400 min-w-[140px] w-full"
                                  />
                                  <datalist id={`dom-${ri}-${mi}-${si}`}>
                                    {avail.map(n => <option key={n} value={n} />)}
                                  </datalist>
                                </div>
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
