'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  type TeamId,
  type DraftPlayer,
  type LogEntry,
  type DraftState,
  TEAMS,
  TOTAL_PICKS,
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

// ─── Flag stripe component ────────────────────────────────────────────────────
// Renders a 3-color horizontal stripe matching the team's national colors.

function FlagStripe({ teamId, height = 'h-2' }: { teamId: TeamId; height?: string }) {
  if (teamId === 'rwb') {
    // USA: red | white | blue
    return (
      <div className={`flex ${height}`}>
        <div className="flex-1 bg-red-600" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-blue-700" />
      </div>
    );
  }
  // Mexico: green | white | red
  return (
    <div className={`flex ${height}`}>
      <div className="flex-1 bg-green-600" />
      <div className="flex-1 bg-white" />
      <div className="flex-1 bg-red-600" />
    </div>
  );
}

// ─── Captain badge ────────────────────────────────────────────────────────────

function CaptainBadge() {
  return (
    <span className="inline-flex items-center text-[10px] font-bold bg-[#c9a84c]/30 text-[#c9a84c] px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 leading-none">
      C
    </span>
  );
}

// ─── TeamBoard ────────────────────────────────────────────────────────────────

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

  const headerBg = isRWB ? 'bg-blue-900' : 'bg-green-900';
  const boardBg = isRWB ? 'bg-blue-50' : 'bg-green-50';
  const borderActive = isRWB
    ? 'border-blue-500 ring-2 ring-blue-200'
    : 'border-green-500 ring-2 ring-green-200';
  const pickNumColor = isRWB ? 'text-blue-400' : 'text-green-500';

  const captain = players.find((p) => p.captain);
  const drafted = players.filter((p) => !p.captain);
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
      {/* Flag stripe */}
      <FlagStripe teamId={teamId} height="h-2.5" />

      {/* Header */}
      <div className={`px-4 py-3 ${headerBg}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xl leading-none">{team.flag}</span>
              <span className="text-white font-bold text-sm leading-snug">{team.name}</span>
            </div>
            <div className="text-white/50 text-xs">Capt: {team.captain} · {team.country}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-white font-bold text-xl leading-none tabular-nums">
              {players.length}/8
            </div>
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
        {/* Captain row — always pinned at top */}
        {captain && (
          <div className="bg-[#c9a84c]/15 border border-[#c9a84c]/30 rounded-lg px-3 py-2 flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#1a4731] text-sm">{captain.name}</span>
                <CaptainBadge />
              </div>
              <div className="text-xs text-[#1a4731]/50">HCP {captain.handicap}</div>
            </div>
            <span className="text-[#c9a84c] text-xs font-bold shrink-0 ml-2">CAPTAIN</span>
          </div>
        )}

        {/* Drafted players */}
        {drafted.length === 0 && !captain && (
          <div className="flex items-center justify-center min-h-[160px] text-sm text-gray-400">
            No players drafted yet
          </div>
        )}
        {drafted.length === 0 && captain && (
          <div className="flex items-center justify-center min-h-[120px] text-sm text-gray-400">
            No picks yet
          </div>
        )}
        {drafted.map((player) => (
          <div
            key={player.id}
            className="bg-white rounded-lg px-3 py-2 flex items-center justify-between shadow-sm"
          >
            <div className="min-w-0">
              <div className="font-semibold text-[#1a4731] text-sm leading-tight">
                {player.name}
              </div>
              <div className="text-xs text-[#1a4731]/45">HCP {player.handicap}</div>
            </div>
            <span className={`text-xs font-bold shrink-0 ml-2 tabular-nums ${pickNumColor}`}>
              #{player.pickNumber}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={`px-4 py-2 border-t border-black/5 ${boardBg}`}>
        <div className="flex justify-between text-xs text-[#1a4731]/45">
          <span>Avg HCP: {avgHandicap}</span>
          <span>{8 - players.length} spots remaining</span>
        </div>
      </div>
    </div>
  );
}

// ─── Pick Timer ───────────────────────────────────────────────────────────────
// 60-second countdown for each draft pick.
// Place an mp3 file at /public/sounds/pick-timer.mp3 — it plays when time expires.

type TimerStatus = 'idle' | 'running' | 'expired' | 'in';

function PickTimer({ pickNumber }: { pickNumber: number }) {
  const DURATION_MS = 60_000;

  const [status, setStatus] = useState<TimerStatus>('idle');
  const [remaining, setRemaining] = useState(DURATION_MS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset whenever the pick number changes (new pick begins)
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStatus('idle');
    setRemaining(DURATION_MS);
  }, [pickNumber]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startTimer = () => {
    if (status === 'running') return;
    setRemaining(DURATION_MS);
    setStatus('running');
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const rem = Math.max(0, DURATION_MS - elapsed);
      setRemaining(rem);
      if (rem === 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setStatus('expired');
        audioRef.current?.play().catch(() => {});
      }
    }, 10);
  };

  const pickIsIn = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRemaining(0);
    setStatus('in');
    audioRef.current?.play().catch(() => {});
  };

  const seconds = Math.floor(remaining / 1000);
  const centis = Math.floor((remaining % 1000) / 10);
  const display = `${String(seconds).padStart(2, '0')}:${String(centis).padStart(2, '0')}`;

  const isExpired = status === 'expired';
  const isIn = status === 'in';
  const isRunning = status === 'running';

  const clockColor =
    isExpired
      ? 'text-red-400'
      : isIn
      ? 'text-[#c9a84c]'
      : remaining <= 10_000
      ? 'text-red-400'
      : remaining <= 20_000
      ? 'text-yellow-300'
      : 'text-white';

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Hidden audio element — drop your mp3 at public/sounds/pick-timer.mp3 */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src="/sounds/pick-timer.mp3" preload="auto" />

      {status === 'idle' ? (
        <button
          onClick={startTimer}
          className="bg-[#c9a84c] hover:bg-[#b8943a] active:scale-[0.97] text-[#1a4731] font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wide"
        >
          On The Clock
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2">
          {/* Countdown display */}
          <div
            className={`font-mono font-black tabular-nums leading-none select-none transition-colors duration-300 ${clockColor}`}
            style={{ fontSize: '2.6rem', letterSpacing: '0.05em' }}
          >
            {display}
          </div>

          {/* Status label */}
          <div className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">
            {isExpired ? 'Time Expired' : isIn ? 'Pick Is In!' : 'Time Remaining'}
          </div>

          {/* Pick Is In button — only while running */}
          {isRunning && (
            <button
              onClick={pickIsIn}
              className="mt-1 bg-white/10 hover:bg-white/20 active:scale-[0.97] text-white font-semibold text-xs px-4 py-1.5 rounded-lg transition-all border border-white/20 uppercase tracking-wide"
            >
              Pick Is In
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Coin Flip Screen ─────────────────────────────────────────────────────────

function CoinFlipScreen({ onSelect }: { onSelect: (team: TeamId) => void }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <div className="text-[#c9a84c] font-semibold uppercase tracking-widest text-xs mb-3">
            RGAO · Ryder Cup
          </div>
          <h1 className="text-4xl font-bold text-[#1a4731] mb-3">Draft Dashboard</h1>
          <p className="text-[#1a4731]/50 text-sm max-w-xs mx-auto">
            Conduct the coin flip in person, then select which captain won and picks first.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#c9a84c]/25 shadow-lg overflow-hidden">
          <div className="bg-[#1a4731] px-6 py-6 text-center">
            <div className="text-5xl mb-3 select-none">🪙</div>
            <h2 className="text-[#c9a84c] font-bold text-xl">Coin Flip</h2>
            <p className="text-white/45 text-sm mt-1">Who picks first?</p>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Team RWB — USA */}
            <button
              onClick={() => onSelect('rwb')}
              className="group text-left rounded-xl border-2 border-gray-200 hover:border-blue-500 overflow-hidden transition-all duration-150 hover:shadow-md active:scale-[0.98]"
            >
              <FlagStripe teamId="rwb" height="h-2" />
              <div className="bg-gradient-to-b from-blue-50 to-white group-hover:from-blue-100 p-5 transition-colors">
                <div className="text-4xl mb-2">{TEAMS.rwb.flag}</div>
                <div className="font-bold text-[#1a4731] text-sm leading-tight mb-0.5">
                  {TEAMS.rwb.name}
                </div>
                <div className="text-xs text-[#1a4731]/50 mb-1">{TEAMS.rwb.country}</div>
                <div className="text-xs text-[#1a4731]/45 mb-3">Captain: {TEAMS.rwb.captain}</div>
                <div className="text-blue-700 font-semibold text-xs group-hover:underline">
                  Picks First →
                </div>
              </div>
            </button>

            {/* Team GWR — Mexico */}
            <button
              onClick={() => onSelect('gwr')}
              className="group text-left rounded-xl border-2 border-gray-200 hover:border-green-500 overflow-hidden transition-all duration-150 hover:shadow-md active:scale-[0.98]"
            >
              <FlagStripe teamId="gwr" height="h-2" />
              <div className="bg-gradient-to-b from-green-50 to-white group-hover:from-green-100 p-5 transition-colors">
                <div className="text-4xl mb-2">{TEAMS.gwr.flag}</div>
                <div className="font-bold text-[#1a4731] text-sm leading-tight mb-0.5">
                  {TEAMS.gwr.name}
                </div>
                <div className="text-xs text-[#1a4731]/50 mb-1">{TEAMS.gwr.country}</div>
                <div className="text-xs text-[#1a4731]/45 mb-3">Captain: {TEAMS.gwr.captain}</div>
                <div className="text-green-700 font-semibold text-xs group-hover:underline">
                  Picks First →
                </div>
              </div>
            </button>
          </div>

          <div className="px-6 pb-5 text-center text-xs text-[#1a4731]/30">
            Non-snake draft · 14 picks · 7 picks per team · Captains pre-assigned
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
  // draftedCount counts only picks made during the draft (excludes pre-assigned captains)
  const draftedCount = useMemo(
    () => draft.players.filter((p) => p.pickNumber !== null).length,
    [draft.players]
  );
  const isDraftComplete = draftedCount === TOTAL_PICKS;

  const currentPickTeam: TeamId | null =
    draft.coinFlipDone && !isDraftComplete
      ? getCurrentPickTeam(draftedCount, draft.firstTeam!)
      : null;

  // Available = not yet assigned (captains are pre-assigned so never appear here)
  const availablePlayers = useMemo(
    () => draft.players.filter((p) => p.team === null),
    [draft.players]
  );

  const rwbPlayers = useMemo(
    () =>
      draft.players
        .filter((p) => p.team === 'rwb')
        .sort((a, b) => {
          if (a.captain && !b.captain) return -1;
          if (!a.captain && b.captain) return 1;
          return (a.pickNumber ?? 0) - (b.pickNumber ?? 0);
        }),
    [draft.players]
  );

  const gwrPlayers = useMemo(
    () =>
      draft.players
        .filter((p) => p.team === 'gwr')
        .sort((a, b) => {
          if (a.captain && !b.captain) return -1;
          if (!a.captain && b.captain) return 1;
          return (a.pickNumber ?? 0) - (b.pickNumber ?? 0);
        }),
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

  // ── SSR guard ──
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
  const currentTeamHeaderBg = currentPickTeam === 'rwb' ? 'bg-blue-900' : 'bg-green-900';
  const actionBg = currentPickTeam === 'rwb' ? 'bg-blue-900' : 'bg-green-900';

  // Upcoming picks preview (next 3 after current)
  const upcomingPicks: { pickNum: number; team: TeamId }[] = [];
  if (!isDraftComplete && draft.firstTeam) {
    for (let i = 1; i < Math.min(4, TOTAL_PICKS - draftedCount); i++) {
      upcomingPicks.push({
        pickNum: draftedCount + 1 + i,
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
          <p className="text-[#1a4731]/45 text-sm mt-0.5">
            {TEAMS[draft.firstTeam!].flag} {TEAMS[draft.firstTeam!].name} picked first
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {draft.log.length > 0 && (
            <button
              onClick={handleUndo}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#1a4731]/65 hover:text-[#1a4731] border border-[#1a4731]/20 hover:border-[#1a4731]/40 px-3 py-1.5 rounded-lg transition-colors"
            >
              ↩ Undo
            </button>
          )}
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

      {/* ── On the Clock Banner ── */}
      {!isDraftComplete && currentPickTeam ? (
        <div className="mb-5 rounded-xl overflow-hidden shadow-sm">
          <FlagStripe teamId={currentPickTeam} height="h-2.5" />
          <div className={`px-5 py-4 flex flex-wrap items-center justify-between gap-4 ${currentTeamHeaderBg}`}>
            <div>
              <div className="text-white/55 text-xs font-semibold uppercase tracking-widest mb-0.5">
                On the Clock — Pick {draftedCount + 1} of {TOTAL_PICKS}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{TEAMS[currentPickTeam].flag}</span>
                <div>
                  <div className="text-white font-bold text-lg leading-tight">
                    {TEAMS[currentPickTeam].name}
                  </div>
                  <div className="text-white/50 text-sm">
                    Captain: {TEAMS[currentPickTeam].captain} · {TEAMS[currentPickTeam].country}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              {/* Upcoming picks */}
              {upcomingPicks.length > 0 && (
                <div className="hidden sm:block">
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-1.5">
                    Upcoming
                  </div>
                  <div className="flex gap-1.5">
                    {upcomingPicks.map(({ pickNum, team }) => (
                      <div
                        key={pickNum}
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          team === 'rwb'
                            ? 'bg-blue-700/60 text-blue-200'
                            : 'bg-green-700/60 text-green-200'
                        }`}
                      >
                        #{pickNum} {team === 'rwb' ? '🇺🇸' : '🇲🇽'}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress */}
              <div className="text-right">
                <div className="text-white/45 text-xs">Drafted</div>
                <div className="text-white font-bold text-2xl tabular-nums leading-none">
                  {draftedCount}
                  <span className="text-white/35 text-base font-normal">/{TOTAL_PICKS}</span>
                </div>
                <div className="text-white/35 text-xs mt-0.5">
                  🇺🇸 {rwbPlayers.length} · 🇲🇽 {gwrPlayers.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : isDraftComplete ? (
        <div className="mb-5 rounded-xl overflow-hidden shadow-sm">
          <div className="flex h-2.5">
            <div className="flex-1 bg-red-600" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-blue-700" />
            <div className="flex-1 bg-green-600" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-red-600" />
          </div>
          <div className="bg-[#1a4731] px-5 py-5 text-center">
            <div className="text-[#c9a84c] font-bold text-xl mb-1">🏆 Draft Complete!</div>
            <div className="text-white/55 text-sm">
              All 16 players have been assigned. Good luck to both teams!
            </div>
            <div className="flex justify-center gap-8 mt-3 text-sm">
              <span className="text-white/60">
                🇺🇸 RWB: <span className="text-white font-bold">{rwbPlayers.length} players</span>
              </span>
              <span className="text-white/60">
                🇲🇽 GWR: <span className="text-white font-bold">{gwrPlayers.length} players</span>
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Pick Timer ── */}
      {!isDraftComplete && currentPickTeam && (
        <div className="mb-5 bg-[#1a4731] rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[#c9a84c]/70 text-xs font-semibold uppercase tracking-widest mb-0.5">
                Pick Clock
              </div>
              <div className="text-white/60 text-sm">
                Pick {draftedCount + 1} of {TOTAL_PICKS} · {TEAMS[currentPickTeam].name}
              </div>
            </div>
            <PickTimer pickNumber={draftedCount + 1} />
          </div>
        </div>
      )}

      {/* ── Main 3-Column Grid ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* ─ Available Players ─ */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-[#c9a84c]/20 shadow-sm overflow-hidden">
            <div className="bg-[#1a4731] px-4 py-3 flex items-center justify-between">
              <h2 className="text-[#c9a84c] font-bold text-sm">Available Players</h2>
              <span className="bg-[#c9a84c] text-[#1a4731] text-xs font-bold px-2 py-0.5 rounded-full tabular-nums">
                {availablePlayers.length}
              </span>
            </div>

            {/* Sort & Search */}
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
                      onClick={() => setSelectedPlayer(isSelected ? null : player)}
                      disabled={isDraftComplete}
                      className={`w-full px-4 py-2.5 text-left transition-colors border-l-4 flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#c9a84c]/10 border-l-[#c9a84c]'
                          : 'border-l-transparent hover:bg-[#f5f0e8] disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-[#1a4731] text-sm leading-tight">
                          {player.name}
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

          {/* Draft Action Panel */}
          {selectedPlayer && currentPickTeam && !isDraftComplete && (
            <div className={`rounded-2xl overflow-hidden shadow-md`}>
              <FlagStripe teamId={currentPickTeam} height="h-2" />
              <div className={`p-4 text-white ${actionBg}`}>
                <div className="mb-3">
                  <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-0.5">
                    Selected
                  </div>
                  <div className="font-bold text-lg leading-tight">{selectedPlayer.name}</div>
                  <div className="text-white/50 text-sm">HCP {selectedPlayer.handicap}</div>
                </div>
                <div className="bg-white/10 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
                  <span className="text-lg">{TEAMS[currentPickTeam].flag}</span>
                  <span className="text-white text-sm font-semibold">{TEAMS[currentPickTeam].name}</span>
                </div>
                <button
                  onClick={() => handleDraft(selectedPlayer)}
                  className="w-full bg-[#c9a84c] text-[#1a4731] font-bold text-sm py-2.5 rounded-lg hover:bg-[#b8943a] transition-colors active:scale-[0.98]"
                >
                  Confirm Pick #{draftedCount + 1}
                </button>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="w-full mt-2 text-white/40 text-xs hover:text-white/70 transition-colors py-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Prompt when nothing selected */}
          {!selectedPlayer && currentPickTeam && !isDraftComplete && (
            <div className="rounded-xl border-2 border-dashed border-[#c9a84c]/25 px-4 py-5 text-center">
              <div className="text-[#1a4731]/35 text-sm">
                Select a player to make Pick #{draftedCount + 1}
              </div>
            </div>
          )}
        </div>

        {/* ─ Team Boards + Draft Log ─ */}
        <div className="lg:col-span-2 space-y-5">
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
              <span className="text-[#c9a84c]/45 text-xs tabular-nums">
                {draft.log.length}/{TOTAL_PICKS} picks
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
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 tabular-nums ${
                        entry.team === 'rwb'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      #{entry.pick}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-[#1a4731] text-sm">
                        {entry.playerName}
                      </span>
                      <span className="text-[#1a4731]/40 text-xs ml-2">HCP {entry.handicap}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base leading-none">{TEAMS[entry.team].flag}</div>
                      <div className="text-[#1a4731]/25 text-xs mt-0.5">{entry.timestamp}</div>
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
