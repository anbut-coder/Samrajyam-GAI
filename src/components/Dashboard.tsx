import React, { useState } from "react";
import { AppData } from "../store";
import { CheckSquare, Camera, CheckCircle2, Circle } from "lucide-react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Input, Textarea, Label } from "./ui/Forms";

interface DashboardProps {
  data: AppData;
  onDelete: (type: keyof AppData, id: string) => void;
  onUpdate: (type: keyof AppData, id: string, data: any) => void;
  onCreateTask: () => void;
  onCreateNote: () => void;
  onCreateReminder: () => void;
  onCreateMeeting: () => void;
  onAICapture: () => void;
}

export function Dashboard({ data, onDelete, onUpdate, onCreateTask, onAICapture }: DashboardProps) {
  const sortedTasks = [...data.tasks].sort((a: any, b: any) => {
    const aDate = a.dueDate || '9999-12-31';
    const bDate = b.dueDate || '9999-12-31';
    if (aDate !== bDate) return aDate.localeCompare(bDate);
    const aTime = a.dueTime || '23:59';
    const bTime = b.dueTime || '23:59';
    return aTime.localeCompare(bTime);
  });

  const pendingTasks = sortedTasks.filter((t: any) => !t.completed);
  const completedTasks = sortedTasks.filter((t: any) => t.completed);

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full flex-1 overflow-y-auto pb-24 md:pb-8">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-on-background">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
         <button 
           onClick={onCreateTask}
           className="flex flex-col items-center justify-center gap-2 p-6 bg-surface-elevated border border-border-default rounded-xl hover:bg-surface-hover hover:border-primary/50 transition-all text-on-background group"
         >
           <div className="p-3 bg-primary/10 text-primary rounded-full group-hover:scale-110 transition-transform">
             <CheckSquare size={24} />
           </div>
           <span className="font-medium">New Task</span>
         </button>
         
         <button 
           onClick={onAICapture}
           className="flex flex-col items-center justify-center gap-2 p-6 bg-surface-elevated border border-border-default rounded-xl hover:bg-surface-hover hover:border-primary/50 transition-all text-on-background group"
         >
           <div className="p-3 bg-primary/10 text-primary rounded-full group-hover:scale-110 transition-transform">
             <Camera size={24} />
           </div>
           <span className="font-medium">AI Capture</span>
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section 
          title="Pending Tasks" 
          type="tasks" 
          items={pendingTasks} 
          onDelete={onDelete} 
          onUpdate={onUpdate} 
          onCreate={onCreateTask}
          variant="warning"
        />
        <Section 
          title="Completed Tasks" 
          type="tasks" 
          items={completedTasks} 
          onDelete={onDelete} 
          onUpdate={onUpdate} 
          onCreate={onCreateTask}
          variant="success"
        />
      </div>
    </div>
  );
}

function Section({ title, items, type, onDelete, onUpdate, onCreate, variant }: any) {
  const emptyStateText = type === 'tasks' ? "No Tasks Yet" : `No ${type} yet`;

  return (
    <Card className="p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-secondary-text uppercase tracking-widest px-1">{title}</h3>
        <Button variant="secondary" size="sm" onClick={onCreate}>+ Add</Button>
      </div>
      
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center border border-dashed border-border-subtle rounded-xl">
          <p className="text-secondary-text mb-4">{emptyStateText}</p>
          <Button onClick={onCreate}>Create Your First Task</Button>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {items.map((item: any) => (
            <DashboardItem 
              key={item.id} 
              item={item} 
              type={type} 
              onDelete={onDelete} 
              onUpdate={onUpdate} 
              variant={variant} 
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function DashboardItem({ item, type, onDelete, onUpdate, variant }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [localItem, setLocalItem] = useState(item);

  const handleSave = () => {
    onUpdate(type, item.id, localItem);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this item?`)) {
      onDelete(type, item.id);
    }
  };

  const toggleComplete = () => {
    onUpdate(type, item.id, { ...item, completed: !item.completed });
  };

  if (isEditing) {
    return (
      <div className="bg-surface-inner border border-primary p-4 rounded-xl flex gap-4">
        <div className={`w-1 rounded-full bg-${variant} flex-shrink-0`}></div>
        <div className="flex-1 space-y-3">
          {Object.keys(localItem).map(key => {
            if (key === 'id' || key === 'completed' || key === 'notificationSent') return null;
            return (
              <div key={key}>
                <Label className="capitalize">{key === 'dueDate' ? 'Due Date' : key === 'dueTime' ? 'Due Time' : key}</Label>
                {key === 'description' || key === 'content' || key === 'notes' ? (
                  <Textarea 
                    value={localItem[key] || ''} 
                    onChange={e => setLocalItem({...localItem, [key]: e.target.value})} 
                  />
                ) : (
                  <Input 
                    type={key === 'date' || key === 'dueDate' ? 'date' : key === 'time' || key === 'dueTime' ? 'time' : 'text'}
                    value={Array.isArray(localItem[key]) ? localItem[key].join(', ') : localItem[key] || ''} 
                    onChange={e => setLocalItem({
                      ...localItem, 
                      [key]: Array.isArray(localItem[key]) 
                        ? e.target.value.split(',').map(s => s.trim()) 
                        : e.target.value
                    })} 
                  />
                )}
              </div>
            );
          })}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </div>
    );
  }

  const formatDateTime = (dateStr?: string, timeStr?: string) => {
    if (!dateStr && !timeStr) return null;
    let result = '';
    if (dateStr) {
      try {
        const [year, month, day] = dateStr.split('-');
        const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        result += d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch (e) {
        result += dateStr;
      }
    }
    if (timeStr) {
      try {
        const [hours, minutes] = timeStr.split(':');
        const d = new Date();
        d.setHours(parseInt(hours, 10));
        d.setMinutes(parseInt(minutes, 10));
        const timeFormatted = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        result += result ? ` • ${timeFormatted}` : timeFormatted;
      } catch (e) {
        result += result ? ` • ${timeStr}` : timeStr;
      }
    }
    return result;
  };

  const formattedDateTime = formatDateTime(item.dueDate, item.dueTime);

  return (
    <div className={`bg-surface-inner border border-border-inner p-4 rounded-xl flex gap-4 group ${item.completed ? 'opacity-70' : ''}`}>
      <div className={`w-1 rounded-full bg-${variant} flex-shrink-0`}></div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <Badge variant={variant}>{type.slice(0, -1)}</Badge>
          {type === 'tasks' && (
            <button 
              onClick={toggleComplete} 
              className="text-secondary-text hover:text-primary transition-colors focus:outline-none"
              aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
            >
              {item.completed ? <CheckCircle2 size={20} className="text-success" /> : <Circle size={20} />}
            </button>
          )}
        </div>
        <h4 className={`text-sm font-medium mt-2 text-on-background ${item.completed ? 'line-through text-secondary-text' : ''}`}>{item.title}</h4>
        
        {item.description && <p className="text-xs text-secondary-text mt-1">{item.description}</p>}
        {item.priority && <p className="text-xs text-secondary-text mt-1">Priority: {item.priority}</p>}
        {formattedDateTime && <p className="text-xs text-secondary-text mt-1 font-medium">{formattedDateTime}</p>}
        {item.category && <p className="text-xs text-secondary-text mt-1">Category: {item.category}</p>}

        <div className="mt-4 flex gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
        </div>
      </div>
    </div>
  );
}
