"use client";

import { STEP_LABELS } from "@/types/wizard";
import { useWizard } from "@/context/WizardContext";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WizardProgress() {
  const { state } = useWizard();

  return (
    <nav className="w-full">
      <ol className="flex items-center gap-1">
        {STEP_LABELS.map((label, index) => {
          const isComplete = index < state.currentStep;
          const isCurrent = index === state.currentStep;

          return (
            <li key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 min-w-0">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium transition-colors",
                    isComplete && "bg-black text-white",
                    isCurrent && "bg-rokt-beetroot text-white",
                    !isComplete && !isCurrent && "bg-rokt-gray-600 text-rokt-gray-900"
                  )}
                >
                  {isComplete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "text-[10px] text-center leading-tight max-w-[72px] truncate",
                    isCurrent ? "font-medium text-foreground" : "text-rokt-gray-800"
                  )}
                >
                  {label}
                </span>
              </div>
              {index < STEP_LABELS.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 mx-2 mt-[-14px]",
                    isComplete ? "bg-black" : "bg-rokt-gray-600"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
