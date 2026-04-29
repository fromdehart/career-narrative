import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ClaimCard } from "../components/ClaimCard";
import { ReferenceCard } from "../components/ReferenceCard";
import { Copy, Check, ExternalLink, Globe, Lock } from "lucide-react";

export default function Dashboard() {
  const { profileId } = useParams<{ profileId: string }>();
  const [copySuccess, setCopySuccess] = useState(false);
  const [editingClaimId, setEditingClaimId] = useState<Id<"claims"> | null>(null);
  const [editText, setEditText] = useState("");

  const profile = useQuery(api.profiles.getProfile, {
    profileId: profileId as Id<"profiles">,
  });
  const claims = useQuery(api.claims.getClaims, {
    profileId: profileId as Id<"profiles">,
  }) ?? [];
  const evidenceList = useQuery(api.evidence.getEvidenceForProfile, {
    profileId: profileId as Id<"profiles">,
  }) ?? [];
  const references = useQuery(api.references.getReferencesForProfile, {
    profileId: profileId as Id<"profiles">,
  }) ?? [];

  const setVisibility = useMutation(api.profiles.setVisibility);
  const toggleClaimVisibility = useMutation(api.claims.toggleVisibility);
  const updateClaimText = useMutation(api.claims.updateText);
  const toggleRefVisibility = useMutation(api.references.toggleVisibility);

  const evidenceByClaimId = new Map<string, typeof evidenceList>();
  for (const e of evidenceList) {
    const arr = evidenceByClaimId.get(e.claimId) ?? [];
    arr.push(e);
    evidenceByClaimId.set(e.claimId, arr);
  }

  const shareUrl = profile
    ? `${window.location.origin}/profile/${profile.shareToken}`
    : "";

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleEditClaim = (id: Id<"claims">) => {
    const claim = claims.find((c) => c._id === id);
    setEditText(claim?.text ?? "");
    setEditingClaimId(id);
  };

  const handleSaveEdit = async () => {
    if (!editingClaimId) return;
    await updateClaimText({ claimId: editingClaimId, text: editText });
    setEditingClaimId(null);
  };

  if (!profileId) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="font-bold text-gray-900">AwesomeWork</span>
          </div>
        </div>

        {/* Profile status card */}
        <div className="bg-white rounded-2xl border p-6 space-y-4">
          <h1 className="text-xl font-bold text-gray-900">Your Profile</h1>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                profile &&
                setVisibility({
                  profileId: profileId as Id<"profiles">,
                  visibility: profile.visibility === "public" ? "private" : "public",
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                profile?.visibility === "public" ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  profile?.visibility === "public" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5 text-sm">
              {profile?.visibility === "public" ? (
                <>
                  <Globe className="w-4 h-4 text-green-500" />
                  <span className="text-green-700 font-medium">Public</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Private</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-600 truncate"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {copySuccess ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copySuccess ? "Copied!" : "Copy"}
            </button>
            <Link
              to={`/profile/${profile?.shareToken}`}
              target="_blank"
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-gray-500" />
            </Link>
          </div>
        </div>

        {/* Claims */}
        {claims.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Claims</h2>
            {editingClaimId ? (
              <div className="bg-white rounded-xl border p-4 space-y-3">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingClaimId(null)}
                    className="px-4 py-1.5 text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
            {claims.map((claim) => (
              <ClaimCard
                key={claim._id}
                claim={claim}
                evidence={evidenceByClaimId.get(claim._id) ?? []}
                editMode={true}
                onToggleVisibility={(id, v) => toggleClaimVisibility({ claimId: id, isVisible: v })}
                onEditText={handleEditClaim}
              />
            ))}
          </div>
        )}

        {/* References */}
        {references.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">References</h2>
            {references.map((ref) => (
              <ReferenceCard
                key={ref._id}
                reference={ref}
                editMode={true}
                onToggleVisibility={(id, v) => toggleRefVisibility({ referenceId: id, isVisible: v })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
