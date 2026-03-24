import { Exam, Task, StudyLog, SubjectStats, StudyPlan, StudyPlanItem, Priority } from '../types';
import { addDays, format, isAfter, isBefore, startOfDay, differenceInDays } from 'date-fns';

export const calculateSubjectStats = (
  subject: string,
  tasks: Task[],
  studyLogs: StudyLog[],
  exams: Exam[]
): SubjectStats => {
  const subjectTasks = tasks.filter(t => t.category === subject);
  const subjectLogs = studyLogs.filter(l => l.subject === subject);
  const subjectExams = exams.filter(e => e.subject === subject);

  const completedTasks = subjectTasks.filter(t => t.isCompleted).length;
  const taskCompletionRate = subjectTasks.length > 0 ? (completedTasks / subjectTasks.length) * 100 : 100;
  
  const totalStudyTime = subjectLogs.reduce((acc, log) => acc + log.duration, 0);
  const lastStudied = subjectLogs.length > 0 
    ? subjectLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date 
    : undefined;

  // Priority Score Calculation: (Exam urgency + Weakness level + Task backlog)
  // Exam urgency: 0-50 (closer exam = higher score)
  const nextExam = subjectExams
    .filter(e => isAfter(new Date(e.dateTime), new Date()))
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];
  
  let examUrgency = 0;
  if (nextExam) {
    const daysUntil = differenceInDays(new Date(nextExam.dateTime), new Date());
    examUrgency = Math.max(0, 50 - daysUntil * 2);
  }

  // Weakness level: 0-30 (lower completion rate = higher score)
  const weaknessLevel = Math.max(0, 30 - (taskCompletionRate * 0.3));

  // Task backlog: 0-20 (more incomplete tasks = higher score)
  const incompleteTasks = subjectTasks.filter(t => !t.isCompleted).length;
  const taskBacklog = Math.min(20, incompleteTasks * 5);

  const priorityScore = examUrgency + weaknessLevel + taskBacklog;

  return {
    subject,
    confidence: taskCompletionRate, // Simple heuristic for now
    taskCompletionRate,
    totalStudyTime,
    lastStudied,
    priorityScore
  };
};

export const generateStudyPlan = (
  subjects: string[],
  stats: SubjectStats[],
  availableTime: number, // in minutes
  date: string = format(new Date(), 'yyyy-MM-dd')
): StudyPlan => {
  // Sort subjects by priority score
  const sortedStats = [...stats].sort((a, b) => b.priorityScore - a.priorityScore);
  
  const items: StudyPlanItem[] = [];
  let remainingTime = availableTime;
  let currentTime = new Date(`${date}T09:00:00`); // Start at 9 AM

  sortedStats.forEach(stat => {
    if (remainingTime <= 0) return;

    // Allocate time based on priority (min 30m, max 120m)
    const allocation = Math.min(remainingTime, Math.max(30, Math.floor((stat.priorityScore / 100) * 120)));
    
    items.push({
      id: Math.random().toString(36).substr(2, 9),
      subject: stat.subject,
      duration: allocation,
      type: 'study',
      startTime: format(currentTime, 'HH:mm'),
      isCompleted: false
    });

    remainingTime -= allocation;
    currentTime = new Date(currentTime.getTime() + allocation * 60000);

    // Add a break if there's time
    if (remainingTime >= 15) {
      items.push({
        id: Math.random().toString(36).substr(2, 9),
        subject: 'Break',
        duration: 15,
        type: 'break',
        startTime: format(currentTime, 'HH:mm'),
        isCompleted: false
      });
      remainingTime -= 15;
      currentTime = new Date(currentTime.getTime() + 15 * 60000);
    }
  });

  return {
    date,
    items,
    goals: sortedStats.slice(0, 3).map(s => `Focus on ${s.subject} due to high priority.`)
  };
};
