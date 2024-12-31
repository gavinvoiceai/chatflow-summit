import { supabase } from "@/integrations/supabase/client";
import { TranscriptionManager } from "./transcriptionManager";
import { CaptionsManager } from "./captionsManager";
import { toast } from "sonner";

export interface TranscriptionSegment {
  speaker: string;
  timestamp: Date;
  content: string;
  isInterim: boolean;
}

interface TranscriptionBuffer {
  text: string;
  timeoutId: number | null;
}

export class TranscriptionService {
  private recognition: SpeechRecognition | null = null;
  private currentMeetingId: string;
  private onTranscriptUpdate: (segment: TranscriptionSegment) => void;
  private onCaptionUpdate: (text: string, speaker: string) => void;
  private transcriptionManager: TranscriptionManager;
  private captionsManager: CaptionsManager;
  private buffer: TranscriptionBuffer = {
    text: '',
    timeoutId: null
  };

  constructor(
    meetingId: string,
    onTranscriptUpdate: (segment: TranscriptionSegment) => void,
    onCaptionUpdate: (text: string, speaker: string) => void
  ) {
    this.currentMeetingId = meetingId;
    this.onTranscriptUpdate = onTranscriptUpdate;
    this.onCaptionUpdate = onCaptionUpdate;
    
    this.transcriptionManager = new TranscriptionManager(
      meetingId,
      'current-user-id',
      onCaptionUpdate
    );
    
    this.captionsManager = new CaptionsManager('You');
    
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
    const lastResult = results[results.length - 1];

    if (lastResult) {
      const transcript = lastResult[0].transcript;
      const isFinal = lastResult.isFinal;

      // Update captions immediately
      const captionText = this.captionsManager.updateCaptions(transcript, isFinal);
      this.onCaptionUpdate(captionText, currentSpeaker);

      if (isFinal) {
        this.commitTranscription(transcript, currentSpeaker);
      } else {
        this.bufferTranscription(transcript, currentSpeaker);
      }
    }
  }

  private bufferTranscription(text: string, speaker: string) {
    if (this.buffer.timeoutId) {
      clearTimeout(this.buffer.timeoutId);
    }

    this.buffer.text = text;

    this.buffer.timeoutId = window.setTimeout(() => {
      if (this.buffer.text) {
        this.commitTranscription(this.buffer.text, speaker);
        this.buffer.text = '';
      }
    }, 1000) as unknown as number;
  }

  private async commitTranscription(text: string, speaker: string) {
    try {
      const segment: TranscriptionSegment = {
        speaker,
        timestamp: new Date(),
        content: text,
        isInterim: false
      };

      await this.transcriptionManager.commitTranscription(text);
      this.onTranscriptUpdate(segment);
    } catch (error) {
      console.error('Error committing transcription:', error);
      toast.error("Failed to save transcription");
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
    if (this.buffer.timeoutId) {
      clearTimeout(this.buffer.timeoutId);
      this.buffer.text = '';
    }
    this.captionsManager.cleanup();
    this.transcriptionManager.cleanup();
  }
}