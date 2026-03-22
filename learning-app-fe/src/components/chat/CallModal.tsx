"use client";
// Forced rebuild to pick up callService exports

import { useCallback, useEffect, useRef, useState } from "react";
import { Client, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Camera, CameraOff, Mic, MicOff, Phone, PhoneOff, Volume2 } from "lucide-react";
import { useWebRTC } from "@/hooks/useWebRTC";
import {
  sendAnswer,
  sendIceCandidate,
  sendIncomingNotification,
  sendOffer,
} from "@/services/callService";
import { callService } from "@/services/callService";

interface Props {
  roomId: string;
  isCaller: boolean;
  currentUserId: string;
  receiverId?: string;
  contactName: string;
  contactAvatar: string;
  callerName?: string;
  callerAvatar?: string;
  isDarkMode?: boolean;
  onClose: () => void;
  type?: "VIDEO" | "VOICE";
}

type CallState = "connecting" | "ringing" | "in-call" | "ended";

export const CallModal = ({
  roomId,
  isCaller,
  currentUserId,
  receiverId,
  contactName,
  contactAvatar,
  callerName,
  callerAvatar,
  isDarkMode = false,
  onClose,
  type = "VIDEO",
}: Props) => {
  const { createPeerConnection, getLocalStream, addTracksToPeer, localStreamRef } =
    useWebRTC();
  const ringAudioRef = useRef<HTMLAudioElement | null>(null);
  const stompRef = useRef<Client | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const hasSentOfferRef = useRef(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isVideoOff, setIsVideoOff] = useState(type === "VOICE");
  const [callState, setCallState] = useState<CallState>(
    isCaller ? "connecting" : "ringing"
  );
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const attachStreamToVideo = useCallback(
    async (
      element: HTMLVideoElement | null,
      stream: MediaStream,
      muted = false
    ) => {
      if (!element) return;

      element.srcObject = stream;
      element.muted = muted;

      try {
        await element.play();
      } catch (error) {
        const mediaError = error as DOMException;
        if (mediaError.name !== "AbortError") {
          console.error("[CallModal] Failed to play stream:", mediaError);
        }
      }
    },
    []
  );

  const flushPendingIceCandidates = useCallback(async () => {
    const peer = peerRef.current;
    if (!peer?.remoteDescription) return;

    while (pendingIceCandidatesRef.current.length > 0) {
      const candidate = pendingIceCandidatesRef.current.shift();
      if (!candidate) continue;

      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("[CallModal] addIceCandidate:", error);
      }
    }
  }, []);

  const ensureLocalMedia = useCallback(async () => {
    const stream = await getLocalStream();
    await attachStreamToVideo(localVideoRef.current, stream, true);
    addTracksToPeer();
    return stream;
  }, [addTracksToPeer, attachStreamToVideo, getLocalStream]);

  useEffect(() => {
    if (callState === "ringing" && !isCaller) {
      const audio = new Audio(
        "https://www.soundjay.com/phone/sounds/telephone-ring-01a.mp3"
      );
      audio.loop = true;
      audio.play().catch(console.error);
      ringAudioRef.current = audio;
      return;
    }

    if (ringAudioRef.current) {
      ringAudioRef.current.pause();
      ringAudioRef.current.currentTime = 0;
      ringAudioRef.current = null;
    }
  }, [callState, isCaller]);

  useEffect(() => {
    return () => {
      if (ringAudioRef.current) {
        ringAudioRef.current.pause();
        ringAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (callState !== "in-call") return;
    const timer = setInterval(() => setCallDuration((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [callState]);

  useEffect(() => {
    if (callState !== "in-call") return;

    const attachWithRetry = () => {
      if (localStreamRef.current && localVideoRef.current) {
          attachStreamToVideo(localVideoRef.current, localStreamRef.current, true);
      }
      if (remoteStream && remoteVideoRef.current) {
          attachStreamToVideo(remoteVideoRef.current, remoteStream, false);
      }
    };

    // Attach immediately
    attachWithRetry();

    // Sometimes the ref is null for a few ms after state change, so retry once
    const timeout = setTimeout(attachWithRetry, 300);

    // If voice call, make sure local video is off in tracks
    if (type === "VOICE" && localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(t => t.enabled = false);
    }
    
    return () => clearTimeout(timeout);
  }, [attachStreamToVideo, callState, localStreamRef, remoteStream, isVideoOff, type]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remain = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}`;
  };

  const cleanupMedia = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setRemoteStream(null);
    pendingIceCandidatesRef.current = [];

    if (localVideoRef.current) {
      localVideoRef.current.pause();
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.pause();
      remoteVideoRef.current.srcObject = null;
    }
  }, [localStreamRef]);

  const saveCallRecord = useCallback(async (status: "COMPLETED" | "MISSED" | "REJECTED" | "CANCELLED", durationSec: number) => {
    try {
      if (!receiverId && !isCaller) {
        // If we don't have receiverId (caller), we need to know who we were calling
      }
      
      const actualCallerId = isCaller ? currentUserId : (receiverId || ""); 
      const actualReceiverId = isCaller ? (receiverId || "") : currentUserId;

      await callService.saveCall({
        callerId: isCaller ? currentUserId : (receiverId || ""), 
        receiverId: isCaller ? (receiverId || "") : currentUserId,
        type: type, // Use the provided type
        status,
        duration: durationSec,
        roomId,
      });
    } catch (err) {
      console.error("[CallModal] Failed to auto-save call record:", err);
    }
  }, [currentUserId, isCaller, receiverId, roomId]);

  const handleEndCall = useCallback((isTimeout = false) => {
    if (stompRef.current?.connected) {
      stompRef.current.publish({
        destination: "/app/call.end",
        body: JSON.stringify({ type: "end", roomId, senderId: currentUserId }),
      });
    }

    let finalStatus: "COMPLETED" | "MISSED" | "REJECTED" | "CANCELLED" = "COMPLETED";
    if (callState !== "in-call") {
      if (isTimeout) {
        finalStatus = "MISSED";
      } else {
        finalStatus = isCaller ? "CANCELLED" : "REJECTED";
      }
    }

    saveCallRecord(finalStatus, callDuration);

    peerRef.current?.close();
    cleanupMedia();
    setCallState("ended");
    setTimeout(onClose, 800);
  }, [callDuration, callState, cleanupMedia, currentUserId, isCaller, onClose, roomId, saveCallRecord]);

  const handleAccept = useCallback(async () => {
    const peer = peerRef.current;
    const stomp = stompRef.current;
    if (!peer || !stomp?.connected) return;

    await ensureLocalMedia();

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    sendAnswer(stomp, roomId, answer, currentUserId);
    await flushPendingIceCandidates();
    setCallState("in-call");
    // History will be saved when ended
  }, [currentUserId, ensureLocalMedia, flushPendingIceCandidates, roomId]);

  // Timeout for MISSED call
  useEffect(() => {
    if (callState === "ringing" && isCaller) {
      const timeout = setTimeout(() => {
        handleEndCall(true); // isTimeout = true
      }, 30000); // 30s timeout
      return () => clearTimeout(timeout);
    }
  }, [callState, handleEndCall, isCaller]);

  const toggleMute = () => {
    const sender = peerRef.current
      ?.getSenders()
      .find((item) => item.track?.kind === "audio");

    if (!sender?.track) return;

    sender.track.enabled = isMuted;
    setIsMuted((value) => !value);
  };

  const sendReadySignal = useCallback(
    (client: Client) => {
      client.publish({
        destination: "/app/call.answer",
        body: JSON.stringify({
          type: "ready",
          roomId,
          senderId: currentUserId,
        }),
      });
    },
    [currentUserId, roomId]
  );

  const createAndSendOffer = useCallback(
    async (client: Client, peer: RTCPeerConnection) => {
      if (hasSentOfferRef.current) return;

      hasSentOfferRef.current = true;
      await ensureLocalMedia();

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      sendOffer(client, roomId, offer, currentUserId);
      setCallState("ringing");
    },
    [currentUserId, ensureLocalMedia, roomId]
  );

  useEffect(() => {
    let subscription: StompSubscription | undefined;
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

    const client = new Client({
      webSocketFactory: () => new SockJS(`${backendUrl}/ws`),
      reconnectDelay: 0,
      onConnect: async () => {
        const peer = createPeerConnection();
        peerRef.current = peer;

        peer.onicecandidate = (event) => {
          if (event.candidate) {
            sendIceCandidate(client, roomId, event.candidate, currentUserId);
          }
        };

        peer.onconnectionstatechange = () => {
          console.log("[CallModal] ConnectionState:", peer.connectionState);
          if (peer.connectionState === "connected") {
            setCallState("in-call");
          } else if (peer.connectionState === "failed" || peer.connectionState === "disconnected") {
            console.error("[CallModal] RTC Connection failed or disconnected");
            // Optionally handle reconnect or end call
          }
        };

        peer.ontrack = async (event) => {
          console.log("[CallModal] Incoming track:", event.track.kind);
          
          setRemoteStream(prev => {
            const targetStream = prev || new MediaStream();
            const incomingStream = event.streams[0];

            if (incomingStream) {
              incomingStream.getTracks().forEach((track) => {
                if (!targetStream.getTracks().some(t => t.id === track.id)) {
                  targetStream.addTrack(track);
                }
              });
            } else {
               if (!targetStream.getTracks().some(t => t.id === event.track.id)) {
                 targetStream.addTrack(event.track);
               }
            }
            
            // Return a NEW MediaStream object to trigger React state update
            return new MediaStream(targetStream);
          });

          setCallState("in-call");
        };

        subscription = client.subscribe(`/topic/call/${roomId}`, async (message) => {
          const signal = JSON.parse(message.body) as {
            roomId: string;
            senderId: string;
            type: "offer" | "answer" | "ice" | "end" | "ready";
            data?: RTCSessionDescriptionInit | RTCIceCandidateInit;
          };

          if (signal.senderId === currentUserId) return;

          switch (signal.type) {
            case "offer":
              if (signal.data) {
                await peer.setRemoteDescription(
                  signal.data as RTCSessionDescriptionInit
                );
                await flushPendingIceCandidates();
                setCallState("ringing");
              }
              break;
            case "answer":
              if (signal.data) {
                await peer.setRemoteDescription(
                  signal.data as RTCSessionDescriptionInit
                );
                await flushPendingIceCandidates();
                setCallState("in-call");
              }
              break;
            case "ready":
              if (isCaller) {
                await createAndSendOffer(client, peer);
              }
              break;
            case "ice":
              if (signal.data) {
                const candidate = signal.data as RTCIceCandidateInit;
                if (!peer.remoteDescription) {
                  pendingIceCandidatesRef.current.push(candidate);
                } else {
                  try {
                    await peer.addIceCandidate(new RTCIceCandidate(candidate));
                  } catch (error) {
                    console.error("[CallModal] addIceCandidate:", error);
                  }
                }
              }
              break;
            case "end":
              peer.close();
              cleanupMedia();
              setCallState("ended");
              setTimeout(onClose, 800);
              break;
          }
        });

        if (!isCaller) {
          sendReadySignal(client);
          return;
        }

        if (receiverId) {
          sendIncomingNotification(client, {
            roomId,
            callerId: currentUserId,
            callerName: callerName ?? contactName,
            callerAvatar: callerAvatar ?? contactAvatar,
            receiverId,
            type, // Add type here
          });
        } else {
          console.warn("[CallModal] isCaller=true but receiverId is missing");
        }
      },
      onStompError: (frame) => console.error("STOMP error:", frame),
    });

    stompRef.current = client;
    client.activate();

    return () => {
      subscription?.unsubscribe();
      peerRef.current?.close();
      client.deactivate();
      cleanupMedia();
    };
  }, [
    attachStreamToVideo,
    callerAvatar,
    callerName,
    cleanupMedia,
    contactAvatar,
    contactName,
    createAndSendOffer,
    createPeerConnection,
    currentUserId,
    ensureLocalMedia,
    flushPendingIceCandidates,
    isCaller,
    onClose,
    receiverId,
    roomId,
    sendReadySignal,
  ]);

  const displayName = isCaller ? contactName : callerName ?? contactName;
  const displayAvatar = isCaller
    ? contactAvatar
    : callerAvatar ?? contactAvatar;

  const stateLabel: Record<CallState, string> = {
    connecting: "Dang ket noi...",
    ringing: isCaller ? "Dang do chuong..." : "Cuoc goi den",
    "in-call": formatDuration(callDuration),
    ended: "Cuoc goi ket thuc",
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-[#09090b]/95 backdrop-blur-xl animate-fade-in">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      <div className="relative w-full h-full flex flex-col items-center justify-between py-12 px-6">
        {/* Header Info */}
        <div className="z-20 text-center animate-slide-down">
          {(callState === "ringing" || callState === "connecting" || callState === "ended") && (
            <div className="relative inline-block mb-6">
              <img
                src={displayAvatar || "/default-avatar.png"}
                alt={displayName}
                className={`w-32 h-32 rounded-full object-cover ring-4 ring-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.3)] ${
                  callState === "ringing" ? "animate-pulse" : ""
                }`}
              />
              {callState === "ringing" && (
                <span className="absolute inset-0 rounded-full animate-ping border-4 border-cyan-500/50" />
              )}
            </div>
          )}
          
          <h2 className="text-3xl font-black text-white tracking-tight mb-2 drop-shadow-md">
            {displayName}
          </h2>
          <div className="flex items-center justify-center gap-2">
            {callState === "in-call" && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            )}
            <p className={`text-sm font-semibold uppercase tracking-widest ${
              callState === "in-call" ? "text-emerald-400 font-mono" : "text-gray-400"
            }`}>
              {stateLabel[callState]}
            </p>
          </div>
        </div>

        {/* Video Stage */}
        <div className="absolute inset-0 z-10 w-full h-full flex items-center justify-center pointer-events-none">
          {callState === "in-call" ? (
             <div className="relative w-full h-full pointer-events-auto overflow-hidden">
                {/* Remote Video (Full Screen) */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Local Video (Floating PIP) */}
                <div className={`absolute top-8 right-8 w-44 md:w-60 aspect-video rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl z-30 group transition-all duration-300 hover:scale-[1.05] ${
                  isVideoOff ? "bg-gray-900" : "bg-black"
                }`}>
                  {isVideoOff ? (
                    <div className="w-full h-full flex items-center justify-center">
                       <img src={callerAvatar || "/default-avatar.png"} alt="me" className="w-12 h-12 rounded-full opacity-50" />
                    </div>
                  ) : (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* Local Mute Indicator */}
                  {isMuted && (
                    <div className="absolute bottom-2 left-2 p-1.5 bg-red-500/80 rounded-full backdrop-blur-md">
                      <MicOff size={10} className="text-white" />
                    </div>
                  )}
                </div>
             </div>
          ) : null}
        </div>

        {/* Controls Bar */}
        <div className="z-30 mb-8 animate-slide-up">
           <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full px-8 py-5 flex items-center gap-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              {callState === "in-call" && (
                <>
                  <button
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
                      isMuted ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                  </button>

                  <button
                    onClick={() => {
                        if (localStreamRef.current) {
                            const videoTrack = localStreamRef.current.getVideoTracks()[0];
                            if (videoTrack) {
                                videoTrack.enabled = isVideoOff;
                                setIsVideoOff(!isVideoOff);
                            }
                        }
                    }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
                      isVideoOff ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {isVideoOff ? <CameraOff size={24} /> : <Camera size={24} />}
                  </button>
                  
                  <div className="w-[1px] h-8 bg-white/20 mx-2" />
                </>
              )}

              {/* End Call Button */}
              <button
                onClick={() => handleEndCall()}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-2xl shadow-red-600/30 transition-all duration-300 hover:scale-110 active:scale-95 hover:rotate-12"
              >
                <PhoneOff size={28} />
              </button>

              {/* Accept Button (Only for ringing receiver) */}
              {callState === "ringing" && !isCaller && (
                <button
                  onClick={handleAccept}
                  className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:scale-110 active:scale-95 animate-bounce-custom"
                >
                  <Phone size={28} />
                </button>
              )}
           </div>
        </div>

        {/* Ended Pulse */}
        {callState === "ended" && (
          <div className="absolute inset-0 flex items-center justify-center z-50 animate-fade-out">
            <div className="bg-red-500/20 backdrop-blur-md rounded-full p-8">
               <PhoneOff size={48} className="text-red-500 animate-bounce" />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-custom {
          0%, 100% { transform: translateY(0) scale(1.1); }
          50% { transform: translateY(-10px) scale(1.1); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-fade-out { animation: fade-out 0.8s ease-in forwards; }
        .animate-slide-down { animation: slide-down 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-bounce-custom { animation: bounce-custom 1s infinite ease-in-out; }
        .animate-pulse-slow { animation: pulse 6s infinite; }
      `}</style>
    </div>
  );
};
