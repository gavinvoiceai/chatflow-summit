import React, { useState, useEffect } from 'react';
import { VideoGrid } from '@/components/VideoGrid';
import { ControlBar } from '@/components/ControlBar';
import { Sidebar } from '@/components/Sidebar';
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

type MeetingState = 'lobby' | 'inProgress' | 'ending';

const Index = () => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [meetingState, setMeetingState] = useState<MeetingState>('lobby');
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [participants, setParticipants] = useState([
    { id: 'local', name: 'You', stream: null, videoEnabled: false, audioEnabled: false, isMainSpeaker: true }
  ]);

  const initializeDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      setParticipants(prev => prev.map(p => 
        p.id === 'local' ? { ...p, stream, videoEnabled: true, audioEnabled: true } : p
      ));
      setVideoEnabled(true);
      setAudioEnabled(true);
      
      toast.success("Camera and microphone connected successfully");
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error("Failed to access camera or microphone");
    }
  };

  const stopMediaTracks = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
      });
      setLocalStream(null);
      setParticipants(prev => prev.map(p => 
        p.id === 'local' ? { ...p, stream: null, videoEnabled: false, audioEnabled: false } : p
      ));
      setVideoEnabled(false);
      setAudioEnabled(false);
    }
  };

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

  const startMeeting = async () => {
    await initializeDevices();
    setMeetingState('inProgress');
  };

  const endMeeting = () => {
    stopMediaTracks();
    setMeetingState('lobby');
    setShowEndDialog(false);
    toast.success("Meeting ended");
  };

  useEffect(() => {
    return () => {
      stopMediaTracks();
    };
  }, []);

  if (meetingState === 'lobby') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <h1 className="text-2xl font-bold mb-8">Start a New Meeting</h1>
        <Button 
          onClick={startMeeting}
          size="lg"
          className="bg-green-500 hover:bg-green-600 text-white px-8"
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
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onToggleVoiceCommands={() => {
              setVoiceCommandsEnabled(!voiceCommandsEnabled);
              toast.info(voiceCommandsEnabled ? "Voice commands disabled" : "Voice commands enabled");
            }}
            onShareScreen={() => {
              toast.info("Screen sharing coming soon");
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
            className="ml-4"
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