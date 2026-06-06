import { useEffect, useState } from 'react';
import { Trophy, Medal, RefreshCw } from 'lucide-react';
import http from '@/api/http';

interface LeaderboardEntry {
  _id: string;
  userName: string;
  userEmail: string;
  overallScore: number;
  metrics?: Record<string, number>;
  formFilled: boolean;
  createdAt: string;
}

export default function HackathonLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hackathonTitle, setHackathonTitle] = useState('Hackathon');

  useEffect(() => {
    (async () => {
      try {
        const [lbRes, cfgRes] = await Promise.all([
          http.get('/hackathon/leaderboard?limit=100'),
          http.get('/hackathon/config'),
        ]);
        setEntries(Array.isArray(lbRes.data) ? lbRes.data : []);
        if (cfgRes.data?.title) setHackathonTitle(cfgRes.data.title);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getMedalColor = (rank: number) => {
    if (rank === 1) return '#F59E0B';
    if (rank === 2) return '#94A3B8';
    if (rank === 3) return '#B45309';
    return '#6B7280';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 dark:text-green-400';
    if (score >= 60) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-10">
      {/* Page header — matches existing dashboard style */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Trophy size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              {hackathonTitle} — Leaderboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {entries.length} participant{entries.length !== 1 ? 's' : ''} ranked by interview score
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 dark:text-gray-500">
          <RefreshCw size={20} className="animate-spin mr-3" /> Loading rankings…
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-24">
          <Trophy size={44} className="text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <div className="text-gray-500 dark:text-gray-400 font-semibold">No results yet</div>
          <div className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Be the first to complete the hackathon interview!
          </div>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {entries.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
              {([1, 0, 2] as const).map((i) => {
                const e = entries[i];
                if (!e) return null;
                const rank = i + 1;
                const heights = ['h-24', 'h-32', 'h-20'];
                const podiumH = i === 0 ? heights[1] : i === 1 ? heights[0] : heights[2];
                return (
                  <div key={e._id} className={`flex flex-col items-center ${i === 0 ? 'order-2' : i === 1 ? 'order-1' : 'order-3'}`}>
                    <div
                      className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow border-2 flex items-center justify-center mb-2"
                      style={{ borderColor: getMedalColor(rank) }}
                    >
                      <span className="font-black text-base" style={{ color: getMedalColor(rank) }}>{rank}</span>
                    </div>
                    <div className="text-center mb-2">
                      <div className="font-bold text-xs text-gray-900 dark:text-white truncate max-w-[90px]">{e.userName}</div>
                      <div className={`text-xl font-black ${getScoreColor(e.overallScore)}`}>{e.overallScore}</div>
                      <div className="text-[10px] text-gray-400">/ 100</div>
                    </div>
                    <div
                      className={`w-full ${podiumH} rounded-t-xl flex items-center justify-center`}
                      style={{ background: `${getMedalColor(rank)}18`, border: `1.5px solid ${getMedalColor(rank)}33` }}
                    >
                      <Medal size={18} style={{ color: getMedalColor(rank) }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full rankings table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">Full Rankings</h2>
              <span className="text-xs text-gray-400">{entries.length} participants</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {entries.map((entry, idx) => (
                <div
                  key={entry._id}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  {/* Rank */}
                  <div className="w-8 flex-shrink-0 text-center">
                    {idx < 3 ? (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center mx-auto"
                        style={{ background: `${getMedalColor(idx + 1)}18` }}
                      >
                        <Medal size={13} style={{ color: getMedalColor(idx + 1) }} />
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 font-bold text-sm">{idx + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm flex-shrink-0">
                    {entry.userName.charAt(0).toUpperCase()}
                  </div>

                  {/* Name & email */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">{entry.userName}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{entry.userEmail}</div>
                  </div>

                  {/* Metrics (desktop) */}
                  {entry.metrics && Object.keys(entry.metrics).length > 0 && (
                    <div className="hidden md:flex gap-2 flex-wrap">
                      {Object.entries(entry.metrics).slice(0, 3).map(([k, v]) => (
                        <span
                          key={k}
                          className="text-xs px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        >
                          {k.replace(/([A-Z])/g, ' $1').trim()}: {v}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xl font-black ${getScoreColor(entry.overallScore)}`}>
                      {entry.overallScore}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500">/ 100</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
