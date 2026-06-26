export interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: "Low" | "Medium" | "High" | string;
}

export interface Meeting {
  id: string;
  title: string;
  date?: string;
  time?: string;
  attendees?: string[];
}

export interface Reminder {
  id: string;
  title: string;
  time?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
}

export interface ExtractedData {
  tasks: Omit<Task, 'id'>[];
  meetings: Omit<Meeting, 'id'>[];
  reminders: Omit<Reminder, 'id'>[];
  notes: Omit<Note, 'id'>[];
}
