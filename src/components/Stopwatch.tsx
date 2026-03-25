import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useDevice } from '../hooks/useDevice';

export default function Stopwatch() {
  const { isTablet, isDesktop } = useDevice();
  // Stopwatch State - Using Date.now() for high precision and background stability
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);
  const requestRef = useRef<number | null>(null);

  const updateStopwatch = useCallback(() => {
    if (isRunning && startTimeRef.current !== null) {
      const now = Date.now();
      const currentElapsed = now - startTimeRef.current;
      const nextTime = accumulatedTimeRef.current + currentElapsed;
      
      // Only update if the centisecond has actually changed to save renders
      setTime(prev => {
        if (Math.floor(prev / 10) !== Math.floor(nextTime / 10)) return nextTime;
        return prev;
      });
      
      requestRef.current = requestAnimationFrame(updateStopwatch);
    }
  }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      requestRef.current = requestAnimationFrame(updateStopwatch);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (startTimeRef.current !== null) {
        accumulatedTimeRef.current += Date.now() - startTimeRef.current;
      }
      startTimeRef.current = null;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, updateStopwatch]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "flex flex-col items-center gap-10 px-6 pb-24 transition-all duration-500",
      isTablet || isDesktop ? "max-w-6xl mx-auto" : "max-w-xl mx-auto"
    )}>
      <header className="w-full text-center space-y-1">
        <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">Stopwatch</h2>
        <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base">Track your time with precision.</p>
      </header>

      <div className={cn(
        "flex flex-col items-center gap-10 w-full",
        (isTablet || isDesktop) && "flex-row items-start justify-center gap-20"
      )}>
        <div className="flex flex-col items-center gap-10">
          <div className="relative flex h-56 w-56 sm:h-80 sm:w-80 items-center justify-center rounded-full border-[10px] sm:border-[15px] border-stone-100 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <div className="text-center">
              <span className="font-mono text-3xl sm:text-6xl font-bold tracking-tighter text-stone-900 dark:text-stone-50">
                {formatTime(time)}
              </span>
            </div>
            <motion.div 
              className="absolute inset-0 -m-[10px] sm:-m-[15px] rounded-full border-[10px] sm:border-[15px] border-brand-500 border-t-transparent"
              animate={{ rotate: isRunning ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            />
          </div>

          <div className="flex items-center gap-6 sm:gap-10">
            <button 
              onClick={() => {
                setTime(0);
                setLaps([]);
                setIsRunning(false);
                accumulatedTimeRef.current = 0;
                startTimeRef.current = null;
                if (requestRef.current) cancelAnimationFrame(requestRef.current);
              }}
              className="rounded-2xl bg-stone-100 p-4 sm:p-6 text-stone-500 transition-all hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400"
            >
              <RotateCcw className="h-6 w-6 sm:h-10 sm:w-10" />
            </button>
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={cn(
                "rounded-3xl p-6 sm:p-10 text-white shadow-2xl transition-all active:scale-90",
                isRunning 
                  ? "bg-brand-500 hover:bg-brand-600 shadow-brand-500/20" 
                  : "bg-brand-600 hover:bg-brand-700 shadow-brand-600/20"
              )}
            >
              {isRunning ? <Pause className="h-10 w-10 sm:h-14 sm:w-14" /> : <Play className="h-10 w-10 sm:h-14 sm:w-14 fill-current" />}
            </button>
            <button 
              onClick={() => setLaps([time, ...laps])}
              disabled={!isRunning}
              className="rounded-2xl bg-stone-100 p-4 sm:p-6 text-stone-500 transition-all hover:bg-stone-200 disabled:opacity-50 dark:bg-stone-800 dark:text-stone-400"
            >
              <Plus className="h-6 w-6 sm:h-10 sm:w-10" />
            </button>
          </div>
        </div>

        <div className={cn(
          "w-full space-y-4",
          (isTablet || isDesktop) && "max-w-md"
        )}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Lap History</h3>
            <span className="text-xs font-bold text-stone-400">{laps.length} Laps</span>
          </div>
          <div className={cn(
            "max-h-60 overflow-y-auto space-y-3 pr-2 scrollbar-hide",
            (isTablet || isDesktop) && "max-h-[400px]"
          )}>
            {laps.map((lap, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={i} 
                className="flex items-center justify-between rounded-2xl border border-stone-100 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900"
              >
                <span className="font-bold text-stone-400">Lap {laps.length - i}</span>
                <span className="font-mono text-lg font-bold">{formatTime(lap)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
