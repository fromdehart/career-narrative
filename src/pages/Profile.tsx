import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { NarrativeView } from "../components/NarrativeView";
import { ClaimCard } from "../components/ClaimCard";
import { ReferenceCard } from "../components/ReferenceCard";
import { Lock, Share2 } from "lucide-react";
import { useState } from "react";

export default function Profile() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [copied, setCopied] = useState(false);

  const profile = useQuery(api.profiles.getProfileByShareToken, {
    shareToken: shareToken ?? "",
  });
  const claims = useQuery(
    api.claims.getClaims,
    profile ? { profileId: profile._id } : "skip"
  ) ?? [];
  const evidenceList = useQuery(
    api.evidence.getEvidenceForProfile,
    profile ? { profileId: profile._id } : "skip"
  ) ?? [];
  const references = useQuery(
    api.references.getReferencesForProfile,
    profile ? { profileId: profile._id } : "skip"
  ) ?? [];

  const evidenceByClaimId = new Map<string, typeof evidenceList>();
  for (const e of evidenceList) {
    const arr = evidenceByClaimId.get(e.claimId) ?? [];
    arr.push(e);
    evidenceByClaimId.set(e.claimId, arr);
  }

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (profile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center space-y-3">
          <Lock className="w-12 h-12 text-gray-300 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-700">This profile is private</h2>
          <p className="text-sm text-gray-400">The candidate hasn't published this profile yet.</p>
        </div>
      </div>
    );
  }

  const visibleClaims = claims.filter((c) => c.isVisible);
  const visibleRefs = references.filter((r) => r.isVisible && r.inviteStatus === "completed");

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{profile.name ?? "Career Profile"}</h1>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {copied ? "Copied!" : "Share"}
          </button>
        </div>

        {/* Narrative */}
        {profile.narrativeMarkdown && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Career Story</h2>
            <NarrativeView markdown={profile.narrativeMarkdown} />
          </div>
        )}

        {/* Claims */}
        {visibleClaims.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Contributions</h2>
            <div className="grid grid-cols-1 gap-3">
              {visibleClaims.map((claim) => (
                <ClaimCard
                  key={claim._id}
                  claim={claim}
                  evidence={evidenceByClaimId.get(claim._id) ?? []}
                  editMode={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {visibleRefs.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">What colleagues say</h2>
            <div className="space-y-3">
              {visibleRefs.map((ref) => (
                <ReferenceCard key={ref._id} reference={ref} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
