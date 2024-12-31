import React from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, MessageSquare, Bot, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ControlBarProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  voiceCommandsEnabled: boolean;
  isListening?: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleVoiceCommands: () => void;
  onShareScreen: () => void;
  onOpenChat: () => void;
  onOpenSettings: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  audioEnabled,
  videoEnabled,
  voiceCommandsEnabled,
  isListening,
  onToggleAudio,
  onToggleVideo,
  onToggleVoiceCommands,
  onShareScreen,
  onOpenChat,
  onOpenSettings,
}) => {
  return (
    <div className="control-bar">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleAudio}
            className={!audioEnabled ? 'text-destructive' : ''}
          >
            {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleVideo}
            className={!videoEnabled ? 'text-destructive' : ''}
          >
            {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {videoEnabled ? 'Turn off camera' : 'Turn on camera'}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={onShareScreen}>
            <Monitor className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Share screen</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={voiceCommandsEnabled ? "default" : "ghost"}
            size="icon"
            onClick={onToggleVoiceCommands}
            className={cn(
              voiceCommandsEnabled && "bg-primary text-primary-foreground",
              isListening && "animate-pulse"
            )}
          >
            <Bot className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {voiceCommandsEnabled ? 'Disable voice commands' : 'Enable voice commands'}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={onOpenChat}>
            <MessageSquare className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Open chat</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={onOpenSettings}>
            <Settings className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Settings</TooltipContent>
      </Tooltip>
    </div>
  );
};