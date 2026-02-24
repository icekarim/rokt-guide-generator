"use client";

import { useWizard } from "@/context/WizardContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlacementAttribute } from "@/types/wizard";
import { LayoutTemplate, Plus, X } from "lucide-react";

export default function StepPlacements() {
  const { state, dispatch } = useWizard();
  const { placementConfig, clientInfo } = state;

  const update = (payload: Partial<typeof placementConfig>) =>
    dispatch({ type: "SET_PLACEMENT_CONFIG", payload });

  const updateAttr = (index: number, partial: Partial<PlacementAttribute>) => {
    const next = [...placementConfig.attributes];
    next[index] = { ...next[index], ...partial };
    update({ attributes: next });
  };

  const addAttr = () => {
    update({
      attributes: [
        ...placementConfig.attributes,
        { key: "", exampleValue: "" },
      ],
    });
  };

  const removeAttr = (index: number) => {
    update({
      attributes: placementConfig.attributes.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rokt-beetroot/10 text-rokt-beetroot">
          <LayoutTemplate className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Placement Configuration</h2>
          <p className="text-sm text-rokt-gray-800">
            Configure the placement that renders offers for{" "}
            {clientInfo.companyName || "your client"}.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pageIdentifier">Page Identifier</Label>
        <Input
          id="pageIdentifier"
          placeholder={`e.g. ${(clientInfo.companyName || "client").toLowerCase().replace(/\s/g, "")}.confirmation`}
          value={placementConfig.pageIdentifier}
          onChange={(e) => update({ pageIdentifier: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Uniquely identifies the page where the Rokt placement appears.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="triggeringRules">Triggering Rules</Label>
        <Textarea
          id="triggeringRules"
          placeholder="e.g. Trigger after purchase confirmation once user and transaction context are available."
          value={placementConfig.triggeringRules}
          onChange={(e) => update({ triggeringRules: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Placement Attributes</Label>
        <p className="text-xs text-muted-foreground">
          These attributes are passed to Rokt when requesting a placement.
        </p>
        <div className="grid gap-2">
          {placementConfig.attributes.map((attr, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl bg-rokt-gray-300 p-2.5">
              <Input
                className="h-8 text-sm font-mono flex-1"
                placeholder="Attribute key"
                value={attr.key}
                onChange={(e) => updateAttr(i, { key: e.target.value })}
              />
              <Input
                className="h-8 text-sm flex-1"
                placeholder="Example value"
                value={attr.exampleValue}
                onChange={(e) =>
                  updateAttr(i, { exampleValue: e.target.value })
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => removeAttr(i)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addAttr}>
          <Plus className="h-4 w-4 mr-1" />
          Add Attribute
        </Button>
      </div>
    </div>
  );
}
