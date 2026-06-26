import React, { useState, useRef, useEffect } from 'react';
import { Settings, Info, LogOut, Bell, User } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { APP_CONFIG } from '../config';
import { Avatar } from './ui/Avatar';

export function ProfileMenu() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="flex items-center justify-center rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
        aria-label="Profile menu"
        aria-expanded={isOpen}
      >
        <Avatar initials="AT" size="md" className="rounded-xl shadow-none" />
      </button>

      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 z-40 md:hidden" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown / Bottom Sheet */}
          <div className={`
            fixed md:absolute z-50 bg-surface border border-border-subtle shadow-lg flex flex-col
            bottom-0 left-0 right-0 rounded-t-2xl max-h-[85vh] overflow-y-auto
            md:bottom-auto md:left-auto md:right-0 md:top-full md:mt-2 md:w-64 md:rounded-xl md:max-h-[calc(100vh-5rem)]
            transition-transform transform translate-y-0
          `}>
            <div className="flex flex-col p-4 border-b border-border-subtle">
              <span className="font-medium text-on-background">Anbu T</span>
              <span className="text-sm text-secondary-text">anbu2k25sg@gmail.com</span>
            </div>

            <div className="py-2">
              <MenuItem icon={<User size={18} />} label="Profile" onClick={() => setIsOpen(false)} />
              <MenuItem icon={<Settings size={18} />} label="Settings" onClick={() => setIsOpen(false)} />
              <MenuItem icon={<Bell size={18} />} label="Notifications" badge="3" onClick={() => setIsOpen(false)} />
            </div>

            <div className="py-2 border-t border-border-subtle">
              <div className="px-4 py-2 text-xs font-semibold text-secondary-text uppercase tracking-wider">
                Theme
              </div>
              <ThemeItem
                active={theme === 'light'}
                icon={<span role="img" aria-label="Light">☀</span>}
                label="Light"
                onClick={() => { setTheme('light'); setIsOpen(false); }}
              />
              <ThemeItem
                active={theme === 'dark'}
                icon={<span role="img" aria-label="Dark">🌙</span>}
                label="Dark"
                onClick={() => { setTheme('dark'); setIsOpen(false); }}
              />
              <ThemeItem
                active={theme === 'system'}
                icon={<span role="img" aria-label="System">💻</span>}
                label="System"
                onClick={() => { setTheme('system'); setIsOpen(false); }}
              />
            </div>

            <div className="py-2 border-t border-border-subtle">
              <MenuItem icon={<Info size={18} />} label="About Samrajyam" onClick={() => setIsOpen(false)} />
              <MenuItem icon={<LogOut size={18} />} label="Log out" onClick={() => setIsOpen(false)} className="text-error hover:text-error" />
            </div>
            
            <div className="p-4 border-t border-border-subtle text-xs text-center text-secondary-text">
              {APP_CONFIG.name} {APP_CONFIG.version}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({ icon, label, badge, onClick, className = '' }: { icon: React.ReactNode; label: string; badge?: string; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-surface-hover text-on-background focus:outline-none focus:bg-surface-hover ${className}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-secondary-text">{icon}</span>
        <span>{label}</span>
      </div>
      {badge && (
        <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

function ThemeItem({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors focus:outline-none ${
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-on-background hover:bg-surface-hover'
      }`}
    >
      <span className={active ? 'text-primary' : 'text-secondary-text'}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
