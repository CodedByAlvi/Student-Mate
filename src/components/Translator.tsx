import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Languages, ArrowRightLeft, Copy, Star, Trash2, History, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translateText } from '../lib/gemini';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

const LANGUAGES = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'en', name: 'English' },
  { code: 'bn', name: 'Bangla' },
  { code: 'ar', name: 'Arabic' },
  { code: 'es', name: 'Spanish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'fr', name: 'French' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ur', name: 'Urdu' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
];

export default function Translator() {
  const { translations, addTranslation, deleteTranslation, toggleFavoriteTranslation, clearTranslations, setConfirmModal } = useStore();
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('bn');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectingLang, setSelectingLang] = useState<'source' | 'target' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTranslate = async () => {
    if (!navigator.onLine) {
      toast.error('You are offline. Translation requires an internet connection.');
      return;
    }

    if (!sourceText.trim()) {
      toast.error('Please enter text to translate');
      return;
    }

    if (isTranslating) return;

    setIsTranslating(true);
    try {
      const result = await translateText(
        sourceText, 
        sourceLang === 'auto' ? 'Auto Detect' : LANGUAGES.find(l => l.code === sourceLang)?.name || 'English',
        LANGUAGES.find(l => l.code === targetLang)?.name || 'Bangla'
      );
      setTranslatedText(result);
      await addTranslation({
        sourceText,
        translatedText: result,
        sourceLang,
        targetLang,
      });
    } catch (error) {
      toast.error('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwap = () => {
    if (sourceLang === 'auto') return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard', {
      icon: <Copy className="h-4 w-4 text-brand-600" />
    });
  };

  const filteredLanguages = LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const LanguagePicker = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={() => setSelectingLang(null)}
    >
      <motion.div 
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl dark:bg-stone-900"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">Select Language</h3>
          <button onClick={() => setSelectingLang(null)} className="text-stone-400">✕</button>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input 
            type="text"
            placeholder="Search languages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl bg-stone-50 py-3 pl-10 pr-4 text-sm outline-none dark:bg-stone-800"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[40vh] sm:max-h-[50vh] overflow-y-auto no-scrollbar">
          {filteredLanguages.map(l => (
            <button
              key={l.code}
              onClick={() => {
                if (selectingLang === 'source') setSourceLang(l.code);
                else setTargetLang(l.code);
                setSelectingLang(null);
                setSearchQuery('');
              }}
              className={cn(
                "rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all",
                (selectingLang === 'source' ? sourceLang === l.code : targetLang === l.code)
                  ? "bg-brand-600 text-white"
                  : "bg-stone-50 text-stone-600 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
              )}
            >
              {l.name}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="space-y-6 px-6 pb-20">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Translator</h1>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className={cn(
            "rounded-2xl p-2.5 transition-all",
            showHistory ? "bg-brand-100 text-brand-600 dark:bg-brand-900/30" : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          )}
        >
          <History className="h-6 w-6" />
        </button>
      </header>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-3xl border border-stone-200 bg-white p-2 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <button 
            onClick={() => setSelectingLang('source')}
            className="flex-1 px-4 py-3 text-left text-sm font-bold text-stone-900 dark:text-stone-50"
          >
            {LANGUAGES.find(l => l.code === sourceLang)?.name}
          </button>
          <button 
            onClick={handleSwap}
            disabled={sourceLang === 'auto'}
            className="rounded-full bg-stone-100 p-2.5 text-stone-500 transition-all hover:bg-brand-100 hover:text-brand-600 disabled:opacity-30 dark:bg-stone-800 dark:text-stone-400"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setSelectingLang('target')}
            className="flex-1 px-4 py-3 text-right text-sm font-bold text-stone-900 dark:text-stone-50"
          >
            {LANGUAGES.find(l => l.code === targetLang)?.name}
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative rounded-3xl border border-stone-200 bg-white p-4 sm:p-6 shadow-sm transition-all focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/5 dark:border-stone-800 dark:bg-stone-900">
            <textarea 
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              className="min-h-[120px] w-full resize-none bg-transparent text-lg leading-relaxed outline-none placeholder:text-stone-300 dark:placeholder:text-stone-700"
            />
            <div className="flex items-center justify-end pt-4 border-t border-stone-50 dark:border-stone-800/50">
              <div className="flex items-center gap-2">
                {sourceText && (
                  <button 
                    onClick={() => setSourceText('')}
                    className="rounded-full p-2 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                <button 
                  onClick={() => handleCopy(sourceText)}
                  className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={handleTranslate}
              disabled={isTranslating || !sourceText.trim()}
              className="group flex items-center gap-3 rounded-full bg-brand-600 px-10 py-4 font-bold text-white shadow-xl shadow-brand-600/20 transition-all hover:bg-brand-700 active:scale-95 disabled:opacity-50"
            >
              {isTranslating ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Languages className="h-5 w-5" />
                </motion.div>
              ) : (
                <Languages className="h-5 w-5 transition-transform group-hover:scale-110" />
              )}
              Translate Now
            </button>
          </div>

          <div className="relative rounded-3xl border border-stone-200 bg-brand-50/30 p-4 sm:p-6 shadow-sm dark:border-stone-800 dark:bg-brand-900/5">
            <textarea 
              value={translatedText}
              readOnly
              placeholder="Translation will appear here..."
              className="min-h-[120px] w-full resize-none bg-transparent text-lg font-bold leading-relaxed text-brand-900 outline-none dark:text-brand-100 placeholder:text-brand-200 dark:placeholder:text-brand-900/30"
            />
            <div className="flex items-center justify-end pt-4 border-t border-brand-100/50 dark:border-brand-900/20">
              <button 
                onClick={() => handleCopy(translatedText)}
                className="rounded-full p-2 text-brand-600 transition-colors hover:bg-brand-100 dark:hover:bg-brand-900/30"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectingLang && <LanguagePicker />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showHistory && (
          <motion.div 
            key="history-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
            onClick={() => setShowHistory(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl dark:bg-stone-900 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 dark:bg-brand-900/20">
                    <History className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold">Recent History</h3>
                </div>
                <div className="flex items-center gap-4">
                  {translations.length > 0 && (
                    <button 
                      onClick={() => {
                        setConfirmModal({
                          title: 'Clear History',
                          message: 'Are you sure you want to clear all translation history? This cannot be undone.',
                          onConfirm: () => {
                            clearTranslations();
                            toast.success('History cleared');
                          }
                        });
                      }}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                  <button onClick={() => setShowHistory(false)} className="rounded-full bg-stone-100 p-2 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
                {translations.map((t) => (
                  <div key={t.id} className="group relative space-y-3 rounded-3xl border border-stone-200 bg-stone-50/50 p-5 transition-all hover:bg-white hover:shadow-md dark:border-stone-800 dark:bg-stone-900/50 dark:hover:bg-stone-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                        <span>{LANGUAGES.find(l => l.code === t.sourceLang)?.name}</span>
                        <ArrowRightLeft className="h-3 w-3" />
                        <span>{LANGUAGES.find(l => l.code === t.targetLang)?.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => toggleFavoriteTranslation(t.id, !t.isFavorite)}
                          className={cn(
                            "rounded-full p-2 transition-all",
                            t.isFavorite ? "text-amber-500" : "text-stone-300 hover:text-stone-500"
                          )}
                        >
                          <Star className="h-4 w-4" fill={t.isFavorite ? "currentColor" : "none"} />
                        </button>
                        <button 
                          onClick={() => deleteTranslation(t.id)}
                          className="rounded-full p-2 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">{t.sourceText}</p>
                    <p className="font-display text-lg font-bold text-brand-600">{t.translatedText}</p>
                  </div>
                ))}
                {translations.length === 0 && (
                  <div className="py-20 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-900">
                      <History className="h-8 w-8 text-stone-300" />
                    </div>
                    <p className="text-stone-400">No translation history yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
