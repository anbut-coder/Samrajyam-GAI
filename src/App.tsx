/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Inbox } from "./components/Inbox";
import { useStore } from "./store";
import { Menu, Bell } from "lucide-react";
import { ProfileMenu } from "./components/ProfileMenu";
import { FloatingActionButton } from "./components/FloatingActionButton";
import { ManualEntryModals } from "./components/ManualEntryModals";

export default function App() {
  const [currentView, setCurrentView] = useState<"dashboard" | "inbox">("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modalType, setModalType] = useState<"task" | "note" | "reminder" | "meeting" | null>(null);
  const { data, addItems, updateItem, deleteItem } = useStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);

  const handleSaveModal = (newData: any) => {
    addItems(newData);
    setCurrentView("dashboard");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCapturedFile(e.target.files[0]);
      setCurrentView("inbox");
      e.target.value = "";
    }
  };

  const triggerAICapture = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background text-on-background overflow-hidden w-full">
      {/* Hidden file input for mobile AI Capture */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 h-16 border-b border-border-subtle flex items-center justify-between px-4 md:px-6 bg-surface flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2 -ml-2 text-secondary-text hover:text-on-background rounded-lg flex items-center justify-center min-h-[44px] min-w-[44px] focus:outline-none"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-white tracking-tighter">S</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-on-background hidden md:block">Samrajyam</h1>
            <h1 className="text-xl font-semibold tracking-tight text-on-background md:hidden">Samrajyam</h1>
          </div>
          
          <div className="hidden md:flex ml-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-secondary-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-1.5 w-64 bg-surface-hover border border-border-subtle rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => setCurrentView("inbox")}
            className="hidden md:flex px-4 py-2 min-h-[36px] bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap items-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
          >
            + New Capture
          </button>
          <button 
            onClick={() => setModalType("task")}
            className="hidden md:flex px-4 py-2 min-h-[36px] bg-surface-hover hover:bg-border-subtle border border-border-subtle text-on-background text-sm font-medium rounded-lg transition-colors whitespace-nowrap items-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
          >
            + New Task
          </button>
          <ProfileMenu />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out`}>
          <Sidebar currentView={currentView} onChangeView={(view) => {
            setCurrentView(view);
            setIsSidebarOpen(false);
          }} isMobileOpen={isSidebarOpen} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden relative w-full min-w-0 bg-background">
          {currentView === "dashboard" ? (
            <Dashboard 
              data={data} 
              onDelete={deleteItem} 
              onUpdate={updateItem} 
              onCreateTask={() => setModalType("task")}
              onCreateNote={() => setModalType("note")}
              onCreateReminder={() => setModalType("reminder")}
              onCreateMeeting={() => setModalType("meeting")}
              onAICapture={triggerAICapture}
            />
          ) : (
            <Inbox 
              onApprove={(approvedData) => {
                addItems(approvedData);
                setCurrentView("dashboard");
              }} 
              initialFile={capturedFile}
              onClearInitialFile={() => setCapturedFile(null)}
            />
          )}
          
          <FloatingActionButton 
            onAICapture={triggerAICapture} 
            onNewTask={() => setModalType("task")}
            onNewNote={() => setModalType("note")}
            onNewReminder={() => setModalType("reminder")}
            onNewMeeting={() => setModalType("meeting")}
          />
        </main>
      </div>
      
      <ManualEntryModals 
        type={modalType} 
        onClose={() => setModalType(null)} 
        onSave={handleSaveModal} 
      />
    </div>
  );
}

