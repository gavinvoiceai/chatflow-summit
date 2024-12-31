import React, { useEffect, useRef, useState } from 'react';
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

interface GridDimensions {
  rows: number;
  cols: number;
}

const calculateGridDimensions = (participantCount: number): GridDimensions => {
  if (participantCount <= 1) return { rows: 1, cols: 1 };
  if (participantCount <= 2) return { rows: 1, cols: 2 };
  if (participantCount <= 4) return { rows: 2, cols: 2 };
  
  const cols = Math.ceil(Math.sqrt(participantCount));
  const rows = Math.ceil(participantCount / cols);
  return { rows, cols };
};

export const VideoGrid: React.FC<VideoGridProps> = ({ participants }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<GridDimensions>({ rows: 1, cols: 1 });
  const mainSpeaker = participants.find(p => p.isMainSpeaker) || participants[0];
  const otherParticipants = participants.filter(p => p.id !== mainSpeaker.id);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      setDimensions(calculateGridDimensions(otherParticipants.length));
    });

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => observer.disconnect();
  }, [otherParticipants.length]);

  return (
    <div className="video-container">
      {/* Main speaker view */}
      <div className="participant-video main-speaker animate-fade-in">
        <div className="absolute bottom-4 left-4 glass-panel px-3 py-1 rounded-full text-sm flex items-center gap-2">
          {mainSpeaker.name}
          {!mainSpeaker.audioEnabled && (
            <span className="text-destructive">🔇</span>
          )}
        </div>
      </div>

      {/* Secondary participants grid */}
      <div 
        ref={gridRef}
        className={cn(
          "grid gap-4",
          `grid-cols-${dimensions.cols}`,
          otherParticipants.length > 4 && "overflow-y-auto"
        )}
        style={{
          height: '30%',
          gridTemplateColumns: `repeat(${dimensions.cols}, 1fr)`,
        }}
      >
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