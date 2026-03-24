import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Pencil, 
  Tag,
  AlarmClock,
  Timer,
  Bell
} from 'lucide-react';
import { format, formatDistanceToNow, isPast, differenceInHours, differenceInDays, differenceInCalendarDays } from 'date-fns';
import { Exam, ExamType, Priority } from '../types';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

const EXAM_TYPES: ExamType[] = ['Midterm', 'Final', 'Test', 'Quiz', 'Assignment', 'Other'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export default function Exams() {
  const { exams, addExam, updateExam, deleteExam, setConfirmModal } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [newExam, setNewExam] = useState<Partial<Exam>>({
    subject: '',
    type: 'Test',
    priority: 'medium',
    dateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    description: ''
  });

  const handleEdit = (exam: Exam) => {
    setNewExam({
      subject: exam.subject,
      type: exam.type,
      priority: exam.priority,
      dateTime: format(new Date(exam.dateTime), "yyyy-MM-dd'T'HH:mm"),
      description: exam.description || ''
    });
    setEditingExamId(exam.id);
    setIsAdding(true);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.subject || !newExam.dateTime || isSubmitting) {
      if (!newExam.subject || !newExam.dateTime) {
        toast.error('Subject and Date are required');
      }
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingExamId) {
        await updateExam(editingExamId, newExam);
        toast.success('Exam updated successfully');
      } else {
        await addExam(newExam);
        toast.success('Exam added successfully', {
          icon: <Calendar className="h-4 w-4 text-brand-600" />
        });
      }
      setIsAdding(false);
      setEditingExamId(null);
      setNewExam({
        subject: '',
        type: 'Test',
        priority: 'medium',
        dateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        description: ''
      });
    } catch (error) {
      toast.error(editingExamId ? 'Failed to update exam' : 'Failed to add exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedExams = [...exams].sort((a, b) => {
    const dateA = new Date(a.dateTime).getTime();
    const dateB = new Date(b.dateTime).getTime();
    return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
  });

  const upcomingExams = sortedExams.filter(e => {
    const date = new Date(e.dateTime);
    return !isNaN(date.getTime()) && !isPast(date);
  });
  const pastExams = sortedExams.filter(e => {
    const date = new Date(e.dateTime);
    return !isNaN(date.getTime()) && isPast(date);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Exam Countdown</h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm">Track your academic milestones and stay prepared.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 sm:px-4 sm:py-2 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Exam
        </button>
      </header>

      {/* Smart Notifications Area */}
      {upcomingExams.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {upcomingExams.slice(0, 2).map(exam => {
            const daysLeft = differenceInDays(new Date(exam.dateTime), new Date());
            if (daysLeft <= 3) {
              return (
                <motion.div
                  key={`notif-${exam.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 rounded-3xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10"
                >
                  <div className="rounded-2xl bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/30">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                      {daysLeft === 0 ? 'Exam Today!' : `${daysLeft} days left for ${exam.subject}`}
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400">Time to focus on your {exam.type.toLowerCase()}.</p>
                  </div>
                </motion.div>
              );
            }
            return null;
          })}
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Timer className="h-5 w-5 text-brand-600" />
          Upcoming Exams
        </h2>
        
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {upcomingExams.length > 0 ? (
              upcomingExams.map((exam) => (
                <ExamCard 
                  key={exam.id} 
                  exam={exam} 
                  onEdit={() => handleEdit(exam)}
                  onDelete={() => {
                    setConfirmModal({
                      title: 'Delete Exam',
                      message: `Are you sure you want to remove the ${exam.subject} exam?`,
                      onConfirm: () => deleteExam(exam.id)
                    });
                  }} 
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-stone-200 bg-stone-50/50 p-16 text-center dark:border-stone-800 dark:bg-stone-900/50"
              >
                <div className="mb-6 rounded-3xl bg-white p-6 shadow-xl shadow-stone-200/50 dark:bg-stone-800 dark:shadow-none">
                  <AlarmClock className="h-12 w-12 text-brand-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold">No exams scheduled</h3>
                <p className="mb-8 max-w-xs text-stone-500 dark:text-stone-400">
                  Stay ahead of your studies by tracking your upcoming exams and milestones.
                </p>
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-2 rounded-2xl bg-brand-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-brand-600/20 transition-all hover:bg-brand-700 hover:scale-105 active:scale-95"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Exam
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {pastExams.length > 0 && (
        <div className="space-y-6 opacity-60">
          <h2 className="text-lg font-bold text-stone-400">Past Exams</h2>
          <div className="grid gap-4">
            {pastExams.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between rounded-3xl border border-stone-100 bg-white p-4 shadow-sm dark:border-stone-800/50 dark:bg-stone-900/50">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-brand-50 p-2 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-700 dark:text-stone-300">{exam.subject}</h4>
                    <p className="text-xs text-stone-400">
                      {(() => {
                        const date = new Date(exam.dateTime);
                        return !isNaN(date.getTime()) ? format(date, 'MMM d, yyyy') : 'Invalid Date';
                      })()}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteExam(exam.id)}
                  className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Exam Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="bg-brand-600 p-6 sm:p-8 text-white shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
                      {editingExamId ? <Clock className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{editingExamId ? 'Edit Exam' : 'New Exam'}</h2>
                      <p className="text-brand-100 text-sm">{editingExamId ? 'Update your academic milestone' : 'Set your academic milestone'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400">
                        <Tag className="h-3 w-3" />
                        Subject
                      </label>
                      <input
                        autoFocus
                        type="text"
                        value={newExam.subject}
                        onChange={e => setNewExam({ ...newExam, subject: e.target.value })}
                        placeholder="e.g. Advanced Mathematics"
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 font-semibold outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-stone-800 dark:bg-stone-950"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400">
                          <Plus className="h-3 w-3" />
                          Type
                        </label>
                        <select
                          value={newExam.type}
                          onChange={e => setNewExam({ ...newExam, type: e.target.value as ExamType })}
                          className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 font-semibold outline-none transition-all focus:border-brand-500 dark:border-stone-800 dark:bg-stone-950"
                        >
                          {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400">
                          <AlertCircle className="h-3 w-3" />
                          Priority
                        </label>
                        <select
                          value={newExam.priority}
                          onChange={e => setNewExam({ ...newExam, priority: e.target.value as Priority })}
                          className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 font-semibold outline-none transition-all focus:border-brand-500 dark:border-stone-800 dark:bg-stone-950"
                        >
                          {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400">
                        <Calendar className="h-3 w-3" />
                        Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={newExam.dateTime}
                        onChange={e => setNewExam({ ...newExam, dateTime: e.target.value })}
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 font-semibold outline-none transition-all focus:border-brand-500 dark:border-stone-800 dark:bg-stone-950"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400">
                        <Clock className="h-3 w-3" />
                        Description
                      </label>
                      <textarea
                        value={newExam.description}
                        onChange={e => setNewExam({ ...newExam, description: e.target.value })}
                        placeholder="Topics, location, or notes..."
                        rows={3}
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 font-semibold outline-none transition-all focus:border-brand-500 dark:border-stone-800 dark:bg-stone-950"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 border-t border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-900 shrink-0">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:flex-1 rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : (editingExamId ? 'Update Exam' : 'Save Exam')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdding(false);
                        setEditingExamId(null);
                      }}
                      className="w-full sm:flex-1 rounded-2xl border-2 border-stone-200 bg-white py-4 text-base font-bold text-stone-700 transition-all hover:bg-stone-100 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ExamCard = React.memo(({ exam, onEdit, onDelete }: { exam: Exam; onEdit: () => void; onDelete: () => void }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const target = new Date(exam.dateTime);
      const created = new Date(exam.createdAt);
      
      if (isNaN(target.getTime())) {
        setTimeLeft('Invalid date');
        setProgress(0);
        return;
      }

      const distance = formatDistanceToNow(target, { addSuffix: true });
      setTimeLeft(distance);

      if (isNaN(created.getTime())) {
        setProgress(0);
        return;
      }

      const total = target.getTime() - created.getTime();
      const elapsed = now.getTime() - created.getTime();
      const p = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 100;
      setProgress(p);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [exam]);

  const examDate = new Date(exam.dateTime);
  const daysLeft = !isNaN(examDate.getTime()) ? differenceInCalendarDays(examDate, new Date()) : 0;
  const isUrgent = daysLeft <= 3 && daysLeft >= 0;

  const priorityStyles = {
    low: {
      dot: 'bg-brand-500',
      tag: 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400',
      border: 'border-brand-200 dark:border-brand-900/30',
      accent: 'bg-brand-500'
    },
    medium: {
      dot: 'bg-amber-500',
      tag: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-900/30',
      accent: 'bg-amber-500'
    },
    high: {
      dot: 'bg-rose-500',
      tag: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-900/30',
      accent: 'bg-rose-500'
    }
  };

  const currentStyle = priorityStyles[exam.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-stone-200 bg-white p-5 sm:p-8 transition-all hover:border-brand-500 hover:shadow-2xl hover:shadow-brand-500/10 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-brand-500/50",
        isUrgent && "border-amber-200 dark:border-amber-900/30"
      )}
    >
      {/* Oversized Background Number */}
      <div className="absolute -right-4 -top-8 select-none opacity-[0.03] dark:opacity-[0.05] transition-all group-hover:scale-110 group-hover:opacity-[0.07] pointer-events-none text-brand-600">
        <span className="font-display text-[100px] sm:text-[150px] md:text-[200px] font-black leading-none">
          {daysLeft === 0 ? '!' : daysLeft}
        </span>
      </div>

      <div className="relative flex flex-col gap-6 sm:gap-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <div className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest", currentStyle.tag)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", currentStyle.dot)} />
                {exam.priority}
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-stone-400">{exam.type}</span>
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <h3 className="font-display text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-[0.9] break-words">
                {exam.subject}
              </h3>
              {exam.description && (
                <p className="font-serif text-base sm:text-lg italic text-stone-500 dark:text-stone-400 line-clamp-2 max-w-xl">
                  {exam.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3">
            <motion.div 
              animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
              transition={isUrgent ? { repeat: Infinity, duration: 2 } : {}}
              className={cn(
                "flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm transition-all min-w-[80px] sm:min-w-[100px]",
                daysLeft === 0 
                  ? "bg-rose-500 text-white" 
                  : isUrgent
                  ? "bg-amber-500 text-white"
                  : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
              )}
            >
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                {daysLeft === 0 ? 'Today' : 'Days'}
              </span>
              <span className="font-display text-3xl sm:text-5xl font-black leading-none mt-1">
                {daysLeft === 0 ? '!' : daysLeft}
              </span>
            </motion.div>
            {isUrgent && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:bg-amber-900/30">
                Urgent
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-stone-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              {(() => {
                const date = new Date(exam.dateTime);
                return !isNaN(date.getTime()) ? format(date, 'EEEE, MMM d') : 'Invalid Date';
              })()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              {(() => {
                const date = new Date(exam.dateTime);
                return !isNaN(date.getTime()) ? format(date, 'p') : '--:--';
              })()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 sm:ml-auto bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded-xl">
            <Timer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="font-mono text-[10px] sm:text-xs font-bold tracking-tight">{timeLeft}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-stone-100 pt-6 dark:border-stone-800">
          <div className="flex items-center gap-2 text-stone-400">
            <Tag className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{exam.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="rounded-full p-2 text-stone-300 transition-all hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20"
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button
              onClick={onDelete}
              className="rounded-full p-2 text-stone-300 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
