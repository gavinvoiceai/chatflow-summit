import React from 'react';
import { VideoGrid } from '@/components/VideoGrid';
import { MeetingControls } from './MeetingControls';

export const VideoConferenceScreen = () => {
  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 relative">
        <VideoGrid participants={[]} />
      </div>
      <MeetingControls />
    </div>
  );
};