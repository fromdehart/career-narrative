import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";

type ReferenceDoc = {
  _id: Id<"references">;
  name: string;
  email: string;
  relationship: string;
  inviteStatus: "pending" | "viewed" | "consented" | "interviewing" | "completed";
  interviewSummary?: string;
  isVisible: boolean;
};

interface Props {
  reference: ReferenceDoc;
  editMode?: boolean;
  onToggleVisibility?: (id: Id<"references">, visible: boolean) => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  viewed: "bg-yellow-100 text-yellow-700",
  consented: "bg-blue-100 text-blue-700",
  interviewing: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

export function ReferenceCard({ reference, editMode, onToggleVisibility }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [resending, setResending] = useState(false);
  const sendInvite = useAction(api.references.sendInvite);

  const handleResend = async () => {
    setResending(true);
    await sendInvite({ referenceId: reference._id });
    setResending(false);
  };

  return (
    <div className={`border rounded-xl p-4 bg-white transition-opacity ${!reference.isVisible && editMode ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900">{reference.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[reference.inviteStatus]}`}>
              {reference.inviteStatus}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{reference.relationship}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {editMode && (
            <button
              onClick={() => onToggleVisibility?.(reference._id, !reference.isVisible)}
              className={`transition-colors ${reference.isVisible ? "text-blue-500 hover:text-blue-700" : "text-gray-300 hover:text-gray-500"}`}
            >
              {reference.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          )}
          {reference.interviewSummary && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {reference.inviteStatus === "pending" && (
        <button
          onClick={handleResend}
          disabled={resending}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
        >
          {resending ? "Re-sending…" : "Re-send invite"}
        </button>
      )}

      {expanded && reference.interviewSummary && (
        <p className="mt-3 text-sm text-gray-700 leading-relaxed border-t pt-3">
          {reference.interviewSummary}
        </p>
      )}
    </div>
  );
}
