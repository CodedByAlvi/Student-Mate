import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  Plus, 
  Trash2, 
  ChevronRight,
  BookOpen,
  CheckCircle2,
  BrainCircuit,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInDays, parseISO, isAfter } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { cn } from '../lib/utils';
import { Exam, StudyLog, SubjectStats } from '../types';

export default function Intelligence() {
  const { 
    exams, 
    tasks, 
    studyLogs, 
    addExam, 
    deleteExam, 
    addStudyLog, 
    getSubjectStats,
    getStudyPlan 
  } = useStore();

  const [showAddExam, setShowAddExam] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);
  const [availableTime, setAvailableTime] = useState(120); // default 2 hours

  const stats = useMemo(() => getSubjectStats(), [tasks, studyLogs, exams]);
  const studyPlan = useMemo(() => getStudyPlan(availableTime), [stats, availableTime]);

  const urgentExams = exams
    .filter(e => isAfter(new Date(e.dateTime), new Date()))
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 3);

  const weakSubjects = stats
    .filter(s => s.priorityScore > 40)
    .sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <div className="space-y-8 px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight">Study Insights</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">AI-powered academic guidance</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/30">
          <Sparkles className="h-6 w-6" />
        </div>
      </div>

      {/* Smart Notifications */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold">
          <Sparkles className="h-5 w-5 text-brand-500" />
          Smart Notifications
        </h3>
        <div className="space-y-3">
          {weakSubjects.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 rounded-2xl border border-red-100 bg-red-50/50 p-4 dark:border-red-900/20 dark:bg-red-900/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                You are falling behind in <span className="font-bold">{weakSubjects[0].subject}</span>. Consider allocating more time today.
              </p>
            </motion.div>
          )}
          {stats.length > 0 && stats.every(s => s.taskCompletionRate > 80) && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/20 dark:bg-emerald-900/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                You're on track today—keep going! Your task completion rate is excellent.
              </p>
            </motion.div>
          )}
          {urgentExams.length > 0 && differenceInDays(new Date(urgentExams[0].dateTime), new Date()) <= 2 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 rounded-2xl border border-orange-100 bg-orange-50/50 p-4 dark:border-orange-900/20 dark:bg-orange-900/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30">
                <Clock className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                Upcoming exam: <span className="font-bold">{urgentExams[0].subject}</span> in {differenceInDays(new Date(urgentExams[0].dateTime), new Date())} days.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Exam Countdown */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold">
            <Clock className="h-5 w-5 text-orange-500" />
            Exam Countdown
          </h3>
          <button 
            onClick={() => setShowAddExam(true)}
            className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
          >
            <Plus className="h-3 w-3" /> Add Exam
          </button>
        </div>

        <div className="grid gap-4">
          {urgentExams.length > 0 ? (
            urgentExams.map(exam => {
              const daysLeft = differenceInDays(new Date(exam.dateTime), new Date());
              const isUrgent = daysLeft <= 3;
              
              return (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border p-4 transition-all",
                    isUrgent 
                      ? "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10" 
                      : "border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        {exam.type} • {exam.subject}
                      </span>
                      <h4 className="font-bold">{exam.subject} Exam</h4>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-2xl font-black",
                        isUrgent ? "text-red-600" : "text-stone-900 dark:text-stone-50"
                      )}>
                        {daysLeft}
                      </span>
                      <span className="ml-1 text-xs font-bold text-stone-400">days</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3 h-1.5 w-full rounded-full bg-stone-100 dark:bg-stone-800">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(5, 100 - (daysLeft * 5))}%` }}
                      className={cn(
                        "h-full rounded-full",
                        isUrgent ? "bg-red-500" : "bg-brand-500"
                      )}
                    />
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-200 p-8 text-center dark:border-stone-800">
              <p className="text-sm text-stone-400">No upcoming exams. Take a breath!</p>
            </div>
          )}
        </div>
      </section>

      {/* Weak Subject Detection */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Weak Subjects Alert
        </h3>

        <div className="grid gap-4">
          {weakSubjects.length > 0 ? (
            weakSubjects.map(subject => (
              <div 
                key={subject.subject}
                className="flex items-center justify-between rounded-2xl bg-stone-100 p-4 dark:bg-stone-900"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold">{subject.subject}</h4>
                    <p className="text-xs text-stone-500">Needs more attention</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-600">
                    {Math.round(subject.priorityScore)}%
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-stone-400">Priority</div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-900/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                You're on track! No critical weaknesses detected.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Subject Performance Chart */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold">
          <BarChart3 className="h-5 w-5 text-brand-500" />
          Subject Performance
        </h3>
        <div className="h-64 w-full rounded-2xl bg-white p-4 shadow-sm dark:bg-stone-900">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats}>
              <PolarGrid stroke="#444" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#888' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
              <Radar
                name="Confidence"
                dataKey="confidence"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.5}
              />
              <Radar
                name="Completion"
                dataKey="taskCompletionRate"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Daily Study Plan */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold">
            <Calendar className="h-5 w-5 text-brand-500" />
            Personalized Study Plan
          </h3>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={availableTime}
              onChange={(e) => setAvailableTime(Number(e.target.value))}
              className="w-16 rounded-lg border border-stone-200 bg-transparent px-2 py-1 text-xs dark:border-stone-800"
            />
            <span className="text-[10px] font-bold text-stone-400">MINS</span>
          </div>
        </div>

        <div className="relative space-y-4 pl-4 before:absolute before:left-0 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
          {studyPlan.items.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative flex items-center gap-4"
            >
              <div className="absolute -left-5 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-500 dark:border-stone-950" />
              <div className={cn(
                "flex flex-1 items-center justify-between rounded-2xl p-4",
                item.type === 'break' ? "bg-stone-100 dark:bg-stone-900" : "bg-brand-50 dark:bg-brand-900/20"
              )}>
                <div>
                  <div className="text-[10px] font-bold text-stone-400">{item.startTime}</div>
                  <h4 className="font-bold">{item.subject}</h4>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-stone-500">{item.duration}m</div>
                  <div className="text-[10px] uppercase tracking-wider text-stone-400">{item.type}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Smart Recommendations */}
      <section className="rounded-3xl bg-stone-900 p-6 text-white dark:bg-brand-900/40">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold">Smart Strategy</h3>
        </div>
        <ul className="mt-4 space-y-3">
          {studyPlan.goals.map((goal, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-stone-300">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              {goal}
            </li>
          ))}
          <li className="flex items-start gap-3 text-sm text-stone-300">
            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
            Take a 5-minute walk after each session to improve retention.
          </li>
        </ul>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {showAddExam && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 dark:bg-stone-900"
            >
              <h3 className="text-xl font-bold">Add New Exam</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addExam({
                  subject: formData.get('subject') as string,
                  dateTime: `${formData.get('date')}T${formData.get('time')}`,
                  type: formData.get('type') as any,
                  priority: 'high'
                });
                setShowAddExam(false);
              }} className="space-y-4">
                <input name="subject" placeholder="Subject Name" required className="w-full rounded-xl border border-stone-200 bg-transparent p-3 dark:border-stone-800" />
                <div className="grid grid-cols-2 gap-4">
                  <input name="date" type="date" required className="rounded-xl border border-stone-200 bg-transparent p-3 dark:border-stone-800" />
                  <input name="time" type="time" required className="rounded-xl border border-stone-200 bg-transparent p-3 dark:border-stone-800" />
                </div>
                <select name="type" className="w-full rounded-xl border border-stone-200 bg-transparent p-3 dark:border-stone-800">
                  <option value="Midterm">Midterm</option>
                  <option value="Final">Final</option>
                  <option value="Test">Test</option>
                  <option value="Quiz">Quiz</option>
                </select>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddExam(false)} className="flex-1 rounded-xl bg-stone-100 py-3 font-bold dark:bg-stone-800">Cancel</button>
                  <button type="submit" className="flex-1 rounded-xl bg-brand-600 py-3 font-bold text-white">Add Exam</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Study Log Modal */}
      <button 
        onClick={() => setShowAddLog(true)}
        className="fixed bottom-32 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-600/30 transition-transform active:scale-90"
      >
        <BookOpen className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {showAddLog && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 dark:bg-stone-900"
            >
              <h3 className="text-xl font-bold">Log Study Session</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addStudyLog({
                  subject: formData.get('subject') as string,
                  duration: Number(formData.get('duration')),
                  type: 'manual',
                  date: new Date().toISOString(),
                  notes: formData.get('notes') as string
                });
                setShowAddLog(false);
              }} className="space-y-4">
                <input name="subject" placeholder="Subject" required className="w-full rounded-xl border border-stone-200 bg-transparent p-3 dark:border-stone-800" />
                <input name="duration" type="number" placeholder="Duration (minutes)" required className="w-full rounded-xl border border-stone-200 bg-transparent p-3 dark:border-stone-800" />
                <textarea name="notes" placeholder="What did you study?" className="w-full rounded-xl border border-stone-200 bg-transparent p-3 dark:border-stone-800" rows={3} />
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddLog(false)} className="flex-1 rounded-xl bg-stone-100 py-3 font-bold dark:bg-stone-800">Cancel</button>
                  <button type="submit" className="flex-1 rounded-xl bg-brand-600 py-3 font-bold text-white">Log Session</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
