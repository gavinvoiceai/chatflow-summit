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
        // Here you would send the candidate to the remote peer
        // through your signaling server
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

    // Add local tracks to the connection
    if (this.localStream) {
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
      const stream = await deviceManager.initializeDevices();
      this.localStream = stream;
      
      // Update existing peer connections with the new stream
      this.peerConnections.forEach(async (peer, participantId) => {
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
      const connection = await this.setupPeerConnection(participantId);
      this.peerConnections.set(participantId, { connection, stream: null });
      
      // Here you would implement the signaling logic to exchange
      // connection information with the remote peer
      console.log(`Peer ${participantId} added to connection pool`);
    } catch (error) {
      console.error('Failed to add peer:', error);
      toast.error("Failed to connect with participant");
      throw error;
    }
  }

  removePeer(participantId: string): void {
    const peer = this.peerConnections.get(participantId);
    if (peer) {
      peer.connection.close();
      this.peerConnections.delete(participantId);
      console.log(`Peer ${participantId} removed from connection pool`);
    }
  }

  async startScreenShare(): Promise<MediaStream> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace tracks in all peer connections
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
    // Stop all tracks in the local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close all peer connections
    this.peerConnections.forEach((peer) => {
      peer.connection.close();
    });
    this.peerConnections.clear();
    
    console.log('WebRTC service cleaned up');
  }
}