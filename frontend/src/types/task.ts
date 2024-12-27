// src/types/task.ts
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  notes?: Note[]; // Added notes field
  createdAt: string;
}

export interface Note {
  id: number;
  content?: string;
  fileName?: string;
  fileUrl?: string;
  createdAt: string;
}