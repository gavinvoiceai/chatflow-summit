import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Subtitles, SubtitlesOff } from 'lucide-react';

interface TranscriptionControlsProps {
  isTranscribing: boolean;
  showCaptions: boolean;
  onToggleTranscription: () => void;
  onToggleCaptions: () => void;
}

export const TranscriptionControls: React.FC<TranscriptionControlsProps> = ({
  isTranscribing,
  showCaptions,
  onToggleTranscription,
  onToggleCaptions,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleTranscription}
        className={isTranscribing ? 'text-primary' : 'text-muted-foreground'}
      >
        {isTranscribing ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleCaptions}
        className={showCaptions ? 'text-primary' : 'text-muted-foreground'}
      >
        {showCaptions ? <Subtitles className="h-5 w-5" /> : <SubtitlesOff className="h-5 w-5" />}
      </Button>
    </div>
  );
};