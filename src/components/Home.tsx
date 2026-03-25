import { useEffect, useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, CheckCircle2, Brain, Target, TrendingUp, ArrowRight, AlarmClock, Calendar, Clock } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, differenceInDays, differenceInCalendarDays } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { cn } from '../lib/utils';
import { ACCENT_COLORS, AccentColor } from '../constants';
import { useDevice } from '../hooks/useDevice';

export default function Home() {
  const user = useStore(state => state.user);
  const notes = useStore(state => state.notes);
  const tasks = useStore(state => state.tasks);
  const reminders = useStore(state => state.reminders);
  const focusSessions = useStore(state => state.focusSessions);
  const exams = useStore(state => state.exams);
  const setActiveTab = useStore(state => state.setActiveTab);
  const { isTablet, isDesktop, isSmallPhone } = useDevice();
  
  const [currentExamIndex, setCurrentExamIndex] = useState(0);
  
  const accent = (user?.accentColor || 'emerald') as AccentColor;
  const brandColor = useMemo(() => ACCENT_COLORS[accent]?.[600] || ACCENT_COLORS.emerald[600], [accent]);
  
  const pendingTasks = useMemo(() => tasks.filter(t => !t.isCompleted), [tasks]);
  const upcomingReminders = useMemo(() => reminders.filter(r => {
    const date = new Date(r.dateTime);
    return !isNaN(date.getTime()) && date > new Date();
  }).slice(0, 3), [reminders]);
  
  // Focus Score Calculation (0-100)
  const todaySessions = useMemo(() => focusSessions.filter(s => {
    const date = new Date(s.createdAt);
    return !isNaN(date.getTime()) && date.toDateString() === new Date().toDateString();
  }), [focusSessions]);

  const focusMinutes = useMemo(() => todaySessions.reduce((acc, s) => acc + s.duration, 0), [todaySessions]);
  const focusScore = useMemo(() => Math.min(100, Math.round((focusMinutes / 120) * 100)), [focusMinutes]);

  // Productivity Graph Data
  const chartData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Pre-filter sessions for the current week to avoid O(days * sessions)
    const weekSessions = focusSessions.filter(s => {
      const date = new Date(s.createdAt);
      return !isNaN(date.getTime()) && date >= weekStart && date <= weekEnd;
    });

    return days.map(day => {
      const daySessions = weekSessions.filter(s => isSameDay(new Date(s.createdAt), day));
      const duration = daySessions.reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
      return {
        name: format(day, 'EEE'),
        minutes: duration,
        fullDate: format(day, 'MMM d'),
      };
    });
  }, [focusSessions]);

  const stats = useMemo(() => [
    { label: 'Notes', count: notes.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', tab: 'notebook' },
    { label: 'To-Do', count: pendingTasks.length, icon: CheckCircle2, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20', tab: 'tasks' },
    { label: 'Focus', count: focusScore, icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', tab: 'focus' },
  ], [notes.length, pendingTasks.length, focusScore]);

  const upcomingExams = useMemo(() => exams
    .filter(e => {
      const date = new Date(e.dateTime);
      return !isNaN(date.getTime()) && date > new Date();
    })
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()), [exams]);

  useEffect(() => {
    if (upcomingExams.length <= 1) {
      setCurrentExamIndex(0);
      return;
    }
    
    const interval = setInterval(() => {
      setCurrentExamIndex((prev) => (prev + 1) % upcomingExams.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [upcomingExams.length]);

  const MOTIVATIONAL_QUOTES = [
    "The secret of getting ahead is getting started.",
    "Don't let what you cannot do interfere with what you can do.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "The only place where success comes before work is in the dictionary.",
    "Your education is a dress rehearsal for a life that is yours to lead.",
    "The beautiful thing about learning is that no one can take it away from you.",
    "Education is the most powerful weapon which you can use to change the world.",
    "The expert in anything was once a beginner.",
    "Believe you can and you're halfway there.",
    "It always seems impossible until it's done."
  ];

  const [quoteIndex, setQuoteIndex] = useState(() => {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return dayOfYear % MOTIVATIONAL_QUOTES.length;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 10000); // Rotate every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const quote = MOTIVATIONAL_QUOTES[quoteIndex];

  return (
    <div className="space-y-8 px-4 sm:px-6 pb-20">
      <header className="relative py-6 sm:py-8">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-px w-6 sm:w-8 bg-stone-300 dark:bg-stone-700" />
            <h2 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
              {format(new Date(), 'EEEE, MMMM do')}
            </h2>
          </div>
          <div className="relative min-h-[100px] sm:min-h-[120px]">
            <AnimatePresence mode="wait">
              <motion.h1 
                key={quote}
                initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-white leading-[1.1] sm:text-5xl break-words"
              >
                {quote}
              </motion.h1>
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Stats Grid - Brutalist/Technical Style */}
      <div className="grid grid-cols-3 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden bg-white dark:bg-stone-900 shadow-sm">
        {stats.map((stat, index) => (
          <motion.button
            key={stat.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setActiveTab(stat.tab)}
            className={cn(
              "flex flex-col items-center gap-1 sm:gap-2 py-3 sm:py-4 transition-all hover:bg-stone-50 dark:hover:bg-stone-800/50",
              index !== stats.length - 1 && "border-r border-stone-200 dark:border-stone-800"
            )}
          >
            <div className={cn("rounded-xl p-1.5 sm:p-2 shadow-sm", stat.bg, stat.color)}>
              <stat.icon className="h-4 w-4" />
            </div>
            <div className="space-y-0.5 text-center">
              <span className={cn(
                "font-mono font-bold tracking-tighter leading-none block",
                isSmallPhone ? "text-lg" : "text-xl"
              )}>
                {stat.count.toString().padStart(2, '0')}{stat.label === 'Focus' ? '%' : ''}
              </span>
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-stone-400">{stat.label}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Main Content Grid for Tablet/Desktop */}
      <div className={cn(
        "grid gap-8",
        isTablet || isDesktop ? "grid-cols-2" : "grid-cols-1"
      )}>
        {/* Upcoming Exams Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Upcoming Exams</h3>
            <button 
              onClick={() => setActiveTab('exams')}
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="relative overflow-hidden h-full">
            <AnimatePresence mode="wait">
              {upcomingExams.length > 0 && upcomingExams[currentExamIndex] ? (
                <motion.div
                  key={upcomingExams[currentExamIndex].id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="relative overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 h-full flex flex-col justify-between"
                >
                  {/* Background Accent */}
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/5 blur-3xl dark:bg-brand-500/10" />
                  
                  <div className="relative flex flex-col gap-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/20">
                          <AlarmClock className="h-7 w-7" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold">{upcomingExams[currentExamIndex].subject}</h4>
                          <span className="inline-block rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:bg-stone-800">
                            {upcomingExams[currentExamIndex].type}
                          </span>
                        </div>
                      </div>
                      {(() => {
                        const examDate = new Date(upcomingExams[currentExamIndex].dateTime);
                        if (isNaN(examDate.getTime())) return null;
                        const diffDays = differenceInCalendarDays(examDate, new Date());
                        return (
                          <div className={cn(
                            "flex flex-col items-end",
                            diffDays <= 3 ? "text-amber-600" : "text-stone-400"
                          )}>
                            <span className="text-2xl font-black leading-none">
                              {diffDays <= 0 ? '0' : diffDays}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                              {diffDays <= 0 ? 'Today' : diffDays === 1 ? 'Day Left' : 'Days Left'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-stone-50 p-4 dark:bg-stone-800/50">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-stone-400" />
                        <span className="text-sm font-medium">
                          {(() => {
                            const date = new Date(upcomingExams[currentExamIndex].dateTime);
                            return !isNaN(date.getTime()) ? format(date, 'MMMM do, yyyy') : 'Invalid Date';
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-stone-400" />
                        <span className="text-sm font-medium">
                          {(() => {
                            const date = new Date(upcomingExams[currentExamIndex].dateTime);
                            return !isNaN(date.getTime()) ? format(date, 'p') : '--:--';
                          })()}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button 
                        onClick={() => setActiveTab('exams')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-stone-800 active:scale-[0.98] dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-200"
                      >
                        View Details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-40 flex-col items-center justify-center gap-3 rounded-[2.5rem] border-2 border-dashed border-stone-200 p-8 text-center dark:border-stone-800"
                >
                  <div className="rounded-full bg-stone-100 p-3 dark:bg-stone-900">
                    <AlarmClock className="h-6 w-6 text-stone-300" />
                  </div>
                  <p className="text-sm font-medium text-stone-400">No upcoming exams scheduled</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Upcoming Reminders */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Upcoming</h3>
            <button 
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {upcomingReminders.length > 0 ? (
              upcomingReminders.map((reminder) => {
                const date = new Date(reminder.dateTime);
                if (isNaN(date.getTime())) return null;
                return (
                  <motion.div 
                    key={reminder.id} 
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 rounded-3xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-stone-100 text-stone-500 dark:bg-stone-800">
                      <span className="text-[10px] font-bold uppercase">{format(date, 'MMM')}</span>
                      <span className="text-lg font-bold">{format(date, 'dd')}</span>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <h4 className="font-bold">{reminder.title}</h4>
                      <p className="text-xs text-stone-500">{format(date, 'p')}</p>
                    </div>
                    <div className={`h-3 w-3 rounded-full ${reminder.color || 'bg-brand-500'}`} />
                  </motion.div>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-stone-200 p-12 text-center dark:border-stone-800">
                <p className="text-sm text-stone-400">No upcoming events</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Productivity Graph */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Productivity</h3>
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand-600">
            <TrendingUp className="h-3 w-3" />
            <span>+12% this week</span>
          </div>
        </div>
        <div className="h-[200px] w-full rounded-3xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                width={30}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 700, color: brandColor }}
                formatter={(value: number) => [`${value} mins`, 'Focus Time']}
              />
              <Bar 
                dataKey="minutes" 
                radius={[6, 6, 0, 0]}
                barSize={32}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.minutes > 0 ? brandColor : '#e5e7eb'} 
                    fillOpacity={entry.minutes > 0 ? 1 : 0.3}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
