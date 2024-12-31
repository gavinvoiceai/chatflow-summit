import React from 'react';
import { Mic } from 'lucide-react';

interface VoiceCommandIndicatorProps {
  isListening: boolean;
  transcript: string;
}

export const VoiceCommandIndicator: React.FC<VoiceCommandIndicatorProps> = ({
  isListening,
  transcript,
}) => {
  return (
    <div className={cn(
      "fixed top-4 left-1/2 -translate-x-1/2 glass-panel rounded-lg px-4 py-2",
      "flex items-center gap-3 transition-all duration-300",
      isListening ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8 pointer-events-none"
    )}>
      <div className={cn(
        "relative",
        isListening && "after:absolute after:inset-0 after:animate-ping after:bg-primary/50 after:rounded-full"
      )}>
        <Mic className={cn(
          "h-5 w-5 transition-colors",
          isListening ? "text-primary" : "text-muted-foreground"
        )} />
      </div>
      <span className="text-sm">
        {transcript || "Listening for commands..."}
      </span>
    </div>
  );
};