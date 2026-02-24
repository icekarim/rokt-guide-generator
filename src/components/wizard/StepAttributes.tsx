"use client";

import { useWizard } from "@/context/WizardContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { UserAttribute } from "@/types/wizard";
import { ListChecks, Plus, X } from "lucide-react";

export default function StepAttributes() {
  const { state, dispatch } = useWizard();
  const attrs = state.userAttributes;

  const setAttrs = (next: UserAttribute[]) =>
    dispatch({ type: "SET_USER_ATTRIBUTES", payload: next });

  const toggleAttr = (index: number, enabled: boolean) => {
    const next = [...attrs];
    next[index] = { ...next[index], enabled };
    setAttrs(next);
  };

  const updateValue = (index: number, exampleValue: string) => {
    const next = [...attrs];
    next[index] = { ...next[index], exampleValue };
    setAttrs(next);
  };

  const addCustom = () => {
    setAttrs([
      ...attrs,
      { key: "", exampleValue: "", enabled: true, isCustom: true },
    ]);
  };

  const updateCustomKey = (index: number, key: string) => {
    const next = [...attrs];
    next[index] = { ...next[index], key };
    setAttrs(next);
  };

  const removeCustom = (index: number) => {
    setAttrs(attrs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rokt-beetroot/10 text-rokt-beetroot">
          <ListChecks className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Set User Attributes <span className="text-sm font-normal text-rokt-gray-800">(optional)</span></h2>
          <p className="text-sm text-rokt-gray-800">
            Select the attributes to include in the integration guide. If none are selected, this section will be omitted.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Standard Attributes</Label>
        <div className="grid gap-2">
          {attrs
            .filter((a) => !a.isCustom)
            .map((attr, _) => {
              const realIndex = attrs.indexOf(attr);
              return (
                <div
                  key={attr.key}
                  className="flex items-center gap-3 rounded-xl bg-rokt-gray-300 p-2.5"
                >
                  <Checkbox
                    checked={attr.enabled}
                    onCheckedChange={(checked) =>
                      toggleAttr(realIndex, !!checked)
                    }
                  />
                  <span className="text-sm font-mono w-28 shrink-0">
                    {attr.key}
                  </span>
                  <Input
                    className="h-8 text-sm"
                    placeholder="Example value"
                    value={attr.exampleValue}
                    onChange={(e) => updateValue(realIndex, e.target.value)}
                    disabled={!attr.enabled}
                  />
                </div>
              );
            })}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Custom Attributes</Label>
        <div className="grid gap-2">
          {attrs
            .filter((a) => a.isCustom)
            .map((attr) => {
              const realIndex = attrs.indexOf(attr);
              return (
                <div
                  key={realIndex}
                  className="flex items-center gap-2 rounded-xl bg-rokt-gray-300 p-2.5"
                >
                  <Input
                    className="h-8 text-sm font-mono"
                    placeholder="Attribute key"
                    value={attr.key}
                    onChange={(e) => updateCustomKey(realIndex, e.target.value)}
                  />
                  <Input
                    className="h-8 text-sm"
                    placeholder="Example value"
                    value={attr.exampleValue}
                    onChange={(e) => updateValue(realIndex, e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removeCustom(realIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
        </div>
        <Button variant="outline" size="sm" onClick={addCustom}>
          <Plus className="h-4 w-4 mr-1" />
          Add Custom Attribute
        </Button>
      </div>
    </div>
  );
}
