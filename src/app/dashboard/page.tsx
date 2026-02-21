import { players } from '@/data/players';

function getTotal(scores: number[]) {
  return scores.reduce((a, b) => a + b, 0);
}

function getToPar(total: number, par: number = 288) {
  const diff = total - par;
  if (diff === 0) return 'E';
  return diff > 0 ? `+${diff}` : `${diff}`;
}

export default function DashboardPage() {
  const sorted = [...players]
    .filter(p => p.scores && p.scores.length > 0)
    .sort((a, b) => getTotal(a.scores!) - getTotal(b.scores!));

  const leader = sorted[0];
  const leaderTotal = getTotal(leader.scores!);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="text-[#c9a84c] font-semibold uppercase tracking-widest text-sm mb-2">2024 RGAO</div>
        <h1 className="text-4xl font-bold text-[#1a4731] mb-1">Tournament Leaderboard</h1>
        <p className="text-[#1a4731]/60">Final Results — Eagle Ridge Country Club</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Tournament Leader', value: leader.nickname ? `"${leader.nickname}"` : leader.name.split(' ')[0] },
          { label: 'Leader Score', value: getToPar(leaderTotal) },
          { label: 'Players in Field', value: sorted.length.toString() },
          { label: 'Rounds Complete', value: '4' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-[#c9a84c]/20 shadow-sm">
            <div className="text-2xl font-bold text-[#1a4731]">{stat.value}</div>
            <div className="text-[#1a4731]/60 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard Table */}
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
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">R1</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">R2</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">R3</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">R4</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">To Par</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((player, index) => {
                const total = getTotal(player.scores!);
                const toPar = getToPar(total);
                const isLeader = index === 0;
                return (
                  <tr key={player.id} className={`border-b border-[#f5f0e8] hover:bg-[#f5f0e8]/50 transition-colors ${isLeader ? 'bg-[#c9a84c]/10' : ''}`}>
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
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#1a4731]">{player.name}</div>
                      <div className="text-xs text-[#1a4731]/50">&ldquo;{player.nickname}&rdquo; · HCP: {player.handicap}</div>
                    </td>
                    {player.scores!.map((score, i) => (
                      <td key={i} className="px-4 py-3 text-center text-sm">
                        <span className={`inline-flex w-8 h-8 items-center justify-center rounded-full text-sm font-medium ${
                          score <= 66 ? 'bg-red-100 text-red-700' :
                          score <= 69 ? 'bg-green-100 text-green-700' :
                          score >= 74 ? 'bg-red-50 text-red-500' :
                          'text-[#1a4731]'
                        }`}>
                          {score}
                        </span>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center font-bold text-[#1a4731]">{total}</td>
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

      {/* Player Cards */}
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
    </div>
  );
}
