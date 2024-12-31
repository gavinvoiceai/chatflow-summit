import React from 'react';
import { Users } from 'lucide-react';

interface ParticipantListProps {
  participants: Array<{
    id: string;
    name: string;
    isHost?: boolean;
  }>;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({ participants }) => {
  return (
    <div className="glass-panel rounded-lg p-4 w-64">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="font-medium">Participants ({participants.length})</h2>
      </div>
      <div className="space-y-2">
        {participants.map((participant) => (
          <div key={participant.id} className="flex items-center justify-between">
            <span className="text-sm">{participant.name}</span>
            {participant.isHost && (
              <span className="text-xs text-primary">Host</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};