import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

interface Props {
  result: {
    profileId: Id<"profiles">;
    shareToken: string;
    name?: string;
    narrativeSnippet: string;
    topClaims: string[];
    score: number;
  };
}

export function CandidateCard({ result }: Props) {
  return (
    <div className="border rounded-xl p-5 bg-white hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900">{result.name ?? "Anonymous candidate"}</p>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {Math.round(result.score * 100)}% match
          </span>
        </div>
        <Link
          to={`/profile/${result.shareToken}`}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium shrink-0"
        >
          View profile <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2">{result.narrativeSnippet}</p>

      {result.topClaims.length > 0 && (
        <ul className="space-y-1">
          {result.topClaims.map((claim, i) => (
            <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
              <span className="text-blue-400 mt-0.5">•</span>
              <span className="line-clamp-1">{claim}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
