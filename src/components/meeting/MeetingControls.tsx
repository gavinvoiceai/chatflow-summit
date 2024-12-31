import React from 'react';
import { Button } from "@/components/ui/button";
import { ControlBar } from '@/components/ControlBar';
import { TranscriptionControls } from '@/components/TranscriptionControls';
import { X } from 'lucide-react';

interface MeetingControlsProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  isTranscribing: boolean;
  showCaptions: boolean;
  onToggleAudio: () => Promise<void>;
  onToggleVideo: () => Promise<void>;
  onToggleTranscription: () => void;
  onToggleCaptions: () => void;
  onShareScreen: () => Promise<void>;
  onEndMeeting: () => void;
}

export const MeetingControls: React.FC<MeetingControlsProps> = ({
  audioEnabled,
  videoEnabled,
  isTranscribing,
  showCaptions,
  onToggleAudio,
  onToggleVideo,
  onToggleTranscription,
  onToggleCaptions,
  onShareScreen,
  onEndMeeting,
}) => {
  return (
    <div className="controls-container">
      <div className="control-bar">
        <ControlBar
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
          voiceCommandsEnabled={false}
          isListening={false}
          onToggleAudio={onToggleAudio}
          onToggleVideo={onToggleVideo}
          onToggleVoiceCommands={() => {}}
          onShareScreen={onShareScreen}
          onOpenChat={() => {}}
          onOpenSettings={() => {}}
        >
          <TranscriptionControls
            isTranscribing={isTranscribing}
            showCaptions={showCaptions}
            onToggleTranscription={onToggleTranscription}
            onToggleCaptions={onToggleCaptions}
          />
        </ControlBar>
        <Button
          variant="destructive"
          size="icon"
          className="ml-2"
          onClick={onEndMeeting}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};