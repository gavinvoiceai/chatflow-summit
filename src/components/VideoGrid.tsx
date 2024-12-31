import React, { useMemo } from 'react';
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

  const secondaryGridColumns = useMemo(() => {
    const count = otherParticipants.length;
    return `repeat(${Math.min(count, 3)}, 1fr)`;
  }, [otherParticipants.length]);

  return (
    <div className="video-grid">
      {/* Main speaker view */}
      <div className="video-container main-speaker">
        <div className="absolute bottom-4 left-4 glass-panel px-3 py-1 rounded-full text-sm flex items-center gap-2">
          {mainSpeaker.name}
          {!mainSpeaker.audioEnabled && (
            <span className="text-destructive">🔇</span>
          )}
        </div>
      </div>

      {/* Secondary participants */}
      <div 
        className="secondary-container"
        style={{ gridTemplateColumns: secondaryGridColumns }}
      >
        {otherParticipants.map((participant) => (
          <div 
            key={participant.id} 
            className="video-container hover:ring-2 hover:ring-primary transition-all cursor-pointer"
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