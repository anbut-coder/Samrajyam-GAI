import React, { useState, useEffect } from "react";
import { ExtractedData, Task, Meeting, Reminder, Note } from "../types";
import { AppData } from "../store";
import { Check, Trash2, Edit2, X, Save } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";

interface ExtractedResultsProps {
  data: ExtractedData;
  onApprove: (approvedData: Partial<AppData>) => void;
}

export function ExtractedResults({ data: initialData, onApprove }: ExtractedResultsProps) {
  const [data, setData] = useState<ExtractedData>(initialData);

  // Sync state if initialData changes
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleUpdate = (type: keyof ExtractedData, index: number, field: string, value: string) => {
    setData((prev) => {
      const newList = [...prev[type]];
      newList[index] = { ...newList[index], [field]: value } as any;
      return { ...prev, [type]: newList };
    });
  };

  const handleDelete = (type: keyof ExtractedData, index: number) => {
    setData((prev) => {
      const newList = [...prev[type]];
      newList.splice(index, 1);
      return { ...prev, [type]: newList };
    });
  };

  const handleApproveAll = () => {
    // Generate UUIDs before approving
    const finalData = {
      tasks: data.tasks.map(t => ({ ...t, id: crypto.randomUUID() })),
      meetings: data.meetings.map(m => ({ ...m, id: crypto.randomUUID() })),
      reminders: data.reminders.map(r => ({ ...r, id: crypto.randomUUID() })),
      notes: data.notes.map(n => ({ ...n, id: crypto.randomUUID() })),
    };
    onApprove(finalData);
  };

  const hasItems = data.tasks.length > 0 || data.meetings.length > 0 || data.reminders.length > 0 || data.notes.length > 0;

  if (!hasItems) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-secondary-text py-12">
        <p>No actionable items found in this image.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-2">
        <h4 className="text-xs font-bold text-secondary-text uppercase tracking-widest px-1">Extraction Queue</h4>
        <Button
          onClick={handleApproveAll}
          className="w-full sm:w-auto"
        >
          <Check size={16} className="mr-2" />
          <span>Save to Samrajyam</span>
        </Button>
      </div>

      <div className="space-y-4">
        <Section title="Tasks" items={data.tasks} type="tasks" onUpdate={handleUpdate} onDelete={handleDelete} variant="warning" />
        <Section title="Meetings" items={data.meetings} type="meetings" onUpdate={handleUpdate} onDelete={handleDelete} variant="info" />
        <Section title="Reminders" items={data.reminders} type="reminders" onUpdate={handleUpdate} onDelete={handleDelete} variant="info" />
        <Section title="Notes" items={data.notes} type="notes" onUpdate={handleUpdate} onDelete={handleDelete} variant="success" />
      </div>
    </div>
  );
}

function Section({ title, items, type, onUpdate, onDelete, variant }: any) {
  if (!items || items.length === 0) return null;

  return (
    <>
      {items.map((item: any, index: number) => (
        <EditableCard key={index} item={item} type={type} index={index} onUpdate={onUpdate} onDelete={onDelete} variant={variant} title={title} />
      ))}
    </>
  );
}

function EditableCard({ item, type, index, onUpdate, onDelete, variant, title }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [localItem, setLocalItem] = useState(item);

  const handleSave = () => {
    Object.keys(localItem).forEach(key => {
      onUpdate(type, index, key, localItem[key]);
    });
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalItem({ ...localItem, [e.target.name]: e.target.value });
  };

  const handleApprove = () => {
    // Generate an ID to mark it as approved
    const itemWithId = { ...item, id: crypto.randomUUID() };
    // This is handled by main approve logic later if needed individually, 
    // but the UI shows approve. For simplicity in MVP, we just let "Approve All" do the job,
    // or simulate it. We can just keep it as a UI element for now.
  }

  if (isEditing) {
    return (
      <Card className="border-primary p-4 flex gap-4">
        <div className={`w-1 rounded-full bg-${variant}`}></div>
        <div className="flex-1 space-y-3">
          {Object.keys(localItem).map(key => {
            if (key === 'id') return null;
            return (
              <div key={key}>
                <label className="block text-xs text-secondary-text mb-1 capitalize">{key}</label>
                {key === 'content' || key === 'description' ? (
                  <textarea
                    name={key}
                    value={localItem[key] || ""}
                    onChange={handleChange}
                    className="w-full bg-surface border border-border-default rounded-lg p-2 text-sm text-on-background focus:outline-none focus:border-primary resize-none h-20"
                  />
                ) : (
                  <input
                    type="text"
                    name={key}
                    value={localItem[key] || ""}
                    onChange={handleChange}
                    className="w-full bg-surface border border-border-default rounded-lg p-2 text-sm text-on-background focus:outline-none focus:border-primary"
                  />
                )}
              </div>
            );
          })}
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 sm:flex-none">Save</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 flex gap-4 group">
      <div className={`w-1 rounded-full bg-${variant}`}></div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <Badge variant={variant}>{title}</Badge>
        </div>
        <p className="text-sm font-medium mt-2 text-on-background">{item.title}</p>
        
        <div className="mt-1 space-y-1">
          {Object.keys(item).map(key => {
            if (key === 'title' || key === 'id' || !item[key]) return null;
            return (
              <p key={key} className="text-xs text-secondary-text line-clamp-2">
                <span className="capitalize mr-1">{key}:</span> 
                {Array.isArray(item[key]) ? item[key].join(', ') : item[key]}
              </p>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <Button variant="secondary" onClick={() => setIsEditing(true)} className="flex-1 sm:flex-none">Edit</Button>
          <Button variant="danger" onClick={() => onDelete(type, index)} className="flex-1 sm:flex-none">Delete</Button>
        </div>
      </div>
    </Card>
  );
}
