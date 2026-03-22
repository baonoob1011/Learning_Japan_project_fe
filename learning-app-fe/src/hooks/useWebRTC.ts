import { useRef } from "react";

export const useWebRTC = () => {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const createPeerConnection = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

    peerRef.current = peer;
    return peer;
  };

  const getLocalStream = async (videoEnabled = true) => {
    // If we already have a live stream, reuse it
    if (localStreamRef.current) {
      const hasLiveTrack = localStreamRef.current
        .getTracks()
        .some((track) => track.readyState === "live");
      if (hasLiveTrack) {
        return localStreamRef.current;
      }
      // Stop any dead/ended tracks before requesting new stream
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    const constraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: videoEnabled
        ? {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
        : false,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    return stream;
  };

  const addTracksToPeer = () => {
    if (!peerRef.current || !localStreamRef.current) return;
    if (peerRef.current.signalingState === "closed") return;

    localStreamRef.current.getTracks().forEach((track) => {
      const alreadyAdded = peerRef.current!.getSenders().find(s => s.track === track);
      if (!alreadyAdded) {
        peerRef.current!.addTrack(track, localStreamRef.current!);
      }
    });
  };

  return {
    peerRef,
    localStreamRef,
    createPeerConnection,
    getLocalStream,
    addTracksToPeer,
  };
};
