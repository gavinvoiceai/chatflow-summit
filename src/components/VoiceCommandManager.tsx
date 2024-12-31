import React, { useCallback, useState } from 'react';
import { VoiceCommandService, VoiceCommand } from '@/services/voiceCommands';
import { toast } from 'sonner';
import { VoiceCommandFeedback } from './VoiceCommandFeedback';

interface VoiceCommandManagerProps {
  meetingId: string;
  onCommand: (command: VoiceCommand) => void;
}

export const VoiceCommandManager: React.FC<VoiceCommandManagerProps> = ({
  meetingId,
  onCommand,
}) => {
  const [transcript, setTranscript] = useState('');
  const [voiceCommandService, setVoiceCommandService] = useState<VoiceCommandService | null>(null);
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(false);

  const initializeVoiceCommands = useCallback(() => {
    const service = new VoiceCommandService(
      meetingId,
      onCommand,
      setTranscript
    );
    setVoiceCommandService(service);
  }, [meetingId, onCommand]);

  const toggleVoiceCommands = useCallback(() => {
    if (!voiceCommandService) {
      initializeVoiceCommands();
      setVoiceCommandsEnabled(true);
      return;
    }

    if (voiceCommandsEnabled) {
      voiceCommandService.stop();
    } else {
      voiceCommandService.start();
    }
    setVoiceCommandsEnabled(!voiceCommandsEnabled);
  }, [voiceCommandService, voiceCommandsEnabled, initializeVoiceCommands]);

  return (
    <>
      <VoiceCommandFeedback
        status={voiceCommandsEnabled ? 'listening' : 'idle'}
        text={transcript}
      />
    </>
  );
};