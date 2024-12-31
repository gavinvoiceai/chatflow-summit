import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  const mainSpeaker = participants.find(p => p.isMainSpeaker) || participants[0];
  const otherParticipants = participants.filter(p => p.id !== mainSpeaker?.id);

  useEffect(() => {
    participants.forEach(participant => {
      if (participant.stream && videoRefs.current[participant.id]) {
        const videoElement = videoRefs.current[participant.id];
        if (videoElement && videoElement.srcObject !== participant.stream) {
          videoElement.srcObject = participant.stream;
          videoElement.play().catch(console.error);
        }
      }
    });
  }, [participants]);

  if (!mainSpeaker) return null;

  return (
    <div className="video-grid">
      <div className={cn("video-container", mainSpeaker.isMainSpeaker && "speaking")}>
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
        <div className="absolute bottom-4 left-4 glass-panel px-3 py-1 rounded-full text-sm">
          {mainSpeaker.name}
          {!mainSpeaker.audioEnabled && (
            <span className="text-destructive ml-2">🔇</span>
          )}
        </div>
      </div>

      {!isMobile && otherParticipants.length > 0 && (
        <div className="secondary-container">
          {otherParticipants.map((participant) => (
            <div 
              key={participant.id} 
              className="video-container"
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
              <div className="absolute bottom-4 left-4 glass-panel px-3 py-1 rounded-full text-sm">
                {participant.name}
                {!participant.audioEnabled && (
                  <span className="text-destructive ml-2">🔇</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};