import { toast } from "sonner";
import { AIAssistantService } from "./aiAssistant";

export interface VoiceCommand {
  type: 'createTask' | 'scheduleFollowup' | 'summarize';
  payload: string;
}

export class VoiceCommandService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private aiAssistant: AIAssistantService;
  private onCommand: (command: VoiceCommand) => void;
  private onTranscript: (text: string) => void;
  private wakeWord: string = 'magic';

  constructor(
    meetingId: string,
    onCommand: (command: VoiceCommand) => void,
    onTranscript: (text: string) => void
  ) {
    this.onCommand = onCommand;
    this.onTranscript = onTranscript;
    this.aiAssistant = new AIAssistantService(meetingId);
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    if (this.recognition) {
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
  }

  private async processCommand(transcript: string) {
    const lowerTranscript = transcript.toLowerCase();
    
    if (!lowerTranscript.includes(this.wakeWord)) return;

    const commandText = transcript.toLowerCase().split(this.wakeWord)[1].trim();
    
    try {
      if (commandText.startsWith('create task')) {
        const task = commandText.replace('create task', '').trim();
        await this.aiAssistant.createTask(task);
        this.onCommand({ type: 'createTask', payload: task });
      } else if (commandText.startsWith('schedule')) {
        const details = commandText.replace('schedule', '').trim();
        await this.aiAssistant.scheduleFollowup(details);
        this.onCommand({ type: 'scheduleFollowup', payload: details });
      } else if (commandText.startsWith('summarize')) {
        const summary = await this.aiAssistant.generateSummary();
        this.onCommand({ type: 'summarize', payload: summary });
      }
    } catch (error) {
      console.error('Error processing command:', error);
      toast.error('Failed to process command');
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