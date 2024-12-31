import React from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ControlBarProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onShareScreen: () => void;
  onOpenChat: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  audioEnabled,
  videoEnabled,
  onToggleAudio,
  onToggleVideo,
  onShareScreen,
  onOpenChat,
}) => {
  return (
    <div className="control-bar">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleAudio}
        className={!audioEnabled ? 'text-destructive' : ''}
      >
        {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleVideo}
        className={!videoEnabled ? 'text-destructive' : ''}
      >
        {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </Button>
      <Button variant="ghost" size="icon" onClick={onShareScreen}>
        <Monitor className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onOpenChat}>
        <MessageSquare className="h-5 w-5" />
      </Button>
    </div>
  );
};