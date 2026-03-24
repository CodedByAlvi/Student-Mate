export type Priority = 'low' | 'medium' | 'high';
export type ReminderType = 'exam' | 'assignment' | 'study' | 'other';
export type ExamType = 'Midterm' | 'Final' | 'Test' | 'Quiz' | 'Assignment' | 'Other';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  theme?: 'light' | 'dark' | 'system';
  accentColor?: string;
  fontFamily?: string;
  layoutDensity?: 'compact' | 'comfortable';
  quietHours?: { start: string; end: string; enabled: boolean };
  dashboardLayout?: string[]; // IDs of widgets in order
  createdAt: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  duration: number; // in minutes
  type: 'pomodoro' | 'short-break' | 'long-break';
  completed: boolean;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  folder?: string;
  color?: string;
  tags?: string[];
  isPinned: boolean;
  attachedDate?: string;
  subject?: string; // For subject-based themes
  updatedAt: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  category?: string;
  priority: Priority;
  dueDate?: string;
  isCompleted: boolean;
  order: number;
  createdAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: ReminderType;
  dateTime: string;
  repeat?: string;
  color?: string;
  createdAt: string;
}

export interface Exam {
  id: string;
  userId: string;
  subject: string;
  dateTime: string;
  type: ExamType;
  description?: string;
  priority: Priority;
  createdAt: string;
}

export interface Translation {
  id: string;
  userId: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  isFavorite: boolean;
  createdAt: string;
}

export interface StudyLog {
  id: string;
  userId: string;
  subject: string;
  duration: number; // in minutes
  type: 'focus' | 'manual' | 'exam';
  date: string;
  notes?: string;
  createdAt: string;
}

export interface SubjectStats {
  subject: string;
  totalStudyTime: number;
  taskCompletionRate: number;
  confidence: number;
  priorityScore: number;
  lastStudied?: string;
}

export interface StudyPlanItem {
  id: string;
  subject: string;
  startTime: string;
  duration: number;
  type: 'study' | 'break';
  isCompleted?: boolean;
}

export interface StudyPlan {
  items: StudyPlanItem[];
  goals: string[];
  date?: string;
}
