import React from 'react';
import { useStore } from '../store/useStore';
import ToDo from './ToDo';
import Reminders from './Reminders';
import { CheckSquare, Bell } from 'lucide-react';
import { cn } from '../lib/utils';
import { useDevice } from '../hooks/useDevice';

export default function Tasks() {
  const activeSubTab = useStore(state => state.activeSubTab);
  const setActiveSubTab = useStore(state => state.setActiveSubTab);
  const { isTablet, isDesktop } = useDevice();

  return (
    <div className={cn(
      "mx-auto space-y-8 pb-24 transition-all duration-500",
      isTablet || isDesktop ? "max-w-4xl px-8" : "max-w-3xl px-4 sm:px-6"
    )}>
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-8 rounded-full bg-brand-600" />
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-stone-400">Productivity Hub</h2>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight">Tasks</h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base">Manage your daily to-dos and set important reminders.</p>
      </header>

      <div className="">
        <div className={cn(
          "flex items-center gap-1 rounded-[1.5rem] bg-stone-100 p-1.5 dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800/50 transition-all duration-300",
          (isTablet || isDesktop) && "max-w-md mx-auto"
        )}>
          <button
            onClick={() => setActiveSubTab('todo')}
            className={cn(
              "flex flex-1 items-center justify-center gap-2.5 rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest transition-all duration-300",
              activeSubTab === 'todo' 
                ? "bg-white text-stone-900 shadow-lg shadow-stone-200/50 dark:bg-stone-800 dark:text-white dark:shadow-none" 
                : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            )}
          >
            <CheckSquare className={cn("h-4 w-4 transition-transform", activeSubTab === 'todo' && "scale-110")} />
            To-Do List
          </button>
          <button
            onClick={() => setActiveSubTab('reminders')}
            className={cn(
              "flex flex-1 items-center justify-center gap-2.5 rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest transition-all duration-300",
              activeSubTab === 'reminders' 
                ? "bg-white text-stone-900 shadow-lg shadow-stone-200/50 dark:bg-stone-800 dark:text-white dark:shadow-none" 
                : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            )}
          >
            <Bell className={cn("h-4 w-4 transition-transform", activeSubTab === 'reminders' && "scale-110")} />
            Reminders
          </button>
        </div>
      </div>

      <div className="transition-all duration-300">
        {activeSubTab === 'todo' ? <ToDo /> : <Reminders />}
      </div>
    </div>
  );
}
