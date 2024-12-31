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
    <div className="grid gap-4 p-4 h-full max-w-[1280px] mx-auto">
      {/* Main Speaker */}
      <div className="relative w-full max-w-[1024px] mx-auto">
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <div className={cn(
            "absolute inset-0",
            mainSpeaker.isMainSpeaker && "ring-2 ring-primary"
          )}>
            <video
              ref={el => videoRefs.current[mainSpeaker.id] = el}
              autoPlay
              playsInline
              muted={mainSpeaker.id === 'local'}
              className={cn(
                "w-full h-full object-cover rounded-lg",
                !mainSpeaker.videoEnabled && "hidden"
              )}
            />
            {!mainSpeaker.videoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary rounded-lg">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl text-primary-foreground">
                  {mainSpeaker.name[0]}
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-sm bg-background/80 backdrop-blur-sm">
              {mainSpeaker.name}
              {!mainSpeaker.audioEnabled && (
                <span className="text-destructive ml-2">🔇</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Other Participants */}
      {!isMobile && otherParticipants.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {otherParticipants.map((participant) => (
            <div key={participant.id} className="relative w-full">
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <div className="absolute inset-0">
                  <video
                    ref={el => videoRefs.current[participant.id] = el}
                    autoPlay
                    playsInline
                    muted={participant.id === 'local'}
                    className={cn(
                      "w-full h-full object-cover rounded-lg",
                      !participant.videoEnabled && "hidden"
                    )}
                  />
                  {!participant.videoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-secondary rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-xl text-primary-foreground">
                        {participant.name[0]}
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-sm bg-background/80 backdrop-blur-sm">
                    {participant.name}
                    {!participant.audioEnabled && (
                      <span className="text-destructive ml-2">🔇</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};