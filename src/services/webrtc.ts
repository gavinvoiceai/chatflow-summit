import { toast } from "sonner";
import { deviceManager } from "./deviceManager";

interface PeerConnection {
  connection: RTCPeerConnection;
  stream: MediaStream | null;
}

const webRTCConfig: RTCConfiguration = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302'
      ]
    }
  ],
  iceCandidatePoolSize: 10
};

export class WebRTCService {
  private peerConnections: Map<string, PeerConnection> = new Map();
  private onStreamUpdate: (streams: Map<string, MediaStream>) => void;
  private localStream: MediaStream | null = null;

  constructor(onStreamUpdate: (streams: Map<string, MediaStream>) => void) {
    this.onStreamUpdate = onStreamUpdate;
  }

  private async setupPeerConnection(participantId: string): Promise<RTCPeerConnection> {
    const connection = new RTCPeerConnection(webRTCConfig);
    
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
      console.log('Received remote track:', event.track.kind);
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

    if (this.localStream) {
      console.log('Adding local tracks to peer connection');
      this.localStream.getTracks().forEach(track => {
        if (this.localStream) {
          connection.addTrack(track, this.localStream);
        }
      });
    }

    return connection;
  }

  async initializeLocalStream(): Promise<MediaStream> {
    try {
      console.log('Initializing local stream');
      const stream = await deviceManager.initializeDevices();
      this.localStream = stream;
      
      // Update existing peer connections with the new stream
      this.peerConnections.forEach(async (peer, participantId) => {
        console.log(`Updating peer connection for ${participantId}`);
        const newConnection = await this.setupPeerConnection(participantId);
        peer.connection.close();
        this.peerConnections.set(participantId, {
          connection: newConnection,
          stream: peer.stream
        });
      });

      return stream;
    } catch (error) {
      console.error('Failed to initialize local stream:', error);
      toast.error("Failed to initialize video stream");
      throw error;
    }
  }

  async addPeer(participantId: string): Promise<void> {
    try {
      console.log(`Adding peer ${participantId}`);
      const connection = await this.setupPeerConnection(participantId);
      this.peerConnections.set(participantId, { connection, stream: null });
    } catch (error) {
      console.error('Failed to add peer:', error);
      toast.error("Failed to connect with participant");
      throw error;
    }
  }

  removePeer(participantId: string): void {
    console.log(`Removing peer ${participantId}`);
    const peer = this.peerConnections.get(participantId);
    if (peer) {
      peer.connection.close();
      this.peerConnections.delete(participantId);
    }
  }

  async startScreenShare(): Promise<MediaStream> {
    try {
      console.log('Starting screen share');
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      this.peerConnections.forEach(peer => {
        const senders = peer.connection.getSenders();
        screenStream.getTracks().forEach(track => {
          const sender = senders.find(s => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          }
        });
      });

      return screenStream;
    } catch (error) {
      console.error('Error sharing screen:', error);
      toast.error('Failed to start screen sharing');
      throw error;
    }
  }

  cleanup(): void {
    console.log('Cleaning up WebRTC service');
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        console.log(`Stopping track: ${track.kind}`);
        track.stop();
      });
      this.localStream = null;
    }

    this.peerConnections.forEach((peer) => {
      peer.connection.close();
    });
    this.peerConnections.clear();
  }
}