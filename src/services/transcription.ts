import { supabase } from "@/integrations/supabase/client";

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

  constructor(
    meetingId: string,
    onTranscriptUpdate: (segment: TranscriptionSegment) => void,
    onCaptionUpdate: (text: string, speaker: string) => void
  ) {
    this.currentMeetingId = meetingId;
    this.onTranscriptUpdate = onTranscriptUpdate;
    this.onCaptionUpdate = onCaptionUpdate;
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      throw new Error('Speech recognition is not supported in your browser');
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

  private async handleSpeechResult(event: SpeechRecognitionEvent) {
    const results = event.results;
    const currentSpeaker = 'User'; // TODO: Implement speaker detection

    for (let i = event.resultIndex; i < results.length; i++) {
      const transcript = results[i][0].transcript;
      const isFinal = results[i].isFinal;

      const segment: TranscriptionSegment = {
        speaker: currentSpeaker,
        timestamp: new Date(),
        content: transcript,
        isInterim: !isFinal
      };

      if (isFinal) {
        await this.updateTranscript(segment);
        this.onCaptionUpdate(transcript, currentSpeaker);
      }

      this.onTranscriptUpdate(segment);
    }
  }

  private handleSpeechError(error: SpeechRecognitionError) {
    console.error('Speech recognition error:', error);
    this.stop();
  }

  private async updateTranscript(segment: TranscriptionSegment) {
    try {
      const { error } = await supabase
        .from('meeting_transcripts')
        .insert({
          meeting_id: this.currentMeetingId,
          speaker_id: segment.speaker,
          content: segment.content,
          timestamp: segment.timestamp
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating transcript:', error);
    }
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
  }
}