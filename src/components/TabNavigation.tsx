import React from 'react';
import { FileText, ListTodo, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabConfig {
  id: string;
  icon: React.ReactNode;
  ariaLabel: string;
}

const tabs: TabConfig[] = [
  {
    id: 'transcript',
    icon: <FileText className="h-5 w-5" />,
    ariaLabel: 'Transcript'
  },
  {
    id: 'actions',
    icon: <ListTodo className="h-5 w-5" />,
    ariaLabel: 'Actions'
  },
  {
    id: 'participants',
    icon: <Users className="h-5 w-5" />,
    ariaLabel: 'Participants'
  }
];

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <div className="tab-header flex items-center justify-start gap-2 p-2 border-b border-border/10">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "tab-button p-2 rounded-md transition-colors duration-200",
            "hover:bg-accent/10 hover:shadow-[0_0_10px_rgba(0,255,157,0.2)]",
            activeTab === tab.id 
              ? "text-[#00FF9D]" 
              : "text-[#00FF9D]/50"
          )}
          aria-label={tab.ariaLabel}
          aria-selected={activeTab === tab.id}
        >
          {tab.icon}
        </button>
      ))}
    </div>
  );
};