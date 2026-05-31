'use client';
import { useState, useEffect } from 'react';

// --- VERİ YAPISI ---
const INITIAL_MATCHES = [
    { id: 1, externalId: "1001", date: 'Thursday 11 June 2026', timestamp: new Date('2026-06-11T23:00:00Z').getTime(), stage: 'Group A', stadium: 'Mexico City', home: { n: 'Mexico', c: 'MEX', f: '🇲🇽' }, away: { n: 'South Africa', c: 'RSA', f: '🇿🇦' }, result: null, events: [] },
    { id: 2, externalId: "1002", date: 'Friday 12 June 2026', timestamp: new Date('2026-06-12T06:00:00Z').getTime(), stage: 'Group A', stadium: 'Guadalajara', home: { n: 'Korea Republic', c: 'KOR', f: '🇰🇷' }, away: { n: 'Czechia', c: 'CZE', f: '🇨🇿' }, result: null, events: [] },
    { id: 3, externalId: "1003", date: 'Friday 12 June 2026', timestamp: new Date('2026-06-12T23:00:00Z').getTime(), stage: 'Group B', stadium: 'Toronto', home: { n: 'Canada', c: 'CAN', f: '🇨🇦' }, away: { n: 'Bosnia and Herz.', c: 'BIH', f: '🇧🇦' }, result: null, events: [] },
    // Diğer 101 maç buraya aynı formatta eklenecek...
];

