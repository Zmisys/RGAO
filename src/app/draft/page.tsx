'use client';

import { useState, useEffect } from 'react';
import { players as initialPlayers, Player, TEAM_RWB, TEAM_GWR } from '@/data/players';

const STORAGE_KEY = 'rgao-ryder-cup-draft-2024';

type SortOption = 'handicap-asc' | 'handicap-desc' | 'name-asc';

interface SavedState {
  playerList: Player[];
  draftLog: string[];
  firstPickTeam: string | null;
  currentTurn: string | null;
  pickNumber: number;
}

function buildDefaultState(): SavedState {
  return {
    playerList: initialPlayers,
    draftLog: [],
    firstPickTeam: null,
    currentTurn: null,
    pickNumber: 0,
  };
}

// ─── Team Board Sub-Component ────────────────────────────────────────────────

interface TeamBoardProps {
  name: string;
  captain: string;
  players: Player[];
  isOnClock: boolean;
  isDraftComplete: boolean;
  headerBg: string;
  borderColor: string;
  cardBg: string;
  badgeClass: string;
  onUndo: (id: number) => void;
}

function TeamBoard({
  name,
  captain,
  players,
  isOnClock,
  isDraftComplete,
  headerBg,
  borderColor,
  cardBg,
  badgeClass,
  onUndo,
}: TeamBoardProps) {
  const drafted = players.filter(p => !p.captain);
  const captainPlayer = players.find(p => p.captain);

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm ${borderColor} ${cardBg}`}>
      <div className={`px-5 py-3 flex items-center justify-between ${headerBg}`}>
        <div className="flex items-center gap-2">
          <h3 className="text-white font-bold text-sm leading-tight">{name}</h3>
          {isOnClock && !isDraftComplete && (
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              ON THE CLOCK
            </span>
          )}
        </div>
        <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">
          {players.length}/8
        </span>
      </div>

      <div className="p-3 space-y-2 min-h-[200px]">
        {/* Captain row */}
        {captainPlayer && (
          <div className="bg-white rounded-lg px-3 py-2 flex items-center justify-between shadow-sm border border-yellow-200">
            <div>
              <div className="font-semibold text-[#1a4731] text-sm">{captainPlayer.name}</div>
              <div className="text-xs text-[#1a4731]/50">HCP {captainPlayer.handicap}</div>
            </div>
            <span className="text-xs font-bold bg-[#c9a84c] text-[#1a4731] px-2 py-0.5 rounded-full">
              CAPTAIN
            </span>
          </div>
        )}

        {/* Drafted players */}
        {drafted.length === 0 && !isOnClock && (
          <div className="text-center py-4 text-sm opacity-40">No picks yet</div>
        )}
        {isOnClock && drafted.length === 0 && (
          <div className="text-center py-4 text-sm opacity-50 italic">Waiting for pick…</div>
        )}
        {drafted.map((player, idx) => (
          <div
            key={player.id}
            className="bg-white rounded-lg px-3 py-2 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${badgeClass}`}>
                {idx + 1}
              </span>
              <div>
                <div className="font-semibold text-[#1a4731] text-sm">{player.name}</div>
                <div className="text-xs text-[#1a4731]/50">HCP {player.handicap}</div>
              </div>
            </div>
            <button
              onClick={() => onUndo(player.id)}
              className="text-red-400 hover:text-red-600 text-sm transition-colors ml-2"
              title="Remove from team"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Draft Page ──────────────────────────────────────────────────────────

