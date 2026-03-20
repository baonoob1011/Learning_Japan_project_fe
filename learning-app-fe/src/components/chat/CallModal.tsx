"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Client, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from "lucide-react";
import { useWebRTC } from "@/hooks/useWebRTC";
import {
  sendAnswer,
  sendIceCandidate,
  sendIncomingNotification,
  sendOffer,
} from "@/services/callService";

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
}: Props) => {
  const { createPeerConnection, getLocalStream, addTracksToPeer, localStreamRef } =
    useWebRTC();
  const ringAudioRef = useRef<HTMLAudioElement | null>(null);
  const stompRef = useRef<Client | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const hasSentOfferRef = useRef(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

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

    if (localStreamRef.current) {
      attachStreamToVideo(localVideoRef.current, localStreamRef.current, true);
    }
    if (remoteStreamRef.current) {
      attachStreamToVideo(remoteVideoRef.current, remoteStreamRef.current, false);
    }
  }, [attachStreamToVideo, callState, localStreamRef]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remain = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}`;
  };

  const cleanupMedia = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
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

  const handleEndCall = useCallback(() => {
    if (stompRef.current?.connected) {
      stompRef.current.publish({
        destination: "/app/call.end",
        body: JSON.stringify({ type: "end", roomId, senderId: currentUserId }),
      });
    }

    peerRef.current?.close();
    cleanupMedia();
    setCallState("ended");
    setTimeout(onClose, 800);
  }, [cleanupMedia, currentUserId, onClose, roomId]);

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
  }, [currentUserId, ensureLocalMedia, flushPendingIceCandidates, roomId]);

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
      process.env.NEXT_PUBLIC_API_URL || "https://api.nibojapan.cloud";

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
          if (peer.connectionState === "connected") {
            setCallState("in-call");
          }
        };

        peer.ontrack = async (event) => {
          if (!remoteStreamRef.current) {
            remoteStreamRef.current = new MediaStream();
          }

          const targetStream = remoteStreamRef.current;
          const incomingStream = event.streams[0];

          if (incomingStream) {
            incomingStream.getTracks().forEach((track) => {
              const exists = targetStream
                .getTracks()
                .some((existingTrack) => existingTrack.id === track.id);
              if (!exists) {
                targetStream.addTrack(track);
              }
            });
          } else {
            const exists = targetStream
              .getTracks()
              .some((track) => track.id === event.track.id);
            if (!exists) {
              targetStream.addTrack(event.track);
            }
          }

          await attachStreamToVideo(remoteVideoRef.current, targetStream, false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={`relative w-80 md:w-[600px] rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center py-10 px-8 gap-6 transition-colors ${
          isDarkMode
            ? "bg-gray-900 border border-gray-700"
            : "bg-white border border-cyan-100"
        }`}
      >
        {(callState === "ringing" || callState === "connecting") && (
          <span className="absolute inset-0 rounded-3xl animate-ping opacity-10 bg-cyan-400 pointer-events-none" />
        )}

        <div className="relative w-full max-w-sm">
          {callState !== "in-call" ? (
            <img
              src={displayAvatar || "/default-avatar.png"}
              alt={displayName}
              className="w-24 h-24 mx-auto rounded-full object-cover ring-4 ring-cyan-400 shadow-xl"
            />
          ) : (
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              <div className="absolute bottom-4 right-4 w-1/4 min-w-[80px] aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-xl z-10">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          {callState === "in-call" && (
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
          )}
        </div>

        <div className="text-center">
          <h2
            className={`text-xl font-bold ${
              isDarkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            {displayName}
          </h2>
          <p
            className={`text-sm mt-1 ${
              callState === "in-call"
                ? "text-emerald-500 font-mono font-semibold"
                : isDarkMode
                  ? "text-gray-400"
                  : "text-gray-500"
            }`}
          >
            {stateLabel[callState]}
          </p>
        </div>

        {callState === "in-call" && (
          <div className="flex items-end gap-1 h-6">
            {[3, 6, 9, 6, 3, 8, 4].map((height, index) => (
              <div
                key={index}
                className="w-1 bg-cyan-400 rounded-full animate-pulse"
                style={{
                  height: `${height * 3}px`,
                  animationDelay: `${index * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {callState !== "ended" && (
          <div className="flex items-center gap-5 mt-2">
            {callState === "in-call" && (
              <button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow ${
                  isMuted
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <Mic
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  />
                )}
              </button>
            )}

            {callState === "ringing" && !isCaller && (
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <Volume2
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
              </div>
            )}

            <button
              onClick={handleEndCall}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>

            {callState === "ringing" && !isCaller && (
              <button
                onClick={handleAccept}
                className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <Phone className="w-6 h-6 text-white" />
              </button>
            )}
          </div>
        )}

        {callState === "ended" && (
          <p
            className={`text-sm animate-pulse ${
              isDarkMode ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Dang dong...
          </p>
        )}
      </div>
    </div>
  );
};
