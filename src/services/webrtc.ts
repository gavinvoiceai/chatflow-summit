import { toast } from "sonner";
import { deviceManager } from "./deviceManager";

interface PeerConnection {
  connection: RTCPeerConnection;
  stream: MediaStream | null;
}

export class WebRTCService {
  private peerConnections: Map<string, PeerConnection> = new Map();
  private onStreamUpdate: (streams: Map<string, MediaStream>) => void;

  constructor(onStreamUpdate: (streams: Map<string, MediaStream>) => void) {
    this.onStreamUpdate = onStreamUpdate;
  }

  private async setupPeerConnection(participantId: string): Promise<RTCPeerConnection> {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const connection = new RTCPeerConnection(config);
    
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', event.candidate);
      }
    };

    connection.onconnectionstatechange = () => {
      console.log(`Connection state for ${participantId}:`, connection.connectionState);
      if (connection.connectionState === 'failed') {
        toast.error(`Connection failed with participant ${participantId}`);
        this.removePeer(participantId);
      }
    };

    connection.ontrack = (event) => {
      const streams = new Map<string, MediaStream>();
      this.peerConnections.forEach((peer, id) => {
        if (peer.stream) streams.set(id, peer.stream);
      });
      if (event.streams[0]) {
        this.peerConnections.get(participantId)!.stream = event.streams[0];
        streams.set(participantId, event.streams[0]);
      }
      this.onStreamUpdate(streams);
    };

    return connection;
  }

  async initializeLocalStream(): Promise<MediaStream> {
    const stream = deviceManager.getCurrentStream();
    if (!stream) {
      throw new Error('No media stream available');
    }
    return stream;
  }

  async addPeer(participantId: string): Promise<void> {
    const connection = await this.setupPeerConnection(participantId);
    const stream = deviceManager.getCurrentStream();
    
    if (stream) {
      stream.getTracks().forEach(track => {
        if (stream) {
          connection.addTrack(track, stream);
        }
      });
    }

    this.peerConnections.set(participantId, { connection, stream: null });
  }

  removePeer(participantId: string): void {
    const peer = this.peerConnections.get(participantId);
    if (peer) {
      peer.connection.close();
      this.peerConnections.delete(participantId);
    }
  }

  async startScreenShare(): Promise<MediaStream> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      return screenStream;
    } catch (error) {
      console.error('Error sharing screen:', error);
      toast.error('Failed to start screen sharing');
      throw error;
    }
  }

  cleanup(): void {
    this.peerConnections.forEach((peer) => {
      peer.connection.close();
    });
    this.peerConnections.clear();
  }
}