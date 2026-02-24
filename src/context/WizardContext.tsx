"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
  WizardState,
  INITIAL_WIZARD_STATE,
  ClientInfo,
  IntegrationType,
  PlatformOptions,
  SdkConfig,
  IdentitySetup,
  UserAttribute,
  EventTracking,
  PlacementConfig,
} from "@/types/wizard";

type WizardAction =
  | { type: "SET_STEP"; step: number }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_CLIENT_INFO"; payload: Partial<ClientInfo> }
  | { type: "SET_INTEGRATION_TYPE"; payload: IntegrationType }
  | { type: "SET_PLATFORM_OPTIONS"; payload: Partial<PlatformOptions> }
  | { type: "SET_SDK_CONFIG"; payload: Partial<SdkConfig> }
  | { type: "SET_IDENTITY_SETUP"; payload: Partial<IdentitySetup> }
  | { type: "SET_USER_ATTRIBUTES"; payload: UserAttribute[] }
  | { type: "SET_EVENT_TRACKING"; payload: Partial<EventTracking> }
  | { type: "SET_PLACEMENT_CONFIG"; payload: Partial<PlacementConfig> }
  | { type: "SET_GENERATING"; payload: boolean }
  | { type: "SET_PDF_URL"; payload: string | null }
  | { type: "RESET" };

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };
    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(state.currentStep + 1, 7) };
    case "PREV_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };
    case "SET_CLIENT_INFO":
      return { ...state, clientInfo: { ...state.clientInfo, ...action.payload } };
    case "SET_INTEGRATION_TYPE":
      return { ...state, integrationType: action.payload, platformOptions: {} };
    case "SET_PLATFORM_OPTIONS":
      return {
        ...state,
        platformOptions: { ...state.platformOptions, ...action.payload },
      };
    case "SET_SDK_CONFIG":
      return { ...state, sdkConfig: { ...state.sdkConfig, ...action.payload } };
    case "SET_IDENTITY_SETUP":
      return {
        ...state,
        identitySetup: { ...state.identitySetup, ...action.payload },
      };
    case "SET_USER_ATTRIBUTES":
      return { ...state, userAttributes: action.payload };
    case "SET_EVENT_TRACKING":
      return {
        ...state,
        eventTracking: { ...state.eventTracking, ...action.payload },
      };
    case "SET_PLACEMENT_CONFIG":
      return {
        ...state,
        placementConfig: { ...state.placementConfig, ...action.payload },
      };
    case "SET_GENERATING":
      return { ...state, isGenerating: action.payload };
    case "SET_PDF_URL":
      return { ...state, generatedPdfUrl: action.payload };
    case "RESET":
      return { ...INITIAL_WIZARD_STATE };
    default:
      return state;
  }
}

interface WizardContextType {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, INITIAL_WIZARD_STATE);

  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}
