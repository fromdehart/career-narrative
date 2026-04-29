import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ProgressSteps } from "../components/ProgressSteps";
import { VoiceInterview } from "../components/VoiceInterview";

export default function Interview() {
  const { profileId } = useParams<{ profileId: string }>();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);

  const generateFromSession = useAction(api.narrative.generateFromSession);

  const handleComplete = async () => {
    if (!profileId || !sessionId || generating) return;
    setGenerating(true);
    try {
      await generateFromSession({
        sessionId: sessionId as Id<"interviewSessions">,
        profileId: profileId as Id<"profiles">,
      });
    } finally {
      navigate(`/evidence/${profileId}`);
    }
  };

  if (!profileId || !sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Invalid session. Please start over.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <span className="font-bold text-gray-900">AwesomeWork</span>
        </div>

        <ProgressSteps currentStep={2} />
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0 max-w-2xl mx-auto w-full px-4 pb-8">
          <div className="h-full bg-white rounded-2xl border overflow-hidden" style={{ minHeight: "500px" }}>
            <VoiceInterview
              sessionId={sessionId as Id<"interviewSessions">}
              profileId={profileId as Id<"profiles">}
              onComplete={handleComplete}
            />
          </div>
        </div>
      </div>

      {generating && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-4 shadow-xl">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-gray-900 text-lg">Building your profile…</p>
              <p className="text-sm text-gray-500 mt-1">This takes about 30 seconds</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
