import React, { useState } from 'react';
import { Bot, ListTodo, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  participants: Array<{
    id: string;
    name: string;
    isHost?: boolean;
  }>;
}

export const AIPanel: React.FC<AIPanelProps> = ({ transcript, actionItems, participants }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <div className={cn(
      "relative h-full flex flex-col transition-all duration-300",
      isCollapsed ? "w-12" : "w-full"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronLeft /> : <ChevronRight />}
      </Button>

      <div className={cn(
        "flex-1 overflow-hidden transition-opacity duration-300",
        isCollapsed && "opacity-0"
      )}>
        <Tabs defaultValue="transcript" className="h-full flex flex-col">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="transcript" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span>Transcript</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              <span>Actions</span>
            </TabsTrigger>
            <TabsTrigger value="participants" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Participants</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transcript" className="flex-1 overflow-y-auto p-4 space-y-3">
            {transcript.map((entry) => (
              <div key={entry.id} className="space-y-1">
                <div className="text-sm text-muted-foreground">{entry.speaker} • {entry.timestamp}</div>
                <p className="text-sm">{entry.text}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="actions" className="flex-1 overflow-y-auto p-4 space-y-2">
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
          </TabsContent>

          <TabsContent value="participants" className="flex-1 overflow-y-auto p-4 space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between">
                <span className="text-sm">{participant.name}</span>
                {participant.isHost && (
                  <span className="text-xs text-primary">Host</span>
                )}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <div className={cn(
        "p-4 border-t border-secondary transition-opacity duration-300",
        isCollapsed && "opacity-0"
      )}>
        <Input
          placeholder="Ask AI assistant..."
          className="bg-secondary/50"
        />
      </div>
    </div>
  );
};