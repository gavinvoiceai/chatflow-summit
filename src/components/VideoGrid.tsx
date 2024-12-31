import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface VideoGridProps {
  participants: Array<{
    id: string;
    name: string;
    stream?: MediaStream;
    videoEnabled: boolean;
    audioEnabled: boolean;
    isMainSpeaker?: boolean;
  }>;
}

export const VideoGrid: React.FC<VideoGridProps> = ({ participants }) => {
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  
  // Ensure we have at least one participant to avoid undefined errors
  const mainSpeaker = participants.find(p => p.isMainSpeaker) || participants[0] || {
    id: 'placeholder',
    name: 'No participants',
    videoEnabled: false,
    audioEnabled: false
  };
  
  const otherParticipants = participants.filter(p => p.id !== mainSpeaker.id);

  useEffect(() => {
    participants.forEach(participant => {
      if (participant.stream && videoRefs.current[participant.id]) {
        const videoElement = videoRefs.current[participant.id];
        if (videoElement && videoElement.srcObject !== participant.stream) {
          videoElement.srcObject = participant.stream;
          videoElement.play().catch(error => {
            console.error('Error playing video:', error);
          });
        }
      }
    });
  }, [participants]);

  return (
    <div className="video-grid h-full">
      {/* Main speaker view */}
      <div className="video-container main-speaker relative rounded-lg overflow-hidden bg-secondary">
        <video
          ref={el => videoRefs.current[mainSpeaker.id] = el}
          autoPlay
          playsInline
          muted={mainSpeaker.id === 'local'}
          className={cn(
            "w-full h-full object-cover",
            !mainSpeaker.videoEnabled && "hidden"
          )}
        />
        {!mainSpeaker.videoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl text-primary-foreground">
              {mainSpeaker.name[0]}
            </div>
          </div>
        )}
        <div className="absolute bottom-4 left-4 glass-panel px-3 py-1 rounded-full text-sm flex items-center gap-2">
          {mainSpeaker.name}
          {!mainSpeaker.audioEnabled && (
            <span className="text-destructive">🔇</span>
          )}
        </div>
      </div>

      {/* Secondary participants */}
      <div className="secondary-container grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {otherParticipants.map((participant) => (
          <div 
            key={participant.id} 
            className="video-container relative rounded-lg overflow-hidden bg-secondary hover:ring-2 hover:ring-primary transition-all cursor-pointer"
          >
            <video
              ref={el => videoRefs.current[participant.id] = el}
              autoPlay
              playsInline
              muted={participant.id === 'local'}
              className={cn(
                "w-full h-full object-cover",
                !participant.videoEnabled && "hidden"
              )}
            />
            {!participant.videoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-xl text-primary-foreground">
                  {participant.name[0]}
                </div>
              </div>
            )}
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