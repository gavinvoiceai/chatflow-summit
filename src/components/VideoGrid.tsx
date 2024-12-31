import React from 'react';

interface VideoGridProps {
  participants: Array<{
    id: string;
    name: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
  }>;
}

export const VideoGrid: React.FC<VideoGridProps> = ({ participants }) => {
  return (
    <div className="video-grid p-4">
      {participants.map((participant) => (
        <div key={participant.id} className="participant-video">
          <div className="absolute bottom-4 left-4 glass-panel px-3 py-1 rounded-full text-sm">
            {participant.name}
            {!participant.audioEnabled && (
              <span className="ml-2">🔇</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};