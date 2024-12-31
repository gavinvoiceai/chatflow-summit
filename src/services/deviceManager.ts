import { toast } from "sonner";

export interface DeviceState {
  audioEnabled: boolean;
  videoEnabled: boolean;
  currentStream: MediaStream | null;
}

class DeviceManager {
  private deviceState: DeviceState = {
    audioEnabled: true,
    videoEnabled: true,
    currentStream: null
  };

  async initializeDevices(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      
      this.deviceState.currentStream = stream;
      this.deviceState.audioEnabled = true;
      this.deviceState.videoEnabled = true;
      
      return stream;
    } catch (error) {
      console.error('Permission error:', error);
      toast.error("Failed to access camera or microphone. Please check your device permissions.");
      throw error;
    }
  }

  async toggleAudio(enabled: boolean): Promise<void> {
    if (this.deviceState.currentStream) {
      this.deviceState.currentStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      this.deviceState.audioEnabled = enabled;
    }
  }

  async toggleVideo(enabled: boolean): Promise<void> {
    if (this.deviceState.currentStream) {
      this.deviceState.currentStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
      this.deviceState.videoEnabled = enabled;
    }
  }

  cleanup(): void {
    if (this.deviceState.currentStream) {
      this.deviceState.currentStream.getTracks().forEach(track => {
        track.stop();
      });
      this.deviceState.currentStream = null;
    }
    
    this.deviceState.audioEnabled = true;
    this.deviceState.videoEnabled = true;
  }

  getCurrentStream(): MediaStream | null {
    return this.deviceState.currentStream;
  }

  getDeviceState(): DeviceState {
    return { ...this.deviceState };
  }
}

export const deviceManager = new DeviceManager();