import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Send } from "lucide-react";

interface Props {
  sessionId: Id<"interviewSessions">;
  onComplete: () => void;
}

export function TextChat({ sessionId, onComplete }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const session = useQuery(api.interview.getSession, { sessionId });
  const addMessage = useMutation(api.interview.addMessage);
  const getNextQuestion = useAction(api.interview.getNextQuestion);

  const transcript = session?.transcript ?? [];
  const userTurnCount = transcript.filter((t) => t.role === "user").length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript.length]);

  useEffect(() => {
    if (!initialized && session && transcript.length === 0) {
      setInitialized(true);
      getNextQuestion({ sessionId }).then(({ question }) => {
        addMessage({ sessionId, role: "assistant", content: question });
      });
    } else if (!initialized && session && transcript.length > 0) {
      setInitialized(true);
    }
  }, [session, initialized, sessionId, transcript.length, getNextQuestion, addMessage]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || sending) return;
    setSending(true);
    setInputValue("");
    await addMessage({ sessionId, role: "user", content: text });
    const { question } = await getNextQuestion({ sessionId });
    const CLOSING = "Thank you so much for your time. This gives us a great picture";
    const CLOSING2 = "This has been a great conversation. I have everything I need";
    if (question.includes(CLOSING) || question.includes(CLOSING2)) {
      await addMessage({ sessionId, role: "assistant", content: question });
      setSending(false);
      onComplete();
      return;
    }
    await addMessage({ sessionId, role: "assistant", content: question });
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {transcript.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t bg-white p-4 space-y-2">
        {userTurnCount >= 8 && (
          <div className="flex justify-center">
            <button
              onClick={onComplete}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              End interview
            </button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer…"
            rows={2}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || sending}
            className="p-2.5 rounded-xl bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
