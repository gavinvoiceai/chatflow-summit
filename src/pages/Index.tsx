import React, { useState, useEffect, useCallback } from 'react';
import { VideoGrid } from '@/components/VideoGrid';
import { ControlBar } from '@/components/ControlBar';
import { Sidebar } from '@/components/Sidebar';
import { WebRTCService } from '@/services/webrtc';
import { VoiceCommand } from '@/services/voiceCommands';
import { VoiceCommandManager } from '@/components/VoiceCommandManager';
import { TranscriptionService, TranscriptionSegment } from '@/services/transcription';
import { TranscriptPanel } from '@/components/TranscriptPanel';
import { ClosedCaptions } from '@/components/ClosedCaptions';
import { TranscriptionControls } from '@/components/TranscriptionControls';
import { deviceManager } from '@/services/deviceManager';
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
      'meeting-id', // TODO: Replace with actual meeting ID
      handleTranscriptUpdate,
      handleCaptionUpdate
    );
    setTranscriptionService(transcription);
  }, [handleStreamUpdate, handleTranscriptUpdate, handleCaptionUpdate]);

  const startMeeting = async () => {
    try {
      setMeetingState('connecting');
      
      // Initialize devices first
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

    // Cleanup on component unmount
    return cleanup;
  }, [webrtcService, transcriptionService]);

  // Handle page unload
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
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <h1 className="text-2xl font-bold mb-8">Start a New Meeting</h1>
        <Button 
          onClick={startMeeting}
          size="lg"
          className="start-meeting"
        >
          Start Meeting
        </Button>
      </div>
    );
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
          meetingId="meeting-id" // TODO: Replace with actual meeting ID
          onCommand={handleVoiceCommand}
        />
        
        <div className="controls-container">
          <ControlBar
            audioEnabled={audioEnabled}
            videoEnabled={videoEnabled}
            voiceCommandsEnabled={false}
            isListening={false}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onToggleVoiceCommands={() => {}}
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
            onOpenChat={() => {
              toast.info("Chat feature coming soon");
            }}
            onOpenSettings={() => {
              toast.info("Settings coming soon");
            }}
          >
            <TranscriptionControls
              isTranscribing={isTranscribing}
              showCaptions={showCaptions}
              onToggleTranscription={toggleTranscription}
              onToggleCaptions={() => setShowCaptions(!showCaptions)}
            />
          </ControlBar>
          
          <Button
            variant="destructive"
            className="ml-4 end-meeting"
            onClick={() => setShowEndDialog(true)}
          >
            End Meeting
          </Button>
        </div>
      </div>

      <Sidebar>
        <TranscriptPanel
          transcripts={transcripts}
          autoScroll={true}
        />
      </Sidebar>

      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Meeting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end the meeting? All participants will be disconnected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={endMeeting} className="bg-destructive text-destructive-foreground">
              End Meeting
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;