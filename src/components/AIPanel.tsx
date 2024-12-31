import React from 'react';
import { Bot, ListTodo } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AIPanelProps {
  transcript: Array<{
    id: string;
    speaker: string;
    text: string;
    timestamp: string;
  }>;
  actionItems: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
}

export const AIPanel: React.FC<AIPanelProps> = ({ transcript, actionItems }) => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-6 p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Bot className="h-5 w-5" />
            <h2>Live Transcript</h2>
          </div>
          <div className="space-y-3">
            {transcript.map((entry) => (
              <div key={entry.id} className="space-y-1">
                <div className="text-sm text-muted-foreground">{entry.speaker} • {entry.timestamp}</div>
                <p className="text-sm">{entry.text}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <ListTodo className="h-5 w-5" />
            <h2>Action Items</h2>
          </div>
          <div className="space-y-2">
            {actionItems.map((item) => (
              <div key={item.id} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={item.completed}
                  className="mt-1"
                  readOnly
                />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-secondary">
        <Input
          placeholder="Ask AI assistant..."
          className="bg-secondary/50"
        />
      </div>
    </div>
  );
};