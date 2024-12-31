interface VideoConstraints {
  width?: { ideal: number };
  height?: { ideal: number };
  frameRate?: { ideal: number };
  deviceId?: string;
}

interface AudioConstraints {
  deviceId?: string;
}

interface StreamConfig {
  video: VideoConstraints | boolean;
  audio: AudioConstraints | boolean;
}

class DeviceManager {
  private currentStream: MediaStream | null = null;
  private defaultVideoConstraints: VideoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 }
  };

  async initializeDevices(config?: StreamConfig): Promise<MediaStream> {
    try {
      // Cleanup any existing stream first
      this.cleanup();
      
      const streamConfig: StreamConfig = config || {
        video: this.defaultVideoConstraints,
        audio: true
      };

      console.log('Initializing devices with config:', streamConfig);
      const stream = await navigator.mediaDevices.getUserMedia(streamConfig);
      this.currentStream = stream;
      return stream;
    } catch (error) {
      console.error('Failed to initialize devices:', error);
      throw error;
    }
  }

  async toggleAudio(enabled: boolean): Promise<void> {
    if (!this.currentStream) {
      console.warn('No active stream to toggle audio');
      return;
    }
    
    this.currentStream.getAudioTracks().forEach(track => {
      console.log(`Setting audio track enabled: ${enabled}`);
      track.enabled = enabled;
    });
  }

  async toggleVideo(enabled: boolean): Promise<void> {
    if (!this.currentStream) {
      console.warn('No active stream to toggle video');
      return;
    }
    
    this.currentStream.getVideoTracks().forEach(track => {
      console.log(`Setting video track enabled: ${enabled}`);
      track.enabled = enabled;
    });
  }

  getCurrentStream(): MediaStream | null {
    return this.currentStream;
  }

  cleanup(): void {
    if (this.currentStream) {
      console.log('Cleaning up media streams');
      this.currentStream.getTracks().forEach(track => {
        track.stop();
      });
      this.currentStream = null;
    }
  }
}

export const deviceManager = new DeviceManager();