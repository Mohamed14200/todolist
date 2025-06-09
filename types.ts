export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number; // Timestamp (e.g., Date.now())
  dueDate?: string;   // YYYY-MM-DD
  dueTime?: string;   // HH:MM
  notified?: boolean; // To track if a notification has been sent
}

export type FilterType = 'all' | 'active' | 'completed';

export type TodoUpdatePayload = Partial<Omit<Todo, 'id' | 'createdAt'>>;
