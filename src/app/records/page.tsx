import { tournamentRecords, notableRecords } from '@/data/records';

export default function RecordsPage() {
  const champions = tournamentRecords.filter(r => r.champion !== null);
  const totalTitles: Record<string, number> = {};
  champions.forEach(r => {
    if (r.champion) {
      totalTitles[r.champion] = (totalTitles[r.champion] || 0) + 1;
    }
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="text-[#c9a84c] font-semibold uppercase tracking-widest text-sm mb-2">RGAO History</div>
        <h1 className="text-4xl font-bold text-[#1a4731] mb-1">Historic Records</h1>
        <p className="text-[#1a4731]/60">Past champions, year-by-year results, and notable achievements</p>
      </div>

      {/* Hall of Champions */}
      <div className="bg-white rounded-2xl border border-[#c9a84c]/20 shadow-sm overflow-hidden mb-8">
        <div className="bg-[#1a4731] px-6 py-4">
          <h2 className="text-[#c9a84c] font-bold text-lg">🏆 Roll of Champions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {tournamentRecords.filter(r => r.champion).map(record => (
            <div key={record.year} className="bg-[#f5f0e8] rounded-xl p-4 border border-[#c9a84c]/20">
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl font-bold text-[#c9a84c]">{record.year}</span>
                <span className="bg-[#1a4731] text-[#c9a84c] text-xs font-bold px-2 py-1 rounded-full">
                  {record.score}
                </span>
              </div>
              <div className="font-bold text-[#1a4731]">{record.champion}</div>
              <div className="text-[#1a4731]/60 text-sm mt-1">Total: {record.total} strokes</div>
            </div>
          ))}
          {tournamentRecords.filter(r => !r.champion).map(record => (
            <div key={record.year} className="bg-gray-50 rounded-xl p-4 border border-gray-200 opacity-60">
              <div className="text-2xl font-bold text-gray-400 mb-2">{record.year}</div>
              <div className="font-medium text-gray-500">{record.notes}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Year by Year Table */}
      <div className="bg-white rounded-2xl border border-[#c9a84c]/20 shadow-sm overflow-hidden mb-8">
        <div className="bg-[#1a4731] px-6 py-4">
          <h2 className="text-[#c9a84c] font-bold text-lg">📅 Year-by-Year Results</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f0e8] border-b border-[#c9a84c]/20">
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">Champion</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1a4731]/60 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody>
              {tournamentRecords.map((record, index) => (
                <tr key={record.year} className={`border-b border-[#f5f0e8] hover:bg-[#f5f0e8]/50 transition-colors ${index === 0 ? 'bg-[#c9a84c]/10' : ''}`}>
                  <td className="px-6 py-4 font-bold text-[#1a4731]">{record.year}</td>
                  <td className="px-6 py-4">
                    {record.champion ? (
                      <div className="flex items-center gap-2">
                        {index === 0 && <span className="text-[#c9a84c]">🏆</span>}
                        <span className="font-medium text-[#1a4731]">{record.champion}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {record.score ? (
                      <span className="font-bold text-red-600">{record.score}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-[#1a4731]/70">
                    {record.total || '—'}
                  </td>
                  <td className="px-6 py-4 text-[#1a4731]/50 text-sm">{record.notes || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notable Records */}
      <div className="bg-white rounded-2xl border border-[#c9a84c]/20 shadow-sm overflow-hidden">
        <div className="bg-[#1a4731] px-6 py-4">
          <h2 className="text-[#c9a84c] font-bold text-lg">⭐ Notable Records</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
          {notableRecords.map(record => (
            <div key={record.record} className="flex items-start gap-4 bg-[#f5f0e8] rounded-xl p-4 border border-[#c9a84c]/20">
              <div className="bg-[#c9a84c] text-[#1a4731] rounded-lg p-2 text-xl flex-shrink-0">🏅</div>
              <div>
                <div className="text-xs font-semibold text-[#1a4731]/50 uppercase tracking-wider mb-1">{record.record}</div>
                <div className="font-bold text-[#1a4731]">{record.value}</div>
                <div className="text-sm text-[#1a4731]/60">{record.holder} ({record.year})</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
