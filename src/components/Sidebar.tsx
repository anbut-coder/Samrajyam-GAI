import { LayoutDashboard, Inbox } from "lucide-react";

interface SidebarProps {
  currentView: "dashboard" | "inbox";
  onChangeView: (view: "dashboard" | "inbox") => void;
  isMobileOpen?: boolean;
}

export function Sidebar({ currentView, onChangeView, isMobileOpen }: SidebarProps) {
  return (
    <aside className={`bg-surface flex flex-col border-r border-border-subtle h-full transition-all duration-300 ${isMobileOpen ? 'w-64' : 'w-64 md:w-20 lg:w-64'}`}>
      <nav className={`flex-1 space-y-2 py-4 ${isMobileOpen ? 'px-4' : 'px-4 md:px-2 lg:px-4'}`}>
        <button
          onClick={() => onChangeView("dashboard")}
          className={`w-full flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-lg transition-colors cursor-pointer ${!isMobileOpen && 'md:justify-center lg:justify-start'} ${
            currentView === "dashboard"
              ? "bg-primary/10 text-primary"
              : "text-secondary-text hover:text-on-background hover:bg-surface-hover"
          }`}
        >
          <LayoutDashboard size={20} className="flex-shrink-0" />
          <span className={`font-medium ${isMobileOpen ? 'block' : 'block md:hidden lg:block'}`}>Dashboard</span>
        </button>

        <button
          onClick={() => onChangeView("inbox")}
          className={`w-full flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-lg transition-colors cursor-pointer ${!isMobileOpen && 'md:justify-center lg:justify-start'} ${
            currentView === "inbox"
              ? "bg-primary/10 text-primary"
              : "text-secondary-text hover:text-on-background hover:bg-surface-hover"
          }`}
        >
          <Inbox size={20} className="flex-shrink-0" />
          <span className={`font-medium ${isMobileOpen ? 'block' : 'block md:hidden lg:block'}`}>AI Inbox</span>
        </button>
      </nav>
    </aside>
  );
}
