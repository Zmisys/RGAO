'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  type TeamId,
  type DraftPlayer,
  type LogEntry,
  type DraftState,
  TEAMS,
  TOTAL_PLAYERS,
  STORAGE_KEY,
  getInitialDraftState,
  getCurrentPickTeam,
} from '@/data/ryder-cup';

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadState(): DraftState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftState;
  } catch {
    return null;
  }
}

function saveState(state: DraftState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CaptainBadge() {
  return (
    <span className="inline-flex items-center text-[10px] font-bold bg-[#c9a84c]/25 text-[#c9a84c] px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 leading-none">
      C
    </span>
  );
}

function TeamBoard({
  teamId,
  players,
  isOnClock,
  isDraftComplete,
}: {
  teamId: TeamId;
  players: DraftPlayer[];
  isOnClock: boolean;
  isDraftComplete: boolean;
}) {
  const team = TEAMS[teamId];
  const isRWB = teamId === 'rwb';

  const headerGradient = isRWB
    ? 'bg-gradient-to-r from-red-700 via-red-800 to-blue-900'
    : 'bg-gradient-to-r from-green-700 via-green-800 to-red-800';

  const boardBg = isRWB ? 'bg-blue-50' : 'bg-green-50';

  const borderActive = isRWB
    ? 'border-blue-500 ring-2 ring-blue-200'
    : 'border-green-500 ring-2 ring-green-200';

  const pickNumColor = isRWB ? 'text-blue-400' : 'text-green-500';

  const avgHandicap =
    players.length > 0
      ? (players.reduce((s, p) => s + p.handicap, 0) / players.length).toFixed(1)
      : '—';

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-sm border-2 transition-all duration-200 ${
        isOnClock && !isDraftComplete ? borderActive : 'border-transparent'
      }`}
    >
      {/* Team header */}
      <div className={`px-4 py-3 ${headerGradient}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-white font-bold text-sm leading-snug">{team.name}</div>
            <div className="text-white/60 text-xs mt-0.5">Capt: {team.captain}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-white font-bold text-xl leading-none">{players.length}/8</div>
            {isOnClock && !isDraftComplete && (
              <div className="text-[#c9a84c] text-[10px] font-bold uppercase tracking-wider mt-0.5 animate-pulse">
                On Clock
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Roster */}
      <div className={`p-3 space-y-1.5 min-h-[220px] ${boardBg}`}>
        {players.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[180px] text-sm text-gray-400">
            No players drafted yet
          </div>
        ) : (
          players.map((player) => (
            <div
              key={player.id}
              className="bg-white rounded-lg px-3 py-2 flex items-center justify-between shadow-sm"
            >
              <div className="min-w-0 flex items-center gap-1.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#1a4731] text-sm truncate leading-tight">
                      {player.name}
                    </span>
                    {player.captain && <CaptainBadge />}
                  </div>
                  <div className="text-xs text-[#1a4731]/50 leading-tight">HCP {player.handicap}</div>
                </div>
              </div>
              <span className={`text-xs font-bold shrink-0 ml-2 tabular-nums ${pickNumColor}`}>
                #{player.pickNumber}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer stats */}
      <div className={`px-4 py-2 border-t border-black/5 ${boardBg}`}>
        <div className="flex justify-between text-xs text-[#1a4731]/50">
          <span>Avg HCP: {avgHandicap}</span>
          <span>{8 - players.length} spots remaining</span>
        </div>
      </div>
    </div>
  );
}

// ─── Coin Flip Screen ─────────────────────────────────────────────────────────

function CoinFlipScreen({ onSelect }: { onSelect: (team: TeamId) => void }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="text-[#c9a84c] font-semibold uppercase tracking-widest text-xs mb-3">
            RGAO · Ryder Cup
          </div>
          <h1 className="text-4xl font-bold text-[#1a4731] mb-3">Draft Dashboard</h1>
          <p className="text-[#1a4731]/55 text-sm max-w-sm mx-auto">
            Conduct the coin flip in person, then select which captain won and picks first to begin the draft.
          </p>
        </div>

        {/* Coin flip card */}
        <div className="bg-white rounded-2xl border border-[#c9a84c]/25 shadow-lg overflow-hidden">
          <div className="bg-[#1a4731] px-6 py-6 text-center">
            <div className="text-5xl mb-3 select-none">🪙</div>
            <h2 className="text-[#c9a84c] font-bold text-xl">Coin Flip</h2>
            <p className="text-white/50 text-sm mt-1">Who picks first?</p>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Team RWB button */}
            <button
              onClick={() => onSelect('rwb')}
              className="group text-left rounded-xl border-2 border-gray-200 hover:border-blue-500 bg-gradient-to-b from-blue-50 to-red-50 hover:from-blue-100 hover:to-red-100 p-5 transition-all duration-150 hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex gap-2 mb-2">
                <span className="text-2xl">🔵</span>
                <span className="text-2xl">🔴</span>
              </div>
              <div className="font-bold text-[#1a4731] text-sm leading-tight mb-1">
                {TEAMS.rwb.name}
              </div>
              <div className="text-xs text-[#1a4731]/55 mb-3">
                Captain: {TEAMS.rwb.captain}
              </div>
              <div className="text-blue-700 font-semibold text-xs group-hover:underline">
                Picks First →
              </div>
            </button>

            {/* Team GWR button */}
            <button
              onClick={() => onSelect('gwr')}
              className="group text-left rounded-xl border-2 border-gray-200 hover:border-green-500 bg-gradient-to-b from-green-50 to-red-50 hover:from-green-100 hover:to-red-100 p-5 transition-all duration-150 hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex gap-2 mb-2">
                <span className="text-2xl">🟢</span>
                <span className="text-2xl">🔴</span>
              </div>
              <div className="font-bold text-[#1a4731] text-sm leading-tight mb-1">
                {TEAMS.gwr.name}
              </div>
              <div className="text-xs text-[#1a4731]/55 mb-3">
                Captain: {TEAMS.gwr.captain}
              </div>
              <div className="text-green-700 font-semibold text-xs group-hover:underline">
                Picks First →
              </div>
            </button>
          </div>

          <div className="px-6 pb-5 text-center text-xs text-[#1a4731]/35">
            Non-snake draft · 16 total picks · 8 players per team
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Draft Page ──────────────────────────────────────────────────────────

type SortKey = 'name' | 'handicap';
type SortDir = 'asc' | 'desc';

export default function DraftPage() {
  const [draft, setDraft] = useState<DraftState>(getInitialDraftState);
  const [selectedPlayer, setSelectedPlayer] = useState<DraftPlayer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('handicap');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // ── Hydrate from localStorage ──
  useEffect(() => {
    const saved = loadState();
    if (saved) setDraft(saved);
    setHydrated(true);
  }, []);

  // ── Persist to localStorage ──
  useEffect(() => {
    if (hydrated) saveState(draft);
  }, [draft, hydrated]);

  // ── Derived state ──
  const draftedCount = useMemo(
    () => draft.players.filter((p) => p.team !== null).length,
    [draft.players]
  );
  const isDraftComplete = draftedCount === TOTAL_PLAYERS;

  const currentPickTeam: TeamId | null =
    draft.coinFlipDone && !isDraftComplete
      ? getCurrentPickTeam(draftedCount, draft.firstTeam!)
      : null;

  const availablePlayers = useMemo(
    () => draft.players.filter((p) => p.team === null),
    [draft.players]
  );

  const rwbPlayers = useMemo(
    () =>
      draft.players
        .filter((p) => p.team === 'rwb')
        .sort((a, b) => (a.pickNumber ?? 0) - (b.pickNumber ?? 0)),
    [draft.players]
  );

  const gwrPlayers = useMemo(
    () =>
      draft.players
        .filter((p) => p.team === 'gwr')
        .sort((a, b) => (a.pickNumber ?? 0) - (b.pickNumber ?? 0)),
    [draft.players]
  );

  // ── Filtered + sorted available players ──
  const filteredPlayers = useMemo(() => {
    let result = [...availablePlayers];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      const cmp =
        sortKey === 'name' ? a.name.localeCompare(b.name) : a.handicap - b.handicap;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [availablePlayers, searchQuery, sortKey, sortDir]);

  // ── Actions ──
  const handleCoinFlip = useCallback((team: TeamId) => {
    setDraft((prev) => ({ ...prev, firstTeam: team, coinFlipDone: true }));
  }, []);

  const handleDraft = useCallback(
    (player: DraftPlayer) => {
      if (!currentPickTeam || !draft.coinFlipDone || isDraftComplete) return;
      const pickNumber = draftedCount + 1;
      const timestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const entry: LogEntry = {
        pick: pickNumber,
        team: currentPickTeam,
        playerName: player.name,
        handicap: player.handicap,
        timestamp,
      };
      setDraft((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.id === player.id ? { ...p, team: currentPickTeam, pickNumber } : p
        ),
        log: [entry, ...prev.log],
      }));
      setSelectedPlayer(null);
    },
    [currentPickTeam, draftedCount, draft.coinFlipDone, isDraftComplete]
  );

  const handleUndo = useCallback(() => {
    if (draft.log.length === 0) return;
    const last = draft.log[0];
    setDraft((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.name === last.playerName ? { ...p, team: null, pickNumber: null } : p
      ),
      log: prev.log.slice(1),
    }));
    setSelectedPlayer(null);
  }, [draft.log]);

  const handleReset = useCallback(() => {
    setDraft(getInitialDraftState());
    setSelectedPlayer(null);
    setShowResetConfirm(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // ── Loading state (SSR guard) ──
  if (!hydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-[#1a4731]/40 text-sm">
        Loading draft...
      </div>
    );
  }

  // ── Phase 1: Coin Flip ──
  if (!draft.coinFlipDone) {
    return <CoinFlipScreen onSelect={handleCoinFlip} />;
  }

  // ── Phase 2 & 3: Draft Board ──
  const currentPickGradient =
    currentPickTeam === 'rwb'
      ? 'bg-gradient-to-r from-red-700 via-red-800 to-blue-900'
      : 'bg-gradient-to-r from-green-700 via-green-800 to-red-800';

  const actionGradient =
    currentPickTeam === 'rwb'
      ? 'bg-gradient-to-br from-red-700 to-blue-900'
      : 'bg-gradient-to-br from-green-700 to-red-800';

  // Build upcoming picks preview (next 4)
  const upcomingPicks: { pickNum: number; team: TeamId }[] = [];
  if (!isDraftComplete && draft.firstTeam) {
    for (let i = 0; i < Math.min(4, TOTAL_PLAYERS - draftedCount); i++) {
      const pickNum = draftedCount + 1 + i;
      upcomingPicks.push({
        pickNum,
        team: getCurrentPickTeam(draftedCount + i, draft.firstTeam),
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ── Page Header ── */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[#c9a84c] font-semibold uppercase tracking-widest text-xs mb-1">
            RGAO · Ryder Cup
          </div>
          <h1 className="text-3xl font-bold text-[#1a4731] leading-tight">Draft Dashboard</h1>
          <p className="text-[#1a4731]/50 text-sm mt-0.5">
            {TEAMS[draft.firstTeam!].name} picked first
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Undo */}
          {draft.log.length > 0 && (
            <button
              onClick={handleUndo}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#1a4731]/65 hover:text-[#1a4731] border border-[#1a4731]/20 hover:border-[#1a4731]/40 px-3 py-1.5 rounded-lg transition-colors"
            >
              ↩ Undo
            </button>
          )}
          {/* Reset */}
          {showResetConfirm ? (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
              <span className="text-sm text-red-700 font-medium">Reset all?</span>
              <button
                onClick={handleReset}
                className="text-sm font-bold text-red-700 hover:text-red-900"
              >
                Yes
              </button>
              <span className="text-red-300">·</span>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="text-sm text-red-400 hover:text-red-600"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-sm font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              Reset Draft
            </button>
          )}
        </div>
      </div>

      {/* ── Current Pick Banner ── */}
      {!isDraftComplete && currentPickTeam ? (
        <div
          className={`mb-5 rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-4 shadow-sm ${currentPickGradient}`}
        >
          <div>
            <div className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">
              On the Clock — Pick {draftedCount + 1} of {TOTAL_PLAYERS}
            </div>
            <div className="text-white font-bold text-lg leading-tight">
              {TEAMS[currentPickTeam].name}
            </div>
            <div className="text-white/60 text-sm">Captain: {TEAMS[currentPickTeam].captain}</div>
          </div>

          <div className="flex items-center gap-6">
            {/* Upcoming picks */}
            {upcomingPicks.length > 1 && (
              <div className="hidden sm:block">
                <div className="text-white/50 text-xs uppercase tracking-wider mb-1.5">
                  Upcoming
                </div>
                <div className="flex gap-1.5">
                  {upcomingPicks.slice(1).map(({ pickNum, team }) => (
                    <div
                      key={pickNum}
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        team === 'rwb'
                          ? 'bg-blue-800/60 text-blue-200'
                          : 'bg-green-800/60 text-green-200'
                      }`}
                    >
                      #{pickNum} {TEAMS[team].shortName}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress */}
            <div className="text-right">
              <div className="text-white/60 text-xs">Drafted</div>
              <div className="text-white font-bold text-2xl tabular-nums leading-none">
                {draftedCount}
                <span className="text-white/40 text-base font-normal">/{TOTAL_PLAYERS}</span>
              </div>
              <div className="text-white/40 text-xs mt-0.5">
                RWB {rwbPlayers.length} · GWR {gwrPlayers.length}
              </div>
            </div>
          </div>
        </div>
      ) : isDraftComplete ? (
        <div className="mb-5 rounded-xl px-5 py-5 bg-[#1a4731] text-center shadow-sm">
          <div className="text-[#c9a84c] font-bold text-xl mb-1">🏆 Draft Complete!</div>
          <div className="text-white/60 text-sm">
            All 16 players have been drafted. Good luck to both teams!
          </div>
          <div className="flex justify-center gap-8 mt-3 text-sm">
            <span className="text-white/70">
              RWB: <span className="text-white font-bold">{rwbPlayers.length} players</span>
            </span>
            <span className="text-white/70">
              GWR: <span className="text-white font-bold">{gwrPlayers.length} players</span>
            </span>
          </div>
        </div>
      ) : null}

      {/* ── Main 3-Column Grid ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* ─ Left: Available Players ─ */}
        <div className="space-y-3">
          {/* Player panel */}
          <div className="bg-white rounded-2xl border border-[#c9a84c]/20 shadow-sm overflow-hidden">
            {/* Panel header */}
            <div className="bg-[#1a4731] px-4 py-3 flex items-center justify-between">
              <h2 className="text-[#c9a84c] font-bold text-sm">Available Players</h2>
              <span className="bg-[#c9a84c] text-[#1a4731] text-xs font-bold px-2 py-0.5 rounded-full tabular-nums">
                {availablePlayers.length}
              </span>
            </div>

            {/* Sort & Search controls */}
            <div className="px-3 pt-3 pb-2 space-y-2 border-b border-[#f5f0e8]">
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-[#1a4731] placeholder-gray-300 focus:outline-none focus:border-[#c9a84c] transition-colors"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={() => toggleSort('handicap')}
                  className={`flex-1 text-xs font-semibold px-2 py-1.5 rounded-md border transition-colors ${
                    sortKey === 'handicap'
                      ? 'bg-[#1a4731] text-[#c9a84c] border-[#1a4731]'
                      : 'text-[#1a4731]/50 border-gray-200 hover:border-[#1a4731]/30'
                  }`}
                >
                  HCP {sortKey === 'handicap' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </button>
                <button
                  onClick={() => toggleSort('name')}
                  className={`flex-1 text-xs font-semibold px-2 py-1.5 rounded-md border transition-colors ${
                    sortKey === 'name'
                      ? 'bg-[#1a4731] text-[#c9a84c] border-[#1a4731]'
                      : 'text-[#1a4731]/50 border-gray-200 hover:border-[#1a4731]/30'
                  }`}
                >
                  Name {sortKey === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </button>
              </div>
            </div>

            {/* Player list */}
            <div className="divide-y divide-[#f5f0e8] max-h-[420px] overflow-y-auto">
              {filteredPlayers.length === 0 ? (
                <div className="px-5 py-8 text-center text-[#1a4731]/35 text-sm">
                  {availablePlayers.length === 0
                    ? 'All players have been drafted!'
                    : 'No players match your search.'}
                </div>
              ) : (
                filteredPlayers.map((player) => {
                  const isSelected = selectedPlayer?.id === player.id;
                  return (
                    <button
                      key={player.id}
                      onClick={() =>
                        setSelectedPlayer(isSelected ? null : player)
                      }
                      disabled={isDraftComplete}
                      className={`w-full px-4 py-2.5 text-left transition-colors border-l-4 flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#c9a84c]/12 border-l-[#c9a84c]'
                          : 'border-l-transparent hover:bg-[#f5f0e8] disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-[#1a4731] text-sm leading-tight">
                            {player.name}
                          </span>
                          {player.captain && <CaptainBadge />}
                        </div>
                        <div className="text-xs text-[#1a4731]/45 mt-0.5">
                          HCP {player.handicap}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-[#c9a84c] shrink-0 text-base">✓</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ─ Draft Action Panel ─ */}
          {selectedPlayer && currentPickTeam && !isDraftComplete && (
            <div className={`rounded-2xl p-4 text-white shadow-md ${actionGradient}`}>
              <div className="mb-3">
                <div className="text-white/55 text-xs font-semibold uppercase tracking-wider mb-0.5">
                  Selected
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg leading-tight">{selectedPlayer.name}</span>
                  {selectedPlayer.captain && (
                    <span className="text-[10px] font-bold bg-[#c9a84c]/25 text-[#c9a84c] px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0">
                      C
                    </span>
                  )}
                </div>
                <div className="text-white/55 text-sm">HCP {selectedPlayer.handicap}</div>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-2 mb-3 text-sm">
                <span className="text-white/60">Drafting to: </span>
                <span className="text-white font-semibold">{TEAMS[currentPickTeam].name}</span>
              </div>
              <button
                onClick={() => handleDraft(selectedPlayer)}
                className="w-full bg-[#c9a84c] text-[#1a4731] font-bold text-sm py-2.5 rounded-lg hover:bg-[#b8943a] transition-colors active:scale-[0.98]"
              >
                Confirm Pick #{draftedCount + 1}
              </button>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="w-full mt-2 text-white/45 text-xs hover:text-white/75 transition-colors py-1"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Prompt to select if no player chosen */}
          {!selectedPlayer && currentPickTeam && !isDraftComplete && (
            <div className="rounded-xl border-2 border-dashed border-[#c9a84c]/30 px-4 py-5 text-center">
              <div className="text-[#1a4731]/40 text-sm">
                Select a player above to make Pick #{draftedCount + 1}
              </div>
            </div>
          )}
        </div>

        {/* ─ Right: Team Boards + Draft Log ─ */}
        <div className="lg:col-span-2 space-y-5">
          {/* Team boards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <TeamBoard
              teamId="rwb"
              players={rwbPlayers}
              isOnClock={currentPickTeam === 'rwb'}
              isDraftComplete={isDraftComplete}
            />
            <TeamBoard
              teamId="gwr"
              players={gwrPlayers}
              isOnClock={currentPickTeam === 'gwr'}
              isDraftComplete={isDraftComplete}
            />
          </div>

          {/* Draft Log */}
          <div className="bg-white rounded-2xl border border-[#c9a84c]/20 shadow-sm overflow-hidden">
            <div className="bg-[#1a4731] px-4 py-3 flex items-center justify-between">
              <h3 className="text-[#c9a84c] font-bold text-sm">Draft Log</h3>
              <span className="text-[#c9a84c]/50 text-xs tabular-nums">
                {draft.log.length}/{TOTAL_PLAYERS} picks
              </span>
            </div>
            <div className="divide-y divide-[#f5f0e8] max-h-56 overflow-y-auto">
              {draft.log.length === 0 ? (
                <div className="px-5 py-5 text-sm text-[#1a4731]/35 text-center">
                  No picks yet — start drafting!
                </div>
              ) : (
                draft.log.map((entry, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                    {/* Pick badge */}
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 tabular-nums ${
                        entry.team === 'rwb'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      #{entry.pick}
                    </span>

                    {/* Player */}
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-[#1a4731] text-sm">{entry.playerName}</span>
                      <span className="text-[#1a4731]/40 text-xs ml-2">HCP {entry.handicap}</span>
                    </div>

                    {/* Team + time */}
                    <div className="text-right shrink-0">
                      <div
                        className={`text-xs font-bold ${
                          entry.team === 'rwb' ? 'text-blue-700' : 'text-green-700'
                        }`}
                      >
                        {TEAMS[entry.team].shortName}
                      </div>
                      <div className="text-[#1a4731]/25 text-xs">{entry.timestamp}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
