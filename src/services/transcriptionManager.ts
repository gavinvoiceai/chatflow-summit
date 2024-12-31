import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TranscriptionConfig {
  batchInterval: number;
  minSpeechGap: number;
}

interface BufferState {
  currentBuffer: string;
  lastSpeechTime: number | null;
  isBuffering: boolean;
  timeoutId: NodeJS.Timeout | null;
}

export class TranscriptionManager {
  private config: TranscriptionConfig;
  private bufferState: BufferState;
  private meetingId: string;
  private speakerId: string;
  private onCaptionUpdate: (text: string, speaker: string) => void;

  constructor(
    meetingId: string,
    speakerId: string,
    onCaptionUpdate: (text: string, speaker: string) => void
  ) {
    this.config = {
      batchInterval: 2000,
      minSpeechGap: 500
    };

    this.bufferState = {
      currentBuffer: "",
      lastSpeechTime: null,
      isBuffering: false,
      timeoutId: null
    };

    this.meetingId = meetingId;
    this.speakerId = speakerId;
    this.onCaptionUpdate = onCaptionUpdate;
  }

  handleSpeech = (text: string, isFinal: boolean) => {
    // Update captions immediately for real-time display
    this.onCaptionUpdate(text, "You");

    if (isFinal) {
      if (this.bufferState.timeoutId) {
        clearTimeout(this.bufferState.timeoutId);
      }
      void this.commitTranscription(text);
    } else {
      this.bufferState.currentBuffer += " " + text;
      this.updateBufferTimer();
    }
  };

  // Make commitTranscription public to fix accessibility error
  public async commitTranscription(text: string) {
    const content = text || this.bufferState.currentBuffer.trim();
    if (!content) return;

    try {
      const { error } = await supabase.from('meeting_transcripts').insert({
        content,
        speaker_id: this.speakerId,
        meeting_id: this.meetingId
      });

      if (error) {
        console.error('Error committing transcription:', error);
        toast.error("Failed to save transcription");
        throw error;
      }
      
      this.bufferState.currentBuffer = "";
    } catch (error) {
      console.error('Error committing transcription:', error);
      toast.error("Failed to save transcription");
      throw error;
    }
  }

  private updateBufferTimer() {
    if (this.bufferState.timeoutId) {
      clearTimeout(this.bufferState.timeoutId);
    }

    this.bufferState.timeoutId = setTimeout(() => {
      void this.commitTranscription(this.bufferState.currentBuffer);
    }, this.config.batchInterval);
  }

  cleanup() {
    if (this.bufferState.timeoutId) {
      clearTimeout(this.bufferState.timeoutId);
    }
    this.bufferState.currentBuffer = "";
    this.bufferState.isBuffering = false;
  }
}