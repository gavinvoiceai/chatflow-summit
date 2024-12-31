import React, { useState, useEffect } from 'react';
import { VideoGrid } from '@/components/VideoGrid';
import { ControlBar } from '@/components/ControlBar';
import { AIPanel } from '@/components/AIPanel';
import { VoiceCommandIndicator } from '@/components/VoiceCommandIndicator';
import { useToast } from '@/components/ui/use-toast';

const mockParticipants = [
  { id: '1', name: 'You', videoEnabled: true, audioEnabled: true, isHost: true, isMainSpeaker: true },
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
  const { toast } = useToast();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Voice recognition setup
  useEffect(() => {
    if (!voiceCommandsEnabled) return;

    let recognition: SpeechRecognition | null = null;
    
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setTranscript(transcript);

        // Check for trigger word
        if (transcript.toLowerCase().includes('magic')) {
          processVoiceCommand(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({
        title: "Voice Commands Unavailable",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [voiceCommandsEnabled]);

  const processVoiceCommand = (command: string) => {
    // Basic command processing
    if (command.includes('create task')) {
      toast({
        title: "New Task",
        description: "Task created from voice command",
      });
    } else if (command.includes('schedule meeting')) {
      toast({
        title: "Meeting Scheduled",
        description: "Meeting scheduled from voice command",
      });
    } else if (command.includes('set reminder')) {
      toast({
        title: "Reminder Set",
        description: "Reminder created from voice command",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 relative">
        <VideoGrid participants={mockParticipants} />
        
        <VoiceCommandIndicator
          isListening={isListening}
          transcript={transcript}
        />
        
        <ControlBar
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
          voiceCommandsEnabled={voiceCommandsEnabled}
          onToggleAudio={() => setAudioEnabled(!audioEnabled)}
          onToggleVideo={() => setVideoEnabled(!videoEnabled)}
          onToggleVoiceCommands={() => setVoiceCommandsEnabled(!voiceCommandsEnabled)}
          onShareScreen={() => console.log('Share screen')}
          onOpenChat={() => console.log('Open chat')}
          onOpenSettings={() => console.log('Open settings')}
        />
      </div>
      
      <div className="w-[30%] border-l border-secondary glass-panel">
        <AIPanel
          transcript={mockTranscript}
          actionItems={mockActionItems}
          participants={mockParticipants}
        />
      </div>
    </div>
  );
};

export default Index;