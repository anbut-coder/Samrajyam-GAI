import { useState, useEffect } from "react";
import { Task, Meeting, Reminder, Note } from "./types";

const STORE_KEY = "samrajyam_data";

export interface AppData {
  tasks: Task[];
  meetings: Meeting[];
  reminders: Reminder[];
  notes: Note[];
}

const defaultData: AppData = {
  tasks: [],
  meetings: [],
  reminders: [],
  notes: [],
};

export function useStore() {
  const [data, setData] = useState<AppData>(() => {
    const stored = localStorage.getItem(STORE_KEY);
    return stored ? JSON.parse(stored) : defaultData;
  });

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  }, [data]);

  const addItems = (newData: Partial<AppData>) => {
    setData((prev) => ({
      tasks: [...prev.tasks, ...(newData.tasks || [])],
      meetings: [...prev.meetings, ...(newData.meetings || [])],
      reminders: [...prev.reminders, ...(newData.reminders || [])],
      notes: [...prev.notes, ...(newData.notes || [])],
    }));
  };

  const updateItem = (type: keyof AppData, id: string, updatedItem: any) => {
    setData((prev) => ({
      ...prev,
      [type]: prev[type].map((item: any) => (item.id === id ? updatedItem : item)),
    }));
  };

  const deleteItem = (type: keyof AppData, id: string) => {
    setData((prev) => ({
      ...prev,
      [type]: prev[type].filter((item: any) => item.id !== id),
    }));
  };

  return { data, addItems, updateItem, deleteItem };
}
