"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Client, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Camera, CameraOff, Mic, MicOff, PhoneOff, Phone } from "lucide-react";
import { callService } from "@/services/callService";
import { sendAnswer, sendIceCandidate, sendIncomingNotification, sendOffer } from "@/services/callService";

/* ─────────── Types ─────────── */
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

/* ─────────── ICE Servers ─────────── */
const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
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
];

/* ─────────── Helpers ─────────── */
function getToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return "";
    return JSON.parse(raw)?.state?.accessToken ?? "";
  } catch {
    return "";
  }
}

async function attachStream(
  el: HTMLVideoElement | null,
  stream: MediaStream,
  muted: boolean
) {
  if (!el) {
    console.log("[CallModal] attachStream skipped - element is null");
    return;
  }
  if (el.srcObject === stream) {
    console.log("[CallModal] attachStream skipped - stream already attached");
    return;
  }
  console.log("[CallModal] attachStream assigning stream to video element:", el, stream.getTracks().map(t => t.kind));
  el.srcObject = stream;
  el.muted = muted;
  el.volume = muted ? 0 : 1.0;
  el.onloadedmetadata = () => {
    console.log("[CallModal] Video onloadedmetadata fired! videoWidth:", el.videoWidth, "videoHeight:", el.videoHeight);
  };
  try {
    await el.play();
    console.log("[CallModal] Video playback started successfully.");
  } catch (e: unknown) {
    if ((e as DOMException).name !== "AbortError") {
      console.warn("[CallModal] video play error:", e);
    }
  }
}

