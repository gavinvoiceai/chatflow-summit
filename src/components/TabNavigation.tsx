import React from 'react';
import { FileText, CheckSquare, Users } from 'lucide-react';
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
    icon: <CheckSquare className="h-5 w-5" />,
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
    <div className="tab-header">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "tab-button flex items-center gap-2",
            activeTab === tab.id && "active"
          )}
          aria-label={tab.ariaLabel}
        >
          {tab.icon}
        </button>
      ))}
    </div>
  );
};