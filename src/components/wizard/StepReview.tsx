"use client";

import { useWizard } from "@/context/WizardContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { INTEGRATION_LABELS } from "@/types/wizard";
import {
  FileDown,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

export default function StepReview() {
  const { state, dispatch } = useWizard();
  const {
    clientInfo,
    integrationType,
    platformOptions,
    sdkConfig,
    identitySetup,
    userAttributes,
    eventTracking,
    placementConfig,
    isGenerating,
    generatedPdfUrl,
  } = state;

  const enabledAttrs = userAttributes.filter((a) => a.enabled || a.isCustom);
  const platformLabel = integrationType
    ? INTEGRATION_LABELS[integrationType]
    : "Not selected";

  const handleGenerate = async () => {
    dispatch({ type: "SET_GENERATING", payload: true });
    dispatch({ type: "SET_PDF_URL", payload: null });

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientInfo,
          integrationType,
          platformOptions,
          sdkConfig,
          identitySetup,
          userAttributes: enabledAttrs,
          eventTracking,
          placementConfig,
        }),
      });

      if (!res.ok) throw new Error("Generation failed");

      const { content } = await res.json();

      const pdfRes = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          clientName: clientInfo.companyName,
          platform: platformLabel,
        }),
      });

      if (!pdfRes.ok) {
        const errBody = await pdfRes.json().catch(() => ({}));
        throw new Error(errBody.details || errBody.error || "PDF generation failed");
      }

      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      dispatch({ type: "SET_PDF_URL", payload: url });
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Failed to generate the guide. Check console for details.");
    } finally {
      dispatch({ type: "SET_GENERATING", payload: false });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rokt-beetroot/10 text-rokt-beetroot">
          <FileDown className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Review & Generate</h2>
          <p className="text-sm text-rokt-gray-800">
            Review your settings and generate the integration guide PDF.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-rokt-gray-300 divide-y divide-rokt-gray-600">
        <SummaryRow label="Client" value={clientInfo.companyName || "—"} />
        <SummaryRow
          label="Industry"
          value={clientInfo.industry.charAt(0).toUpperCase() + clientInfo.industry.slice(1)}
        />
        <SummaryRow label="Platform" value={platformLabel} />
        <SummaryRow
          label="Environment"
          value={
            <Badge variant={sdkConfig.environment === "production" ? "default" : "secondary"}>
              {sdkConfig.environment}
            </Badge>
          }
        />
        {sdkConfig.firstPartyDomain && (
          <SummaryRow label="First-Party Domain" value={sdkConfig.firstPartyDomain} />
        )}
        <SummaryRow
          label="Email Format"
          value={identitySetup.emailFormat}
        />
        <SummaryRow
          label="Identity Triggers"
          value={
            <div className="flex flex-wrap gap-1">
              {identitySetup.identityTriggers.map((t) => (
                <Badge key={t} variant="outline" className="text-xs">
                  {t}
                </Badge>
              ))}
              {identitySetup.customTrigger && (
                <Badge variant="outline" className="text-xs">
                  {identitySetup.customTrigger}
                </Badge>
              )}
            </div>
          }
        />
        <SummaryRow
          label="User Attributes"
          value={`${enabledAttrs.length} attributes selected`}
        />
        <SummaryRow
          label="Events"
          value={`${eventTracking.events.length} events configured`}
        />
        <SummaryRow
          label="Page Identifier"
          value={placementConfig.pageIdentifier || "—"}
        />
        <SummaryRow
          label="Placement Attributes"
          value={`${placementConfig.attributes.length} attributes`}
        />
      </div>

      <Separator />

      <div className="flex flex-col items-center gap-4">
        {generatedPdfUrl ? (
          <>
            <div className="flex items-center gap-2 text-rokt-beetroot">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">
                Guide generated — opened in a new tab.
              </span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(generatedPdfUrl, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open again
              </Button>
              <a href={generatedPdfUrl} download={`Rokt_${clientInfo.companyName.replace(/\s/g, "_")}_Integration_Guide.pdf`}>
                <Button size="sm" className="bg-rokt-beetroot hover:bg-rokt-wine text-white">
                  <FileDown className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch({ type: "SET_PDF_URL", payload: null })}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            </div>
          </>
        ) : (
          <>
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="min-w-[200px] rounded-full bg-rokt-beetroot hover:bg-rokt-wine text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Generate PDF
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center max-w-sm">
              The PDF will open in a new tab for full-size preview.
            </p>
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: "PREV_STEP" })}
          className="mt-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to edit
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
