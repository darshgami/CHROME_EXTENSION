import React, { useState, useEffect } from 'react';
import { 
  Play, Square, Pause, Trash2, AlertCircle, 
  FileSpreadsheet, FileText, Search, MapPin, Cpu
} from 'lucide-react';
import { csvExport } from '../extension/src/export/csvExport.js';
import { excelExport } from '../extension/src/export/excelExport.js';

export default function App() {
  const [leads, setLeads] = useState([]);
  const [session, setSession] = useState({ status: 'idle', config: {} });
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [activeTabUrl, setActiveTabUrl] = useState('');

  // Load initial state and set up listener
  useEffect(() => {
    chrome.storage.local.get(['lsp_leads', 'lsp_current_session'], (result) => {
      if (result.lsp_leads) setLeads(result.lsp_leads);
      if (result.lsp_current_session) {
        setSession(result.lsp_current_session);
        if (result.lsp_current_session.config) {
          if (!keyword) setKeyword(result.lsp_current_session.config.keyword || '');
          setCity(result.lsp_current_session.config.city || '');
          setPincode(result.lsp_current_session.config.pincode || '');
        }
      }
    });

    // Auto-fetch active tab
    if (chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].url) {
          const url = tabs[0].url;
          setActiveTabUrl(url);
          
          // Auto-detect keyword from URL if possible
          if (!keyword) {
            try {
              const urlObj = new URL(url);
              let detected = '';
              if (urlObj.hostname.includes('justdial')) detected = url.split('/')[4] || url.split('/')[3];
              else if (urlObj.hostname.includes('indiamart')) detected = urlObj.searchParams.get('ss') || url.split('/')[3];
              else if (urlObj.hostname.includes('yelp')) detected = urlObj.searchParams.get('find_desc');
              
              if (detected) {
                setKeyword(decodeURIComponent(detected).replace(/[-_+]/g, ' '));
              }
            } catch (e) { }
          }
        }
      });
    }

    const storageListener = (changes, areaName) => {
      if (areaName === 'local') {
        if (changes.lsp_leads) {
          setLeads(changes.lsp_leads.newValue || []);
        }
        if (changes.lsp_current_session) {
          setSession(changes.lsp_current_session.newValue || { status: 'idle' });
        }
      }
    };
    chrome.storage.onChanged.addListener(storageListener);

    const messageListener = (message) => {
      if (message.type === 'LEAD_FOUND') {
        // Automatically scroll to see new lead
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const handleStart = () => {
    if (!keyword.trim()) {
      alert('Please enter a keyword/category to search.');
      return;
    }
    
    const payload = {
      keyword: keyword.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      scrollDelay: 2000,
      maxScrolls: 15
    };

    chrome.runtime.sendMessage({ type: 'START_SCRAPING', payload });
  };

  const handleStop = () => {
    chrome.runtime.sendMessage({ type: 'STOP_SCRAPING' });
  };

  const handlePause = () => {
    chrome.runtime.sendMessage({ type: 'PAUSE_SCRAPING' });
  };

  const handleResume = () => {
    chrome.runtime.sendMessage({ type: 'RESUME_SCRAPING' });
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all scraped leads?')) {
      chrome.storage.local.set({ lsp_leads: [] });
      setLeads([]);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    csvExport.export(leads, `Leads_${keyword || 'export'}`);
  };

  const handleExportExcel = () => {
    if (leads.length === 0) return;
    excelExport.export(leads, `Leads_${keyword || 'export'}`);
  };

  const totalCount = leads.length;
  const isRunning = session.status === 'running';
  const isPaused = session.status === 'paused';

  return (
    <div className="flex flex-col h-[600px] bg-slate-950 text-slate-100 p-4 select-none">
      
      {/* HEADER */}
      <header className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg shadow-md shadow-indigo-600/30">
            <Cpu className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">Lead Scraper <span className="text-indigo-400">Pro</span></h1>
            <p className="text-[10px] text-slate-400 font-medium">Universal Directory Extraction</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
            isRunning ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
            isPaused ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
            'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              isRunning ? 'bg-emerald-400 animate-ping' : 
              isPaused ? 'bg-amber-400' : 
              'bg-slate-500'
            }`} />
            {session.status.toUpperCase()}
          </div>
        </div>
      </header>

      {/* BODY CONFIG */}
      <main className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
        
        {/* URL DISPLAY */}
        {activeTabUrl && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-[9px] text-slate-400 font-mono truncate">
            <span className="text-indigo-400 font-semibold uppercase mr-1">Target:</span> 
            {activeTabUrl}
          </div>
        )}

        {/* INPUTS ROW */}
        <section className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl shadow-lg space-y-3">
          <div className="relative">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Keywords (Business Type)</label>
            <div className="flex gap-1 mt-1">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. Auto Parts, Wholesaler, Repair"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg py-1.5 pl-9 pr-3 text-xs outline-none transition-colors"
                  disabled={isRunning || isPaused}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">City / Location</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai, New York"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg py-1.5 pl-9 pr-3 text-xs outline-none transition-colors"
                  disabled={isRunning || isPaused}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Zip / Pincode</label>
              <input 
                type="text" 
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Optional"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg py-1.5 px-3 mt-1 text-xs outline-none transition-colors"
                disabled={isRunning || isPaused}
              />
            </div>
          </div>
        </section>

        {/* CONTROLS */}
        <section className="flex gap-2.5">
          {!isRunning && !isPaused ? (
            <button 
              onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 py-2.5 rounded-xl font-semibold text-xs tracking-wider transition-all shadow-lg shadow-indigo-600/25"
            >
              <Play className="w-4 h-4 fill-current" /> START SCRAPING
            </button>
          ) : (
            <>
              {isRunning ? (
                <button 
                  onClick={handlePause}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 py-2.5 rounded-xl font-semibold text-xs tracking-wider transition-all"
                >
                  <Pause className="w-4 h-4 fill-current" /> PAUSE
                </button>
              ) : (
                <button 
                  onClick={handleResume}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 py-2.5 rounded-xl font-semibold text-xs tracking-wider transition-all"
                >
                  <Play className="w-4 h-4 fill-current" /> RESUME
                </button>
              )}
              
              <button 
                onClick={handleStop}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 py-2.5 rounded-xl font-semibold text-xs tracking-wider transition-all shadow-lg shadow-rose-600/10"
              >
                <Square className="w-4 h-4 fill-current" /> STOP
              </button>
            </>
          )}
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-2.5">
          <div className="bg-slate-900/60 border border-slate-800 p-2 rounded-xl text-center">
            <span className="text-[9px] text-slate-400 uppercase font-semibold">Total Leads</span>
            <div className="text-lg font-extrabold text-slate-100 mt-0.5">{totalCount}</div>
          </div>
        </section>

        {/* TAB CONTENTS */}
        <section className="min-h-[140px] max-h-[180px] overflow-hidden">
          
          {/* LEADS LIST */}
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Lead Preview (Last 20)</span>
              <div className="flex gap-1.5">
                <button 
                  onClick={handleExportExcel}
                  disabled={leads.length === 0}
                  className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <FileSpreadsheet className="w-2.5 h-2.5" /> Excel
                </button>
                <button 
                  onClick={handleExportCSV}
                  disabled={leads.length === 0}
                  className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <FileText className="w-2.5 h-2.5" /> CSV
                </button>
                <button 
                  onClick={handleClear}
                  disabled={leads.length === 0}
                  className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Trash2 className="w-2.5 h-2.5" /> Clear
                </button>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg p-4 bg-slate-900/20">
                <AlertCircle className="w-6 h-6 mb-1.5 text-slate-600" />
                No leads found. Enter keywords and start scraping.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto border border-slate-800 rounded-lg bg-slate-950">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="sticky top-0 bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2 font-semibold">Name</th>
                      <th className="p-2 font-semibold">Contact</th>
                      <th className="p-2 font-semibold">Category/Rating</th>
                      <th className="p-2 font-semibold text-center">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {leads.slice(-20).reverse().map((l, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-2 font-medium max-w-[120px]">
                          <div className="truncate text-white">{l.name}</div>
                          <div className="text-[9px] text-slate-500 truncate">{l.city}</div>
                        </td>
                        <td className="p-2 text-slate-300 font-mono text-[9px]">
                          <div>{l.phone || l.whatsapp || 'N/A'}</div>
                          {l.email && <div className="text-indigo-300 truncate max-w-[80px]">{l.email}</div>}
                        </td>
                        <td className="p-2 text-slate-400 text-[9px] max-w-[100px]">
                          <div className="truncate">{l.category || 'N/A'}</div>
                          {l.rating && <div className="text-amber-400 font-bold">★ {l.rating} {l.reviews ? `(${l.reviews})` : ''}</div>}
                        </td>
                        <td className="p-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                            l.relevanceScore >= 75 ? 'bg-emerald-500/10 text-emerald-400' :
                            l.relevanceScore >= 50 ? 'bg-indigo-500/10 text-indigo-400' :
                            'bg-rose-500/10 text-rose-400'
                          }`}>
                            {l.relevanceScore}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="flex justify-between items-center pt-2.5 border-t border-slate-800 text-[10px] text-slate-400">
        <div>
          Ready to scrape B2B listings.
        </div>
        <div className="font-medium text-slate-500">v1.0.0</div>
      </footer>
    </div>
  );
}
