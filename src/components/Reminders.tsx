import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Bell, Clock, Plus, Trash2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function Reminders() {
  const { reminders, addReminder, deleteReminder, setConfirmModal } = useStore();
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [title, setTitle] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReminders = reminders.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dateTime || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await addReminder({
        title,
        type: 'other',
        dateTime: new Date(dateTime).toISOString(),
        color: 'bg-brand-500',
      });
      setTitle('');
      setDateTime('');
      setShowAddReminder(false);
      toast.success('Reminder set', {
        icon: <Bell className="h-4 w-4 text-brand-600" />
      });
    } catch (error) {
      toast.error('Failed to set reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 px-6 pb-20">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Reminders</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAddReminder(!showAddReminder)}
            className={cn(
              "flex items-center gap-2 rounded-2xl px-4 py-2.5 font-bold transition-all",
              showAddReminder 
                ? "bg-brand-600 text-white shadow-xl shadow-brand-600/20" 
                : "bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800"
            )}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs uppercase tracking-widest">New</span>
          </button>
        </div>
      </header>

      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 transition-colors group-focus-within:text-brand-600">
          <Bell className="h-5 w-5" />
        </div>
        <input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search reminders..."
          className="w-full rounded-[2rem] border border-stone-200 bg-white py-5 pl-16 pr-8 text-base outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 dark:border-stone-800 dark:bg-stone-900/30 dark:focus:border-brand-500"
        />
      </div>

      <AnimatePresence>
        {showAddReminder && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAddReminder}
            className="overflow-hidden space-y-8 rounded-[2.5rem] border-2 border-brand-100 bg-brand-50/30 p-6 sm:p-8 shadow-2xl shadow-brand-500/5 dark:border-brand-900/30 dark:bg-brand-900/10"
          >
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400 ml-1">Reminder Title</label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you need to remember?"
                className="w-full rounded-2xl border-none bg-white px-6 py-5 text-stone-900 shadow-sm ring-1 ring-stone-200 transition-all focus:ring-2 focus:ring-brand-500 dark:bg-stone-900 dark:text-white dark:ring-stone-800"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400 ml-1">Date & Time</label>
              <input 
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full rounded-2xl border-none bg-white px-6 py-5 text-stone-900 shadow-sm ring-1 ring-stone-200 transition-all focus:ring-2 focus:ring-brand-500 dark:bg-stone-900 dark:text-white dark:ring-stone-800"
              />
            </div>
            <button 
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-600 py-5 font-bold text-white shadow-xl shadow-brand-600/20 transition-all hover:bg-brand-700 active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              Set Reminder
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {filteredReminders.map((reminder) => (
          <motion.div 
            layout
            key={reminder.id} 
            className="group flex items-center gap-5 rounded-[2rem] border border-stone-200 bg-white p-5 transition-all hover:shadow-2xl hover:border-brand-200 dark:border-stone-800 dark:bg-stone-900/40 dark:hover:border-brand-800"
          >
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-xl shadow-brand-500/20 transition-transform group-hover:scale-110">
              <Clock className="h-7 w-7" />
            </div>
            <div className="flex-1 space-y-1.5">
              <h4 className="font-display text-lg font-bold tracking-tight text-stone-900 dark:text-stone-50">{reminder.title}</h4>
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-800 px-2 py-1 rounded-lg">
                  <Calendar className="h-3 w-3 text-brand-500" />
                  <span>{format(new Date(reminder.dateTime), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-800 px-2 py-1 rounded-lg">
                  <Clock className="h-3 w-3 text-brand-500" />
                  <span>{format(new Date(reminder.dateTime), 'p')}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                setConfirmModal({
                  title: 'Delete Reminder',
                  message: 'Are you sure you want to delete this reminder?',
                  onConfirm: () => {
                    deleteReminder(reminder.id);
                    toast.error('Reminder removed');
                  }
                });
              }}
              className="rounded-full p-2.5 text-stone-300 transition-all hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </motion.div>
        ))}
        {reminders.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-900">
              <Bell className="h-8 w-8 text-stone-300" />
            </div>
            <p className="text-stone-400">No reminders set. Stay ahead of your schedule!</p>
          </div>
        )}
      </div>
    </div>
  );
}
