import { supabase } from "@/integrations/supabase/client";
import { TranscriptionManager } from "./transcriptionManager";
import { toast } from "sonner";

export interface TranscriptionSegment {
  speaker: string;
  timestamp: Date;
  content: string;
  isInterim: boolean;
}

export class TranscriptionService {
  private recognition: SpeechRecognition | null = null;
  private currentMeetingId: string;
  private onTranscriptUpdate: (segment: TranscriptionSegment) => void;
  private onCaptionUpdate: (text: string, speaker: string) => void;
  private transcriptionManager: TranscriptionManager;

  constructor(
    meetingId: string,
    onTranscriptUpdate: (segment: TranscriptionSegment) => void,
    onCaptionUpdate: (text: string, speaker: string) => void
  ) {
    this.currentMeetingId = meetingId;
    this.onTranscriptUpdate = onTranscriptUpdate;
    this.onCaptionUpdate = onCaptionUpdate;
    
    // Initialize TranscriptionManager with current user ID
    // Note: In a real app, you'd get the actual user ID
    this.transcriptionManager = new TranscriptionManager(
      meetingId,
      'current-user-id',
      onCaptionUpdate
    );
    
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      toast.error("Speech recognition is not supported in your browser");
      throw new Error('Speech recognition not supported');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    if (this.recognition) {
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = this.handleSpeechResult.bind(this);
      this.recognition.onerror = this.handleSpeechError.bind(this);
    }
  }

  private handleSpeechResult(event: SpeechRecognitionEvent) {
    const results = Array.from(event.results);
    const currentSpeaker = 'You';

    for (let i = event.resultIndex; i < results.length; i++) {
      const transcript = results[i][0].transcript;
      const isFinal = results[i].isFinal;

      // Use TranscriptionManager for buffering and processing
      this.transcriptionManager.handleSpeech(transcript, isFinal);

      // Update transcript panel
      const segment: TranscriptionSegment = {
        speaker: currentSpeaker,
        timestamp: new Date(),
        content: transcript,
        isInterim: !isFinal
      };

      this.onTranscriptUpdate(segment);
    }
  }

  private handleSpeechError(error: SpeechRecognitionError) {
    console.error('Speech recognition error:', error);
    toast.error("Speech recognition error occurred");
    this.stop();
  }

  start() {
    if (this.recognition) {
      this.recognition.start();
    }
  }

  stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
    this.transcriptionManager.cleanup();
  }
}