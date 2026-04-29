import { Check } from "lucide-react";

const STEPS = ["Upload", "Interview", "Evidence", "References", "Profile"];

interface Props {
  currentStep: 1 | 2 | 3 | 4 | 5;
}

export function ProgressSteps({ currentStep }: Props) {
  return (
    <div className="flex items-center justify-center py-6 px-4">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  isCompleted
                    ? "bg-blue-600 text-white"
                    : isCurrent
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium ${
                  isCompleted || isCurrent ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-0.5 mb-5 mx-1 ${
                  step < currentStep ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
