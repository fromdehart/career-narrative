import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ConsentGate } from "../components/ConsentGate";
import { VoiceInterview } from "../components/VoiceInterview";

type Stage = "loading" | "consent" | "interview" | "done";

export default function RefInterview() {
  const { inviteToken } = useParams<{ inviteToken: string }>();
  const [stage, setStage] = useState<Stage>("loading");
  const [sessionId, setSessionId] = useState<Id<"interviewSessions"> | null>(null);

  const data = useQuery(api.references.getByInviteToken, {
    inviteToken: inviteToken ?? "",
  });
  const updateStatus = useMutation(api.references.updateStatus);
  const startSession = useMutation(api.interview.startSession);
  const generateReferenceSummary = useAction(api.narrative.generateReferenceSummary);

  // Mark as viewed
  useEffect(() => {
    if (data?.reference && stage === "loading") {
      setStage("consent");
      updateStatus({ referenceId: data.reference._id, status: "viewed" });
    }
  }, [data, stage, updateStatus]);

  const handleConsent = async () => {
    if (!data) return;
    const { reference, candidateName } = data;
    await updateStatus({ referenceId: reference._id, status: "consented" });

    const systemContext = buildRefSystemContext(reference.name, candidateName ?? "the candidate");
    const { sessionId: sid } = await startSession({
      profileId: reference.profileId,
      sessionType: "reference",
      referenceId: reference._id,
      mode: "voice",
      systemContext,
    });
    await updateStatus({ referenceId: reference._id, status: "interviewing" });
    setSessionId(sid);
    setStage("interview");
  };

  const handleComplete = async () => {
    if (!sessionId || !data) return;
    await generateReferenceSummary({
      sessionId,
      referenceId: data.reference._id,
    });
    setStage("done");
  };

  if (stage === "loading" || data === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Invalid or expired invite link.</p>
      </div>
    );
  }

  const { reference, candidateName } = data;

  if (stage === "consent") {
    return (
      <ConsentGate
        reference={reference}
        candidateName={candidateName ?? "A candidate"}
        onConsent={handleConsent}
      />
    );
  }

  if (stage === "interview" && sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="max-w-2xl mx-auto w-full px-4 py-8 flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="font-bold text-gray-900">AwesomeWork · Reference Interview</span>
          </div>

          <div className="flex-1 bg-white rounded-2xl border overflow-hidden" style={{ minHeight: "500px" }}>
            <VoiceInterview
              sessionId={sessionId}
              profileId={reference.profileId}
              onComplete={handleComplete}
            />
          </div>
        </div>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Thank you!</h2>
          <p className="text-gray-600">
            {reference.name}, your responses have been saved and shared with{" "}
            <strong>{candidateName}</strong>.
          </p>
          <p className="text-sm text-gray-400">You can safely close this window.</p>
        </div>
      </div>
    );
  }

  return null;
}

function buildRefSystemContext(referenceName: string, candidateName: string): string {
  return `You are interviewing ${referenceName} about their professional experience working with ${candidateName}. Their responses will be included in ${candidateName}'s career profile on AwesomeWork, with ${referenceName}'s full consent.

Your goals:
- Ask about the working relationship and duration
- Ask for 2-3 specific examples of ${candidateName}'s contributions and impact
- Ask about ${candidateName}'s key strengths
- Keep it conversational and positive — this is a reference conversation, not a review
- When you have enough, say exactly: "Thank you so much for your time. This gives us a great picture of ${candidateName}'s work."
That closing phrase signals the end of the session.`;
}
