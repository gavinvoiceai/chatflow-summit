import React from 'react';
import { Button } from "@/components/ui/button";
import { ControlBar } from '@/components/ControlBar';
import { TranscriptionControls } from '@/components/TranscriptionControls';

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
        className="ml-4 end-meeting"
        onClick={onEndMeeting}
      >
        End Meeting
      </Button>
    </div>
  );
};