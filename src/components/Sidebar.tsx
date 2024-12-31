import React, { useState } from 'react';
import { TabNavigation } from './TabNavigation';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    'fixed right-0 h-screen bg-background border-l border-border/10 transition-all duration-300 z-40',
    isOpen ? 'w-80' : 'w-0',
    isMobile && 'bottom-0 h-[70vh] w-full border-t border-l-0 translate-y-full',
    isMobile && isOpen && 'translate-y-0'
  );

  return (
    <>
      <div className={sidebarClass}>
        <button
          onClick={onToggle}
          className="absolute -left-10 top-4 p-2 bg-background/80 backdrop-blur-sm rounded-l-lg border border-r-0 border-border/10 hover:bg-accent/10 transition-colors duration-200 lg:hidden"
        >
          {isOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>

        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <div className="panel-content overflow-y-auto">
          {children}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/10">
          <Input
            placeholder="Ask AI Assistant..."
            className="w-full bg-background/50 backdrop-blur-sm"
          />
        </div>
      </div>
      
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
};