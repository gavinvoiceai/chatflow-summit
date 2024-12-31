import React, { useState, useEffect, useCallback } from 'react';
import { VideoGrid } from '@/components/VideoGrid';
import { Sidebar } from '@/components/Sidebar';
import { WebRTCService } from '@/services/webrtc';
import { VoiceCommand } from '@/services/voiceCommands';
import { VoiceCommandManager } from '@/components/VoiceCommandManager';
import { TranscriptionService, TranscriptionSegment } from '@/services/transcription';
import { TranscriptPanel } from '@/components/TranscriptPanel';
import { ClosedCaptions } from '@/components/ClosedCaptions';
import { deviceManager } from '@/services/deviceManager';
import { toast } from "sonner";
import { LobbyView } from '@/components/meeting/LobbyView';
import { MeetingControls } from '@/components/meeting/MeetingControls';
import { EndMeetingDialog } from '@/components/meeting/EndMeetingDialog';

type MeetingState = 'lobby' | 'connecting' | 'inProgress' | 'ending';

const Index = () => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [meetingState, setMeetingState] = useState<MeetingState>('lobby');
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [participants, setParticipants] = useState([
    { id: 'local', name: 'You', stream: null, videoEnabled: false, audioEnabled: false, isMainSpeaker: true }
  ]);
  const [webrtcService, setWebrtcService] = useState<WebRTCService | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptionSegment[]>([]);
  const [currentCaption, setCurrentCaption] = useState({ text: '', speaker: '' });
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [transcriptionService, setTranscriptionService] = useState<TranscriptionService | null>(null);

  const handleTranscriptUpdate = useCallback((segment: TranscriptionSegment) => {
    setTranscripts(prev => [...prev, segment]);
  }, []);

  const handleCaptionUpdate = useCallback((text: string, speaker: string) => {
    setCurrentCaption({ text, speaker });
  }, []);

  const handleStreamUpdate = useCallback((streams: Map<string, MediaStream>) => {
    setParticipants(prev => prev.map(p => ({
      ...p,
      stream: streams.get(p.id) || null
    })));
  }, []);

  const handleVoiceCommand = useCallback((command: VoiceCommand) => {
    switch (command.type) {
      case 'createTask':
        toast.success(`Created task: ${command.payload}`);
        break;
      case 'scheduleFollowup':
        toast.success(`Scheduled meeting: ${command.payload}`);
        break;
      case 'summarize':
        toast.success(`Generated summary: ${command.payload}`);
        break;
    }
  }, []);

  const initializeServices = useCallback(async () => {
    const webrtc = new WebRTCService(handleStreamUpdate);
    setWebrtcService(webrtc);

    const transcription = new TranscriptionService(
      'meeting-id',
      handleTranscriptUpdate,
      handleCaptionUpdate
    );
    setTranscriptionService(transcription);
  }, [handleStreamUpdate, handleTranscriptUpdate, handleCaptionUpdate]);

  const startMeeting = async () => {
    try {
      setMeetingState('connecting');
      const stream = await deviceManager.initializeDevices();
      await initializeServices();
      
      if (webrtcService) {
        await webrtcService.initializeLocalStream();
        setParticipants(prev => prev.map(p => 
          p.id === 'local' ? { ...p, stream, videoEnabled: true, audioEnabled: true } : p
        ));
        setVideoEnabled(true);
        setAudioEnabled(true);
      }
      
      setMeetingState('inProgress');
      toast.success("Meeting started successfully");
    } catch (error) {
      console.error('Error starting meeting:', error);
      toast.error("Failed to start meeting");
      setMeetingState('lobby');
    }
  };

  const endMeeting = () => {
    deviceManager.cleanup();
    webrtcService?.cleanup();
    transcriptionService?.stop();
    setMeetingState('lobby');
    setShowEndDialog(false);
    setParticipants([
      { id: 'local', name: 'You', stream: null, videoEnabled: false, audioEnabled: false, isMainSpeaker: true }
    ]);
    toast.success("Meeting ended");
  };

  const toggleAudio = async () => {
    await deviceManager.toggleAudio(!audioEnabled);
    setAudioEnabled(!audioEnabled);
    setParticipants(prev => prev.map(p => 
      p.id === 'local' ? { ...p, audioEnabled: !audioEnabled } : p
    ));
  };

  const toggleVideo = async () => {
    await deviceManager.toggleVideo(!videoEnabled);
    setVideoEnabled(!videoEnabled);
    setParticipants(prev => prev.map(p => 
      p.id === 'local' ? { ...p, videoEnabled: !videoEnabled } : p
    ));
  };

  const toggleTranscription = useCallback(() => {
    if (!transcriptionService) return;

    if (isTranscribing) {
      transcriptionService.stop();
      setIsTranscribing(false);
      toast.success("Transcription stopped");
    } else {
      transcriptionService.start();
      setIsTranscribing(true);
      toast.success("Transcription started");
    }
  }, [transcriptionService, isTranscribing]);

  useEffect(() => {
    const cleanup = () => {
      deviceManager.cleanup();
      webrtcService?.cleanup();
      transcriptionService?.stop();
    };

    return cleanup;
  }, [webrtcService, transcriptionService]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      deviceManager.cleanup();
      webrtcService?.cleanup();
      transcriptionService?.stop();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [webrtcService, transcriptionService]);

  if (meetingState === 'lobby') {
    return <LobbyView onStartMeeting={startMeeting} />;
  }

  return (
    <div className="conference-container">
      <div className="flex-1 relative pr-[300px]">
        <VideoGrid participants={participants} />
        
        {showCaptions && (
          <ClosedCaptions
            text={currentCaption.text}
            speaker={currentCaption.speaker}
          />
        )}
        
        <VoiceCommandManager
          meetingId="meeting-id"
          onCommand={handleVoiceCommand}
        />
        
        <MeetingControls
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
          isTranscribing={isTranscribing}
          showCaptions={showCaptions}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onToggleTranscription={toggleTranscription}
          onToggleCaptions={() => setShowCaptions(!showCaptions)}
          onShareScreen={async () => {
            try {
              const screenStream = await webrtcService?.startScreenShare();
              if (screenStream) {
                toast.success("Screen sharing started");
              }
            } catch {
              toast.error("Failed to start screen sharing");
            }
          }}
          onEndMeeting={() => setShowEndDialog(true)}
        />
      </div>

      <Sidebar>
        <TranscriptPanel
          transcripts={transcripts}
          autoScroll={true}
        />
      </Sidebar>

      <EndMeetingDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        onConfirm={endMeeting}
      />
    </div>
  );
};

export default Index;
