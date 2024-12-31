import React, { useState } from 'react';
import { Text, CheckSquare, Users } from 'lucide-react';
import { ParticipantList } from './ParticipantList';
import { Input } from './ui/input';

interface TabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, icon, isActive, onClick }) => (
  <button
    className={`tab-button flex items-center gap-2 ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const TranscriptPanel = () => (
  <div className="space-y-4">
    <div className="transcript-message">
      <span className="timestamp text-xs">10:30 AM</span>
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

export const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('participants');
  
  const tabs = [
    {
      id: 'transcript',
      label: 'Transcript',
      icon: <Text className="w-4 h-4" />,
      content: TranscriptPanel
    },
    {
      id: 'actions',
      label: 'Actions',
      icon: <CheckSquare className="w-4 h-4" />,
      content: ActionPanel
    },
    {
      id: 'participants',
      label: 'Participants',
      icon: <Users className="w-4 h-4" />,
      content: ParticipantList
    }
  ];

  const ActivePanel = tabs.find(tab => tab.id === activeTab)?.content || TranscriptPanel;

  return (
    <div className="sidebar">
      <div className="tab-header">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>
      
      <div className="panel-content">
        <ActivePanel participants={[
          { id: '1', name: 'You', isHost: true },
          { id: '2', name: 'John Doe' }
        ]} />
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