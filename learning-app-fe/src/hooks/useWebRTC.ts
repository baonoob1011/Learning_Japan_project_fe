import { useRef } from "react";

export const useWebRTC = () => {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const createPeerConnection = () => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerRef.current = peer;
    return peer;
  };

  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    localStreamRef.current = stream;
    return stream;
  };

  const addTracksToPeer = () => {
    if (!peerRef.current || !localStreamRef.current) return;

    localStreamRef.current.getTracks().forEach((track) => {
      peerRef.current!.addTrack(track, localStreamRef.current!);
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
