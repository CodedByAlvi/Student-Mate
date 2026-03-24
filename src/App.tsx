/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { cn } from './lib/utils';
import Layout from './components/Layout';
import Home from './components/Home';
import Notebook from './components/Notebook';
import Translator from './components/Translator';
import Stopwatch from './components/Stopwatch';
import FocusMode from './components/FocusMode';
import Exams from './components/Exams';
import Tasks from './components/Tasks';
import Settings from './components/Settings';
import { motion, AnimatePresence } from 'motion/react';
import { ACCENT_COLORS, AccentColor } from './constants';

import ErrorBoundary from './components/ErrorBoundary';
import CustomToaster from './components/CustomToaster';

export default function App() {
  const { user, activeTab, setActiveTab, loadLocalData } = useStore();

  // Load local data on mount
  useEffect(() => {
    loadLocalData();
  }, [loadLocalData]);

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
    switch (activeTab) {
      case 'home': return <Home />;
      case 'notebook': return <Notebook />;
      case 'translator': return <Translator />;
      case 'tasks': return <Tasks />;
      case 'exams': return <Exams />;
      case 'stopwatch': return <Stopwatch />;
      case 'focus': return <FocusMode />;
      case 'settings': return <Settings />;
      default: return <Home />;
    }
  };

  const fontClass = 
    user?.fontFamily === 'space-grotesk' ? 'font-display' : 
    user?.fontFamily === 'mono' ? 'font-mono' : 
    user?.fontFamily === 'outfit' ? 'font-outfit' :
    user?.fontFamily === 'serif' ? 'font-serif' :
    'font-sans';

  return (
    <ErrorBoundary>
      <div className={cn("min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-50", fontClass)}>
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
