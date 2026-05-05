/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Download, 
  Play, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Database,
  Globe,
  Facebook,
  Linkedin,
  Map as MapIcon,
  ShoppingBag,
  ExternalLink,
  Mail,
  Phone,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lead, ScrapeJob, ScraperSource } from './types';

const SOURCE_ICONS: Record<ScraperSource, React.ReactNode> = {
  'yellow-pages': <Globe size={18} />,
  'kijiji': <ShoppingBag size={18} />,
  'google-maps': <MapIcon size={18} />,
  'facebook': <Facebook size={18} />,
  'linkedin': <Linkedin size={18} />
};

export default function App() {
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [source, setSource] = useState<ScraperSource>('yellow-pages');
  const [interval, setInterval] = useState<'once' | 'weekly'>('once');
  const [isScraping, setIsScraping] = useState(false);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    fetchData();
    const timer = window.setInterval(fetchData, 2000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching state from engine...');
      const jobsRes = await fetch('/api/jobs');
      const leadsRes = await fetch('/api/leads');
      
      if (!jobsRes.ok) {
        console.error(`Jobs fetch failed: ${jobsRes.status} ${jobsRes.statusText}`);
        throw new Error(`Jobs server error: ${jobsRes.status}`);
      }
      if (!leadsRes.ok) {
        console.error(`Leads fetch failed: ${leadsRes.status} ${leadsRes.statusText}`);
        throw new Error(`Leads server error: ${leadsRes.status}`);
      }
      
      const jobsData = await jobsRes.json();
      const leadsData = await leadsRes.json();
      
      console.log('Sync successful:', { jobs: jobsData.length, leads: leadsData.length });
      setJobs(jobsData);
      setLeads(leadsData);
      setServerStatus('online');
    } catch (err) {
      console.error('Connection Diagnostics:', err);
      setServerStatus('offline');
    }
  };

  const startScrape = async () => {
    if (!query) return;
    setIsScraping(true);
    try {
      await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, query, location, scheduledInterval: interval })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsScraping(false);
    }
  };

  const handleExport = () => {
    window.open('/api/export', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-300 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Header */}
      <header className="h-20 border-b border-white/10 px-8 flex justify-between items-center bg-[#0D0D0D] sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/40 rounded flex items-center justify-center">
            <div className="w-4 h-4 bg-emerald-500 rounded-sm shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          </div>
          <div>
            <h1 className="text-xl font-serif text-white tracking-wide uppercase italic">LeadHarvest <span className="text-emerald-500">v2.4</span></h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Multi-Source Scraper Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase">Next Scheduled Run</span>
            <span className="text-xs text-white font-mono uppercase">Mon 08:00 AM • Weekly</span>
          </div>
          <button 
            onClick={handleExport}
            disabled={leads.length === 0}
            className="px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded hover:bg-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Export Excel
          </button>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-80px)] overflow-hidden">
        {/* Controls Panel */}
        <aside className="w-80 border-r border-white/5 bg-[#0D0D0D] flex flex-col p-6 space-y-8">
          <section className="space-y-6">
            <h3 className="text-[11px] text-slate-500 uppercase tracking-[0.2em]">Configuration</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] text-slate-400 uppercase tracking-wider">Source Provider</label>
                <div className="grid grid-cols-5 gap-1">
                  {(['yellow-pages', 'kijiji', 'google-maps', 'facebook', 'linkedin'] as ScraperSource[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSource(s)}
                      className={`p-3 border transition-all rounded ${
                        source === s 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                          : 'border-white/10 hover:border-white/30 text-slate-500'
                      }`}
                      title={s.replace('-', ' ')}
                    >
                      {SOURCE_ICONS[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-slate-400 uppercase tracking-wider">Search Query</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Plumbers, Dentists..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-emerald-500/50 text-slate-200 font-mono text-xs transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-slate-400 uppercase tracking-wider">Location Scope</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Toronto, ON"
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-emerald-500/50 text-slate-200 font-mono text-xs transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-slate-400 uppercase tracking-wider">Execution Plan</label>
                <div className="flex bg-black/40 border border-white/10 rounded-lg p-1">
                  {(['once', 'weekly'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setInterval(opt)}
                      className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-widest rounded transition-all ${
                        interval === opt ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {opt === 'once' ? 'Manual' : 'Weekly'}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={startScrape}
                disabled={isScraping || !query}
                className="w-full bg-emerald-500 text-black py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-bold uppercase tracking-[0.2em] text-xs shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
              >
                {isScraping ? <Layers className="animate-spin" size={16} /> : <Play size={16} />}
                Initiate Run
              </button>
            </div>
          </section>

          <section className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center">
              <h3 className="text-[11px] text-slate-500 uppercase tracking-[0.2em]">Active Queue</h3>
              <span className="font-mono text-[9px] bg-white/10 text-slate-300 px-1.5 py-0.5 rounded">{jobs.length}</span>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {jobs.map((job) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={job.id}
                    className="p-3 border border-white/5 bg-black/20 rounded-lg space-y-2 group hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="text-emerald-500/60 group-hover:text-emerald-500 transition-colors">{SOURCE_ICONS[job.source]}</div>
                        <span className="font-mono text-[10px] text-slate-200 uppercase">{job.query}</span>
                      </div>
                      {job.status === 'running' ? (
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
                      ) : job.status === 'completed' ? (
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                      ) : (
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {jobs.length === 0 && <p className="font-serif italic text-center text-[10px] text-slate-600 py-4">No active processes</p>}
            </div>
          </section>

          <section className="mt-auto pt-6 border-t border-white/5">
            <div className="p-4 border border-emerald-500/30 bg-emerald-500/5 rounded-lg">
              <p className="text-[10px] text-emerald-500 font-bold uppercase mb-1">System Health</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">All sources currently accessible. Proxy pool verified.</p>
            </div>
          </section>
        </aside>

        {/* Data View */}
        <section className="flex-1 bg-[#080808] overflow-hidden flex flex-col">
          <div className="h-12 border-b border-white/5 flex items-center px-8 justify-between bg-black/20">
            <span className="text-[11px] font-mono tracking-wider text-slate-500 italic uppercase">Current Session: {leads.length.toLocaleString()} Leads Captured</span>
            <div className="flex gap-6 uppercase tracking-[0.2em] text-[10px]">
              <button className="text-slate-500 hover:text-white transition-colors">Export CSV</button>
              <button onClick={handleExport} className="text-emerald-500 hover:text-emerald-400 transition-colors">Export Excel</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {leads.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-4 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Company / Name</th>
                    <th className="pb-4 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Contact Details</th>
                    <th className="pb-4 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold text-center">Source</th>
                    <th className="pb-4 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-mono">
                  {leads.map((lead) => (
                    <tr 
                      key={lead.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-white text-sm font-semibold group-hover:text-emerald-400 transition-colors">{lead.companyName}</span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1">{lead.name}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-300">{lead.email || 'no-email@extraction.io'}</span>
                          <span className="text-slate-500 text-[11px]">{lead.phone || 'no-phone'}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-2 text-slate-400 uppercase text-[10px] tracking-widest">
                          <span className="opacity-60">{SOURCE_ICONS[lead.source]}</span>
                          {lead.source.split('-')[0]}
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest rounded-sm">
                          VALID
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6 grayscale">
                <Database size={80} strokeWidth={1} />
                <p className="font-serif italic text-2xl tracking-[0.3em] uppercase">Engine Primed</p>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <footer className="h-10 bg-black border-t border-white/10 flex items-center justify-between px-8 text-[10px] font-mono uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)] ${
                  serverStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 
                  serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className={serverStatus === 'online' ? 'text-slate-400' : 'text-red-400'}>
                  Engine: {serverStatus === 'online' ? 'Active' : serverStatus === 'offline' ? 'Offline (Check Server)' : 'Connecting...'}
                </span>
              </div>
              <span className="text-white/5">|</span>
              <span>Total Archive: {leads.length.toLocaleString()} Records</span>
            </div>
            <div className="flex gap-6">
              <button 
                onClick={fetchData}
                className="hover:text-emerald-500 transition-colors uppercase tracking-widest flex items-center gap-2"
              >
                <Clock size={10} /> Sync Now
              </button>
              <span className="text-white/5">|</span>
              <span>Log ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
              <span className="text-emerald-500 font-bold">PRO License</span>
            </div>
          </footer>
        </section>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #10B981;
        }
      `}</style>
    </div>
  );
}
