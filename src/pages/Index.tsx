import React, { useState, useEffect } from 'react';
import { VideoGrid } from '@/components/VideoGrid';
import { ControlBar } from '@/components/ControlBar';
import { AIPanel } from '@/components/AIPanel';
import { VoiceCommandIndicator } from '@/components/VoiceCommandIndicator';
import { useToast } from '@/components/ui/use-toast';
import { WebRTCService } from '@/services/webrtc';
import { VoiceCommandService } from '@/services/voiceCommands';

const Index = () => {
  const { toast } = useToast();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState([
    { id: 'local', name: 'You', videoEnabled: true, audioEnabled: true, isHost: true, isMainSpeaker: true },
  ]);

  // Initialize WebRTC service
  const [webRTCService] = useState(() => new WebRTCService((participantId, stream) => {
    setParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, stream } : p
    ));
  }));

  // Initialize voice command service
  const [voiceCommandService] = useState(() => new VoiceCommandService(
    (newTranscript) => setTranscript(newTranscript),
    {
      onCreateTask: (task) => {
        toast.success(`New task created: ${task}`);
      },
      onScheduleMeeting: (details) => {
        toast.success(`Meeting scheduled: ${details}`);
      },
      onSendSummary: (recipient) => {
        toast.success(`Summary sent to ${recipient}`);
      },
    }
  ));

  // Initialize media stream
  useEffect(() => {
    const initializeStream = async () => {
      try {
        const stream = await webRTCService.initializeLocalStream();
        setLocalStream(stream);
        setParticipants(prev => prev.map(p => 
          p.id === 'local' ? { ...p, stream } : p
        ));
      } catch (error) {
        console.error('Failed to initialize stream:', error);
        toast.error('Failed to access camera or microphone');
      }
    };

    initializeStream();

    return () => {
      webRTCService.closeAllConnections();
    };
  }, []);

  // Handle media controls
  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
      setParticipants(prev => prev.map(p => 
        p.id === 'local' ? { ...p, audioEnabled: !audioEnabled } : p
      ));
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
      setParticipants(prev => prev.map(p => 
        p.id === 'local' ? { ...p, videoEnabled: !videoEnabled } : p
      ));
    }
  };

  const toggleVoiceCommands = () => {
    if (!voiceCommandsEnabled) {
      voiceCommandService.start();
      setIsListening(true);
    } else {
      voiceCommandService.stop();
      setIsListening(false);
    }
    setVoiceCommandsEnabled(!voiceCommandsEnabled);
  };

  return (
    <div className="conference-container h-screen flex">
      <div className="flex-1 relative">
        <VideoGrid participants={participants} />
        
        <VoiceCommandIndicator
          isListening={isListening}
          transcript={transcript}
        />
      </div>
      
      <div className="w-80 border-l border-border">
        <AIPanel
          transcript={[
            { id: '1', speaker: 'System', text: 'Meeting started', timestamp: new Date().toLocaleTimeString() }
          ]}
          actionItems={[]}
          participants={participants}
        />
      </div>

      <div className="controls-container fixed bottom-0 left-0 right-0 p-4">
        <ControlBar
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
          voiceCommandsEnabled={voiceCommandsEnabled}
          isListening={isListening}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onToggleVoiceCommands={toggleVoiceCommands}
          onShareScreen={() => {
            toast.info('Screen sharing coming soon');
          }}
          onOpenChat={() => {
            toast.info('Chat feature coming soon');
          }}
          onOpenSettings={() => {
            toast.info('Settings coming soon');
          }}
        />
      </div>
    </div>
  );
};

export default Index;