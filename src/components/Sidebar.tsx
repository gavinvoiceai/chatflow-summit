import React from 'react';
import { TabNavigation } from './TabNavigation';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
  children?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  isMobile,
  children
}) => {
  const [activeTab, setActiveTab] = useState('transcript');

  const sidebarClass = cn(
    'sidebar',
    !isOpen && 'sidebar-collapsed',
    isMobile && 'sidebar-mobile',
    isMobile && isOpen && 'open'
  );

  return (
    <div className={sidebarClass}>
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="panel-content">
        {children}
      </div>
      
      <div className="ai-input-container">
        <Input
          placeholder="Ask AI Assistant..."
          className="ai-input"
        />
      </div>
    </div>
  );
};