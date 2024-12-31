import React, { useEffect, useRef } from 'react';
import { TranscriptionSegment } from '@/services/transcription';
import { format } from 'date-fns';

interface TranscriptPanelProps {
  transcripts: TranscriptionSegment[];
  autoScroll?: boolean;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  transcripts,
  autoScroll = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcripts, autoScroll]);

  return (
    <div ref={containerRef} className="transcript-panel overflow-y-auto h-full p-4 space-y-4 text-foreground">
      {transcripts.map((message, index) => (
        <div key={index} className="message-block space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#00FF9D]">{message.speaker}</span>
            <span className="text-sm text-muted-foreground">
              {format(message.timestamp, 'HH:mm:ss')}
            </span>
          </div>
          <div className="pl-4">{message.content}</div>
        </div>
      ))}
      {transcripts.length === 0 && (
        <div className="text-muted-foreground text-center py-4">
          No transcripts available yet
        </div>
      )}
    </div>
  );
};