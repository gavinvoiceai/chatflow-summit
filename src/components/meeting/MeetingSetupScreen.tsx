import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, Copy } from "lucide-react";
import { toast } from "sonner";
import { deviceManager } from '@/services/deviceManager';
import { useParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const MeetingSetupScreen = () => {
  const { meetingId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    initializeDevices();
    return () => {
      deviceManager.cleanup();
    };
  }, []);

  const initializeDevices = async () => {
    try {
      const mediaStream = await deviceManager.initializeDevices({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Set initial device states
      mediaStream.getVideoTracks().forEach(track => track.enabled = isVideoEnabled);
      mediaStream.getAudioTracks().forEach(track => track.enabled = isAudioEnabled);
    } catch (error) {
      console.error('Failed to initialize devices:', error);
      toast.error('Failed to access camera and microphone');
    }
  };

  const toggleVideo = async () => {
    try {
      await deviceManager.toggleVideo(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    } catch (error) {
      console.error('Failed to toggle video:', error);
      toast.error('Failed to toggle video');
    }
  };

  const toggleAudio = async () => {
    try {
      await deviceManager.toggleAudio(!isAudioEnabled);
      setIsAudioEnabled(!isAudioEnabled);
    } catch (error) {
      console.error('Failed to toggle audio:', error);
      toast.error('Failed to toggle audio');
    }
  };

  const copyMeetingLink = async () => {
    const link = `${window.location.origin}/meeting/${meetingId}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Meeting link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy meeting link:', error);
      toast.error('Failed to copy meeting link');
    }
  };

  const startMeeting = async () => {
    try {
      const { error } = await supabase
        .from('meetings')
        .update({ is_active: true })
        .eq('id', meetingId);

      if (error) throw error;
      
      // Save user preferences
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.data.user.id,
            camera_enabled: isVideoEnabled,
            microphone_enabled: isAudioEnabled,
          });
      }

      window.location.reload(); // This will trigger the main meeting view
    } catch (error) {
      console.error('Failed to start meeting:', error);
      toast.error('Failed to start meeting');
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8 min-h-screen bg-background">
      {/* Meeting Info Banner */}
      <div className="w-full max-w-4xl bg-card rounded-lg p-4 flex justify-between items-center">
        <div className="text-foreground">
          <span className="text-muted-foreground">Meeting ID: </span>
          <span className="font-mono">{meetingId}</span>
          <Button
            variant="outline"
            size="sm"
            className="ml-4"
            onClick={copyMeetingLink}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
        </div>
      </div>

      {/* Video Preview */}
      <div className="w-full max-w-4xl aspect-video bg-card rounded-lg overflow-hidden relative">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline
          muted 
          className={cn(
            "w-full h-full object-cover",
            !isVideoEnabled && "hidden"
          )}
        />
        {!isVideoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-card">
            <VideoOff className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Device Controls */}
      <div className="flex justify-center gap-4">
        <Button
          variant={isVideoEnabled ? "default" : "secondary"}
          onClick={toggleVideo}
          className="min-w-[120px]"
        >
          {isVideoEnabled ? (
            <Video className="h-4 w-4 mr-2" />
          ) : (
            <VideoOff className="h-4 w-4 mr-2" />
          )}
          {isVideoEnabled ? 'Stop Video' : 'Start Video'}
        </Button>
        
        <Button
          variant={isAudioEnabled ? "default" : "secondary"}
          onClick={toggleAudio}
          className="min-w-[120px]"
        >
          {isAudioEnabled ? (
            <Mic className="h-4 w-4 mr-2" />
          ) : (
            <MicOff className="h-4 w-4 mr-2" />
          )}
          {isAudioEnabled ? 'Mute' : 'Unmute'}
        </Button>
        
        <Button 
          variant="default"
          className="min-w-[120px] bg-primary hover:bg-primary/90"
          onClick={startMeeting}
        >
          Go Live
        </Button>
      </div>
    </div>
  );
};