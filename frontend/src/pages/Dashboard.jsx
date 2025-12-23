import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Cell } from 'recharts';
import { LogOut, TrendingUp, Zap, Activity, BarChart3, Target, Trophy, X, MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Reliable Image Component (Prevents broken images)
const SecureImage = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = useState(src);
  return <img src={imgSrc} alt={alt} className={className} onError={() => setImgSrc("https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=400")} />;
};

export default function Dashboard() {
  const [match, setMatch] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [players, setPlayers] = useState([]);
  const [news, setNews] = useState([]);
  const [standings, setStandings] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchRes, playersRes, newsRes, analyticsRes, standingsRes, upcomingRes] = await Promise.all([
            axios.get('http://localhost:5000/api/cricket/match-status'),
            axios.get('http://localhost:5000/api/cricket/players'),
            axios.get('http://localhost:5000/api/cricket/news'),
            axios.get('http://localhost:5000/api/cricket/analytics'),
            axios.get('http://localhost:5000/api/cricket/standings'),
            axios.get('http://localhost:5000/api/cricket/upcoming')
        ]);
        
        setMatch(matchRes.data);
        setPlayers(playersRes.data);
        setNews(newsRes.data);
        setAnalytics(analyticsRes.data);
        setStandings(standingsRes.data);
        setUpcoming(upcomingRes.data);
      } catch (err) {
        console.error("Error loading dashboard data");
      }
    };
    fetchData();
  }, []);

  if (!match || !analytics) return <div className="min-h-screen bg-[#1e1b4b] flex items-center justify-center text-pink-400 font-bold animate-pulse text-xl">Loading Experience...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#0f172a] text-white font-sans selection:bg-pink-500/30">
      
      {/* NAVBAR */}
      <nav className="p-4 px-8 flex justify-between items-center bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg text-xl">SC</div>
          <h1 className="text-xl font-bold tracking-wider">SECURE<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-300">CRICKET</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-xs text-indigo-300 uppercase tracking-widest">Logged in as</p>
            <p className="font-bold text-white">{user.name}</p>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto p-6 space-y-8 pb-20">

        {/* 1. TOP STATS TICKER */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Projected Score", value: match.stats?.projected, icon: Target, color: "text-pink-400", bg: "bg-pink-500/10" },
              { label: "Win Probability", value: match.stats?.winProb, icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/10" },
              { label: "Current Run Rate", value: match.stats?.crr, icon: Activity, color: "text-green-400", bg: "bg-green-500/10" },
              { label: "Last Wicket", value: "KL Rahul", icon: BarChart3, color: "text-cyan-400", bg: "bg-cyan-500/10" },
            ].map((stat, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                key={i} className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-all"
              >
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon size={24} /></div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </motion.div>
            ))}
        </div>

        {/* 2. HERO LIVE SCORECARD */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative h-80 rounded-[30px] overflow-hidden shadow-2xl border border-white/10 group">
          <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-[3s]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e1b4b] via-[#1e1b4b]/80 to-transparent"></div>
          
          <div className="relative z-10 p-10 h-full flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-4">
                <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse tracking-widest shadow-lg shadow-red-500/50">● LIVE</span>
                <span className="text-indigo-200 text-sm font-semibold bg-white/5 px-3 py-1 rounded-full border border-white/10">{match.venue}</span>
             </div>
             <div className="flex flex-col md:flex-row justify-between gap-6">
                <div>
                   <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white drop-shadow-2xl">{match.match}</h2>
                   <p className="text-indigo-200 text-lg mt-2 font-medium">{match.homeTeam.name} Batting</p>
                </div>
                <div className="text-right bg-black/20 p-6 rounded-3xl backdrop-blur-md border border-white/10 shadow-xl">
                   <p className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-indigo-300">{match.homeTeam.score}</p>
                   <p className="text-pink-400 font-mono text-xl">{match.homeTeam.overs} Overs</p>
                </div>
             </div>
          </div>
        </motion.div>

        {/* 3. RECENT OVERS & PARTNERSHIP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/5">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider flex items-center gap-2"><Zap size={16} className="text-yellow-400"/> Recent Balls</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {analytics.recentOvers.map((ball, i) => (
                        <div key={i} className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 
                            ${ball.type === 'boundary' || ball.type === 'six' ? 'bg-green-500 text-black border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 
                              ball.type === 'wicket' ? 'bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-white/10 text-white border-white/20'}`}>
                            {ball.score}
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-indigo-300 uppercase mb-1">Current Partnership</h3>
                    <p className="text-3xl font-black text-white">{match.stats.partnership}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-full text-indigo-300 shadow-lg shadow-indigo-500/20"><Activity size={32} /></div>
            </div>
        </div>

        {/* 4. MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT COLUMN (Charts, Players, Standings) */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* CHARTS ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Run Progression */}
                    <div className="bg-[#0f172a]/40 p-6 rounded-3xl border border-white/5 shadow-xl">
                       <h3 className="mb-6 font-bold flex items-center gap-2 text-lg text-indigo-100"><TrendingUp size={20} className="text-pink-500" /> Run Graph</h3>
                       <div style={{ width: '100%', height: 250 }}>
                         <ResponsiveContainer>
                           <AreaChart data={analytics.runProgression}>
                             <defs>
                               <linearGradient id="colorRun" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                                 <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                               </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                             <XAxis dataKey="over" stroke="#94a3b8" tickLine={false} />
                             <YAxis stroke="#94a3b8" tickLine={false} />
                             <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}} />
                             <Area type="monotone" dataKey="runs" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorRun)" />
                           </AreaChart>
                         </ResponsiveContainer>
                       </div>
                    </div>

                    {/* Phase Analysis */}
                    <div className="bg-[#0f172a]/40 p-6 rounded-3xl border border-white/5 shadow-xl">
                       <h3 className="mb-6 font-bold flex items-center gap-2 text-lg text-indigo-100"><BarChart3 size={20} className="text-cyan-500" /> Phase Stats</h3>
                       <div style={{ width: '100%', height: 250 }}>
                         <ResponsiveContainer>
                           <BarChart data={analytics.phaseAnalysis}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                             <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} style={{fontSize: '10px'}} />
                             <YAxis stroke="#94a3b8" tickLine={false} />
                             <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}} />
                             <Bar dataKey="runs" radius={[6, 6, 0, 0]}>
                                {analytics.phaseAnalysis.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index === 0 ? '#22d3ee' : index === 1 ? '#818cf8' : '#f472b6'} />
                                ))}
                             </Bar>
                           </BarChart>
                         </ResponsiveContainer>
                       </div>
                    </div>
                </div>

                {/* PLAYERS LIST */}
                <div>
                    <h3 className="font-bold text-xl px-2 mb-4">On The Field</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {players.map((p, index) => (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.1 }} key={p.id} className="bg-white/5 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all border border-white/5 cursor-pointer group">
                                <SecureImage src={p.img} className="w-16 h-16 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform" />
                                <div>
                                    <h4 className="font-bold text-white group-hover:text-pink-400 transition-colors">{p.name}</h4>
                                    <p className="text-xs text-indigo-300">{p.role}</p>
                                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded mt-1 inline-block text-gray-300">{p.stats.runs ? `Runs: ${p.stats.runs}` : `Wickets: ${p.stats.wickets}`}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* TOURNAMENT STANDINGS */}
                <div>
                    <h3 className="font-bold text-xl px-2 mb-4">Points Table</h3>
                    <div className="bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden border border-white/5">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-black/20 text-indigo-300 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="p-4 font-medium">Rank</th>
                                    <th className="p-4 font-medium">Team</th>
                                    <th className="p-4 font-medium">P</th>
                                    <th className="p-4 font-medium">Won</th>
                                    <th className="p-4 font-medium text-right">Pts</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {standings.map((team) => (
                                    <tr key={team.rank} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-gray-400">#{team.rank}</td>
                                        <td className="p-4 font-bold flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${team.rank <= 4 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-gray-500'}`}></div> {team.team}
                                        </td>
                                        <td className="p-4 text-gray-400">{team.played}</td>
                                        <td className="p-4 text-gray-400">{team.won}</td>
                                        <td className="p-4 text-right font-black text-pink-400">{team.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN (Sidebar: Commentary, News, Upcoming) */}
            <div className="space-y-6">

                {/* LIVE COMMENTARY */}
                <div className="bg-white/5 rounded-3xl border border-white/5 p-6 h-fit">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-yellow-400" /> Commentary</h3>
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {analytics.commentary.map((comm, i) => (
                            <div key={i} className="flex gap-3 pb-3 border-b border-white/5 last:border-0">
                                <span className="font-mono font-bold text-xs text-pink-400 pt-1">{comm.over}</span>
                                <p className="text-sm text-gray-200 leading-snug">{comm.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* UPCOMING MATCHES */}
                <div className="bg-gradient-to-b from-indigo-900/40 to-black/40 rounded-3xl border border-white/5 p-6">
                     <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Calendar className="text-cyan-400" size={18} /> Upcoming</h3>
                     <div className="space-y-3">
                        {upcoming.map((match) => (
                            <div key={match.id} className="bg-white/5 p-4 rounded-xl flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer">
                                <div>
                                    <h4 className="font-bold text-xs text-white uppercase">{match.match}</h4>
                                    <p className="text-[10px] text-gray-400">{match.venue}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] bg-indigo-500/20 px-2 py-1 rounded text-indigo-300 font-bold">{match.date}</span>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>

                {/* NEWS FEED (Scrollable) */}
                <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/5 p-6 h-fit sticky top-24">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Zap className="text-pink-500" fill="currentColor" /> Trending News</h3>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {news.map((item, index) => (
                      <motion.div 
                        key={item.id} onClick={() => setSelectedNews(item)}
                        whileHover={{ scale: 1.02 }}
                        className="group bg-black/20 p-3 rounded-2xl border border-white/5 cursor-pointer hover:border-pink-500/30 transition-all flex gap-3"
                      >
                         <SecureImage src={item.img} className="w-14 h-14 rounded-lg object-cover opacity-80 group-hover:opacity-100 bg-gray-800" />
                         <div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mb-1 inline-block ${item.type === 'HOT' ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-300'}`}>{item.type}</span>
                            <h4 className="text-xs font-semibold leading-relaxed text-gray-200 group-hover:text-white line-clamp-2">{item.title}</h4>
                            <p className="text-[10px] text-gray-500 mt-1">{item.time}</p>
                         </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

            </div>
        </div>

      </div>

      {/* NEWS MODAL (Pop-up) */}
      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedNews(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div layoutId={`news-${selectedNews.id}`} className="bg-[#1e1b4b] w-full max-w-2xl rounded-[30px] overflow-hidden relative z-10 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setSelectedNews(null)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-pink-500 transition-colors z-20"><X size={20}/></button>
              <div className="h-72 relative">
                <SecureImage src={selectedNews.img} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b4b] to-transparent"></div>
                <div className="absolute bottom-6 left-8 right-8">
                    <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block shadow-lg">{selectedNews.type}</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white shadow-black drop-shadow-lg leading-tight">{selectedNews.title}</h2>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 border-b border-white/10 pb-4">
                    <Calendar size={14} /> Published: {selectedNews.time}
                </div>
                <p className="text-indigo-100 text-lg leading-relaxed">{selectedNews.details}</p>
                <p className="text-gray-400 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl mt-4 transition-colors">
                    Read Full Article
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}