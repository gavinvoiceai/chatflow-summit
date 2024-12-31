import React from 'react';
import { Button } from "@/components/ui/button";

interface LobbyViewProps {
  onStartMeeting: () => Promise<void>;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ onStartMeeting }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <h1 className="text-2xl font-bold mb-8">Start a New Meeting</h1>
      <Button 
        onClick={onStartMeeting}
        size="lg"
        className="start-meeting"
      >
        Start Meeting
      </Button>
    </div>
  );
};