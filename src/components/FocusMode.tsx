import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Brain, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ACCENT_COLORS, AccentColor } from '../constants';

const POMODORO_TIME = 25 * 60;
const DEEP_FOCUS_TIME = 50 * 60;
const QUICK_FOCUS = 15 * 60;
const POWER_FOCUS = 90 * 60;
const ULTRA_FOCUS = 120 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;
const EXTENDED_BREAK = 30 * 60;
const MICRO_BREAK = 2 * 60;

export default function FocusMode() {
  const { user, focusSessions, addFocusSession, addStudyLog, setIsFocusActive } = useStore();
  const [mode, setMode] = useState<'pomodoro' | 'deep-focus' | 'quick-focus' | 'power-focus' | 'ultra-focus' | 'short-break' | 'long-break' | 'extended-break' | 'micro-break'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [isActive, setIsActive] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const baseTimeRef = useRef<number>(POMODORO_TIME);
  const timerRef = useRef<number | null>(null);

  // Sync with global store
  useEffect(() => {
    setIsFocusActive(isActive);
    return () => setIsFocusActive(false);
  }, [isActive, setIsFocusActive]);

  // Handle browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isActive) {
        e.preventDefault();
        e.returnValue = 'Your focus session is still active. Closing the app will end your session. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isActive]);

  const updateTimer = useCallback(() => {
    if (isActive && startTimeRef.current !== null) {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      const nextTime = Math.max(0, baseTimeRef.current - elapsed);
      
      setTimeLeft(nextTime);
      
      if (nextTime === 0) {
        handleTimerComplete();
      } else {
        timerRef.current = window.requestAnimationFrame(updateTimer);
      }
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
      baseTimeRef.current = timeLeft;
      timerRef.current = window.requestAnimationFrame(updateTimer);
    } else {
      if (timerRef.current) window.cancelAnimationFrame(timerRef.current);
      startTimeRef.current = null;
    }
    return () => {
      if (timerRef.current) window.cancelAnimationFrame(timerRef.current);
    };
  }, [isActive, updateTimer]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    if (navigator.onLine) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
    }
    
    if (mode === 'pomodoro' || mode === 'deep-focus' || mode === 'quick-focus' || mode === 'power-focus' || mode === 'ultra-focus') {
      const duration = mode === 'pomodoro' ? 25 : mode === 'deep-focus' ? 50 : mode === 'quick-focus' ? 15 : mode === 'power-focus' ? 90 : 120;
      await addFocusSession({
        duration,
        type: 'pomodoro',
        completed: true,
      });
      
      await addStudyLog({
        subject: 'General',
        duration,
        type: 'focus',
        date: new Date().toISOString(),
        notes: `${mode.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} session completed`
      });

      toast.success(`${mode.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} session complete! Time for a break.`);
      setMode('short-break');
      setTimeLeft(SHORT_BREAK);
    } else {
      toast.success('Break over! Ready to focus?');
      setMode('pomodoro');
      setTimeLeft(POMODORO_TIME);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'pomodoro') setTimeLeft(POMODORO_TIME);
    else if (mode === 'deep-focus') setTimeLeft(DEEP_FOCUS_TIME);
    else if (mode === 'quick-focus') setTimeLeft(QUICK_FOCUS);
    else if (mode === 'power-focus') setTimeLeft(POWER_FOCUS);
    else if (mode === 'ultra-focus') setTimeLeft(ULTRA_FOCUS);
    else if (mode === 'short-break') setTimeLeft(SHORT_BREAK);
    else if (mode === 'long-break') setTimeLeft(LONG_BREAK);
    else if (mode === 'extended-break') setTimeLeft(EXTENDED_BREAK);
    else if (mode === 'micro-break') setTimeLeft(MICRO_BREAK);
  };

  const switchMode = (newMode: typeof mode) => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'pomodoro') setTimeLeft(POMODORO_TIME);
    else if (newMode === 'deep-focus') setTimeLeft(DEEP_FOCUS_TIME);
    else if (newMode === 'quick-focus') setTimeLeft(QUICK_FOCUS);
    else if (newMode === 'power-focus') setTimeLeft(POWER_FOCUS);
    else if (newMode === 'ultra-focus') setTimeLeft(ULTRA_FOCUS);
    else if (newMode === 'short-break') setTimeLeft(SHORT_BREAK);
    else if (newMode === 'long-break') setTimeLeft(LONG_BREAK);
    else if (newMode === 'extended-break') setTimeLeft(EXTENDED_BREAK);
    else if (newMode === 'micro-break') setTimeLeft(MICRO_BREAK);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const totalTimeForMode = useMemo(() => {
    if (mode === 'pomodoro') return POMODORO_TIME;
    if (mode === 'deep-focus') return DEEP_FOCUS_TIME;
    if (mode === 'quick-focus') return QUICK_FOCUS;
    if (mode === 'power-focus') return POWER_FOCUS;
    if (mode === 'ultra-focus') return ULTRA_FOCUS;
    if (mode === 'short-break') return SHORT_BREAK;
    if (mode === 'long-break') return LONG_BREAK;
    if (mode === 'extended-break') return EXTENDED_BREAK;
    return MICRO_BREAK;
  }, [mode]);

  const progress = (timeLeft / totalTimeForMode) * 100;

  // Stats calculation
  const todaySessions = useMemo(() => focusSessions.filter(s => 
    new Date(s.createdAt).toDateString() === new Date().toDateString() && s.type === 'pomodoro'
  ), [focusSessions]);

  const totalFocusMinutes = useMemo(() => todaySessions.reduce((acc, s) => acc + s.duration, 0), [todaySessions]);

  const accent = (user?.accentColor || 'emerald') as AccentColor;
  const brandColor = ACCENT_COLORS[accent]?.[600] || ACCENT_COLORS.emerald[600];

  const chartData = [
    { name: 'Focus', value: totalFocusMinutes },
    { name: 'Remaining Goal', value: Math.max(0, 150 - totalFocusMinutes) },
  ];

  const COLORS = [brandColor, '#e5e7eb'];

  return (
    <div className="space-y-8 px-6 pb-20">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Focus Mode</h1>
        <button 
          onClick={() => setShowStats(!showStats)}
          className={cn(
            "rounded-2xl p-2.5 transition-all",
            showStats ? "bg-brand-100 text-brand-600 dark:bg-brand-900/30" : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          )}
        >
          <BarChart3 className="h-6 w-6" />
        </button>
      </header>

      <AnimatePresence mode="wait">
        {showStats ? (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Today's Focus</p>
                <h3 className="mt-1 text-2xl font-bold">{totalFocusMinutes}m</h3>
              </div>
              <div className="rounded-3xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Sessions</p>
                <h3 className="mt-1 text-2xl font-bold">{todaySessions.length}</h3>
              </div>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
              <h4 className="mb-4 font-bold">Daily Progress</h4>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-xs text-stone-500">Goal: 150 minutes focus per day</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="timer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="flex flex-col gap-6 w-full max-w-md">
              <div className="flex flex-wrap gap-1 rounded-2xl bg-stone-100 p-1 dark:bg-stone-900">
                {(['pomodoro', 'deep-focus', 'quick-focus', 'power-focus', 'ultra-focus', 'short-break', 'long-break', 'extended-break', 'micro-break'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={cn(
                      "flex-1 min-w-[80px] rounded-xl px-2 py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all",
                      mode === m 
                        ? "bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-50" 
                        : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                    )}
                  >
                    {m.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex h-56 w-56 sm:h-72 sm:w-72 items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 288 288">
                <circle
                  cx="144"
                  cy="144"
                  r="130"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-stone-100 dark:text-stone-900"
                />
                <motion.circle
                  cx="144"
                  cy="144"
                  r="130"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 130}
                  animate={{ 
                    strokeDashoffset: 2 * Math.PI * 130 * (1 - progress / 100) 
                  }}
                  transition={{ duration: 1, ease: "linear" }}
                  className="text-brand-600"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="font-display text-4xl sm:text-7xl font-bold tabular-nums tracking-tight">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                  {mode === 'pomodoro' || mode === 'deep-focus' ? 'Focusing' : 'Resting'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <button 
                onClick={resetTimer}
                className="rounded-full bg-stone-100 p-3 sm:p-4 text-stone-600 transition-all hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800"
              >
                <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button 
                onClick={toggleTimer}
                className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-600/20 transition-all hover:bg-brand-700 active:scale-95"
              >
                {isActive ? <Pause className="h-6 w-6 sm:h-8 sm:w-8" /> : <Play className="h-6 w-6 sm:h-8 sm:w-8 translate-x-0.5" />}
              </button>
              <div className="w-10 sm:w-14" /> {/* Spacer */}
            </div>

            <div className="w-full space-y-4 rounded-3xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-brand-50 p-2 text-brand-600 dark:bg-brand-900/20">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold">Deep Focus Tip</h4>
                  <p className="text-xs text-stone-500">Put your phone away and close unnecessary tabs.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
