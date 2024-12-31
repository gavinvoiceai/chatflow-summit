import { toast } from "sonner";

interface PeerConnection {
  connection: RTCPeerConnection;
  stream: MediaStream | null;
}

export class WebRTCService {
  private peerConnections: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
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
    
    // Handle ICE candidates
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send candidate to signaling server
        console.log('New ICE candidate:', event.candidate);
      }
    };

    // Handle connection state changes
    connection.onconnectionstatechange = () => {
      console.log(`Connection state for ${participantId}:`, connection.connectionState);
      if (connection.connectionState === 'failed') {
        toast.error(`Connection failed with participant ${participantId}`);
        this.removePeer(participantId);
      }
    };

    // Handle incoming tracks
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
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Failed to access camera or microphone');
      throw error;
    }
  }

  async addPeer(participantId: string): Promise<void> {
    const connection = await this.setupPeerConnection(participantId);
    
    // Add local tracks to the connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (this.localStream) {
          connection.addTrack(track, this.localStream);
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
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }
}