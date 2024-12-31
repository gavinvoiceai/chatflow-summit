import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Mic, MicOff, VideoOff } from 'lucide-react';
import { toast } from "sonner";
import { deviceManager } from '@/services/deviceManager';
import { supabase } from "@/integrations/supabase/client";

interface DeviceInfo {
  deviceId: string;
  label: string;
}

interface PreMeetingSetupProps {
  onJoinMeeting: () => Promise<void>;
}

export const PreMeetingSetup: React.FC<PreMeetingSetupProps> = ({ onJoinMeeting }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDevices, setVideoDevices] = useState<DeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<DeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDevices();
    loadUserPreferences();
  }, []);

  const initializeDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const videoDevs = devices.filter(device => device.kind === 'videoinput');
      const audioDevs = devices.filter(device => device.kind === 'audioinput');
      
      setVideoDevices(videoDevs.map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 5)}` })));
      setAudioDevices(audioDevs.map(d => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.slice(0, 5)}` })));
      
      if (videoDevs.length > 0) setSelectedVideoDevice(videoDevs[0].deviceId);
      if (audioDevs.length > 0) setSelectedAudioDevice(audioDevs[0].deviceId);
      
      await startVideoPreview();
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize devices:', error);
      toast.error('Failed to initialize devices. Please check your permissions.');
      setIsLoading(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .single();

      if (preferences) {
        setSelectedVideoDevice(preferences.preferred_camera_id || '');
        setSelectedAudioDevice(preferences.preferred_microphone_id || '');
        setIsVideoEnabled(preferences.camera_enabled);
        setIsAudioEnabled(preferences.microphone_enabled);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const saveUserPreferences = async () => {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          preferred_camera_id: selectedVideoDevice,
          preferred_microphone_id: selectedAudioDevice,
          camera_enabled: isVideoEnabled,
          microphone_enabled: isAudioEnabled,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  const startVideoPreview = async () => {
    try {
      const stream = await deviceManager.initializeDevices({
        video: { deviceId: selectedVideoDevice },
        audio: { deviceId: selectedAudioDevice },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Set initial device states
      stream.getVideoTracks().forEach(track => track.enabled = isVideoEnabled);
      stream.getAudioTracks().forEach(track => track.enabled = isAudioEnabled);
    } catch (error) {
      console.error('Failed to start video preview:', error);
      toast.error('Failed to start video preview');
    }
  };

  const toggleVideo = async () => {
    setIsVideoEnabled(!isVideoEnabled);
    await deviceManager.toggleVideo(!isVideoEnabled);
  };

  const toggleAudio = async () => {
    setIsAudioEnabled(!isAudioEnabled);
    await deviceManager.toggleAudio(!isAudioEnabled);
  };

  const handleDeviceChange = async (deviceId: string, type: 'video' | 'audio') => {
    if (type === 'video') {
      setSelectedVideoDevice(deviceId);
    } else {
      setSelectedAudioDevice(deviceId);
    }
    await startVideoPreview();
  };

  const handleJoinMeeting = async () => {
    await saveUserPreferences();
    await onJoinMeeting();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Video Preview */}
        <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!isVideoEnabled && 'hidden'}`}
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <VideoOff className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Device Controls */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <Select
              value={selectedVideoDevice}
              onValueChange={(value) => handleDeviceChange(value, 'video')}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select camera" />
              </SelectTrigger>
              <SelectContent>
                {videoDevices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedAudioDevice}
              onValueChange={(value) => handleDeviceChange(value, 'audio')}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select microphone" />
              </SelectTrigger>
              <SelectContent>
                {audioDevices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              variant={isVideoEnabled ? "default" : "secondary"}
              size="icon"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            <Button
              variant={isAudioEnabled ? "default" : "secondary"}
              size="icon"
              onClick={toggleAudio}
            >
              {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Join/Create Meeting Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleJoinMeeting}
            disabled={isLoading}
            className="w-40"
          >
            Join Meeting
          </Button>
        </div>
      </div>
    </div>
  );
};