/* ─────────── Component ─────────── */
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
  /* refs */
  const stompRef = useRef<Client | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const hasSentOfferRef = useRef(false);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const ringAudioRef = useRef<HTMLAudioElement | null>(null);
  const isCleanedRef = useRef(false);
  const callSavedRef = useRef(false); // prevent double-saving

  /* state */
  const [callState, setCallState] = useState<CallState>(
    isCaller ? "connecting" : "ringing"
  );
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(type === "VOICE");
  const [callDuration, setCallDuration] = useState(0);

  /* ── Timer ── */
  useEffect(() => {
    if (callState !== "in-call") return;
    const t = setInterval(() => setCallDuration(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [callState]);

  /* ── Attach streams whenever they or state changes ── */
  useEffect(() => {
    if (remoteStream && callState === "in-call" && remoteVideoRef.current) {
      attachStream(remoteVideoRef.current, remoteStream, false);
    }
    if (localStreamRef.current && localVideoRef.current) {
      attachStream(localVideoRef.current, localStreamRef.current, true);
    }
  }); // run on every render to ensure video refs are always attached if they remount

  /* ── Ringing audio ── */
  useEffect(() => {
    if (callState === "ringing" && !isCaller) {
      const a = new Audio("https://www.soundjay.com/phone/sounds/telephone-ring-01a.mp3");
      a.loop = true;
      a.play().catch(() => { });
      ringAudioRef.current = a;
    } else {
      ringAudioRef.current?.pause();
      ringAudioRef.current = null;
    }
  }, [callState, isCaller]);

  /* ── Get local media ── */
  const ensureLocalMedia = useCallback(async () => {
    if (localStreamRef.current?.getTracks().some(t => t.readyState === "live")) {
      attachStream(localVideoRef.current, localStreamRef.current, true);
      return localStreamRef.current;
    }
    localStreamRef.current?.getTracks().forEach(t => t.stop());

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
      video: type !== "VOICE"
        ? { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
        : false,
    });
    localStreamRef.current = stream;
    attachStream(localVideoRef.current, stream, true);
    return stream;
  }, [type]);

  /* ── Add tracks to peer ── */
  const addTracks = useCallback((peer: RTCPeerConnection) => {
    if (!localStreamRef.current) {
      console.warn("[CallModal] addTracks failed - localStreamRef is null");
      return;
    }
    const senders = peer.getSenders();
    const senderTrackIds = senders.map(s => s.track?.id).filter(Boolean);
    console.log("[CallModal] Current senders before addTracks:", senderTrackIds);

    localStreamRef.current.getTracks().forEach(track => {
      console.log("[CallModal] Attempting to add track:", track.kind, track.id, "enabled:", track.enabled, "readyState:", track.readyState);
      if (!senderTrackIds.includes(track.id)) {
        peer.addTrack(track, localStreamRef.current!);
        console.log("[CallModal] Successfully added track to peer:", track.kind);
      } else {
        console.log("[CallModal] Track already in senders:", track.kind);
      }
    });
  }, []);

  /* ── Flush queued ICE ── */
  const flushIce = useCallback(async (peer: RTCPeerConnection) => {
    while (pendingCandidatesRef.current.length > 0) {
      const c = pendingCandidatesRef.current.shift()!;
      try { await peer.addIceCandidate(new RTCIceCandidate(c)); } catch { /* ignore */ }
    }
  }, []);

  /* ── Cleanup ── */
  const cleanup = useCallback(() => {
    if (isCleanedRef.current) return;
    isCleanedRef.current = true;

    ringAudioRef.current?.pause();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    peerRef.current?.close();
    peerRef.current = null;
    stompRef.current?.deactivate();
    stompRef.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  /* ── End call ── */
  const handleEndCall = useCallback((status: "COMPLETED" | "MISSED" | "REJECTED" | "CANCELLED" = "COMPLETED") => {
    if (stompRef.current?.connected) {
      stompRef.current.publish({
        destination: "/app/call.end",
        body: JSON.stringify({ type: "end", roomId, senderId: currentUserId }),
      });
    }
    // ✅ Only the CALLER saves the call record to avoid duplicates
    if (isCaller && !callSavedRef.current) {
      callSavedRef.current = true;
      callService.saveCall({
        callerId: currentUserId,
        receiverId: receiverId ?? "",
        type,
        status,
        duration: callDuration,
        roomId,
      }).catch(() => { });
    }

    setCallState("ended");
    cleanup();
    setTimeout(onClose, 600);
  }, [callDuration, cleanup, currentUserId, isCaller, onClose, receiverId, roomId, type]);

  /* ── Accept (receiver presses accept after offer arrives) ── */
  const handleAccept = useCallback(async () => {
    const peer = peerRef.current;
    const stomp = stompRef.current;
    if (!peer || !stomp?.connected) {
      alert("Đang kết nối, vui lòng thử lại...");
      return;
    }

    // If offer hasn't arrived yet, keep ringing and wait
    if (!pendingOfferRef.current) {
      alert("Đang chờ kết nối từ người gọi...");
      return;
    }

    try {
      setCallState("connecting");
      await ensureLocalMedia();
      addTracks(peer);

      await peer.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
      pendingOfferRef.current = null;
      await flushIce(peer);

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      sendAnswer(stomp, roomId, answer, currentUserId);
      setCallState("in-call");
    } catch (err) {
      console.error("[CallModal] handleAccept error:", err);
      alert(`Kết nối thất bại: ${(err as Error).message}`);
      handleEndCall("REJECTED");
    }
  }, [addTracks, currentUserId, ensureLocalMedia, flushIce, handleEndCall, roomId]);

  /* ── Main STOMP + WebRTC Effect ── */
  useEffect(() => {
    isCleanedRef.current = false;
    let sub: StompSubscription | undefined;
    const token = getToken();

    const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerRef.current = peer;

    peer.onicecandidate = ({ candidate }) => {
      if (candidate && stompRef.current?.connected) {
        sendIceCandidate(stompRef.current, roomId, candidate, currentUserId);
      }
    };

    peer.oniceconnectionstatechange = () => {
      console.log("[CallModal] ICE State changed:", peer.iceConnectionState, "Signaling State:", peer.signalingState);
      if (peer.iceConnectionState === "connected" || peer.iceConnectionState === "completed") {
        setCallState("in-call");
      } else if (peer.iceConnectionState === "failed") {
        console.warn("[CallModal] ICE failed - trying restart");
        peer.restartIce();
      }
    };

    peer.ontrack = (event) => {
      console.log("[CallModal] ontrack event fired:", event.track.kind, "track id:", event.track.id, "muted:", event.track.muted, "readyState:", event.track.readyState);

      // Grab all remote tracks from the peer connection directly to ensure we don't miss any
      const remoteTracks = peer.getReceivers().map(r => r.track).filter((t): t is MediaStreamTrack => t !== null);
      console.log("[CallModal] Total remote tracks mapped from receivers:", remoteTracks.map(t => `${t.kind}(${t.enabled})`));

      const newStream = new MediaStream(remoteTracks);
      console.log("[CallModal] Created new MediaStream with tracks:", newStream.getTracks().map(t => t.kind));

      // Force update React state with new reference
      setRemoteStream(newStream);

      // Force immediate DOM update to be absolutely certain it doesn't get missed by React batching
      if (remoteVideoRef.current) {
        console.log("[CallModal] Forcing immediate attachStream to remoteVideoRef from ontrack");
        attachStream(remoteVideoRef.current, newStream, false);
      } else {
        console.warn("[CallModal] remoteVideoRef is null during ontrack");
      }

      setCallState("in-call");
    };

    const client = new Client({
      webSocketFactory: () => new SockJS("https://api.nibojapan.cloud/ws"),
      reconnectDelay: 0, // disable auto-reconnect to avoid duplicate connections
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},

      onConnect: async () => {
        console.log("[CallModal] STOMP Connected");

        sub = client.subscribe(`/topic/call/${roomId}`, async (msg) => {
          const signal = JSON.parse(msg.body) as {
            type: "offer" | "answer" | "ice" | "end" | "ready";
            senderId: string;
            data?: RTCSessionDescriptionInit | RTCIceCandidateInit;
          };

          if (signal.senderId === currentUserId) return;
          console.log("[CallModal] Signal:", signal.type, "from", signal.senderId);

          switch (signal.type) {
            case "offer": {
              // Store offer; if receiver hasn't pressed Accept yet, just store it
              if (signal.data) {
                pendingOfferRef.current = signal.data as RTCSessionDescriptionInit;
                // If receiver is in "ringing" state, show accept button (already visible)
                // If they already pressed accept (state = connecting), process immediately
                setCallState(prev => prev === "connecting" ? prev : "ringing");
              }
              break;
            }
            case "ready": {
              // Receiver is ready → caller sends offer
              if (isCaller && !hasSentOfferRef.current) {
                hasSentOfferRef.current = true;
                try {
                  await ensureLocalMedia();
                  addTracks(peer);

                  // Set up transceivers for video+audio
                  if (peer.getTransceivers().length === 0) {
                    peer.addTransceiver("audio", { direction: "sendrecv" });
                    if (type !== "VOICE") peer.addTransceiver("video", { direction: "sendrecv" });
                  }

                  const offer = await peer.createOffer();
                  await peer.setLocalDescription(offer);
                  sendOffer(client, roomId, offer, currentUserId);
                  setCallState("ringing");
                } catch (err) {
                  console.error("[CallModal] createOffer error:", err);
                }
              }
              break;
            }
            case "answer": {
              if (signal.data && peer.signalingState === "have-local-offer") {
                await peer.setRemoteDescription(new RTCSessionDescription(signal.data as RTCSessionDescriptionInit));
                await flushIce(peer);
                setCallState("in-call");
              }
              break;
            }
            case "ice": {
              if (signal.data) {
                const c = signal.data as RTCIceCandidateInit;
                if (peer.remoteDescription) {
                  try { await peer.addIceCandidate(new RTCIceCandidate(c)); } catch { /* ignore stale candidates */ }
                } else {
                  pendingCandidatesRef.current.push(c);
                }
              }
              break;
            }
            case "end": {
              if (callState !== "ended") {
                // ✅ If WE are the caller and haven't saved yet, save now
                // (remote side ended the call - rejected OR finished)
                if (isCaller && !callSavedRef.current) {
                  callSavedRef.current = true;
                  const saveStatus = callState === "in-call" ? "COMPLETED" : "REJECTED";
                  callService.saveCall({
                    callerId: currentUserId,
                    receiverId: receiverId ?? "",
                    type,
                    status: saveStatus,
                    duration: callDuration,
                    roomId,
                  }).catch(() => { });
                }
                setCallState("ended");
                cleanup();
                setTimeout(onClose, 600);
              }
              break;
            }
          }
        });

        // After subscribing, notify the other side
        if (isCaller) {
          // Caller notifies receiver via incoming notification
          if (receiverId) {
            sendIncomingNotification(client, {
              roomId,
              callerId: currentUserId,
              callerName: callerName ?? contactName,
              callerAvatar: callerAvatar ?? contactAvatar,
              receiverId,
              callType: type,
            });
          }
          // Caller also sets up media and waits for "ready" from receiver
          try {
            await ensureLocalMedia();
            addTracks(peer);
          } catch (err) {
            console.error("[CallModal] Caller media setup error:", err);
          }
        } else {
          // Receiver: send "ready" so caller knows we're connected
          client.publish({
            destination: "/app/call.answer",
            body: JSON.stringify({ type: "ready", roomId, senderId: currentUserId }),
          });
        }
      },

      onStompError: (frame) => console.error("[CallModal] STOMP error:", frame),
      onDisconnect: () => console.log("[CallModal] STOMP Disconnected"),
    });

    stompRef.current = client;
    client.activate();

    // Missed call timeout (30s)
    let missedTimeout: ReturnType<typeof setTimeout> | undefined;
    if (isCaller) {
      missedTimeout = setTimeout(() => {
        if (callState !== "in-call") handleEndCall("MISSED");
      }, 30000);
    }

    return () => {
      clearTimeout(missedTimeout);
      sub?.unsubscribe();
      if (!isCleanedRef.current) cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty: run once on mount

  /* ─── Toggle Mute ─── */
  const toggleMute = () => {
    const sender = peerRef.current?.getSenders().find(s => s.track?.kind === "audio");
    if (sender?.track) {
      sender.track.enabled = isMuted;
      setIsMuted(p => !p);
    }
  };

  /* ─── Toggle Video ─── */
  const toggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = isVideoOff;
      setIsVideoOff(p => !p);
    }
  };

  /* ─── Format duration ─── */
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  /* ─── Status label ─── */
  const statusLabel = {
    connecting: "Đang kết nối...",
    ringing: isCaller ? "Đang đổ chuông..." : "Cuộc gọi đến...",
    "in-call": fmt(callDuration),
    ended: "Kết thúc",
  }[callState];

  /* ─── Render ─── */
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className={`relative w-full max-w-2xl mx-4 rounded-3xl overflow-hidden shadow-2xl ${isDarkMode ? "bg-gray-900" : "bg-gray-800"}`}>

        {/* Video area */}
        <div className="relative w-full aspect-video bg-black">
          {/* Remote video (full) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* No video placeholder */}
          {callState !== "in-call" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900/50 to-gray-900">
              <img
                src={contactAvatar || "/avatar.png"}
                alt={contactName}
                className="w-24 h-24 rounded-full border-4 border-white/20 object-cover mb-4"
              />
              <h2 className="text-white text-xl font-bold">{contactName}</h2>
              <p className="text-white/60 text-sm mt-1">{statusLabel}</p>
            </div>
          )}

          {/* Local video (PiP) */}
          {type !== "VOICE" && (
            <div className="absolute bottom-3 right-3 w-28 h-20 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg bg-gray-900">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoOff ? "opacity-0" : ""}`}
              />
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <CameraOff className="text-white/50 w-6 h-6" />
                </div>
              )}
            </div>
          )}

          {/* Status overlay when in-call */}
          {callState === "in-call" && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-1 rounded-full">
              <span className="text-white text-sm font-mono">{fmt(callDuration)}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 px-6 py-5 bg-black/40">
          <button
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 ${isMuted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {type !== "VOICE" && (
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 ${isVideoOff ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              {isVideoOff ? <CameraOff size={20} /> : <Camera size={20} />}
            </button>
          )}

          {/* Accept button (receiver only, when ringing) */}
          {callState === "ringing" && !isCaller && (
            <button
              onClick={handleAccept}
              className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-xl transition-all hover:scale-110 animate-bounce"
            >
              <Phone size={24} />
            </button>
          )}

          {/* End call */}
          <button
            onClick={() => handleEndCall(callState === "in-call" ? "COMPLETED" : isCaller ? "CANCELLED" : "REJECTED")}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-xl transition-all hover:scale-110"
          >
            <PhoneOff size={24} />
          </button>
        </div>

        {/* Contact info */}
        <div className="px-6 pb-4 text-center">
          <p className="text-white/60 text-xs">{type === "VOICE" ? "🎤 Cuộc gọi thoại" : "📹 Cuộc gọi video"}</p>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
