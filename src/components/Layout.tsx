import React from 'react';
import { Home, Notebook as NoteIcon, CheckSquare, Brain, Settings as SettingsIcon, Moon, Sun, GraduationCap, AlarmClock, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import ConfirmModal from './ConfirmModal';
import { useDevice } from '../hooks/useDevice';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const user = useStore(state => state.user);
  const updateUserProfile = useStore(state => state.updateUserProfile);
  const { isTablet, isDesktop, isSmallPhone } = useDevice();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'notebook', label: 'Notes', icon: NoteIcon },
    { id: 'exams', label: 'Exams', icon: AlarmClock },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'stopwatch', label: 'Stopwatch', icon: Timer },
    { id: 'focus', label: 'Focus', icon: Brain },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className={cn(
      "mx-auto min-h-screen bg-stone-50 dark:bg-[#050505] selection:bg-brand-500/30 selection:text-brand-900 pb-32 transition-all duration-500",
      isSmallPhone ? "max-w-full" : 
      isTablet ? "max-w-4xl px-8" : 
      isDesktop ? "max-w-6xl px-12" : 
      "max-w-lg sm:max-w-2xl md:max-w-3xl"
    )}>
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/5 blur-[120px] dark:bg-brand-500/10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] dark:bg-blue-500/10" />
      </div>

      <header className={cn(
        "sticky top-0 z-50 flex items-center justify-between border-b border-stone-200/50 bg-stone-50/60 backdrop-blur-xl dark:border-stone-800/50 dark:bg-[#050505]/60 transition-all",
        isTablet || isDesktop ? "px-0 py-6 mb-4" : "px-4 sm:px-6 py-4 sm:py-5"
      )}>
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-stone-900 text-white shadow-xl dark:bg-white dark:text-black"
          >
            <GraduationCap className="h-4 w-4 sm:h-6 sm:w-6" />
          </motion.div>
          <div className="flex flex-col">
            <h1 className="font-display text-base sm:text-xl font-bold tracking-tight leading-none">Student Mate</h1>
            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mt-1">Academic Hub</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-stone-200 bg-white transition-all hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700",
              activeTab === 'settings' ? "text-brand-600 border-brand-200 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-900/30" : "text-stone-500"
            )}
          >
            <SettingsIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => {
              const currentTheme = user?.theme || 'light';
              const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
              updateUserProfile({ theme: nextTheme });
            }}
            className="group relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-stone-200 bg-white transition-all hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={user?.theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {user?.theme === 'dark' ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </header>

      <main className="relative">{children}</main>

      <nav className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[2.5rem] border border-stone-200/50 bg-white/80 p-1.5 sm:p-2 shadow-2xl backdrop-blur-2xl dark:border-stone-800/50 dark:bg-stone-900/80 safe-area-bottom transition-all duration-500",
        isTablet ? "w-[80%] max-w-[800px] p-3" : 
        isDesktop ? "w-[60%] max-w-[900px] p-4" : 
        "w-[96%] max-w-[500px]"
      )}>
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar relative px-1 sm:px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-shrink-0 rounded-2xl transition-all duration-300",
                  isTablet || isDesktop ? "min-w-[80px] h-20" : "min-w-[48px] sm:min-w-[56px] md:min-w-[64px] h-12 sm:h-14 md:h-16",
                  isActive ? "text-brand-600" : "text-stone-400 hover:text-stone-600 dark:text-stone-400 dark:hover:text-stone-200"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 rounded-2xl bg-brand-50 dark:bg-brand-900/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={cn(
                  "relative z-10 transition-transform", 
                  isTablet || isDesktop ? "h-6 w-6" : "h-5 w-5",
                  isActive && "scale-110 mb-1"
                )} />
                <span className={cn(
                  "relative z-10 font-bold uppercase tracking-wider transition-all",
                  isTablet || isDesktop ? "text-[10px]" : "text-[9px]",
                  isActive ? "opacity-100" : "opacity-60"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-1 h-1 w-1 rounded-full bg-brand-600"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
      <ConfirmModal />
    </div>
  );
}
