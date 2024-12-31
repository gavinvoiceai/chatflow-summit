import { toast } from "sonner";

export interface VoiceCommand {
  type: 'createTask' | 'scheduleMeeting' | 'setReminder' | 'shareDocument';
  payload: string;
}

export class VoiceCommandService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private onCommand: (command: VoiceCommand) => void;
  private onTranscript: (text: string) => void;

  constructor(
    onCommand: (command: VoiceCommand) => void,
    onTranscript: (text: string) => void
  ) {
    this.onCommand = onCommand;
    this.onTranscript = onTranscript;
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');

      this.onTranscript(transcript);
      this.processCommand(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast.error('Voice command error occurred');
      this.stop();
    };
  }

  private processCommand(transcript: string) {
    const lowerTranscript = transcript.toLowerCase();
    
    if (!lowerTranscript.includes('magic')) return;

    const commandText = transcript.toLowerCase().split('magic')[1].trim();
    
    if (commandText.startsWith('create task')) {
      const task = commandText.replace('create task', '').trim();
      this.onCommand({ type: 'createTask', payload: task });
    } else if (commandText.startsWith('schedule meeting')) {
      const details = commandText.replace('schedule meeting', '').trim();
      this.onCommand({ type: 'scheduleMeeting', payload: details });
    } else if (commandText.startsWith('set reminder')) {
      const reminder = commandText.replace('set reminder', '').trim();
      this.onCommand({ type: 'setReminder', payload: reminder });
    } else if (commandText.startsWith('share document')) {
      const document = commandText.replace('share document', '').trim();
      this.onCommand({ type: 'shareDocument', payload: document });
    }
  }

  start() {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
      this.isListening = true;
      toast.success('Voice commands activated');
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      toast.success('Voice commands deactivated');
    }
  }

  isActive(): boolean {
    return this.isListening;
  }
}