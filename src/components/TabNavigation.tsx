import React from 'react';
import { FileText, CheckSquare, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabConfig {
  id: string;
  icon: React.ReactNode;
  label: string;
  ariaLabel: string;
}

const tabs: TabConfig[] = [
  {
    id: 'transcript',
    icon: <FileText className="h-5 w-5" />,
    label: 'Transcript',
    ariaLabel: 'Transcript'
  },
  {
    id: 'actions',
    icon: <CheckSquare className="h-5 w-5" />,
    label: 'Actions',
    ariaLabel: 'Actions'
  },
  {
    id: 'participants',
    icon: <Users className="h-5 w-5" />,
    label: 'Participants',
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
    <div className="tab-header flex items-center gap-2 p-2 border-b border-border/10">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "tab-button flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
            "hover:bg-accent/10",
            activeTab === tab.id && "bg-accent/10 text-accent"
          )}
          aria-label={tab.ariaLabel}
          aria-selected={activeTab === tab.id}
        >
          {tab.icon}
          <span className="text-sm font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};