export default function DraftPage() {
  const [playerList, setPlayerList] = useState<Player[]>(initialPlayers);
  const [draftLog, setDraftLog] = useState<string[]>([]);
  const [firstPickTeam, setFirstPickTeam] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState<string | null>(null);
  const [pickNumber, setPickNumber] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('handicap-asc');
  const [showAll, setShowAll] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: SavedState = JSON.parse(saved);
        setPlayerList(state.playerList);
        setDraftLog(state.draftLog);
        setFirstPickTeam(state.firstPickTeam);
        setCurrentTurn(state.currentTurn);
        setPickNumber(state.pickNumber);
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (!hydrated) return;
    const state: SavedState = { playerList, draftLog, firstPickTeam, currentTurn, pickNumber };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [playerList, draftLog, firstPickTeam, currentTurn, pickNumber, hydrated]);

  // Derived state
  const availablePlayers = playerList.filter(p => p.team === null);
  const isDraftComplete = availablePlayers.length === 0 && firstPickTeam !== null;
  const rwbPlayers = playerList.filter(p => p.team === TEAM_RWB);
  const gwrPlayers = playerList.filter(p => p.team === TEAM_GWR);

  // Build sorted/filtered player list for the panel
  const baseList = showAll ? playerList : availablePlayers;
  const displayPlayers = [...baseList].sort((a, b) => {
    if (sortBy === 'handicap-asc') return a.handicap - b.handicap;
    if (sortBy === 'handicap-desc') return b.handicap - a.handicap;
    return a.name.localeCompare(b.name);
  });

  // ── Handlers ──

  function handleCoinFlip(team: string) {
    setFirstPickTeam(team);
    setCurrentTurn(team);
  }

  function assignToCurrentTeam() {
    if (!selectedPlayer || !currentTurn || isDraftComplete) return;
    const nextPick = pickNumber + 1;
    const nextTurn = currentTurn === TEAM_RWB ? TEAM_GWR : TEAM_RWB;
    const remaining = availablePlayers.length - 1;

    setPlayerList(prev =>
      prev.map(p => (p.id === selectedPlayer.id ? { ...p, team: currentTurn } : p))
    );
    setDraftLog(prev => [
      `Pick #${nextPick} — ${currentTurn}: ${selectedPlayer.name} (HCP ${selectedPlayer.handicap})`,
      ...prev,
    ]);
    setPickNumber(nextPick);
    setCurrentTurn(remaining === 0 ? null : nextTurn);
    setSelectedPlayer(null);
  }

  function undoDraft(playerId: number) {
    const player = playerList.find(p => p.id === playerId);
    if (!player || player.captain) return;
    const teamThatDrafted = player.team!;

    setPlayerList(prev => prev.map(p => (p.id === playerId ? { ...p, team: null } : p)));
    setDraftLog(prev => [
      `↩  ${player.name} returned to pool (pick reversed)`,
      ...prev,
    ]);
    setPickNumber(prev => Math.max(0, prev - 1));
    setCurrentTurn(teamThatDrafted);
    if (selectedPlayer?.id === playerId) setSelectedPlayer(null);
  }

  function resetDraft() {
    setPlayerList(initialPlayers);
    setDraftLog([]);
    setFirstPickTeam(null);
    setCurrentTurn(null);
    setPickNumber(0);
    setSelectedPlayer(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  // Prevent SSR/client mismatch
  if (!hydrated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* ── Page Header ── */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[#c9a84c] font-semibold uppercase tracking-widest text-sm mb-2">
            RGAO · Ryder Cup Format
          </div>
          <h1 className="text-4xl font-bold text-[#1a4731] mb-1">Player Draft Board</h1>
          <p className="text-[#1a4731]/60">
            {isDraftComplete
              ? 'Draft complete — all 16 players assigned'
              : !firstPickTeam
              ? 'Conduct a coin flip to determine who picks first'
              : `${availablePlayers.length} of 14 players remaining · Pick #${pickNumber + 1} up next`}
          </p>
        </div>
        <button
          onClick={resetDraft}
          className="bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
        >
          Reset Draft
        </button>
      </div>

      {/* ── Coin Flip Section ── */}
      {!firstPickTeam && (
        <div className="mb-8 bg-[#1a4731] rounded-2xl p-7 text-center text-[#f5f0e8]">
          <div className="text-[#c9a84c] text-xs font-semibold uppercase tracking-widest mb-2">
            Step 1 — Coin Flip
          </div>
          <h2 className="text-2xl font-bold mb-1">Who won the coin flip?</h2>
          <p className="text-[#f5f0e8]/50 text-sm mb-7">
            The winning captain gets the first overall pick
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => handleCoinFlip(TEAM_RWB)}
              className="group bg-red-700 hover:bg-red-800 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-left shadow-lg"
            >
              <div className="text-base">{TEAM_RWB}</div>
              <div className="text-white/60 text-xs font-normal mt-0.5">Captain: Ryan Parker</div>
            </button>
            <button
              onClick={() => handleCoinFlip(TEAM_GWR)}
              className="group bg-green-700 hover:bg-green-800 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-left shadow-lg"
            >
              <div className="text-base">{TEAM_GWR}</div>
              <div className="text-white/60 text-xs font-normal mt-0.5">Captain: Cole Dominguez</div>
            </button>
          </div>
        </div>
      )}

      {/* ── On the Clock Banner ── */}
      {firstPickTeam && !isDraftComplete && currentTurn && (
        <div
          className={`mb-6 rounded-xl px-6 py-4 flex items-center justify-between text-white shadow ${
            currentTurn === TEAM_RWB ? 'bg-red-700' : 'bg-green-700'
          }`}
        >
          <div>
            <div className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-0.5">
              On the Clock · Pick #{pickNumber + 1}
            </div>
            <div className="font-bold text-xl">{currentTurn}</div>
          </div>
          <div className="text-right text-white/60 text-sm">
            <div>{availablePlayers.length} players left</div>
            <div className="text-xs">
              {currentTurn === TEAM_RWB ? 'Ryan Parker' : 'Cole Dominguez'}, Captain
            </div>
          </div>
        </div>
      )}

      {/* ── Draft Complete Banner ── */}
      {isDraftComplete && (
        <div className="mb-6 bg-[#1a4731] rounded-xl px-6 py-5 text-center">
          <div className="text-[#c9a84c] font-bold text-xl mb-1">Draft Complete!</div>
          <p className="text-[#f5f0e8]/60 text-sm">
            All 16 players have been assigned. Teams are set — let the tournament begin!
          </p>
        </div>
      )}

      {/* ── Main Grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left Column: Player List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-[#c9a84c]/20 shadow-sm overflow-hidden">
            {/* Panel Header */}
            <div className="bg-[#1a4731] px-5 py-4 flex items-center justify-between">
              <h2 className="text-[#c9a84c] font-bold">
                {showAll ? 'All Players' : 'Available Players'}
              </h2>
              <span className="bg-[#c9a84c] text-[#1a4731] text-xs font-bold px-2 py-1 rounded-full">
                {showAll ? playerList.length : availablePlayers.length}
              </span>
            </div>

            {/* Sort & Filter Controls */}
            <div className="px-4 py-3 bg-[#f5f0e8]/50 border-b border-[#f5f0e8] flex flex-wrap gap-2">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="text-xs border border-[#c9a84c]/30 rounded-lg px-2 py-1.5 text-[#1a4731] bg-white focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
              >
                <option value="handicap-asc">HCP: Low → High</option>
                <option value="handicap-desc">HCP: High → Low</option>
                <option value="name-asc">Name: A → Z</option>
              </select>
              <button
                onClick={() => setShowAll(prev => !prev)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  showAll
                    ? 'bg-[#1a4731] text-[#c9a84c]'
                    : 'bg-white border border-[#c9a84c]/30 text-[#1a4731] hover:bg-[#f5f0e8]'
                }`}
              >
                {showAll ? 'Available Only' : 'Show All'}
              </button>
            </div>

            {/* Player List */}
            <div className="divide-y divide-[#f5f0e8]">
              {displayPlayers.length === 0 ? (
                <div className="px-5 py-8 text-center text-[#1a4731]/40 text-sm">
                  {availablePlayers.length === 0 ? 'All players drafted!' : 'No players to show'}
                </div>
              ) : (
                displayPlayers.map(player => {
                  const isDrafted = player.team !== null;
                  const isSelected = selectedPlayer?.id === player.id;
                  const isClickable = !isDrafted && !!firstPickTeam && !isDraftComplete;

                  return (
                    <button
                      key={player.id}
                      onClick={() => {
                        if (!isClickable) return;
                        setSelectedPlayer(isSelected ? null : player);
                      }}
                      disabled={!isClickable}
                      className={`w-full px-5 py-3 text-left transition-colors flex items-center justify-between gap-2
                        ${isClickable ? 'hover:bg-[#f5f0e8] cursor-pointer' : 'cursor-default'}
                        ${isDrafted ? 'opacity-40' : ''}
                        ${isSelected ? 'bg-[#c9a84c]/20 border-l-4 border-[#c9a84c]' : ''}
                      `}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-[#1a4731] text-sm truncate">{player.name}</div>
                        <div className="text-xs text-[#1a4731]/50">
                          HCP {player.handicap}
                          {player.captain && ' · Captain'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isDrafted && (
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              player.team === TEAM_RWB
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {player.team === TEAM_RWB ? 'RWB' : 'GWR'}
                          </span>
                        )}
                        {isSelected && <span className="text-[#c9a84c] text-lg">✓</span>}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Draft Action Panel */}
          {selectedPlayer && currentTurn && !isDraftComplete && (
            <div className="bg-[#1a4731] rounded-2xl p-5 text-[#f5f0e8]">
              <div className="text-[#c9a84c] text-xs font-semibold uppercase tracking-wider mb-1">
                Now Drafting — Pick #{pickNumber + 1}
              </div>
              <div className="font-bold text-xl mb-0.5">{selectedPlayer.name}</div>
              <div className="text-[#f5f0e8]/50 text-sm mb-4">Handicap {selectedPlayer.handicap}</div>
              <button
                onClick={assignToCurrentTeam}
                className={`w-full font-bold text-sm px-4 py-3 rounded-xl transition-colors shadow ${
                  currentTurn === TEAM_RWB
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Draft to {currentTurn}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Team Boards + Log */}
        <div className="lg:col-span-2 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <TeamBoard
              name={TEAM_RWB}
              captain="Ryan Parker"
              players={rwbPlayers}
              isOnClock={currentTurn === TEAM_RWB}
              isDraftComplete={isDraftComplete}
              headerBg="bg-red-700"
              borderColor="border-red-200"
              cardBg="bg-red-50"
              badgeClass="bg-red-100 text-red-700"
              onUndo={undoDraft}
            />
            <TeamBoard
              name={TEAM_GWR}
              captain="Cole Dominguez"
              players={gwrPlayers}
              isOnClock={currentTurn === TEAM_GWR}
              isDraftComplete={isDraftComplete}
              headerBg="bg-green-700"
              borderColor="border-green-200"
              cardBg="bg-green-50"
              badgeClass="bg-green-100 text-green-700"
              onUndo={undoDraft}
            />
          </div>

          {/* Draft Log */}
          <div className="bg-white rounded-2xl border border-[#c9a84c]/20 shadow-sm overflow-hidden">
            <div className="bg-[#1a4731] px-5 py-3 flex items-center justify-between">
              <h3 className="text-[#c9a84c] font-bold">Draft Log</h3>
              <span className="text-[#f5f0e8]/40 text-xs">{pickNumber} picks made</span>
            </div>
            <div className="divide-y divide-[#f5f0e8] max-h-56 overflow-y-auto">
              {draftLog.length === 0 ? (
                <div className="px-5 py-6 text-sm text-[#1a4731]/40 text-center">
                  No picks yet — start drafting!
                </div>
              ) : (
                draftLog.map((entry, i) => {
                  const isUndo = entry.startsWith('↩');
                  return (
                    <div
                      key={i}
                      className={`px-5 py-2.5 text-sm flex items-start gap-2 ${
                        isUndo ? 'text-[#1a4731]/40 italic' : 'text-[#1a4731]/75'
                      }`}
                    >
                      <span
                        className={`shrink-0 font-mono text-xs mt-0.5 ${
                          isUndo ? 'text-[#1a4731]/30' : 'text-[#c9a84c]'
                        }`}
                      >
                        {isUndo ? '↩' : `#${draftLog.filter((e, j) => j >= i && !e.startsWith('↩')).length}`}
                      </span>
                      <span>{isUndo ? entry.substring(3) : entry.replace(/^Pick #\d+ — /, '')}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
