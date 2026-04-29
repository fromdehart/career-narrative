import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ProgressSteps } from "../components/ProgressSteps";
import { ReferenceCard } from "../components/ReferenceCard";
import { ReferenceForm } from "../components/ReferenceForm";
import { Plus, X } from "lucide-react";

export default function References() {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [emailValue, setEmailValue] = useState("");

  const profile = useQuery(api.profiles.getProfile, {
    profileId: profileId as Id<"profiles">,
  });
  const references = useQuery(api.references.getReferencesForProfile, {
    profileId: profileId as Id<"profiles">,
  }) ?? [];
  const roles = useQuery(api.roles.getRoles, {
    profileId: profileId as Id<"profiles">,
  }) ?? [];

  const setEmail = useMutation(api.profiles.setEmail);
  const setVisibility = useMutation(api.profiles.setVisibility);
  const updateStatus = useMutation(api.profiles.updateStatus);

  const handlePublish = async () => {
    if (!profileId || publishing) return;
    if (!profile?.email) {
      setShowEmailModal(true);
      return;
    }
    await doPublish();
  };

  const doPublish = async () => {
    if (!profileId) return;
    setPublishing(true);
    try {
      if (nameValue && emailValue) {
        await setEmail({ profileId: profileId as Id<"profiles">, email: emailValue, name: nameValue });
      }
      await setVisibility({ profileId: profileId as Id<"profiles">, visibility: "public" });
      await updateStatus({ profileId: profileId as Id<"profiles">, status: "published" });
      navigate(`/dashboard/${profileId}`);
    } finally {
      setPublishing(false);
    }
  };

  if (!profileId) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <span className="font-bold text-gray-900">AwesomeWork</span>
        </div>

        <ProgressSteps currentStep={4} />

        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Add references</h1>
            <p className="text-sm text-gray-500 mt-1">
              Invite colleagues to share their perspective. We'll guide them through a short voice
              interview.
            </p>
          </div>

          {references.map((ref) => (
            <ReferenceCard key={ref._id} reference={ref} />
          ))}

          {showForm ? (
            <ReferenceForm
              profileId={profileId as Id<"profiles">}
              roles={roles}
              onCreated={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <Plus className="w-4 h-4" /> Add reference
            </button>
          )}

          <div className="border-t pt-5 flex flex-col gap-3">
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {publishing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing…
                </>
              ) : (
                "Publish profile"
              )}
            </button>
            <p className="text-center text-xs text-gray-400">
              References are optional — you can always add them from your dashboard later.
            </p>
          </div>
        </div>
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Almost there!</h2>
              <button onClick={() => setShowEmailModal(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500">Save your profile link for later.</p>
            <input
              type="text"
              placeholder="Your name"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email address"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => { setShowEmailModal(false); doPublish(); }}
              disabled={!nameValue || !emailValue}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              Publish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
