'use client';

import { useState, useEffect } from 'react';
import { players as initialPlayers, Player } from '@/data/players';

const STORAGE_KEY = 'rgao-leaderboard-data';

function getTotal(scores: number[]) {
  return scores.reduce((a, b) => a + b, 0);
}

function getToPar(total: number, par: number = 288) {
  const diff = total - par;
  if (diff === 0) return 'E';
  return diff > 0 ? `+${diff}` : `${diff}`;
}

export default function DashboardPage() {
  const [hydrated, setHydrated] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [data, setData] = useState<Player[]>(initialPlayers);
  const [editData, setEditData] = useState<Player[]>(initialPlayers);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Player[];
        setData(parsed);
        setEditData(parsed);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const handleEnterEdit = () => {
    setEditData(data.map(p => ({ ...p, scores: [...(p.scores ?? [])] })));
    setEditMode(true);
  };

  const handleSave = () => {
    setData(editData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(editData));
    } catch {
      // ignore
    }
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditData(data.map(p => ({ ...p, scores: [...(p.scores ?? [])] })));
    setEditMode(false);
  };

  const updateField = (id: number, field: keyof Player, value: string | number) => {
    setEditData(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const updateScore = (id: number, roundIndex: number, value: string) => {
    const num = parseInt(value, 10);
    setEditData(prev => prev.map(p => {
      if (p.id !== id) return p;
      const scores = [...(p.scores ?? [])];
      scores[roundIndex] = isNaN(num) ? 0 : num;
      return { ...p, scores };
    }));
  };

  if (!hydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-[#1a4731]/40 text-sm">
        Loading leaderboard...
      </div>
    );
  }

  // Sort by current saved data; table order only updates on Save
  const sorted = [...data]
    .filter(p => p.scores && p.scores.length > 0)
    .sort((a, b) => getTotal(a.scores!) - getTotal(b.scores!));

  const maxRounds = Math.max(...sorted.map(p => p.scores?.length ?? 0), 0);
  const roundLabels = Array.from({ length: maxRounds }, (_, i) => `R${i + 1}`);

  const leader = sorted[0];
  const leaderTotal = leader ? getTotal(leader.scores!) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* ── Header ── */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[#c9a84c] font-semibold uppercase tracking-widest text-sm mb-2">2026 RGAO</div>
          <h1 className="text-4xl font-bold text-[#1a4731] mb-1">Tournament Leaderboard</h1>
          <p className="text-[#1a4731]/60">Eagle Ridge Country Club</p>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-[#1a4731]/20 text-[#1a4731]/60 hover:border-[#1a4731]/40 hover:text-[#1a4731] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#1a4731] text-[#c9a84c] hover:bg-[#1a4731]/90 transition-colors"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={handleEnterEdit}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-[#c9a84c]/40 text-[#1a4731] hover:bg-[#c9a84c]/10 transition-colors"
            >
              Edit Leaderboard
            </button>
          )}
        </div>
      </div>

      {/* ── Edit mode notice ── */}
      {editMode && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <strong>Edit Mode on.</strong> Update any field below, then click <strong>Save Changes</strong> to persist.
        </div>
      )}

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Tournament Leader', value: leader ? (leader.nickname ? `"${leader.nickname}"` : leader.name.split(' ')[0]) : '—' },
          { label: 'Leader Score', value: leader ? getToPar(leaderTotal) : '—' },
          { label: 'Players in Field', value: sorted.length.toString() },
          { label: 'Rounds Complete', value: maxRounds.toString() },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-[#c9a84c]/20 shadow-sm">
            <div className="text-2xl font-bold text-[#1a4731]">{stat.value}</div>
            <div className="text-[#1a4731]/60 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Leaderboard Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#c9a84c]/20 overflow-hidden mb-8">
        <div className="bg-[#1a4731] px-6 py-4">
          <h2 className="text-[#c9a84c] font-bold text-lg">Full Leaderboard</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f0e8] border-b border-[#c9a84c]/20">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">Pos</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">Player</th>
                {roundLabels.map(r => (
                  <th key={r} className="px-4 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">{r}</th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">To Par</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((player, index) => {
                const total = getTotal(player.scores!);
                const toPar = getToPar(total);
                const isLeader = index === 0;
                const ep = editMode ? (editData.find(p => p.id === player.id) ?? player) : player;
                return (
                  <tr
                    key={player.id}
                    className={`border-b border-[#f5f0e8] hover:bg-[#f5f0e8]/50 transition-colors ${isLeader && !editMode ? 'bg-[#c9a84c]/10' : ''}`}
                  >
                    {/* Position */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                        index === 0 ? 'bg-[#c9a84c] text-[#1a4731]' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'text-[#1a4731]/60'
                      }`}>
                        {index + 1}
                      </span>
                    </td>

                    {/* Player info */}
                    <td className="px-4 py-3">
                      {editMode ? (
                        <div className="space-y-1 min-w-[160px]">
                          <input
                            value={ep.name}
                            onChange={e => updateField(player.id, 'name', e.target.value)}
                            className="w-full text-sm font-semibold text-[#1a4731] border border-[#c9a84c]/40 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                          />
                          <div className="flex gap-1">
                            <input
                              value={ep.nickname ?? ''}
                              onChange={e => updateField(player.id, 'nickname', e.target.value)}
                              placeholder="Nickname"
                              className="flex-1 text-xs text-[#1a4731]/60 border border-[#c9a84c]/20 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                            />
                            <input
                              type="number"
                              value={ep.handicap}
                              onChange={e => updateField(player.id, 'handicap', parseInt(e.target.value) || 0)}
                              placeholder="HCP"
                              className="w-14 text-xs text-center text-[#1a4731]/60 border border-[#c9a84c]/20 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="font-semibold text-[#1a4731]">{player.name}</div>
                          <div className="text-xs text-[#1a4731]/50">&ldquo;{player.nickname}&rdquo; · HCP: {player.handicap}</div>
                        </>
                      )}
                    </td>

                    {/* Round scores */}
                    {roundLabels.map((_, ri) => {
                      const score = player.scores?.[ri];
                      const epScore = ep.scores?.[ri];
                      return (
                        <td key={ri} className="px-4 py-3 text-center text-sm">
                          {editMode ? (
                            <input
                              type="number"
                              value={epScore ?? ''}
                              onChange={e => updateScore(player.id, ri, e.target.value)}
                              className="w-14 text-center text-sm border border-[#c9a84c]/40 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                            />
                          ) : (
                            <span className={`inline-flex w-8 h-8 items-center justify-center rounded-full text-sm font-medium ${
                              score !== undefined && score <= 66 ? 'bg-red-100 text-red-700' :
                              score !== undefined && score <= 69 ? 'bg-green-100 text-green-700' :
                              score !== undefined && score >= 74 ? 'bg-red-50 text-red-500' :
                              'text-[#1a4731]'
                            }`}>
                              {score ?? '—'}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* Total */}
                    <td className="px-4 py-3 text-center font-bold text-[#1a4731]">{total}</td>

                    {/* To Par */}
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold text-lg ${
                        toPar.startsWith('-') ? 'text-red-600' :
                        toPar === 'E' ? 'text-[#1a4731]' :
                        'text-gray-500'
                      }`}>
                        {toPar}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Player Cards (read-only) ── */}
      {!editMode && (
        <div>
          <h2 className="text-2xl font-bold text-[#1a4731] mb-4">Player Profiles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.slice(0, 6).map((player, index) => {
              const total = getTotal(player.scores!);
              return (
                <div key={player.id} className="bg-white rounded-xl p-5 border border-[#c9a84c]/20 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-[#1a4731]">{player.name}</div>
                      <div className="text-[#c9a84c] text-sm font-medium">&ldquo;{player.nickname}&rdquo;</div>
                    </div>
                    <span className={`text-2xl font-bold ${getToPar(total).startsWith('-') ? 'text-red-600' : 'text-gray-500'}`}>
                      {getToPar(total)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-[#1a4731]/60">
                    <span>HCP: {player.handicap}</span>
                    <span>Position: #{index + 1}</span>
                    <span>Total: {total}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
