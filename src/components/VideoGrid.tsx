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

const calculateGridLayout = (participantCount: number): string => {
  const layouts = {
    1: "1fr",
    2: "1fr 1fr",
    3: "2fr 1fr / 1fr 1fr",
    4: "2fr 1fr / 1fr 1fr"
  };
  return layouts[participantCount as keyof typeof layouts] || "1fr 1fr";
};

export const VideoGrid: React.FC<VideoGridProps> = ({ participants }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const mainSpeaker = participants.find(p => p.isMainSpeaker) || participants[0];
  const otherParticipants = participants.filter(p => p.id !== mainSpeaker.id);

  const gridStyle = {
    display: 'grid',
    gridTemplateAreas: otherParticipants.length <= 1 
      ? '"main" "secondary"'
      : '"main main" "secondary1 secondary2"',
    gap: '16px',
    padding: '16px',
    height: 'calc(100vh - 80px)'
  };

  return (
    <div className="video-container">
      <div style={gridStyle}>
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
          className="grid gap-4"
          style={{
            gridTemplateColumns: calculateGridLayout(otherParticipants.length),
          }}
        >
          {otherParticipants.map((participant, index) => (
            <div 
              key={participant.id} 
              className="participant-video animate-fade-in cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              style={{
                gridArea: `secondary${index + 1}`
              }}
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
    </div>
  );
};