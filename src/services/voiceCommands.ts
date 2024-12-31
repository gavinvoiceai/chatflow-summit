import { toast } from "sonner";

export interface VoiceCommandHandlers {
  onCreateTask: (task: string) => void;
  onScheduleMeeting: (details: string) => void;
  onSendSummary: (recipient: string) => void;
}

export class VoiceCommandService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private onTranscriptUpdate: (transcript: string) => void;
  private handlers: VoiceCommandHandlers;

  constructor(
    onTranscriptUpdate: (transcript: string) => void,
    handlers: VoiceCommandHandlers
  ) {
    this.onTranscriptUpdate = onTranscriptUpdate;
    this.handlers = handlers;
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        this.onTranscriptUpdate(transcript);
        this.processCommand(transcript);
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Voice command error occurred');
        this.isListening = false;
      };

    } else {
      console.error('Speech recognition not supported');
      toast.error('Speech recognition is not supported in your browser');
    }
  }

  private processCommand(transcript: string) {
    const lowerTranscript = transcript.toLowerCase();
    if (lowerTranscript.includes('magic')) {
      const command = transcript.toLowerCase().split('magic')[1].trim();
      
      if (command.startsWith('create task')) {
        const task = command.replace('create task', '').trim();
        this.handlers.onCreateTask(task);
      } else if (command.startsWith('schedule meeting')) {
        const details = command.replace('schedule meeting', '').trim();
        this.handlers.onScheduleMeeting(details);
      } else if (command.startsWith('send summary')) {
        const recipient = command.replace('send summary', '').trim();
        this.handlers.onSendSummary(recipient);
      }
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