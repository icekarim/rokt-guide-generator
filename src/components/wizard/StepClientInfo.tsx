"use client";

import { useWizard } from "@/context/WizardContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Industry } from "@/types/wizard";
import { Building2 } from "lucide-react";

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: "ecommerce", label: "Ecommerce" },
  { value: "travel", label: "Travel & Hospitality" },
  { value: "entertainment", label: "Entertainment" },
  { value: "finance", label: "Finance & Insurance" },
  { value: "other", label: "Other" },
];

export default function StepClientInfo() {
  const { state, dispatch } = useWizard();
  const { clientInfo } = state;

  const update = (payload: Partial<typeof clientInfo>) =>
    dispatch({ type: "SET_CLIENT_INFO", payload });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rokt-beetroot/10 text-rokt-beetroot">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Client Information</h2>
          <p className="text-sm text-rokt-gray-800">
            Tell us about the client this integration guide is for.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="companyName">
            Company Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="companyName"
            placeholder="e.g. Fanatics"
            value={clientInfo.companyName}
            onChange={(e) => update({ companyName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry / Vertical</Label>
          <Select
            value={clientInfo.industry}
            onValueChange={(val) => update({ industry: val as Industry })}
          >
            <SelectTrigger id="industry">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind.value} value={ind.value}>
                  {ind.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="apiKey">Rokt API Key</Label>
        <Input
          id="apiKey"
          placeholder="YOUR_ROKT_API_KEY"
          value={clientInfo.apiKey}
          onChange={(e) => update({ apiKey: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Leave blank to use a placeholder in the generated guide.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Brief Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Describe the client and their use case to help personalize the guide..."
          value={clientInfo.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );
}