export default function PredictBase() {
    const [matches, setMatches] = useState(INITIAL_MATCHES);
    const [myPicks, setMyPicks] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('matches');
    const [search, setSearch] = useState('');
    const [modalMatch, setModalMatch] = useState<any>(null);

    // --- OTOMATİK SKOR SORGULAMA ---
    useEffect(() => {
        const fetchResults = async () => {
            const now = Date.now();
            const hundredFiveMins = 105 * 60 * 1000;

            const pendingMatches = matches.filter(m => !m.result && (now - m.timestamp) > hundredFiveMins);

            for (const m of pendingMatches) {
                try {
                    const res = await fetch(`/api/matches?matchId=${m.externalId}`);
                    const data = await res.json();

                    if (data.score) {
                        updateMatchAndPicks(m.id, data.score, data.events);
                    }
                } catch (e) { console.error("Update failed", m.id); }
            }
        };

        const interval = setInterval(fetchResults, 600000); // 10 dakikada bir
        fetchResults();
        return () => clearInterval(interval);
    }, [matches]);

    const updateMatchAndPicks = (matchId: number, score: string, events: any[]) => {
        setMatches(prev => prev.map(m => m.id === matchId ? { ...m, result: score, events } : m));
        setMyPicks(prev => prev.map(p => {
            if (p.matchId === matchId && p.status === 'pend') {
                const isWin = p.pred === score;
                return { ...p, status: isWin ? 'win' : 'lost', payout: isWin ? p.tickets * 15 : 0 };
            }
            return p;
        }));
    };

    // --- DASHBOARD HESAPLAMA ---
    const stats = {
        wins: myPicks.filter(p => p.status === 'win').length,
        lost: myPicks.filter(p => p.status === 'lost').length,
        pend: myPicks.filter(p => p.status === 'pend').length,
        earned: myPicks.reduce((s, p) => s + (p.payout || 0), 0)
    };

    return (
        <div className="min-h-screen bg-[#05070a] text-white pb-20">
            {/* HEADER */}
            <div className="sticky top-0 z-50 bg-[#05070a]/95 border-b border-white/5 backdrop-blur-md px-4 py-3">
                <div className="flex justify-between items-center mb-3">
                    <div className="font-display text-lg font-black text-[#00e87a] uppercase italic">⚽ PREDICTBASE 2026</div>
                    <div className="text-[9px] font-bold border border-[#00e87a]/20 px-3 py-1 rounded-lg text-[#00e87a] uppercase">Connect</div>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setActiveTab('matches')} className={`text-[10px] font-bold uppercase pb-1 border-b-2 transition-all ${activeTab === 'matches' ? 'border-[#00e87a] text-[#00e87a]' : 'border-transparent text-gray-500'}`}>Matches</button>
                    <button onClick={() => setActiveTab('picks')} className={`text-[10px] font-bold uppercase pb-1 border-b-2 transition-all ${activeTab === 'picks' ? 'border-[#00e87a] text-[#00e87a]' : 'border-transparent text-gray-500'}`}>My Picks</button>
                </div>
            </div>

            <div className="p-4 max-w-xl mx-auto">
                {activeTab === 'matches' ? (
                    <>
                        <input onChange={(e) => setSearch(e.target.value)} type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs mb-4 outline-none focus:border-[#00e87a]" placeholder="Search teams..." />
                        <div className="grid gap-4">
                            {matches.filter(m => m.home.n.toLowerCase().includes(search.toLowerCase()) || m.away.n.toLowerCase().includes(search.toLowerCase())).map(m => (
                                <div key={m.id} className="bg-gradient-to-br from-white/10 to-transparent border border-white/5 rounded-[24px] p-5">
                                    <div className="flex justify-between text-[8px] font-bold text-gray-500 uppercase mb-4 tracking-widest">
                                        <span>{m.stage} • 90 MIN ONLY</span>
                                        <span className={m.result ? 'text-gray-600' : 'text-[#00e87a]'}>{m.date}</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex flex-col items-center w-1/3">
                                            <span className="text-3xl mb-1">{m.home.f}</span>
                                            <span className="text-[10px] font-black uppercase text-center">{m.home.n}</span>
                                        </div>
                                        {m.result ? (
                                            <div className="text-center">
                                                <div className="text-3xl font-black text-[#00e87a] font-mono tracking-tighter">{m.result}</div>
                                                <div className="text-[7px] text-gray-600 font-bold uppercase">Final Score</div>
                                            </div>
                                        ) : (
                                            <div className="text-xl font-black text-gray-800 italic">VS</div>
                                        )}
                                        <div className="flex flex-col items-center w-1/3">
                                            <span className="text-3xl mb-1">{m.away.f}</span>
                                            <span className="text-[10px] font-black uppercase text-center">{m.away.n}</span>
                                        </div>
                                    </div>

                                    {/* GOAL DETAILS */}
                                    {m.result && m.events.length > 0 && (
                                        <div className="bg-black/40 rounded-xl p-2 mb-3 border border-white/5">
                                            {m.events.map((e:any, i:number) => (
                                                <div key={i} className="flex justify-between text-[8px] font-bold py-0.5 px-1">
                                                    <span className="text-gray-400">⚽ {e.player}</span>
                                                    <span className="text-[#00e87a]">{e.minute}'</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center border-t border-white/5 pt-3">
                                        <span className="text-[8px] font-bold text-gray-600 uppercase">Pool: {m.result ? 'Closed' : '0 USDC'}</span>
                                        {!m.result && (
                                            <button onClick={() => setModalMatch(m)} className="bg-gradient-to-r from-[#00e87a] to-[#00b85e] text-[#03100a] px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider">Predict</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    /* DASHBOARD VIEW */
                    <div className="grid gap-4">
                        <div className="grid grid-cols-4 gap-2">
                            <div className="bg-white/5 rounded-2xl p-3 text-center"><div className="text-[#00e87a] font-black">{stats.wins}</div><div className="text-[7px] text-gray-500 uppercase font-bold">Wins</div></div>
                            <div className="bg-white/5 rounded-2xl p-3 text-center"><div className="text-red-500 font-black">{stats.lost}</div><div className="text-[7px] text-gray-500 uppercase font-bold">Lost</div></div>
                            <div className="bg-white/5 rounded-2xl p-3 text-center"><div className="text-yellow-500 font-black">{stats.pend}</div><div className="text-[7px] text-gray-500 uppercase font-bold">Pend</div></div>
                            <div className="bg-white/5 rounded-2xl p-3 text-center"><div className="text-white font-black">${stats.earned}</div><div className="text-[7px] text-gray-500 uppercase font-bold">Earned</div></div>
                        </div>
                        {myPicks.length === 0 ? (
                            <div className="text-center py-20 text-gray-600 font-bold text-xs">No predictions made yet.</div>
                        ) : (
                            myPicks.map((p, i) => {
                                const m = matches.find(match => match.id === p.matchId);
                                return (
                                    <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                                        <div>
                                            <div className="text-[10px] font-black uppercase">{m?.home.n} vs {m?.away.n}</div>
                                            <div className="text-[9px] text-gray-500 font-bold uppercase">Pred: <span className="text-white">{p.pred}</span> • {p.tickets} Tix</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase mb-1 ${p.status === 'win' ? 'bg-[#00e87a]/20 text-[#00e87a]' : p.status === 'lost' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{p.status}</div>
                                            {p.status === 'win' && <div className="text-[#00e87a] font-black text-xs">+${p.payout}</div>}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* PREDICTION MODAL */}
            {modalMatch && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-lg flex items-end justify-center">
                    <div className="w-full max-w-xl bg-[#0c1016] rounded-t-[32px] p-8 animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between mb-8">
                            <h2 className="text-lg font-black uppercase">{modalMatch.home.c} VS {modalMatch.away.c}</h2>
                            <button onClick={() => setModalMatch(null)} className="text-gray-500">✕</button>
                        </div>
                        <div className="flex justify-center gap-8 mb-8">
                            <div className="flex flex-col items-center">
                                <div className="text-3xl mb-3">{modalMatch.home.f}</div>
                                <input id="sh" type="number" defaultValue="0" className="w-16 h-16 bg-white/10 border-2 border-white/10 rounded-2xl text-center text-2xl font-black focus:border-[#00e87a] outline-none" />
                                <span className="text-[8px] text-[#00e87a] font-bold uppercase mt-2">Type Score</span>
                            </div>
                            <div className="text-3xl font-black text-gray-800 mt-4">—</div>
                            <div className="flex flex-col items-center">
                                <div className="text-3xl mb-3">{modalMatch.away.f}</div>
                                <input id="sa" type="number" defaultValue="0" className="w-16 h-16 bg-white/10 border-2 border-white/10 rounded-2xl text-center text-2xl font-black focus:border-[#00e87a] outline-none" />
                                <span className="text-[8px] text-[#00e87a] font-bold uppercase mt-2">Type Score</span>
                            </div>
                        </div>
                        <button onClick={() => {
                            const h = (document.getElementById('sh') as HTMLInputElement).value;
                            const a = (document.getElementById('sa') as HTMLInputElement).value;
                            setMyPicks([{ matchId: modalMatch.id, pred: `${h}-${a}`, tickets: 1, status: 'pend', payout: 0 }, ...myPicks]);
                            setModalMatch(null);
                        }} className="w-full bg-[#00e87a] text-[#03100a] py-4 rounded-2xl font-black uppercase text-sm tracking-widest">Deploy Prediction</button>
                    </div>
                </div>
            )}
        </div>
    );
}
