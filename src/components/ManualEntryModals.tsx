import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input, Textarea, Label } from './ui/Forms';
import { AppData } from '../store';
import { v4 as uuidv4 } from 'uuid';

interface ManualEntryModalsProps {
  type: 'task' | 'note' | 'reminder' | 'meeting' | null;
  onClose: () => void;
  onSave: (data: Partial<AppData>) => void;
}

export function ManualEntryModals({ type, onClose, onSave }: ManualEntryModalsProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [attendees, setAttendees] = useState('');

  useEffect(() => {
    if (type) {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDate('');
      setTime('');
      setAttendees('');
    }
  }, [type]);

  const handleSave = () => {
    if (!title.trim()) return;

    const id = uuidv4();
    
    switch (type) {
      case 'task':
        onSave({ tasks: [{ id, title, description, priority }] });
        break;
      case 'note':
        onSave({ notes: [{ id, title, content: description }] });
        break;
      case 'reminder':
        onSave({ reminders: [{ id, title, time }] });
        break;
      case 'meeting':
        onSave({ meetings: [{ id, title, date, time, attendees: attendees.split(',').map(a => a.trim()).filter(Boolean) }] });
        break;
    }
    onClose();
  };

  const getTitle = () => {
    switch (type) {
      case 'task': return 'New Task';
      case 'note': return 'New Note';
      case 'reminder': return 'New Reminder';
      case 'meeting': return 'New Meeting';
      default: return '';
    }
  };

  return (
    <Modal isOpen={!!type} onClose={onClose} title={getTitle()}>
      <div className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title..." autoFocus />
        </div>

        {(type === 'task' || type === 'note') && (
          <div>
            <Label>{type === 'task' ? 'Description' : 'Note Content'}</Label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder={type === 'task' ? "Add details..." : "Write your note here..."} 
            />
          </div>
        )}

        {type === 'task' && (
          <div>
            <Label>Priority</Label>
            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)}
              className="w-full h-11 px-4 bg-surface-hover border border-border-subtle rounded-lg text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        )}

        {(type === 'meeting' || type === 'reminder') && (
          <div className="grid grid-cols-2 gap-4">
            {type === 'meeting' && (
              <div>
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            )}
            <div>
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
        )}

        {type === 'meeting' && (
          <div>
            <Label>Attendees (comma separated)</Label>
            <Input value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="e.g. john@example.com, jane@example.com" />
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-border-subtle mt-6">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave} disabled={!title.trim()}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}
