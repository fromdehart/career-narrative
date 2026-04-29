import { useState } from "react";
import { Eye, EyeOff, Pencil, Check, Link, FileText, MessageSquare } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

type ClaimDoc = {
  _id: Id<"claims">;
  text: string;
  claimType: "outcome" | "skill" | "responsibility" | "achievement";
  confidenceScore: number;
  isVisible: boolean;
};

type EvidenceDoc = {
  _id: Id<"evidence">;
  evidenceType: "file" | "url" | "soft_context";
  verificationStatus: "verified" | "self_reported";
  fileName?: string;
  url?: string;
};

interface Props {
  claim: ClaimDoc;
  evidence: EvidenceDoc[];
  editMode?: boolean;
  onToggleVisibility?: (id: Id<"claims">, visible: boolean) => void;
  onEditText?: (id: Id<"claims">) => void;
}

const TYPE_COLORS: Record<string, string> = {
  outcome: "bg-green-100 text-green-800",
  skill: "bg-blue-100 text-blue-800",
  achievement: "bg-amber-100 text-amber-800",
  responsibility: "bg-gray-100 text-gray-700",
};

export function ClaimCard({ claim, evidence, editMode, onToggleVisibility, onEditText }: Props) {
  const [editing, setEditing] = useState(false);

  return (
    <div
      className={`rounded-xl border p-4 transition-opacity ${
        !claim.isVisible && editMode ? "opacity-50" : ""
      } bg-white`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-gray-900 flex-1 leading-snug">{claim.text}</p>
        {editMode && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onEditText?.(claim._id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleVisibility?.(claim._id, !claim.isVisible)}
              className={`transition-colors ${claim.isVisible ? "text-blue-500 hover:text-blue-700" : "text-gray-300 hover:text-gray-500"}`}
              title={claim.isVisible ? "Hide" : "Show"}
            >
              {claim.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[claim.claimType]}`}>
          {claim.claimType}
        </span>

        <div className="flex items-center gap-1.5 flex-1 min-w-[80px]">
          <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden max-w-[80px]">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${Math.round(claim.confidenceScore * 100)}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">{Math.round(claim.confidenceScore * 100)}%</span>
        </div>
      </div>

      {evidence.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {evidence.map((e) => (
            <span
              key={e._id}
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                e.verificationStatus === "verified"
                  ? "bg-green-50 text-green-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {e.evidenceType === "file" ? (
                <FileText className="w-3 h-3" />
              ) : e.evidenceType === "url" ? (
                <Link className="w-3 h-3" />
              ) : (
                <MessageSquare className="w-3 h-3" />
              )}
              {e.verificationStatus === "verified" ? "verified" : "self-reported"}
              {e.fileName ? ` · ${e.fileName.slice(0, 20)}` : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
