import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Square, Pause, Download, Trash2, Settings, AlertCircle, 
  CheckCircle2, RefreshCw, FileSpreadsheet, FileText, Terminal, 
  Search, MapPin, Activity, Sparkles, AlertTriangle, Eye, ShieldAlert, Cpu
} from 'lucide-react';
import { csvExport } from '../extension/src/export/csvExport.js';
import { excelExport } from '../extension/src/export/excelExport.js';
import { autoTester } from '../extension/src/testing/autoTester.js';

export default function App() {
  const [leads, setLeads] = useState([]);
  const [session, setSession] = useState({ status: 'idle', config: {} });
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [speed, setSpeed] = useState('medium'); // slow, medium, fast
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('leads'); // leads, logs, diagnostics
  const [diagnosticsResult, setDiagnosticsResult] = useState(null);
  const [testingDiagnostics, setTestingDiagnostics] = useState(false);
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);

  const logsEndRef = useRef(null);

  const keywordSuggestions = [
    'Auto Parts Spares', 'Software Development Agency', 'Electronics Retailer',
    'AC Repair Maintenance', 'Banana Wholesaler', 'Laptop Computers Dealer',
    'Restaurants and Cafes', 'Boutique Apparel Clothing'
  ];

  // Load initial state and set up listener
  useEffect(() => {
    chrome.storage.local.get(['lsp_leads', 'lsp_current_session'], (result) => {
      if (result.lsp_leads) setLeads(result.lsp_leads);
      if (result.lsp_current_session) {
        setSession(result.lsp_current_session);
        if (result.lsp_current_session.config) {
          setKeyword(result.lsp_current_session.config.keyword || '');
          setCity(result.lsp_current_session.config.city || '');
          setPincode(result.lsp_current_session.config.pincode || '');
          setSpeed(result.lsp_current_session.config.speed || 'medium');
        }
      }
    });

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
      if (message.type === 'LOG_MESSAGE') {
        setLogs(prev => [...prev.slice(-99), message.payload]);
      } else if (message.type === 'CLEAR_LOGS') {
        setLogs([]);
      } else if (message.type === 'LEAD_FOUND') {
        // Automatically scroll to see new lead
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    // Populate initial dummy logs or instructions
    setLogs([
      { id: '1', level: 'info', timeLabel: new Date().toLocaleTimeString(), message: 'System initialized. Ready to scrape.' }
    ]);

    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  // Scroll to bottom of logs console on update
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleStart = () => {
    if (!keyword.trim()) {
      alert('Please enter a keyword/category to search.');
      return;
    }
    
    // Resolve delay based on speed control
    const delayMap = { slow: 4000, medium: 2000, fast: 1000 };
    const payload = {
      keyword: keyword.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      scrollDelay: delayMap[speed],
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

  const runDiagnostics = () => {
    setTestingDiagnostics(true);
    setDiagnosticsResult(null);
    setActiveTab('diagnostics');

    chrome.runtime.sendMessage({ type: 'RUN_DIAGNOSTICS' }, (response) => {
      setTestingDiagnostics(false);
      if (!response) {
        setDiagnosticsResult({ error: 'No response from page context. Make sure you are on a webpage and refresh the page.' });
      } else if (response.error) {
        setDiagnosticsResult({ error: response.error });
      } else {
        setDiagnosticsResult(response.diagnostics);
      }
    });
  };

  const runSelfTests = async () => {
    setActiveTab('logs');
    await autoTester.runSelfTests();
  };

  // Stats counting
  const totalCount = leads.length;
  const highConfCount = leads.filter(l => l.relevanceScore >= 75).length;
  const medConfCount = leads.filter(l => l.relevanceScore >= 50 && l.relevanceScore < 75).length;
  const lowConfCount = leads.filter(l => l.relevanceScore < 50).length;

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
                  onFocus={() => setShowKeywordSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowKeywordSuggestions(false), 200)}
                  placeholder="e.g. Auto Parts, Wholesaler, Repair"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg py-1.5 pl-9 pr-3 text-xs outline-none transition-colors"
                  disabled={isRunning || isPaused}
                />
                
                {/* Keyword Suggestions Dropdown */}
                {showKeywordSuggestions && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-55 max-h-40 overflow-y-auto text-xs py-1">
                    {keywordSuggestions.map(s => (
                      <button
                        key={s}
                        onMouseDown={() => setKeyword(s)}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-800/50 hover:text-indigo-400 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
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

          {/* Speed & Settings Control */}
          <div className="flex justify-between items-center pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Scraping Speed:</span>
              <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                {['slow', 'medium', 'fast'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-0.5 rounded-md font-medium capitalize transition-colors ${
                      speed === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    disabled={isRunning || isPaused}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={runDiagnostics}
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 bg-slate-800 hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-700/60"
              >
                <Activity className="w-3 h-3 text-indigo-400" /> Page Health
              </button>
              <button 
                onClick={runSelfTests}
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 bg-slate-800 hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-700/60"
              >
                <Sparkles className="w-3 h-3 text-amber-400" /> Self-Test
              </button>
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
        <section className="grid grid-cols-4 gap-2.5">
          <div className="bg-slate-900/60 border border-slate-800 p-2 rounded-xl text-center">
            <span className="text-[9px] text-slate-400 uppercase font-semibold">Total Leads</span>
            <div className="text-lg font-extrabold text-slate-100 mt-0.5">{totalCount}</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-850 p-2 rounded-xl text-center">
            <span className="text-[9px] text-emerald-400 uppercase font-semibold">High Conf</span>
            <div className="text-lg font-extrabold text-emerald-400 mt-0.5">{highConfCount}</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-850 p-2 rounded-xl text-center">
            <span className="text-[9px] text-indigo-400 uppercase font-semibold">Med Conf</span>
            <div className="text-lg font-extrabold text-indigo-400 mt-0.5">{medConfCount}</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-850 p-2 rounded-xl text-center">
            <span className="text-[9px] text-rose-400 uppercase font-semibold">Low/Bad</span>
            <div className="text-lg font-extrabold text-rose-400 mt-0.5">{lowConfCount}</div>
          </div>
        </section>

        {/* TABS HEADER */}
        <section className="border-b border-slate-800">
          <div className="flex gap-4 text-xs font-semibold">
            {['leads', 'logs', 'diagnostics'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`pb-2 capitalize border-b-2 transition-all px-1 ${
                  activeTab === t ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* TAB CONTENTS */}
        <section className="min-h-[140px] max-h-[180px] overflow-hidden">
          
          {/* LEADS LIST */}
          {activeTab === 'leads' && (
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
                        <th className="p-2 font-semibold">Phone</th>
                        <th className="p-2 font-semibold">City</th>
                        <th className="p-2 font-semibold text-center">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {leads.slice(-20).reverse().map((l, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-2 font-medium truncate max-w-[150px]">{l.name}</td>
                          <td className="p-2 text-slate-300 font-mono">{l.phone || 'N/A'}</td>
                          <td className="p-2 text-slate-400 truncate max-w-[100px]">{l.city || 'N/A'}</td>
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
          )}

          {/* LOGS CONSOLE */}
          {activeTab === 'logs' && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-slate-400" /> Execution Console
                </span>
                <button 
                  onClick={() => setLogs([])}
                  className="text-[9px] font-semibold text-slate-500 hover:text-slate-300"
                >
                  Clear Logs
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-black/40 border border-slate-800 rounded-lg p-2 font-mono text-[9px] space-y-1">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-2">
                    <span className="text-slate-600">{log.timeLabel}</span>
                    <span className={
                      log.level === 'success' ? 'text-emerald-400' :
                      log.level === 'error' ? 'text-rose-400 font-semibold' :
                      log.level === 'warning' ? 'text-amber-400' :
                      'text-slate-300'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}

          {/* DIAGNOSTICS */}
          {activeTab === 'diagnostics' && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Extractor Diagnostics</span>
              </div>

              <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-lg p-3 text-xs overflow-y-auto">
                {testingDiagnostics ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mb-1 text-indigo-500" />
                    Querying DOM structures...
                  </div>
                ) : diagnosticsResult ? (
                  diagnosticsResult.error ? (
                    <div className="flex gap-2 text-rose-400">
                      <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Diagnostic Failed</div>
                        <div className="text-[10px] mt-0.5">{diagnosticsResult.error}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200">Extractor Health:</span>
                        <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                          diagnosticsResult.status === 'HEALTHY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          diagnosticsResult.status === 'WEAK' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {diagnosticsResult.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-slate-950 p-1.5 rounded border border-slate-800 flex justify-between">
                          <span className="text-slate-400">Cards Found:</span>
                          <span className="font-bold text-slate-200">{diagnosticsResult.cardCount}</span>
                        </div>
                        <div className="bg-slate-950 p-1.5 rounded border border-slate-800 flex justify-between">
                          <span className="text-slate-400">Name Coverage:</span>
                          <span className="font-bold text-indigo-400">{diagnosticsResult.nameCoverage}%</span>
                        </div>
                        <div className="bg-slate-950 p-1.5 rounded border border-slate-800 flex justify-between">
                          <span className="text-slate-400">Phone Coverage:</span>
                          <span className="font-bold text-emerald-400">{diagnosticsResult.phoneCoverage}%</span>
                        </div>
                        <div className="bg-slate-950 p-1.5 rounded border border-slate-800 flex justify-between">
                          <span className="text-slate-400">Email Coverage:</span>
                          <span className="font-bold text-amber-400">{diagnosticsResult.emailCoverage}%</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 italic bg-black/20 p-1.5 rounded border border-slate-800/50 mt-1">
                        Recommendation: {diagnosticsResult.recommendation}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <Activity className="w-5 h-5 mb-1 text-slate-600" />
                    Click "Page Health" above to analyze the active webpage DOM layout.
                  </div>
                )}
              </div>
            </div>
          )}
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
