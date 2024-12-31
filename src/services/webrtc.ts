import { toast } from "sonner";

export class WebRTCService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private onParticipantStreamHandler: (participantId: string, stream: MediaStream) => void;

  constructor(
    onParticipantStream: (participantId: string, stream: MediaStream) => void
  ) {
    this.onParticipantStreamHandler = onParticipantStream;
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

  async createPeerConnection(participantId: string): Promise<RTCPeerConnection> {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    });

    // Add local tracks to the peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (this.localStream) {
          peerConnection.addTrack(track, this.localStream);
        }
      });
    }

    // Handle incoming streams
    peerConnection.ontrack = (event) => {
      this.onParticipantStreamHandler(participantId, event.streams[0]);
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state for ${participantId}:`, peerConnection.connectionState);
      if (peerConnection.connectionState === 'failed') {
        toast.error(`Connection failed with participant ${participantId}`);
        this.closePeerConnection(participantId);
      }
    };

    this.peerConnections.set(participantId, peerConnection);
    return peerConnection;
  }

  async createOffer(participantId: string): Promise<RTCSessionDescriptionInit> {
    const peerConnection = await this.createPeerConnection(participantId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
  }

  async handleAnswer(participantId: string, answer: RTCSessionDescriptionInit) {
    const peerConnection = this.peerConnections.get(participantId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  async handleIceCandidate(participantId: string, candidate: RTCIceCandidateInit) {
    const peerConnection = this.peerConnections.get(participantId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  closePeerConnection(participantId: string) {
    const peerConnection = this.peerConnections.get(participantId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(participantId);
    }
  }

  closeAllConnections() {
    this.peerConnections.forEach((_, participantId) => {
      this.closePeerConnection(participantId);
    });
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }
}