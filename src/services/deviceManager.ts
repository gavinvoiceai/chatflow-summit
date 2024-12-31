import { toast } from "sonner";

interface VideoConstraints {
  width: { ideal: number };
  height: { ideal: number };
  frameRate: { ideal: number };
}

class DeviceManager {
  private currentStream: MediaStream | null = null;
  private videoConstraints: VideoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 }
  };

  async initializeDevices(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: this.videoConstraints,
        audio: true
      });

      await this.validateStream(stream);
      this.currentStream = stream;
      return stream;
    } catch (error) {
      console.error('Failed to initialize devices:', error);
      toast.error("Failed to access camera or microphone");
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
    if (!this.currentStream) return;
    
    this.currentStream.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });
  }

  async toggleVideo(enabled: boolean): Promise<void> {
    if (!this.currentStream) return;
    
    this.currentStream.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
  }

  getCurrentStream(): MediaStream | null {
    return this.currentStream;
  }

  cleanup(): void {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => {
        track.stop();
      });
      this.currentStream = null;
    }
  }
}

export const deviceManager = new DeviceManager();