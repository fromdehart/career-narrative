import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ProgressSteps } from "../components/ProgressSteps";
import { ClaimCard } from "../components/ClaimCard";
import { EvidenceUploader } from "../components/EvidenceUploader";

export default function Evidence() {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const claims = useQuery(api.claims.getClaims, { profileId: profileId as Id<"profiles"> }) ?? [];
  const evidenceList = useQuery(api.evidence.getEvidenceForProfile, {
    profileId: profileId as Id<"profiles">,
  }) ?? [];

  const evidenceByClaimId = new Map<string, typeof evidenceList>();
  for (const e of evidenceList) {
    const arr = evidenceByClaimId.get(e.claimId) ?? [];
    arr.push(e);
    evidenceByClaimId.set(e.claimId, arr);
  }

  const visibleClaims = claims.filter((c) => c.isVisible);
  const currentClaim = visibleClaims[currentIndex];

  const advance = () => {
    if (currentIndex < visibleClaims.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      navigate(`/references/${profileId}`);
    }
  };

  if (!profileId) return null;

  if (claims.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500">Loading your claims…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <span className="font-bold text-gray-900">AwesomeWork</span>
        </div>

        <ProgressSteps currentStep={3} />

        <div className="bg-white rounded-2xl border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Add evidence</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Claim {currentIndex + 1} of {visibleClaims.length}
              </p>
            </div>
            <Link
              to={`/references/${profileId}`}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Skip all
            </Link>
          </div>

          {/* Dots */}
          <div className="flex gap-1.5">
            {visibleClaims.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex
                    ? "w-6 bg-blue-600"
                    : i < currentIndex
                      ? "w-1.5 bg-blue-300"
                      : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>

          {currentClaim && (
            <>
              <ClaimCard
                claim={currentClaim}
                evidence={evidenceByClaimId.get(currentClaim._id) ?? []}
                editMode={false}
              />
              <EvidenceUploader
                profileId={profileId as Id<"profiles">}
                claimId={currentClaim._id}
                onSubmit={advance}
                onSkip={advance}
              />
            </>
          )}

          {!currentClaim && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">All claims covered!</p>
              <button
                onClick={() => navigate(`/references/${profileId}`)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Done — add references
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
