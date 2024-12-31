import React from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, MessageSquare, Settings, Subtitles } from 'lucide-react';
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
  children?: React.ReactNode;
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
  children
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-black/80 backdrop-blur-sm border border-border/10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleAudio}
              className={cn(
                "control-button",
                !audioEnabled && "text-destructive"
              )}
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
              className={cn(
                "control-button",
                !videoEnabled && "text-destructive"
              )}
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
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onShareScreen}
              className="control-button"
            >
              <Monitor className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Share screen</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onOpenChat}
              className="control-button"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open chat</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onOpenSettings}
              className="control-button"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>

        {children}
      </div>
    </div>
  );
};