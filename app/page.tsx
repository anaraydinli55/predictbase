'use client';
import { useState, useEffect } from 'react';

// --- TİPLER ---
interface GoalEvent {
  player: string;
  minute: number;
}

interface Match {
  id: number;
  externalId: string; // Balldontlie ID
  date: string;
  timestamp: number;
  stage: string;
  home: { n: string; f: string; c: string };
  away: { n: string; f: string; c: string };
  result: string | null; // Sadece 90 dk skoru
  events: GoalEvent[];
}

export default function PredictBase() {
  const [matches, setMatches] = useState<Match[]>([
    { 
      id: 1, 
      externalId: "74321", // Örnek ID
      date: 'Thursday 11 June 2026', 
      timestamp: new Date('2026-06-11T23:00:00Z').getTime(),
      stage: 'Group A',
      home: { n: 'Mexico', c: 'MEX', f: '🇲🇽' }, 
      away: { n: 'South Africa', c: 'RSA', f: '🇿🇦' },
      result: null,
      events: []
    },
    // ... Buraya diğer 103 maç aynı formatta eklenecek
  ]);

  const [myPicks, setMyPicks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('matches');

  // --- OTOMATİK SORGULAMA MANTIĞI ---
  useEffect(() => {
    const checkUpdates = async () => {
      const now = Date.now();
      
      const matchesToUpdate = matches.filter(m => {
        const timePassed = now - m.timestamp;
        const hundredFiveMins = 105 * 60 * 1000;
        return timePassed > hundredFiveMins && !m.result;
      });

      for (const match of matchesToUpdate) {
        try {
          const res = await fetch(`/api/matches?matchId=${match.externalId}`);
          const apiData = await res.json();

          // Balldontlie API'den 90 dk skorunu ve golleri al
          // apiData.status === 'finished' kontrolü eklenebilir
          if (apiData.data) {
            const regulationScore = apiData.data.scores.ft; // "2-1" gibi
            const allEvents = apiData.data.events || [];
            
            // Sadece 90 dakika içindeki golleri filtrele
            const goals = allEvents
              .filter((e: any) => e.type === 'goal' && parseInt(e.minute) <= 90)
              .map((e: any) => ({ player: e.player_name, minute: parseInt(e.minute) }));

            updateMatchResult(match.id, regulationScore, goals);
          }
        } catch (err) {
          console.error("Update failed for match:", match.id);
        }
      }
    };

    const interval = setInterval(checkUpdates, 600000); // 10 dakikada bir
    checkUpdates(); // İlk yüklemede çalıştır
    return () => clearInterval(interval);
  }, [matches]);

  const updateMatchResult = (id: number, score: string, goals: GoalEvent[]) => {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, result: score, events: goals } : m));
    
    // Dashboard'daki WIN/LOSS durumunu güncelle
    setMyPicks(prev => prev.map(p => {
      if (p.matchId === id && p.status === 'pend') {
        const isWin = p.pred === score;
        return { ...p, status: isWin ? 'win' : 'lost', payout: isWin ? p.tickets * 15 : 0 };
      }
      return p;
    }));
  };

  return (
    <main className="min-h-screen bg-[#05070a] text-white font-sans pb-20">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#05070a]/90 backdrop-blur-md border-b border-white/10 p-4">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <h1 className="font-black text-xl text-[#00e87a] tracking-tighter italic">PREDICTBASE 2026</h1>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('matches')} className={`text-xs font-bold uppercase ${activeTab === 'matches' ? 'text-[#00e87a]' : 'text-gray-500'}`}>Matches</button>
            <button onClick={() => setActiveTab('picks')} className={`text-xs font-bold uppercase ${activeTab === 'picks' ? 'text-[#00e87a]' : 'text-gray-500'}`}>Dashboard</button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        {activeTab === 'matches' ? (
          <div className="grid gap-4">
            {matches.map(m => (
              <div key={m.id} className="bg-gradient-to-br from-white/10 to-transparent border border-white/5 rounded-3xl p-5">
                <div className="flex justify-between text-[9px] font-bold text-gray-500 uppercase mb-4">
                  <span>{m.stage} • 90 MIN ONLY</span>
                  <span className={m.result ? 'text-gray-600' : 'text-[#00e87a]'}>{m.date}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col items-center w-1/3">
                    <span className="text-3xl mb-1">{m.home.f}</span>
                    <span className="text-[10px] font-black uppercase text-center">{m.home.n}</span>
                  </div>

                  {m.result ? (
                    <div className="text-center">
                      <div className="text-3xl font-black text-[#00e87a] font-mono tracking-widest">{m.result}</div>
                      <div className="text-[7px] text-gray-600 font-bold uppercase">Final Result</div>
                    </div>
                  ) : (
                    <div className="text-xl font-black text-gray-800 italic">VS</div>
                  )}

                  <div className="flex flex-col items-center w-1/3">
                    <span className="text-3xl mb-1">{m.away.f}</span>
                    <span className="text-[10px] font-black uppercase text-center">{m.away.n}</span>
                  </div>
                </div>

                {/* GOL ATANLAR LİSTESİ */}
                {m.result && m.events.length > 0 && (
                  <div className="bg-black/30 rounded-xl p-3 mb-2 border border-white/5">
                    {m.events.map((e, idx) => (
                      <div key={idx} className="flex justify-between text-[9px] font-medium border-b border-white/5 py-1 last:border-0">
                        <span className="text-gray-400">⚽ {e.player}</span>
                        <span className="text-[#00e87a]">{e.minute}'</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {!m.result && (
                  <button className="w-full bg-[#00e87a] text-black font-black py-3 rounded-xl text-xs uppercase tracking-widest hover:scale-[0.98] transition-transform">
                    Predict Score
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* DASHBOARD KISMI */
          <div className="text-center py-20 text-gray-600 font-bold text-xs uppercase">
            Check your predictions here...
          </div>
        )}
      </div>
    </main>
  );
}
