
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowLeftRight, 
  Clipboard, 
  Trash2, 
  RotateCcw, 
  Info, 
  Check, 
  Binary, 
  Text,
  AlertCircle,
  Clock,
  ExternalLink,
  Sun,
  Moon,
  Languages
} from 'lucide-react';
import { ConversionMode, ConverterSettings, ConversionHistory, Theme, Language } from './types';
import { stringToHex, hexToString, isHexString } from './utils/converter';
import { SettingsPanel } from './components/SettingsPanel';
import { translations } from './i18n';

const App: React.FC = () => {
  // Appearance & Localization
  const [theme, setTheme] = useState<Theme>(() => 
    (localStorage.getItem('theme') as Theme) || 'dark'
  );
  const [language, setLanguage] = useState<Language>(() => 
    (localStorage.getItem('language') as Language) || 'en'
  );

  // App State
  const [mode, setMode] = useState<ConversionMode>(ConversionMode.STRING_TO_HEX);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [settings, setSettings] = useState<ConverterSettings>({
    delimiter: ' ',
    prefix: '',
    uppercase: true,
    liveMode: true,
    encoding: 'UTF-8'
  });

  const t = translations[language];
  const isDark = theme === 'dark';

  // Persistence
  useEffect(() => localStorage.setItem('theme', theme), [theme]);
  useEffect(() => localStorage.setItem('language', language), [language]);

  // Conversion logic
  const performConversion = useCallback((val: string, currentMode: ConversionMode, currentSettings: ConverterSettings) => {
    if (!val.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    try {
      let result = '';
      if (currentMode === ConversionMode.STRING_TO_HEX) {
        result = stringToHex(val, currentSettings);
      } else {
        result = hexToString(val, currentSettings);
      }
      setOutput(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Invalid input');
      setOutput('');
    }
  }, []);

  // Effect: Live Conversion
  useEffect(() => {
    if (settings.liveMode) {
      performConversion(input, mode, settings);
    }
  }, [input, mode, settings, performConversion]);

  const handleManualConvert = () => {
    performConversion(input, mode, settings);
    if (input.trim() && output.trim()) {
      const newEntry: ConversionHistory = {
        id: crypto.randomUUID(),
        input,
        output,
        mode,
        timestamp: Date.now()
      };
      setHistory(prev => [newEntry, ...prev.slice(0, 9)]);
    }
  };

  const swapMode = () => {
    const newMode = mode === ConversionMode.STRING_TO_HEX 
      ? ConversionMode.HEX_TO_STRING 
      : ConversionMode.STRING_TO_HEX;
    if (output) {
      setInput(output);
      setMode(newMode);
    } else {
      setMode(newMode);
    }
  };

  const copyToClipboard = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch (err) {
      console.error('Failed to paste!', err);
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'zh' : 'en');

  return (
    <div className={`min-h-screen flex flex-col items-center justify-start p-4 md:p-8 transition-colors duration-300 overflow-x-hidden ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header */}
      <header className="w-full max-w-5xl mb-12 relative flex flex-col items-center">
        {/* Decorative background glow */}
        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 ${isDark ? 'bg-blue-600/10' : 'bg-blue-500/5'} rounded-full blur-[100px] -z-10`}></div>
        
        {/* Controls: Theme & Language */}
        <div className="absolute top-0 right-0 flex gap-2">
          <button 
            onClick={toggleLanguage}
            className={`p-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold uppercase ${isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900'}`}
          >
            <Languages size={16} />
            {language === 'en' ? 'ZH' : 'EN'}
          </button>
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-yellow-400' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900'}`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 mb-2 pt-8 md:pt-0">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-900/20">
            <Binary size={32} strokeWidth={2.5} className="text-white" />
          </div>
          <h1 className={`text-4xl font-bold tracking-tight ${isDark ? 'bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400' : 'text-slate-900'}`}>
            {t.title}
          </h1>
        </div>
        <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} max-w-lg mx-auto text-center`}>
          {t.subtitle}
        </p>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 gap-8">
        
        {/* Converter Section */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-center">
          
          {/* Input Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={`flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {mode === ConversionMode.STRING_TO_HEX ? <Text size={16} className="text-blue-500" /> : <Binary size={16} className="text-indigo-500" />}
                {mode === ConversionMode.STRING_TO_HEX ? t.inputLabelString : t.inputLabelHex}
              </label>
              <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} font-mono uppercase`}>
                {input.length} {t.chars}
              </span>
            </div>
            <div className="relative group">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === ConversionMode.STRING_TO_HEX ? t.placeholderString : t.placeholderHex}
                className={`w-full h-48 border rounded-2xl p-4 transition-all resize-none mono leading-relaxed ${
                  isDark 
                  ? 'bg-slate-900/50 border-slate-700/80 text-slate-200 placeholder:text-slate-600 focus:ring-blue-500/30' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-300 focus:ring-blue-500/10'
                } focus:ring-4 focus:border-blue-500/50 outline-none`}
              />
              <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                  onClick={pasteFromClipboard}
                  className={`p-2 rounded-lg border transition-all shadow-lg flex items-center gap-1 text-xs font-bold ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-100 text-slate-600 hover:text-slate-900'}`}
                  title={t.paste}
                >
                  <Clipboard size={14} /> {t.paste}
                </button>
                 <button 
                  onClick={clearAll}
                  className={`p-2 rounded-lg border transition-all shadow-lg flex items-center gap-1 text-xs font-bold ${isDark ? 'bg-slate-800/80 border-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-400' : 'bg-white border-slate-100 hover:bg-red-50 text-red-500 text-slate-500'}`}
                  title={t.clear}
                >
                  <Trash2 size={14} /> {t.clear}
                </button>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex flex-row lg:flex-col items-center justify-center gap-4 py-2">
            <button 
              onClick={swapMode}
              className={`group p-4 rounded-full shadow-lg transition-all active:scale-95 ring-4 ${isDark ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 ring-slate-950' : 'bg-blue-500 hover:bg-blue-400 shadow-blue-200 ring-slate-50'} text-white`}
              title="Swap Mode"
            >
              <ArrowLeftRight size={24} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <div className={`hidden lg:block w-px h-16 bg-gradient-to-b from-transparent ${isDark ? 'via-slate-800' : 'via-slate-200'} to-transparent`}></div>
          </div>

          {/* Output Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={`flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {mode === ConversionMode.STRING_TO_HEX ? <Binary size={16} className="text-indigo-500" /> : <Text size={16} className="text-blue-500" />}
                {mode === ConversionMode.STRING_TO_HEX ? t.outputLabelHex : t.outputLabelString}
              </label>
              {error && (
                <div className="flex items-center gap-1 text-red-500 text-xs font-medium animate-pulse">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </div>
            <div className="relative">
              <div className={`w-full h-48 border rounded-2xl p-4 overflow-y-auto mono break-all leading-relaxed whitespace-pre-wrap selection:bg-blue-500/30 ${
                isDark 
                ? 'bg-slate-900 border-slate-700/80 text-slate-200' 
                : 'bg-white border-slate-200 text-slate-900'
              }`}>
                {output || <span className={`${isDark ? 'text-slate-700' : 'text-slate-300'} italic`}>{t.resultPlaceholder}</span>}
              </div>
              
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={copyToClipboard}
                  disabled={!output}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm font-medium shadow-lg ${
                    copied 
                    ? 'bg-green-500/20 border-green-500/50 text-green-500' 
                    : `${isDark ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-600'} disabled:opacity-30 disabled:cursor-not-allowed`
                  }`}
                >
                  {copied ? <Check size={16} /> : <Clipboard size={16} />}
                  {copied ? t.copied : t.copy}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Action Bar (Optional manual trigger) */}
        {!settings.liveMode && (
          <div className="flex justify-center -mt-4">
            <button 
              onClick={handleManualConvert}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-xl shadow-indigo-900/30 flex items-center gap-2"
            >
              <RotateCcw size={20} />
              {t.convertNow}
            </button>
          </div>
        )}

        {/* Settings & Info Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Settings Panel */}
          <div className="md:col-span-2">
            <SettingsPanel settings={settings} onSettingsChange={setSettings} language={language} theme={theme} />
          </div>

          {/* Side Info Cards */}
          <div className="space-y-4">
            
            {/* History Card */}
            <div className={`${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl p-5 shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <Clock size={14} /> {t.recent}
                </h4>
                <button onClick={() => setHistory([])} className={`text-[10px] uppercase ${isDark ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`}>{t.clearHistory}</button>
              </div>
              <div className="space-y-3">
                {history.length > 0 ? (
                  history.map(item => (
                    <button 
                      key={item.id}
                      onClick={() => {
                        setInput(item.input);
                        setMode(item.mode);
                      }}
                      className={`w-full text-left group p-2 rounded-lg transition-colors border border-transparent ${isDark ? 'hover:bg-slate-800/50 hover:border-slate-700' : 'hover:bg-slate-50 hover:border-slate-100'}`}
                    >
                      <div className="text-[10px] text-blue-500 font-bold mb-1">
                        {item.mode === ConversionMode.STRING_TO_HEX ? 'STRING → HEX' : 'HEX → STRING'}
                      </div>
                      <div className={`text-xs truncate font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {item.input.substring(0, 30)}...
                      </div>
                    </button>
                  ))
                ) : (
                  <p className={`text-xs text-center py-4 italic ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{t.noHistory}</p>
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className={`border rounded-xl p-5 ${isDark ? 'bg-blue-600/5 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
              <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                <Info size={14} /> {t.quickTips}
              </h4>
              <ul className={`text-xs space-y-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  <span>{t.tip1}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  <span>{t.tip2}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  <span>{t.tip3}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`mt-auto w-full max-w-5xl py-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm ${isDark ? 'border-slate-900 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
        <p>{t.footer}</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-blue-500 transition-colors flex items-center gap-1">
            Docs <ExternalLink size={14} />
          </a>
          <a href="#" className="hover:text-blue-500 transition-colors flex items-center gap-1">
            Github <ExternalLink size={14} />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
