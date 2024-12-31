import React, { useState } from 'react';
import { VideoGrid } from '@/components/VideoGrid';
import { ControlBar } from '@/components/ControlBar';
import { AIPanel } from '@/components/AIPanel';
import { ParticipantList } from '@/components/ParticipantList';

const mockParticipants = [
  { id: '1', name: 'You', videoEnabled: true, audioEnabled: true, isHost: true },
  { id: '2', name: 'John Doe', videoEnabled: true, audioEnabled: false },
  { id: '3', name: 'Jane Smith', videoEnabled: true, audioEnabled: true },
  { id: '4', name: 'Mike Johnson', videoEnabled: true, audioEnabled: true },
];

const mockTranscript = [
  { id: '1', speaker: 'John Doe', text: "Let's discuss the project timeline.", timestamp: '10:30 AM' },
  { id: '2', speaker: 'You', text: "I think we should focus on the MVP first.", timestamp: '10:31 AM' },
  { id: '3', speaker: 'Jane Smith', text: "I agree, that makes sense.", timestamp: '10:31 AM' },
];

const mockActionItems = [
  { id: '1', text: 'Create project timeline', completed: true },
  { id: '2', text: 'Schedule follow-up meeting', completed: false },
  { id: '3', text: 'Share MVP requirements', completed: false },
];

const Index = () => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 relative">
        <VideoGrid participants={mockParticipants} />
        
        <div className="absolute top-4 right-4 animate-fade-in">
          <ParticipantList participants={mockParticipants} />
        </div>
        
        <ControlBar
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
          onToggleAudio={() => setAudioEnabled(!audioEnabled)}
          onToggleVideo={() => setVideoEnabled(!videoEnabled)}
          onShareScreen={() => console.log('Share screen')}
          onOpenChat={() => setIsChatOpen(!isChatOpen)}
        />
      </div>
      
      <div className="w-[30%] border-l border-secondary glass-panel">
        <AIPanel
          transcript={mockTranscript}
          actionItems={mockActionItems}
        />
      </div>
    </div>
  );
};

export default Index;