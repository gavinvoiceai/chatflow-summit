import React, { useState } from 'react';
import { TabNavigation } from './TabNavigation';
import { Input } from './ui/input';
import { Users } from 'lucide-react';

interface SidebarProps {
  children?: React.ReactNode;
}

const TranscriptPanel = () => (
  <div className="space-y-4">
    <div className="transcript-message">
      <span className="text-xs text-accent-blue">10:30 AM</span>
      <p className="mt-1">Welcome to the meeting!</p>
    </div>
  </div>
);

const ActionPanel = () => (
  <div className="space-y-4">
    <div className="action-item">
      <input type="checkbox" className="checkbox" />
      <span>Follow up on project timeline</span>
    </div>
  </div>
);

const ParticipantPanel = () => (
  <div className="glass-panel rounded-lg p-4 w-64">
    <div className="flex items-center gap-2 mb-4">
      <Users className="h-5 w-5 text-primary" />
      <h2 className="font-medium">Participants</h2>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm">You</span>
        <span className="text-xs text-primary">Host</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">John Doe</span>
      </div>
    </div>
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('transcript');
  
  const renderContent = () => {
    switch (activeTab) {
      case 'transcript':
        return children || <TranscriptPanel />;
      case 'actions':
        return <ActionPanel />;
      case 'participants':
        return <ParticipantPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="sidebar">
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="panel-content">
        {renderContent()}
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