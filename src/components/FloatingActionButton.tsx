import React, { useState, useEffect } from 'react';
import { Plus, Camera, CheckSquare, FileText, Bell, Calendar, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface FloatingActionButtonProps {
  onAICapture: () => void;
  onNewTask: () => void;
  onNewNote: () => void;
  onNewReminder: () => void;
  onNewMeeting: () => void;
}

export function FloatingActionButton({ 
  onAICapture, 
  onNewTask, 
  onNewNote, 
  onNewReminder, 
  onNewMeeting 
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close when clicking outside or pressing escape is handled by the overlay
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-hover active:scale-95 transition-all z-40 focus:outline-none focus:ring-4 focus:ring-primary/30"
        aria-label="New Item"
      >
        <Plus size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-2xl z-50 md:hidden flex flex-col max-h-[90vh] pb-8 pt-4 px-4 shadow-xl"
            >
              <div className="w-12 h-1.5 bg-border-subtle rounded-full mx-auto mb-6" />
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-on-background">Create New</h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-secondary-text bg-surface-hover rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <ActionItem 
                  icon={<Camera size={20} />} 
                  label="AI Capture" 
                  onClick={() => handleAction(onAICapture)} 
                  primary 
                />
                <ActionItem 
                  icon={<CheckSquare size={20} />} 
                  label="New Task" 
                  onClick={() => handleAction(onNewTask)} 
                />
                <ActionItem 
                  icon={<FileText size={20} />} 
                  label="New Note" 
                  onClick={() => handleAction(onNewNote)} 
                />
                <ActionItem 
                  icon={<Bell size={20} />} 
                  label="New Reminder" 
                  onClick={() => handleAction(onNewReminder)} 
                />
                <ActionItem 
                  icon={<Calendar size={20} />} 
                  label="New Meeting" 
                  onClick={() => handleAction(onNewMeeting)} 
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ActionItem({ icon, label, onClick, primary = false }: { icon: React.ReactNode, label: string, onClick: () => void, primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors text-left ${
        primary 
          ? 'bg-primary/10 text-primary hover:bg-primary/20 font-medium' 
          : 'bg-surface-hover text-on-background hover:bg-border-subtle'
      }`}
    >
      <div className={`p-2 rounded-lg ${primary ? 'bg-primary/20 text-primary' : 'bg-surface text-secondary-text'}`}>
        {icon}
      </div>
      <span className="text-base font-medium">{label}</span>
    </button>
  );
}
