import React, { useState, useEffect, useCallback } from 'react';
import { VideoGrid } from '@/components/VideoGrid';
import { ControlBar } from '@/components/ControlBar';
import { Sidebar } from '@/components/Sidebar';
import { WebRTCService } from '@/services/webrtc';
import { VoiceCommandService, VoiceCommand } from '@/services/voiceCommands';
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
import { Button } from "@/components/ui/button";

type MeetingState = 'lobby' | 'connecting' | 'inProgress' | 'ending';

const Index = () => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(false);
  const [meetingState, setMeetingState] = useState<MeetingState>('lobby');
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [participants, setParticipants] = useState([
    { id: 'local', name: 'You', stream: null, videoEnabled: false, audioEnabled: false, isMainSpeaker: true }
  ]);
  const [webrtcService, setWebrtcService] = useState<WebRTCService | null>(null);
  const [voiceCommandService, setVoiceCommandService] = useState<VoiceCommandService | null>(null);
  const [transcript, setTranscript] = useState('');

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
    const voice = new VoiceCommandService(
      'meeting-id', // TODO: Replace with actual meeting ID
      handleVoiceCommand,
      setTranscript
    );
    
    setWebrtcService(webrtc);
    setVoiceCommandService(voice);
  }, [handleStreamUpdate, handleVoiceCommand]);

  const startMeeting = async () => {
    try {
      setMeetingState('connecting');
      await initializeServices();
      
      if (webrtcService) {
        const stream = await webrtcService.initializeLocalStream();
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
    webrtcService?.cleanup();
    voiceCommandService?.stop();
    setMeetingState('lobby');
    setShowEndDialog(false);
    setParticipants([
      { id: 'local', name: 'You', stream: null, videoEnabled: false, audioEnabled: false, isMainSpeaker: true }
    ]);
    toast.success("Meeting ended");
  };

  const toggleAudio = () => {
    if (participants[0].stream) {
      participants[0].stream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
      setParticipants(prev => prev.map(p => 
        p.id === 'local' ? { ...p, audioEnabled: !audioEnabled } : p
      ));
    }
  };

  const toggleVideo = () => {
    if (participants[0].stream) {
      participants[0].stream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
      setParticipants(prev => prev.map(p => 
        p.id === 'local' ? { ...p, videoEnabled: !videoEnabled } : p
      ));
    }
  };

  const toggleVoiceCommands = () => {
    if (voiceCommandsEnabled) {
      voiceCommandService?.stop();
    } else {
      voiceCommandService?.start();
    }
    setVoiceCommandsEnabled(!voiceCommandsEnabled);
  };

  useEffect(() => {
    return () => {
      webrtcService?.cleanup();
      voiceCommandService?.stop();
    };
  }, [webrtcService, voiceCommandService]);

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
        
        <div className="controls-container">
          <ControlBar
            audioEnabled={audioEnabled}
            videoEnabled={videoEnabled}
            voiceCommandsEnabled={voiceCommandsEnabled}
            isListening={voiceCommandsEnabled}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onToggleVoiceCommands={toggleVoiceCommands}
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
          />
          
          <Button
            variant="destructive"
            className="ml-4 end-meeting"
            onClick={() => setShowEndDialog(true)}
          >
            End Meeting
          </Button>
        </div>
      </div>

      <Sidebar />

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
