import React from 'react';
import { cn } from '@/lib/utils';

interface VideoGridProps {
  participants: Array<{
    id: string;
    name: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
    isMainSpeaker?: boolean;
  }>;
}

export const VideoGrid: React.FC<VideoGridProps> = ({ participants }) => {
  const mainSpeaker = participants.find(p => p.isMainSpeaker) || participants[0];
  const otherParticipants = participants.filter(p => p.id !== mainSpeaker.id);

  return (
    <div className="relative w-full h-full p-4 gap-4">
      {/* Main speaker view */}
      {mainSpeaker && (
        <div className="w-full h-[60vh] mb-4">
          <div className="participant-video w-full h-full animate-fade-in">
            <div className="absolute bottom-4 left-4 glass-panel px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {mainSpeaker.name}
              {!mainSpeaker.audioEnabled && (
                <span className="text-destructive">🔇</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Other participants grid */}
      <div className={cn(
        "grid gap-4 w-full",
        otherParticipants.length <= 2 ? "grid-cols-2" :
        otherParticipants.length <= 4 ? "grid-cols-2" :
        "grid-cols-3"
      )}>
        {otherParticipants.map((participant) => (
          <div 
            key={participant.id} 
            className="participant-video animate-fade-in cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            onClick={() => console.log('Set as main speaker:', participant.id)}
          >
            <div className="absolute bottom-4 left-4 glass-panel px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {participant.name}
              {!participant.audioEnabled && (
                <span className="text-destructive">🔇</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
