import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Id } from "../../convex/_generated/dataModel";

type ReferenceDoc = {
  _id: Id<"references">;
  name: string;
  relationship: string;
};

interface Props {
  reference: ReferenceDoc;
  candidateName: string;
  onConsent: () => void;
}

export function ConsentGate({ reference, candidateName, onConsent }: Props) {
  const [consenting, setConsenting] = useState(false);
  const navigate = useNavigate();

  const handleConsent = () => {
    setConsenting(true);
    onConsent();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border p-8 text-center space-y-6">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto">
          <span className="text-white font-bold text-lg">A</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reference Interview</h1>
          <p className="mt-2 text-gray-600">
            <strong>{candidateName}</strong> has invited you to share your perspective on their work.
          </p>
        </div>

        <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 text-left leading-relaxed">
          By continuing, you agree that your responses in this interview may be shared with{" "}
          <strong>{candidateName}</strong> and included in their career profile on AwesomeWork. This
          is entirely voluntary. You may stop at any time.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleConsent}
            disabled={consenting}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {consenting ? "Starting…" : "I agree — start the interview"}
          </button>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
