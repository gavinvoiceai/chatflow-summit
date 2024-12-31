import React from 'react';
import { FileText, ListTodo, Users, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabConfig {
  id: string;
  icon: React.ReactNode;
  ariaLabel: string;
  unreadCount?: number;
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
  },
  {
    id: 'chat',
    icon: <MessageSquare className="h-5 w-5" />,
    ariaLabel: 'Chat'
  }
];

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  unreadChats?: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  unreadChats = 0
}) => {
  return (
    <div className="tab-header flex items-center justify-start gap-2 p-2 bg-[#0A0A0A] border-b border-border/10">
      {tabs.map((tab) => (
        <div key={tab.id} className="relative">
          <button
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "p-2 rounded-md transition-colors duration-200",
              activeTab === tab.id 
                ? "text-[#00FF9D]" 
                : "text-[#00FF9D]/30 hover:text-[#00FF9D]/50"
            )}
            aria-label={tab.ariaLabel}
            aria-selected={activeTab === tab.id}
          >
            {tab.icon}
          </button>
          {tab.id === 'chat' && unreadChats > 0 && activeTab !== 'chat' && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#00FF9D] text-[10px] text-black font-medium">
              {unreadChats}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};