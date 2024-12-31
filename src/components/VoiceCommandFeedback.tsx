import React from 'react';
import { Mic, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceCommandFeedbackProps {
  status: 'listening' | 'processing' | 'success' | 'idle';
  text?: string;
}

export const VoiceCommandFeedback: React.FC<VoiceCommandFeedbackProps> = ({
  status,
  text
}) => {
  const getIcon = () => {
    switch (status) {
      case 'listening':
        return <Mic className="h-5 w-5 text-primary animate-pulse" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-primary" />;
      default:
        return null;
    }
  };

  const getText = () => {
    if (text) return text;
    switch (status) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing command...';
      case 'success':
        return 'Command executed';
      default:
        return '';
    }
  };

  if (status === 'idle') return null;

  return (
    <div className={cn(
      "fixed top-4 left-1/2 -translate-x-1/2 glass-panel rounded-lg px-4 py-2",
      "flex items-center gap-3 transition-all duration-300"
    )}>
      {getIcon()}
      <span className="text-sm font-medium">{getText()}</span>
    </div>
  );
};