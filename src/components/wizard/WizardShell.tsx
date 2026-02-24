"use client";

import { useWizard } from "@/context/WizardContext";
import { TOTAL_STEPS } from "@/types/wizard";
import { Button } from "@/components/ui/button";
import WizardProgress from "./WizardProgress";
import StepClientInfo from "./StepClientInfo";
import StepIntegrationType from "./StepIntegrationType";
import StepSdkConfig from "./StepSdkConfig";
import StepIdentity from "./StepIdentity";
import StepAttributes from "./StepAttributes";
import StepEvents from "./StepEvents";
import StepPlacements from "./StepPlacements";
import StepReview from "./StepReview";
import { ArrowLeft, ArrowRight } from "lucide-react";

const STEP_COMPONENTS = [
  StepClientInfo,
  StepIntegrationType,
  StepSdkConfig,
  StepIdentity,
  StepAttributes,
  StepEvents,
  StepPlacements,
  StepReview,
];

export default function WizardShell() {
  const { state, dispatch } = useWizard();
  const StepComponent = STEP_COMPONENTS[state.currentStep];

  const canGoNext = () => {
    switch (state.currentStep) {
      case 0:
        return state.clientInfo.companyName.trim().length > 0;
      case 1:
        return state.integrationType !== null;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <header className="bg-black">
        <div className="mx-auto max-w-3xl flex items-center gap-3 py-4 px-6">
          <img
            src="/rokt-logo-black.png"
            alt="Rokt"
            className="h-5 invert"
          />
          <div className="h-3.5 w-px bg-white/20" />
          <span className="text-white/50 text-[11px] font-mono tracking-wider uppercase">
            Integration Guide Generator
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pt-10 pb-16">
        <WizardProgress />

        <div className="mt-8 bg-white rounded-2xl p-8 md:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <StepComponent />
        </div>

        {state.currentStep < TOTAL_STEPS - 1 && (
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => dispatch({ type: "PREV_STEP" })}
              disabled={state.currentStep === 0}
              className="rounded-full px-6 h-10 border-rokt-gray-600 text-rokt-gray-900 hover:bg-rokt-gray-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => dispatch({ type: "NEXT_STEP" })}
              disabled={!canGoNext()}
              className="rounded-full px-6 h-10 bg-rokt-beetroot hover:bg-rokt-wine text-white"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
