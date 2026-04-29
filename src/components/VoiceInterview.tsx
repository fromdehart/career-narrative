import { useState, useEffect, useRef } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { TextChat } from "./TextChat";

interface Props {
  sessionId: Id<"interviewSessions">;
  profileId: Id<"profiles">;
  onComplete: () => void;
}

type VoiceStatus = "requesting-mic" | "connecting" | "connected" | "error";

const CLOSING_PHRASES = [
  "This has been a great conversation. I have everything I need",
  "Thank you so much for your time. This gives us a great picture",
];

export function VoiceInterview({ sessionId, onComplete }: Props) {
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("requesting-mic");
  const [subtitle, setSubtitle] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const subtitleBufferRef = useRef("");

  const getEphemeralKey = useAction(api.interview.getRealtimeEphemeralKey);
  const addMessage = useMutation(api.interview.addMessage);

  useEffect(() => {
    if (mode !== "voice") return;

    let cancelled = false;

    async function start() {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        if (!cancelled) setMode("text");
        return;
      }

      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
      setVoiceStatus("connecting");

      let ephemeralKey: string;
      try {
        const result = await getEphemeralKey({ sessionId });
        ephemeralKey = result.ephemeralKey;
      } catch {
        if (!cancelled) setMode("text");
        return;
      }

      if (cancelled) return;

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      const audioEl = new Audio();
      audioEl.autoplay = true;
      audioRef.current = audioEl;

      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
        audioEl.play().catch(() => {});
      };

      const dc = pc.createDataChannel("oai-events");

      dc.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data as string) as Record<string, unknown>;
          const type = event.type as string;

          if (type === "response.audio_transcript.delta") {
            const delta = event.delta as string;
            subtitleBufferRef.current += delta;
            setSubtitle(subtitleBufferRef.current);
            setSpeaking(true);
          } else if (type === "response.audio_transcript.done") {
            const full = subtitleBufferRef.current;
            setSpeaking(false);
            addMessage({ sessionId, role: "assistant", content: full });
            const isClosing = CLOSING_PHRASES.some((p) => full.includes(p));
            if (isClosing) {
              setTimeout(() => onComplete(), 1500);
            }
            subtitleBufferRef.current = "";
            setSubtitle("");
          } else if (type === "conversation.item.input_audio_transcription.completed") {
            const transcript = (event as { transcript?: string }).transcript ?? "";
            if (transcript) {
              addMessage({ sessionId, role: "user", content: transcript });
            }
          }
        } catch {
          // ignore parse errors
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      let answerRes: Response;
      try {
        answerRes = await fetch(
          "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${ephemeralKey}`,
              "Content-Type": "application/sdp",
            },
            body: pc.localDescription!.sdp,
          }
        );
      } catch {
        if (!cancelled) setMode("text");
        return;
      }

      const answerSdp = await answerRes.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      if (!cancelled) setVoiceStatus("connected");
    }

    start();

    return () => {
      cancelled = true;
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, [mode, sessionId, getEphemeralKey, addMessage, onComplete]);

  const switchToText = () => {
    pcRef.current?.close();
    pcRef.current = null;
    setMode("text");
  };

  const endInterview = () => {
    pcRef.current?.close();
    pcRef.current = null;
    onComplete();
  };

  if (mode === "text") {
    return <TextChat sessionId={sessionId} onComplete={onComplete} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-4">
      <div className="relative">
        <div
          className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all ${
            speaking
              ? "border-blue-500 animate-pulse bg-blue-50"
              : voiceStatus === "connected"
                ? "border-green-400 bg-green-50"
                : "border-gray-200 bg-gray-50"
          }`}
        >
          {voiceStatus === "requesting-mic" || voiceStatus === "connecting" ? (
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : voiceStatus === "error" ? (
            <MicOff className="w-10 h-10 text-red-400" />
          ) : (
            <Mic className={`w-10 h-10 ${speaking ? "text-blue-600" : "text-green-500"}`} />
          )}
        </div>
        {speaking && (
          <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ping opacity-30" />
        )}
      </div>

      <div className="text-center max-w-md min-h-[48px]">
        {voiceStatus === "requesting-mic" && (
          <p className="text-gray-500">Requesting microphone access…</p>
        )}
        {voiceStatus === "connecting" && (
          <p className="text-gray-500">Connecting to interviewer…</p>
        )}
        {voiceStatus === "connected" && subtitle && (
          <p className="text-gray-700 text-base leading-relaxed">{subtitle}</p>
        )}
        {voiceStatus === "connected" && !subtitle && (
          <p className="text-gray-400 text-sm">
            {speaking ? "Interviewer is speaking…" : "Listening…"}
          </p>
        )}
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={endInterview}
          className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-full hover:bg-red-100 transition-colors font-medium"
        >
          <PhoneOff className="w-4 h-4" />
          End interview
        </button>
        <button
          onClick={switchToText}
          className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
        >
          Switch to text mode
        </button>
      </div>
    </div>
  );
}
