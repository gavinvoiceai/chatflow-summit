import React from 'react';
import { cn } from '@/lib/utils';

interface ClosedCaptionsProps {
  text: string;
  speaker: string;
  position?: 'bottom' | 'top';
  size?: 'small' | 'medium' | 'large';
}

export const ClosedCaptions: React.FC<ClosedCaptionsProps> = ({
  text,
  speaker,
  position = 'bottom',
  size = 'medium'
}) => {
  return (
    <div
      className={cn(
        "absolute left-0 right-0 flex justify-center z-50 px-4",
        position === 'bottom' ? "bottom-20" : "top-20"
      )}
    >
      <div className="caption-container bg-background/60 backdrop-blur-sm px-4 py-2 rounded-lg max-w-[80%]">
        <span className="text-primary font-medium mr-2">{speaker}:</span>
        <span className={cn(
          "text-foreground",
          size === 'small' && "text-sm",
          size === 'medium' && "text-base",
          size === 'large' && "text-lg"
        )}>
          {text}
        </span>
      </div>
    </div>
  );
};