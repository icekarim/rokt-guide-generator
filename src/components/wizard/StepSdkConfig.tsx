"use client";

import { useWizard } from "@/context/WizardContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";

export default function StepSdkConfig() {
  const { state, dispatch } = useWizard();
  const { sdkConfig, integrationType, clientInfo } = state;

  const update = (payload: Partial<typeof sdkConfig>) =>
    dispatch({ type: "SET_SDK_CONFIG", payload });

  const showKeySecret =
    integrationType &&
    ["ios", "android", "flutter", "react-native"].includes(integrationType);

  const showCookiePrefs =
    integrationType &&
    ["web", "gtm", "adobe"].includes(integrationType);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rokt-beetroot/10 text-rokt-beetroot">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">SDK Configuration</h2>
          <p className="text-sm text-rokt-gray-800">
            Configure the SDK settings for{" "}
            {clientInfo.companyName || "your client"}.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-rokt-gray-300 p-4">
        <div>
          <Label className="text-sm font-medium">Environment</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {sdkConfig.environment === "development"
              ? "Testing mode - no production data collected"
              : "Live mode - collecting real customer data"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Dev</span>
          <Switch
            checked={sdkConfig.environment === "production"}
            onCheckedChange={(checked) =>
              update({ environment: checked ? "production" : "development" })
            }
          />
          <span className="text-xs text-muted-foreground">Prod</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="firstPartyDomain">First-Party Domain (optional)</Label>
        <Input
          id="firstPartyDomain"
          placeholder={`e.g. rkt.${(clientInfo.companyName || "company").toLowerCase().replace(/\s/g, "")}.com`}
          value={sdkConfig.firstPartyDomain}
          onChange={(e) => update({ firstPartyDomain: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Routes SDK requests through the client&apos;s own domain for brand
          alignment and improved cookie reliability.
        </p>
      </div>

      {showKeySecret && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sdkKey">SDK Key</Label>
            <Input
              id="sdkKey"
              placeholder="your-key"
              value={clientInfo.keyAndSecret?.key || ""}
              onChange={(e) =>
                dispatch({
                  type: "SET_CLIENT_INFO",
                  payload: {
                    keyAndSecret: {
                      key: e.target.value,
                      secret: clientInfo.keyAndSecret?.secret || "",
                    },
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sdkSecret">SDK Secret</Label>
            <Input
              id="sdkSecret"
              placeholder="your-secret"
              value={clientInfo.keyAndSecret?.secret || ""}
              onChange={(e) =>
                dispatch({
                  type: "SET_CLIENT_INFO",
                  payload: {
                    keyAndSecret: {
                      key: clientInfo.keyAndSecret?.key || "",
                      secret: e.target.value,
                    },
                  },
                })
              }
            />
          </div>
        </div>
      )}

      {showCookiePrefs && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Cookie Preferences</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-white p-3">
              <div>
                <p className="text-sm">Functional Cookies</p>
                <p className="text-xs text-muted-foreground">
                  Enhance personalization and checkout experiences
                </p>
              </div>
              <Switch
                checked={sdkConfig.functionalCookies}
                onCheckedChange={(checked) =>
                  update({ functionalCookies: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white p-3">
              <div>
                <p className="text-sm">Targeting Cookies</p>
                <p className="text-xs text-muted-foreground">
                  Enable advertising and retargeting
                </p>
              </div>
              <Switch
                checked={sdkConfig.targetingCookies}
                onCheckedChange={(checked) =>
                  update({ targetingCookies: checked })
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
