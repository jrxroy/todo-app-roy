export type Priority = 'low' | 'medium' | 'high';
export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface Subtask {
  id: string;
  title: string;
  is_completed: boolean;
}

export interface Todo {
  id: string;
  title: string;
  frequency: Frequency;
  priority: Priority;
  category: string;
  is_completed: boolean;
  due_date: string;
  subtasks: Subtask[];
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  frequency_type: string;
  completed_week: boolean[];
  completed_dates: string[];
}

export interface WorkspaceItem {
  id: string;
  title: string;
  description: string;
  link: string;
  category: string;
}

export interface JournalItem {
  id: string;
  date: string;
  content: string;
}