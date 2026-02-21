'use client';

import { useState } from 'react';
import { players as initialPlayers, teams, Player } from '@/data/players';

export default function DraftPage() {
  const [playerList, setPlayerList] = useState<Player[]>(initialPlayers);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [draftLog, setDraftLog] = useState<string[]>([]);

  const availablePlayers = playerList.filter(p => p.team === null);
  const draftedPlayers = playerList.filter(p => p.team !== null);

  function assignToTeam(team: string) {
    if (!selectedPlayer) return;
    setPlayerList(prev =>
      prev.map(p => p.id === selectedPlayer.id ? { ...p, team } : p)
    );
    setDraftLog(prev => [`${team} drafted ${selectedPlayer.name} ("${selectedPlayer.nickname}")`, ...prev]);
    setSelectedPlayer(null);
  }

  function undoDraft(playerId: number) {
    const player = playerList.find(p => p.id === playerId);
    if (!player) return;
    setPlayerList(prev => prev.map(p => p.id === playerId ? { ...p, team: null } : p));
    setDraftLog(prev => [`↩ ${player.name} returned to available pool`, ...prev]);
  }

  function resetDraft() {
    setPlayerList(initialPlayers.map(p => ({ ...p, team: null })));
    setDraftLog([]);
    setSelectedPlayer(null);
  }

  const teamColors: Record<string, string> = {
    'The Eagles': 'bg-blue-50 border-blue-300 text-blue-800',
    'The Birdies': 'bg-green-50 border-green-300 text-green-800',
    'The Bogeys': 'bg-red-50 border-red-300 text-red-800',
    'The Pars': 'bg-purple-50 border-purple-300 text-purple-800',
  };

  const teamHeaderColors: Record<string, string> = {
    'The Eagles': 'bg-blue-600',
    'The Birdies': 'bg-green-600',
    'The Bogeys': 'bg-red-600',
    'The Pars': 'bg-purple-600',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[#c9a84c] font-semibold uppercase tracking-widest text-sm mb-2">2024 RGAO</div>
          <h1 className="text-4xl font-bold text-[#1a4731] mb-1">Fantasy Draft Board</h1>
          <p className="text-[#1a4731]/60">Select a player then assign them to a team</p>
        </div>
        <button
          onClick={resetDraft}
          className="bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
        >
          Reset Draft
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Available Players */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-[#c9a84c]/20 shadow-sm overflow-hidden">
            <div className="bg-[#1a4731] px-5 py-4 flex items-center justify-between">
              <h2 className="text-[#c9a84c] font-bold">Available Players</h2>
              <span className="bg-[#c9a84c] text-[#1a4731] text-xs font-bold px-2 py-1 rounded-full">{availablePlayers.length}</span>
            </div>
            <div className="divide-y divide-[#f5f0e8]">
              {availablePlayers.length === 0 ? (
                <div className="px-5 py-8 text-center text-[#1a4731]/50 text-sm">All players have been drafted!</div>
              ) : (
                availablePlayers.map(player => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayer(selectedPlayer?.id === player.id ? null : player)}
                    className={`w-full px-5 py-3 text-left hover:bg-[#f5f0e8] transition-colors flex items-center justify-between ${
                      selectedPlayer?.id === player.id ? 'bg-[#c9a84c]/20 border-l-4 border-[#c9a84c]' : ''
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-[#1a4731] text-sm">{player.name}</div>
                      <div className="text-xs text-[#1a4731]/50">&ldquo;{player.nickname}&rdquo; · HCP {player.handicap}</div>
                    </div>
                    {selectedPlayer?.id === player.id && (
                      <span className="text-[#c9a84c] text-lg">✓</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Draft Action Panel */}
          {selectedPlayer && (
            <div className="mt-4 bg-[#1a4731] rounded-2xl p-5 text-[#f5f0e8]">
              <div className="mb-3">
                <div className="text-[#c9a84c] text-xs font-semibold uppercase tracking-wider mb-1">Drafting</div>
                <div className="font-bold text-lg">{selectedPlayer.name}</div>
                <div className="text-[#f5f0e8]/60 text-sm">&ldquo;{selectedPlayer.nickname}&rdquo; · HCP {selectedPlayer.handicap}</div>
              </div>
              <div className="text-[#f5f0e8]/70 text-xs mb-3">Assign to team:</div>
              <div className="grid grid-cols-2 gap-2">
                {teams.map(team => (
                  <button
                    key={team}
                    onClick={() => assignToTeam(team)}
                    className="bg-[#c9a84c] text-[#1a4731] font-semibold text-sm px-3 py-2 rounded-lg hover:bg-[#b8943a] transition-colors"
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Team Boards */}
        <div className="lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-4">
            {teams.map(team => {
              const teamPlayers = draftedPlayers.filter(p => p.team === team);
              return (
                <div key={team} className={`rounded-2xl border overflow-hidden shadow-sm ${teamColors[team] || 'bg-gray-50 border-gray-200'}`}>
                  <div className={`px-5 py-3 flex items-center justify-between ${teamHeaderColors[team] || 'bg-gray-600'}`}>
                    <h3 className="text-white font-bold">{team}</h3>
                    <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">{teamPlayers.length}/3</span>
                  </div>
                  <div className="p-3 space-y-2 min-h-[120px]">
                    {teamPlayers.length === 0 ? (
                      <div className="text-center py-6 text-sm opacity-50">No players drafted yet</div>
                    ) : (
                      teamPlayers.map(player => (
                        <div key={player.id} className="bg-white rounded-lg px-3 py-2 flex items-center justify-between shadow-sm">
                          <div>
                            <div className="font-semibold text-[#1a4731] text-sm">{player.name}</div>
                            <div className="text-xs text-[#1a4731]/50">&ldquo;{player.nickname}&rdquo; · HCP {player.handicap}</div>
                          </div>
                          <button
                            onClick={() => undoDraft(player.id)}
                            className="text-red-400 hover:text-red-600 text-sm transition-colors"
                            title="Remove from team"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Draft Log */}
          <div className="mt-6 bg-white rounded-2xl border border-[#c9a84c]/20 shadow-sm overflow-hidden">
            <div className="bg-[#1a4731] px-5 py-3">
              <h3 className="text-[#c9a84c] font-bold">Draft Log</h3>
            </div>
            <div className="divide-y divide-[#f5f0e8] max-h-48 overflow-y-auto">
              {draftLog.length === 0 ? (
                <div className="px-5 py-4 text-sm text-[#1a4731]/50 text-center">No picks yet — start drafting!</div>
              ) : (
                draftLog.map((entry, i) => (
                  <div key={i} className="px-5 py-2 text-sm text-[#1a4731]/70">
                    <span className="text-[#c9a84c] font-mono text-xs mr-2">#{draftLog.length - i}</span>
                    {entry}
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
