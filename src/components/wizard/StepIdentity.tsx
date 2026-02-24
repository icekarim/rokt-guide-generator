"use client";

import { useWizard } from "@/context/WizardContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { EmailFormat } from "@/types/wizard";
import { UserCheck } from "lucide-react";

const TRIGGERS = [
  { id: "login", label: "Login" },
  { id: "signup", label: "Sign Up" },
  { id: "purchase", label: "Purchase Completion" },
];

export default function StepIdentity() {
  const { state, dispatch } = useWizard();
  const { identitySetup } = state;

  const update = (payload: Partial<typeof identitySetup>) =>
    dispatch({ type: "SET_IDENTITY_SETUP", payload });

  const toggleTrigger = (triggerId: string, checked: boolean) => {
    const current = identitySetup.identityTriggers;
    const next = checked
      ? [...current, triggerId]
      : current.filter((t) => t !== triggerId);
    update({ identityTriggers: next });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rokt-beetroot/10 text-rokt-beetroot">
          <UserCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Identity Setup</h2>
          <p className="text-sm text-rokt-gray-800">
            Configure how users are identified in the integration.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Email Format</Label>
        <RadioGroup
          value={identitySetup.emailFormat}
          onValueChange={(val) => update({ emailFormat: val as EmailFormat })}
          className="grid grid-cols-3 gap-3"
        >
          {([
            { value: "raw", label: "Raw Email", desc: "Plain text email address" },
            { value: "hashed", label: "SHA256 Hashed", desc: "Pre-hashed email" },
            { value: "both", label: "Both", desc: "Raw + hashed in code" },
          ] as const).map((opt) => (
            <label
              key={opt.value}
              htmlFor={`email-${opt.value}`}
              className="flex flex-col items-center gap-1 rounded-xl border border-rokt-gray-600 p-3 cursor-pointer hover:bg-rokt-gray-300 has-[[data-state=checked]]:border-rokt-beetroot has-[[data-state=checked]]:bg-rokt-beetroot/[0.03]"
            >
              <RadioGroupItem value={opt.value} id={`email-${opt.value}`} />
              <span className="text-xs font-medium">{opt.label}</span>
              <span className="text-[10px] text-muted-foreground text-center">
                {opt.desc}
              </span>
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">
          When to Trigger Identify
        </Label>
        <div className="flex flex-wrap gap-4">
          {TRIGGERS.map((trigger) => (
            <div key={trigger.id} className="flex items-center gap-2">
              <Checkbox
                id={trigger.id}
                checked={identitySetup.identityTriggers.includes(trigger.id)}
                onCheckedChange={(checked) =>
                  toggleTrigger(trigger.id, !!checked)
                }
              />
              <Label htmlFor={trigger.id} className="text-sm cursor-pointer">
                {trigger.label}
              </Label>
            </div>
          ))}
        </div>
        <Input
          placeholder="Custom trigger (optional), e.g. 'Joins Rewards Program'"
          value={identitySetup.customTrigger}
          onChange={(e) => update({ customTrigger: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sampleEmail">Sample Email for Code Example</Label>
        <Input
          id="sampleEmail"
          placeholder="guest@example.com"
          value={identitySetup.sampleEmail}
          onChange={(e) => update({ sampleEmail: e.target.value })}
        />
      </div>
    </div>
  );
}
