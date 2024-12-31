interface VideoConstraints {
  width: { ideal: number };
  height: { ideal: number };
  frameRate: { ideal: number };
}

interface StreamConfig {
  video: VideoConstraints | boolean;
  audio: boolean;
}

class DeviceManager {
  private currentStream: MediaStream | null = null;
  private videoConstraints: VideoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 }
  };

  async initializeDevices(config?: StreamConfig): Promise<MediaStream> {
    try {
      // Cleanup any existing stream first
      this.cleanup();
      
      const streamConfig: StreamConfig = config || {
        video: this.videoConstraints,
        audio: true
      };

      const stream = await navigator.mediaDevices.getUserMedia(streamConfig);
      await this.validateStream(stream);
      this.currentStream = stream;
      return stream;
    } catch (error) {
      console.error('Failed to initialize devices:', error);
      throw error;
    }
  }

  private validateStream(stream: MediaStream): Promise<MediaStream> {
    return new Promise((resolve, reject) => {
      const videoTrack = stream.getVideoTracks()[0];
      
      if (!videoTrack) {
        reject(new Error('No video track available'));
        return;
      }

      // Add track ended event listener
      videoTrack.addEventListener('ended', () => {
        console.error('Video track ended unexpectedly');
      });

      if (videoTrack.readyState === 'live') {
        resolve(stream);
        return;
      }

      const cleanup = () => {
        videoTrack.removeEventListener('ended', handleEnded);
        videoTrack.removeEventListener('mute', handleMute);
      };

      const handleEnded = () => {
        cleanup();
        reject(new Error('Video track ended'));
      };

      const handleMute = () => {
        cleanup();
        reject(new Error('Video track muted'));
      };

      videoTrack.addEventListener('ended', handleEnded);
      videoTrack.addEventListener('mute', handleMute);

      // Grace period for stream initialization
      setTimeout(() => {
        cleanup();
        resolve(stream);
      }, 1000);
    });
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