import React, { useState } from 'react';
import { Input } from './ui/input';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages?: Message[];
  onSendMessage?: (content: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages = [],
  onSendMessage
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="message-block space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#00FF9D]">{msg.sender}</span>
              <span className="text-sm text-muted-foreground">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="pl-4 text-foreground">{msg.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-border/10">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="w-full bg-background/50 border-accent/20 focus:border-accent/50 focus:ring-accent/20 focus:shadow-[0_0_15px_rgba(0,255,157,0.2)] transition-all duration-200 text-foreground placeholder:text-muted-foreground"
        />
      </form>
    </div>
  );
};