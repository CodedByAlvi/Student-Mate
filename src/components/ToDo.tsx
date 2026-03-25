import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Plus, CheckCircle2, Circle, Trash2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { Priority } from '../types';
import { useDevice } from '../hooks/useDevice';

const TaskItem = React.memo(({ 
  task, 
  onToggle, 
  onRemove, 
  priorityColors 
}: { 
  task: any; 
  onToggle: (id: string, completed: boolean) => void; 
  onRemove: (id: string) => void;
  priorityColors: Record<string, string>;
}) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group flex items-center gap-5 rounded-[2rem] border border-stone-200 bg-white p-5 transition-all hover:shadow-2xl hover:border-brand-200 dark:border-stone-800 dark:bg-stone-900/40 dark:hover:border-brand-800",
        task.isCompleted && "opacity-80"
      )}
    >
      <button 
        onClick={() => onToggle(task.id, !task.isCompleted)}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-500",
          task.isCompleted ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20" : "bg-stone-100 text-stone-400 hover:bg-stone-200 dark:bg-stone-800"
        )}
      >
        {task.isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
      </button>
      
      <div className="flex-1 space-y-1.5">
        <h3 className={cn(
          "text-lg font-bold tracking-tight transition-all duration-500",
          task.isCompleted ? "text-stone-500 line-through decoration-brand-500 decoration-2" : "text-stone-900 dark:text-white"
        )}>
          {task.title}
        </h3>
        <div className="flex items-center gap-3">
          <span className={cn(
            "rounded-lg px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest",
            priorityColors[task.priority]
          )}>
            {task.priority}
          </span>
          {task.category && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">
              {task.category}
            </span>
          )}
        </div>
      </div>

      <button 
        onClick={() => onRemove(task.id)}
        className="rounded-xl p-3 text-stone-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 dark:hover:bg-rose-900/20"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </motion.div>
  );
});

export default function ToDo() {
  const tasks = useStore(state => state.tasks);
  const addTask = useStore(state => state.addTask);
  const updateTask = useStore(state => state.updateTask);
  const deleteTask = useStore(state => state.deleteTask);
  const setConfirmModal = useStore(state => state.setConfirmModal);
  const { isTablet, isDesktop } = useDevice();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTask = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await addTask({
        title: newTaskTitle,
        category: 'General',
        priority,
        isCompleted: false,
      });
      setNewTaskTitle('');
      toast.success('Task added', {
        icon: <CheckCircle2 className="h-4 w-4 text-brand-600" />
      });
    } catch (error) {
      toast.error('Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  }, [newTaskTitle, priority, addTask, isSubmitting]);

  const toggleTask = React.useCallback((id: string, isCompleted: boolean) => {
    updateTask(id, { isCompleted });
  }, [updateTask]);

  const removeTask = React.useCallback((id: string) => {
    setConfirmModal({
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task?',
      onConfirm: () => {
        deleteTask(id);
        toast.error('Task removed');
      }
    });
  }, [deleteTask, setConfirmModal]);

  const filteredTasks = useMemo(() => tasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase())
  ), [tasks, search]);

  const priorityColors = {
    low: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    medium: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    high: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      <div className="space-y-6">
        <div className="group relative">
          <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400 transition-all group-focus-within:text-brand-500 group-focus-within:scale-110" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-[2rem] border-none bg-white py-5 pl-14 pr-6 text-stone-900 shadow-sm ring-1 ring-stone-200 outline-none transition-all focus:ring-2 focus:ring-brand-500 dark:bg-stone-900 dark:text-white dark:ring-stone-800"
          />
        </div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleAddTask} 
          className="space-y-8 rounded-[2.5rem] border border-brand-100 bg-white p-6 sm:p-8 shadow-2xl shadow-brand-500/5 dark:border-brand-900/30 dark:bg-stone-900"
        >
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400 ml-1">New Task</label>
            <div className="relative group">
              <input 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full rounded-2xl border-none bg-stone-50 py-4 sm:py-5 pl-5 sm:pl-6 pr-14 sm:pr-16 text-base sm:text-lg font-bold tracking-tight text-stone-900 shadow-inner outline-none transition-all focus:ring-2 focus:ring-brand-500 dark:bg-stone-950 dark:text-white"
              />
              <button 
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-brand-600 p-2.5 sm:p-3 text-white shadow-xl shadow-brand-600/20 transition-all hover:bg-brand-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-stone-50 dark:bg-stone-950 px-4 sm:px-6 py-3 rounded-2xl shadow-inner">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 whitespace-nowrap">Priority</span>
              <div className="flex flex-1 items-center justify-between sm:justify-start gap-1.5 sm:gap-2">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      "rounded-lg px-3 sm:px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                      priority === p 
                        ? (p === 'high' ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" :
                           p === 'medium' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" :
                           "bg-blue-500 text-white shadow-lg shadow-blue-500/20")
                        : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.form>
      </div>

      <div className={cn(
        "space-y-3",
        (isTablet || isDesktop) && "grid grid-cols-2 gap-6 space-y-0"
      )}>
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <TaskItem 
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onRemove={removeTask}
              priorityColors={priorityColors}
            />
          ))}
        </AnimatePresence>
        {filteredTasks.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-900">
              <CheckCircle2 className="h-8 w-8 text-stone-300" />
            </div>
            <p className="text-stone-400">
              {search ? 'No tasks match your search.' : 'All caught up! Time to relax.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
