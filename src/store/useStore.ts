import { create } from 'zustand';
import toast from 'react-hot-toast';
import { Note, Task, Reminder, Translation, UserProfile, FocusSession, Exam, StudyLog, SubjectStats, StudyPlan, StudyPlanItem } from '../types';

const STORAGE_KEY = 'student-mate-data';

const DEFAULT_USER: UserProfile = {
  uid: 'local-user',
  email: 'guest@studentmate.local',
  displayName: 'Guest Student',
  photoURL: '',
  theme: 'system',
  accentColor: 'emerald',
  fontFamily: 'inter',
  layoutDensity: 'comfortable',
  createdAt: new Date().toISOString(),
};

interface AppState {
  user: UserProfile | null;
  notes: Note[];
  tasks: Task[];
  reminders: Reminder[];
  translations: Translation[];
  focusSessions: FocusSession[];
  exams: Exam[];
  studyLogs: StudyLog[];
  isAuthReady: boolean;
  activeTab: string;
  activeSubTab: 'todo' | 'reminders';
  isFocusActive: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  confirmModal: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  };
  
  setUser: (user: UserProfile | null) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setAuthReady: (ready: boolean) => void;
  setActiveTab: (tab: string) => void;
  setActiveSubTab: (subTab: 'todo' | 'reminders') => void;
  setIsFocusActive: (active: boolean) => void;
  setConfirmModal: (modal: Partial<AppState['confirmModal']>) => void;
  closeConfirmModal: () => void;
  
  // Notes
  addNote: (note: Partial<Note>) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  // Tasks
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Reminders
  addReminder: (reminder: Partial<Reminder>) => Promise<void>;
  updateReminder: (id: string, reminder: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  
  // Translations
  addTranslation: (translation: Partial<Translation>) => Promise<void>;
  deleteTranslation: (id: string) => Promise<void>;
  clearTranslations: () => Promise<void>;
  toggleFavoriteTranslation: (id: string, isFavorite: boolean) => Promise<void>;

  // Focus Sessions
  addFocusSession: (session: Partial<FocusSession>) => Promise<void>;

  // Exams
  addExam: (exam: Partial<Exam>) => Promise<void>;
  updateExam: (id: string, exam: Partial<Exam>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;

  // Study Logs
  addStudyLog: (log: Partial<StudyLog>) => Promise<void>;
  deleteStudyLog: (id: string) => Promise<void>;

  // Intelligence
  getSubjectStats: () => SubjectStats[];
  getStudyPlan: (availableMinutes: number) => StudyPlan;
  startSync: (uid: string) => void;
  stopSync: () => void;
  loadLocalData: () => void;
}

const saveToStorage = (state: Partial<AppState>) => {
  const data = {
    notes: state.notes,
    tasks: state.tasks,
    reminders: state.reminders,
    translations: state.translations,
    focusSessions: state.focusSessions,
    exams: state.exams,
    studyLogs: state.studyLogs,
    user: state.user,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const useStore = create<AppState>((set, get) => ({
  user: DEFAULT_USER,
  notes: [],
  tasks: [],
  reminders: [],
  translations: [],
  focusSessions: [],
  exams: [],
  studyLogs: [],
  isAuthReady: true,
  activeTab: 'home',
  activeSubTab: 'todo',
  isFocusActive: false,
  isLoading: false,
  isSyncing: false,
  confirmModal: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  },

  loadLocalData: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        set({
          notes: parsed.notes || [],
          tasks: parsed.tasks || [],
          reminders: parsed.reminders || [],
          translations: parsed.translations || [],
          focusSessions: parsed.focusSessions || [],
          exams: parsed.exams || [],
          studyLogs: parsed.studyLogs || [],
          user: parsed.user || DEFAULT_USER,
        });
      } catch (e) {
        console.error('Failed to load local data', e);
      }
    }
  },

  setUser: (user) => {
    set({ user });
    saveToStorage(get());
  },
  updateUserProfile: async (updates) => {
    const { user } = get();
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    set({ user: updatedUser });
    saveToStorage(get());
  },
  setAuthReady: (ready) => set({ isAuthReady: ready }),
  setActiveTab: (tab) => {
    const { isFocusActive, activeTab, setConfirmModal } = get();
    if (isFocusActive && activeTab === 'focus' && tab !== 'focus') {
      setConfirmModal({
        title: 'End Focus Session?',
        message: 'Your focus timer is currently running. Leaving this page will end your current focus session. Are you sure you want to continue?',
        onConfirm: () => set({ activeTab: tab, isFocusActive: false })
      });
    } else {
      set({ activeTab: tab });
    }
  },
  setActiveSubTab: (subTab) => set({ activeSubTab: subTab }),
  setIsFocusActive: (active) => set({ isFocusActive: active }),
  setConfirmModal: (modal) => set((state) => ({ 
    confirmModal: { ...state.confirmModal, ...modal, isOpen: true } 
  })),
  closeConfirmModal: () => set((state) => ({ 
    confirmModal: { ...state.confirmModal, isOpen: false } 
  })),

  addNote: async (note) => {
    if (!note.title?.trim() && !note.content?.trim()) {
      toast.error('Note cannot be empty');
      return;
    }
    const { notes } = get();
    const newNote = {
      ...note,
      id: Math.random().toString(36).substring(7),
      userId: 'local-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: note.isPinned || false,
      title: note.title?.slice(0, 200) || 'Untitled Note',
      content: note.content?.slice(0, 10000) || '',
    } as Note;
    set({ notes: [newNote, ...notes] });
    saveToStorage(get());
  },
  updateNote: async (id, note) => {
    const { notes } = get();
    const updatedNotes = notes.map(n => n.id === id ? { 
      ...n, 
      ...note, 
      title: note.title !== undefined ? note.title.slice(0, 200) : n.title,
      content: note.content !== undefined ? note.content.slice(0, 10000) : n.content,
      updatedAt: new Date().toISOString() 
    } : n);
    set({ notes: updatedNotes });
    saveToStorage(get());
  },
  deleteNote: async (id) => {
    const { notes } = get();
    set({ notes: notes.filter(n => n.id !== id) });
    saveToStorage(get());
  },

  addTask: async (task) => {
    if (!task.title?.trim()) {
      toast.error('Task title is required');
      return;
    }
    const { tasks } = get();
    const newTask = {
      ...task,
      id: Math.random().toString(36).substring(7),
      userId: 'local-user',
      isCompleted: false,
      createdAt: new Date().toISOString(),
      order: tasks.length,
      title: task.title.slice(0, 500),
    } as Task;
    set({ tasks: [newTask, ...tasks] });
    saveToStorage(get());
  },
  updateTask: async (id, task) => {
    const { tasks } = get();
    const updatedTasks = tasks.map(t => t.id === id ? { 
      ...t, 
      ...task,
      title: task.title !== undefined ? task.title.slice(0, 500) : t.title,
    } : t);
    set({ tasks: updatedTasks });
    saveToStorage(get());
  },
  deleteTask: async (id) => {
    const { tasks } = get();
    set({ tasks: tasks.filter(t => t.id !== id) });
    saveToStorage(get());
  },

  addReminder: async (reminder) => {
    if (!reminder.title?.trim()) {
      toast.error('Reminder title is required');
      return;
    }
    const { reminders } = get();
    const newReminder = {
      ...reminder,
      id: Math.random().toString(36).substring(7),
      userId: 'local-user',
      createdAt: new Date().toISOString(),
      title: reminder.title.slice(0, 500),
    } as Reminder;
    set({ reminders: [newReminder, ...reminders] });
    saveToStorage(get());
  },
  updateReminder: async (id, reminder) => {
    const { reminders } = get();
    const updatedReminders = reminders.map(r => r.id === id ? { 
      ...r, 
      ...reminder,
      title: reminder.title !== undefined ? reminder.title.slice(0, 500) : r.title,
    } : r);
    set({ reminders: updatedReminders });
    saveToStorage(get());
  },
  deleteReminder: async (id) => {
    const { reminders } = get();
    set({ reminders: reminders.filter(r => r.id !== id) });
    saveToStorage(get());
  },

  addTranslation: async (translation) => {
    if (!translation.sourceText?.trim()) return;
    const { translations } = get();
    const newTranslation = {
      ...translation,
      id: Math.random().toString(36).substring(7),
      userId: 'local-user',
      isFavorite: false,
      createdAt: new Date().toISOString(),
      sourceText: translation.sourceText.slice(0, 5000),
      translatedText: translation.translatedText?.slice(0, 5000) || '',
    } as Translation;
    set({ translations: [newTranslation, ...translations].slice(0, 100) }); // Limit history
    saveToStorage(get());
  },
  deleteTranslation: async (id) => {
    const { translations } = get();
    set({ translations: translations.filter(t => t.id !== id) });
    saveToStorage(get());
  },
  clearTranslations: async () => {
    set({ translations: [] });
    saveToStorage(get());
  },
  toggleFavoriteTranslation: async (id, isFavorite) => {
    const { translations } = get();
    const updatedTranslations = translations.map(t => t.id === id ? { ...t, isFavorite } : t);
    set({ translations: updatedTranslations });
    saveToStorage(get());
  },

  addFocusSession: async (session) => {
    const { focusSessions } = get();
    const newSession = {
      ...session,
      id: Math.random().toString(36).substring(7),
      userId: 'local-user',
      createdAt: new Date().toISOString(),
    } as FocusSession;
    set({ focusSessions: [newSession, ...focusSessions] });
    saveToStorage(get());
  },

  addExam: async (exam) => {
    if (!exam.subject?.trim()) {
      toast.error('Subject is required');
      return;
    }
    const { exams } = get();
    const newExam = {
      ...exam,
      id: Math.random().toString(36).substring(7),
      userId: 'local-user',
      createdAt: new Date().toISOString(),
      subject: exam.subject.slice(0, 100),
    } as Exam;
    set({ exams: [newExam, ...exams] });
    saveToStorage(get());
  },
  updateExam: async (id, exam) => {
    const { exams } = get();
    const updatedExams = exams.map(e => e.id === id ? { 
      ...e, 
      ...exam,
      subject: exam.subject !== undefined ? exam.subject.slice(0, 100) : e.subject,
    } : e);
    set({ exams: updatedExams });
    saveToStorage(get());
  },
  deleteExam: async (id) => {
    const { exams } = get();
    set({ exams: exams.filter(e => e.id !== id) });
    saveToStorage(get());
  },

  addStudyLog: async (log) => {
    if (!log.subject?.trim()) {
      toast.error('Subject is required');
      return;
    }
    const { studyLogs } = get();
    const newLog = {
      ...log,
      id: Math.random().toString(36).substring(7),
      userId: 'local-user',
      createdAt: new Date().toISOString(),
      subject: log.subject.slice(0, 100),
      notes: log.notes?.slice(0, 2000) || '',
    } as StudyLog;
    set({ studyLogs: [newLog, ...studyLogs] });
    saveToStorage(get());
  },
  deleteStudyLog: async (id) => {
    const { studyLogs } = get();
    set({ studyLogs: studyLogs.filter(l => l.id !== id) });
    saveToStorage(get());
  },

  getSubjectStats: () => {
    const { tasks, studyLogs, exams } = get();
    const subjects = Array.from(new Set([
      ...tasks.map(t => t.category).filter(Boolean),
      ...studyLogs.map(l => l.subject),
      ...exams.map(e => e.subject)
    ])) as string[];

    return subjects.map(subject => {
      const subjectTasks = tasks.filter(t => t.category === subject);
      const subjectLogs = studyLogs.filter(l => l.subject === subject);
      const subjectExams = exams.filter(e => e.subject === subject);

      const totalStudyTime = subjectLogs.reduce((acc, l) => acc + l.duration, 0);
      const taskCompletionRate = subjectTasks.length > 0 
        ? (subjectTasks.filter(t => t.isCompleted).length / subjectTasks.length) * 100 
        : 100;
      
      const confidence = Math.min(100, (totalStudyTime / 300) * 50 + (taskCompletionRate * 0.5));
      
      const upcomingExam = subjectExams.find(e => new Date(e.dateTime) > new Date());
      const daysToExam = upcomingExam 
        ? Math.max(1, (new Date(upcomingExam.dateTime).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 30;
      
      const priorityScore = Math.min(100, (100 - confidence) * 0.7 + (30 / daysToExam) * 30);

      return {
        subject,
        totalStudyTime,
        taskCompletionRate,
        confidence,
        priorityScore
      };
    });
  },

  getStudyPlan: (availableMinutes) => {
    const stats = get().getSubjectStats();
    const sortedSubjects = [...stats].sort((a, b) => b.priorityScore - a.priorityScore);
    
    const items: StudyPlanItem[] = [];
    const goals: string[] = [];
    let currentTime = new Date();
    let remainingTime = availableMinutes;

    sortedSubjects.forEach((subject, idx) => {
      if (remainingTime <= 0) return;

      const duration = Math.min(remainingTime, 45);
      if (duration < 15) return;

      items.push({
        id: `plan-${idx}`,
        subject: subject.subject,
        startTime: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration,
        type: 'study'
      });

      currentTime = new Date(currentTime.getTime() + duration * 60000);
      remainingTime -= duration;

      if (remainingTime > 5) {
        items.push({
          id: `break-${idx}`,
          subject: 'Short Break',
          startTime: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: 5,
          type: 'break'
        });
        currentTime = new Date(currentTime.getTime() + 5 * 60000);
        remainingTime -= 5;
      }

      if (subject.priorityScore > 60) {
        goals.push(`Focus on ${subject.subject} fundamentals today.`);
      }
    });

    if (goals.length === 0) {
      goals.push("Maintain your current pace across all subjects.");
    }

    return { items, goals };
  },

  startSync: () => {
    set({ isSyncing: false });
  },

  stopSync: () => {
    set({ isSyncing: false });
  },
}));
