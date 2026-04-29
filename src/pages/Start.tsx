import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProgressSteps } from "../components/ProgressSteps";
import { ResumeUploader } from "../components/ResumeUploader";
import { AlertCircle } from "lucide-react";

export default function Start() {
  const navigate = useNavigate();
  const [extractedText, setExtractedText] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProfile = useMutation(api.profiles.createProfile);
  const saveResumeText = useMutation(api.profiles.saveResumeText);
  const parseResumeToRoles = useAction(api.resume.parseResumeToRoles);
  const createRolesFromResume = useMutation(api.roles.createRolesFromResume);
  const startSession = useMutation(api.interview.startSession);

  const handleTextExtracted = (text: string, name: string) => {
    setExtractedText(text);
    setFileName(name);
    setError(null);
  };

  const handleContinue = async () => {
    if (!extractedText || parsing) return;
    setError(null);
    setParsing(true);

    try {
      const anonymousId = crypto.randomUUID();
      localStorage.setItem("aww-anonymous-id", anonymousId);

      const { profileId } = await createProfile({ anonymousId });
      localStorage.setItem("aww-profile-id", profileId);

      await saveResumeText({ profileId, resumeText: extractedText });

      const { roles } = await parseResumeToRoles({ resumeText: extractedText });
      if (roles.length > 0) {
        await createRolesFromResume({ profileId, roles });
      }

      const systemContext = buildSystemContext(extractedText);
      const { sessionId } = await startSession({
        profileId,
        sessionType: "candidate",
        mode: "voice",
        systemContext,
      });

      navigate(`/interview/${profileId}?session=${sessionId}`);
    } catch (e) {
      setError("Something went wrong. Please try again.");
      console.error(e);
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <span className="font-bold text-gray-900">AwesomeWork</span>
        </div>

        <ProgressSteps currentStep={1} />

        <div className="bg-white rounded-2xl border p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upload your resume</h1>
            <p className="text-gray-500 mt-1 text-sm">
              We'll extract your work history and use it to guide your interview.
            </p>
          </div>

          <ResumeUploader onTextExtracted={handleTextExtracted} />

          {fileName && extractedText && (
            <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              Ready: <strong>{fileName}</strong>
            </p>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleContinue}
            disabled={!extractedText || parsing}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
          >
            {parsing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Setting up your interview…
              </>
            ) : (
              "Continue to Interview"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function buildSystemContext(resumeText: string): string {
  return `You are an expert career interviewer at AwesomeWork. You have the candidate's resume in front of you.

Your goal: surface their most impressive, authentic career stories through targeted questions.
- Ask ONE question at a time and wait for the full answer before asking the next.
- Do NOT repeat anything already on the resume. Reference it to show familiarity.
- Dig for specifics: numbers, timelines, their personal contribution vs. the team's.
- Push back gently on vague answers: "Can you be more specific about what you personally did?"
- Cover 3-4 key roles or projects, about 5 minutes each.
- After enough depth, ask: "Is there anything important about your career that we haven't covered yet?"
- When the conversation feels complete, say exactly: "This has been a great conversation. I have everything I need to build your profile. Thank you."
That closing phrase signals the end of the session.

Resume:
${resumeText}`;
}
