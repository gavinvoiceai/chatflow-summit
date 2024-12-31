import React, { useState, useEffect } from 'react';
import { VideoGrid } from '@/components/VideoGrid';
import { MeetingControls } from './MeetingControls';
import { useParams, useNavigate } from 'react-router-dom';
import { deviceManager } from '@/services/deviceManager';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TranscriptPanel } from '@/components/TranscriptPanel';
import { ChatPanel } from '@/components/ChatPanel';

export const VideoConferenceScreen = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);

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

  const [activeTab, setActiveTab] = useState('transcript');
  const [unreadChats, setUnreadChats] = useState(0);
  const [messages, setMessages] = useState([]);

  const handleTabChange = (tab: string) => {
    if (tab === 'chat') {
      setUnreadChats(0);
    }
    setActiveTab(tab);
  };

  const handleNewMessage = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      sender: 'You',
      content,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // Increment unread count when new messages arrive and we're not on the chat tab
  useEffect(() => {
    if (activeTab !== 'chat' && messages.length > 0) {
      setUnreadChats((prev) => prev + 1);
    }
  }, [messages.length]);

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 relative">
        <ErrorBoundary>
          <div className="h-full">
            <VideoGrid participants={participants} />
          </div>
        </ErrorBoundary>
        
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
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

      {!isMobile && (
        <div className="w-80 border-l border-border/10 bg-background/95 backdrop-blur-sm">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full">
            <TabsList className="w-full justify-start px-2 border-b border-border/10">
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="transcript" className="h-[calc(100%-48px)] overflow-y-auto">
              <TranscriptPanel 
                transcripts={[]} 
                autoScroll={true}
              />
            </TabsContent>
            <TabsContent value="actions" className="h-[calc(100%-48px)] overflow-y-auto">
              <div className="p-4">Action Items</div>
            </TabsContent>
            <TabsContent value="participants" className="h-[calc(100%-48px)] overflow-y-auto">
              <div className="p-4">Participants</div>
            </TabsContent>
            <TabsContent value="chat" className="h-[calc(100%-48px)] overflow-y-auto">
              <ChatPanel 
                messages={messages}
                onSendMessage={handleNewMessage}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};
