/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, lazy, Suspense } from 'react';
import { useStore } from './store/useStore';
import { cn } from './lib/utils';
import Layout from './components/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { ACCENT_COLORS, AccentColor } from './constants';
import { usePerformance } from './hooks/usePerformance';

import ErrorBoundary from './components/ErrorBoundary';
import CustomToaster from './components/CustomToaster';

// Lazy load components for Phase 3: Smart Resource Loading
const Home = lazy(() => import('./components/Home'));
const Notebook = lazy(() => import('./components/Notebook'));
const Stopwatch = lazy(() => import('./components/Stopwatch'));
const FocusMode = lazy(() => import('./components/FocusMode'));
const Exams = lazy(() => import('./components/Exams'));
const Tasks = lazy(() => import('./components/Tasks'));
const Settings = lazy(() => import('./components/Settings'));

export default function App() {
  const user = useStore(state => state.user);
  const activeTab = useStore(state => state.activeTab);
  const setActiveTab = useStore(state => state.setActiveTab);
  const loadLocalData = useStore(state => state.loadLocalData);
  const forceSave = useStore(state => state.forceSave);
  const setIsUltraPerformanceMode = useStore(state => state.setIsUltraPerformanceMode);
  
  const { isUltraPerformanceMode: perfMode } = usePerformance();

  // Phase 1: Activate Ultra Performance Mode in the store
  useEffect(() => {
    setIsUltraPerformanceMode(perfMode);
  }, [perfMode, setIsUltraPerformanceMode]);

  // Monitor memory pressure if available
  useEffect(() => {
    if (!('performance' in window) || !('memory' in (window.performance as any))) return;

    const checkMemory = () => {
      const memory = (window.performance as any).memory;
      const usedPercent = (memory.usedJSHeapSize / memory.jsHeapLimit) * 100;
      
      // If using more than 80% of heap, force performance mode
      if (usedPercent > 80) {
        setIsUltraPerformanceMode(true);
        console.warn('High memory pressure detected, activating Ultra Performance Mode');
      }
    };

    const interval = setInterval(checkMemory, 10000);
    return () => clearInterval(interval);
  }, [setIsUltraPerformanceMode]);

  // Load local data on mount
  useEffect(() => {
    loadLocalData();
    
    // Force save on exit
    const handleBeforeUnload = () => {
      forceSave();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [loadLocalData, forceSave]);

  // Apply Theme
  useEffect(() => {
    const theme = user?.theme || 'system';
    const root = window.document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
  }, [user?.theme]);

  // Apply Accent Color
  useEffect(() => {
    const accent = (user?.accentColor || 'emerald') as AccentColor;
    const colors = ACCENT_COLORS[accent] || ACCENT_COLORS.emerald;
    const root = window.document.documentElement;

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--brand-${key}`, value);
    });
  }, [user?.accentColor]);

  const renderContent = () => {
    return (
      <Suspense fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      }>
        {(() => {
          switch (activeTab) {
            case 'home': return <Home />;
            case 'notebook': return <Notebook />;
            case 'tasks': return <Tasks />;
            case 'exams': return <Exams />;
            case 'stopwatch': return <Stopwatch />;
            case 'focus': return <FocusMode />;
            case 'settings': return <Settings />;
            default: return <Home />;
          }
        })()}
      </Suspense>
    );
  };

  const fontClass = 
    user?.fontFamily === 'space-grotesk' ? 'font-display' : 
    user?.fontFamily === 'mono' ? 'font-mono' : 
    user?.fontFamily === 'outfit' ? 'font-outfit' :
    user?.fontFamily === 'serif' ? 'font-serif' :
    'font-sans';

  return (
    <ErrorBoundary>
      <div className={cn("min-h-screen bg-white text-stone-900 dark:bg-black dark:text-stone-50", fontClass)}>
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="pb-28 pt-6"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </Layout>
        <CustomToaster />
      </div>
    </ErrorBoundary>
  );
}
