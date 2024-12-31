import React, { useState, useEffect } from 'react';
import { VideoGrid } from '@/components/VideoGrid';
import { MeetingControls } from './MeetingControls';
import { Sidebar } from '@/components/Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import { deviceManager } from '@/services/deviceManager';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export const VideoConferenceScreen = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    const initializeStream = async () => {
      try {
        const stream = await deviceManager.initializeDevices({
          video: true,
          audio: true
        });
        setLocalStream(stream);
      } catch (error) {
        console.error('Failed to initialize devices:', error);
        toast.error('Failed to initialize devices');
      }
    };

    initializeStream();

    return () => {
      if (localStream) {
        console.log('Cleaning up media streams');
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleToggleAudio = async () => {
    if (localStream) {
      const newState = !audioEnabled;
      await deviceManager.toggleAudio(newState);
      setAudioEnabled(newState);
    }
  };

  const handleToggleVideo = async () => {
    if (localStream) {
      const newState = !videoEnabled;
      await deviceManager.toggleVideo(newState);
      setVideoEnabled(newState);
    }
  };

  const handleShareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      // Handle screen sharing stream
      toast.success('Screen sharing started');
    } catch (error) {
      console.error('Failed to start screen sharing:', error);
      toast.error('Failed to start screen sharing');
    }
  };

  const handleEndMeeting = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    navigate('/');
  };

  const participants = localStream ? [
    {
      id: 'local',
      name: 'You',
      stream: localStream,
      videoEnabled,
      audioEnabled,
      isMainSpeaker: true
    }
  ] : [];

  return (
    <div className="relative h-screen bg-background overflow-hidden">
      {/* End Meeting Button - Fixed position */}
      <Button
        variant="destructive"
        size="sm"
        className="absolute top-4 right-4 z-50 md:right-[336px]"
        onClick={handleEndMeeting}
      >
        <X className="h-4 w-4 mr-2" />
        End Meeting
      </Button>

      <div className="flex h-full">
        {/* Main Content Area */}
        <div className="flex-1 relative">
          <ErrorBoundary>
            <div className="h-full pb-24 md:pb-20">
              <VideoGrid participants={participants} />
            </div>
          </ErrorBoundary>

          {/* Controls - Fixed at bottom */}
          <div className="fixed bottom-0 left-0 right-0 md:right-[320px] p-4 bg-background/80 backdrop-blur-sm border-t border-border/10 z-40">
            <MeetingControls
              audioEnabled={audioEnabled}
              videoEnabled={videoEnabled}
              isTranscribing={isTranscribing}
              showCaptions={showCaptions}
              onToggleAudio={handleToggleAudio}
              onToggleVideo={handleToggleVideo}
              onToggleTranscription={() => setIsTranscribing(!isTranscribing)}
              onToggleCaptions={() => setShowCaptions(!showCaptions)}
              onShareScreen={handleShareScreen}
              onEndMeeting={handleEndMeeting}
            />
          </div>
        </div>

        {/* Sidebar - Fixed width on desktop */}
        <Sidebar 
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};