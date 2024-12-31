import { toast } from "sonner";

interface CaptionSegment {
  text: string;
  timestamp: number;
  speaker: string;
}

export class CaptionsManager {
  private config = {
    displayDuration: 10000, // 10 seconds
    maxWords: 50,          // Maximum words to show
    fadeOutDuration: 1000  // Smooth fade out
  };

  private state: {
    activeSegments: CaptionSegment[];
    currentSpeaker: string;
  } = {
    activeSegments: [],
    currentSpeaker: 'You'
  };

  constructor(initialSpeaker: string = 'You') {
    this.state.currentSpeaker = initialSpeaker;
  }

  public updateCaptions(text: string, isFinal: boolean) {
    try {
      const segment: CaptionSegment = {
        text,
        timestamp: Date.now(),
        speaker: this.state.currentSpeaker
      };

      if (isFinal) {
        this.state.activeSegments.push(segment);
        this.pruneOldSegments();
      }

      return this.formatCaptionsText();
    } catch (error) {
      console.error('Caption update error:', error);
      toast.error("Failed to update captions");
      return '';
    }
  }

  private pruneOldSegments() {
    const now = Date.now();
    this.state.activeSegments = this.state.activeSegments.filter(segment => 
      now - segment.timestamp < this.config.displayDuration
    );
  }

  private formatCaptionsText(): string {
    return this.state.activeSegments
      .map(segment => `${segment.speaker}: ${segment.text}`)
      .join(' ')
      .split(' ')
      .slice(-this.config.maxWords)
      .join(' ');
  }

  public setSpeaker(speaker: string) {
    this.state.currentSpeaker = speaker;
  }

  public cleanup() {
    this.state.activeSegments = [];
  }
}