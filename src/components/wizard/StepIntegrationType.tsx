"use client";

import { useWizard } from "@/context/WizardContext";
import { IntegrationType, INTEGRATION_LABELS, AppType, IOSLanguage, AndroidLanguage, GradleType, PackageManager, IOSLinking } from "@/types/wizard";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Globe, Smartphone, TabletSmartphone, Layers, Code2, Tag, BarChart3, Palette } from "lucide-react";
import { Blocks } from "lucide-react";

const PLATFORM_ICONS: Record<IntegrationType, React.ReactNode> = {
  web: <Globe className="h-5 w-5" />,
  ios: <Smartphone className="h-5 w-5" />,
  android: <TabletSmartphone className="h-5 w-5" />,
  flutter: <Layers className="h-5 w-5" />,
  "react-native": <Code2 className="h-5 w-5" />,
  gtm: <Tag className="h-5 w-5" />,
  tealium: <BarChart3 className="h-5 w-5" />,
  adobe: <Palette className="h-5 w-5" />,
};

export default function StepIntegrationType() {
  const { state, dispatch } = useWizard();

  const selectPlatform = (platform: IntegrationType) => {
    dispatch({ type: "SET_INTEGRATION_TYPE", payload: platform });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rokt-beetroot/10 text-rokt-beetroot">
          <Blocks className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Integration Type</h2>
          <p className="text-sm text-rokt-gray-800">
            Select the platform for this integration guide.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.keys(INTEGRATION_LABELS) as IntegrationType[]).map(
          (platform) => (
            <button
              key={platform}
              onClick={() => selectPlatform(platform)}
              className={cn(
                "flex flex-col items-center gap-2.5 rounded-xl border p-4 transition-colors cursor-pointer",
                state.integrationType === platform
                  ? "border-rokt-beetroot bg-rokt-beetroot/[0.03]"
                  : "border-rokt-gray-600 hover:border-rokt-gray-900/30 bg-white"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  state.integrationType === platform
                    ? "bg-rokt-beetroot text-white"
                    : "bg-rokt-gray-300 text-rokt-gray-900"
                )}
              >
                {PLATFORM_ICONS[platform]}
              </div>
              <span className="text-xs font-medium text-center leading-tight">
                {INTEGRATION_LABELS[platform]}
              </span>
            </button>
          )
        )}
      </div>

      {state.integrationType && (
        <PlatformSubOptions platform={state.integrationType} />
      )}
    </div>
  );
}

function PlatformSubOptions({ platform }: { platform: IntegrationType }) {
  const { state, dispatch } = useWizard();
  const opts = state.platformOptions;

  const update = (payload: Partial<typeof opts>) =>
    dispatch({ type: "SET_PLATFORM_OPTIONS", payload });

  switch (platform) {
    case "web":
    case "gtm":
    case "adobe":
      return (
        <div className="rounded-xl bg-rokt-gray-300 p-4 space-y-3">
          <Label className="text-sm font-medium">Application Type</Label>
          <RadioGroup
            value={opts.appType || "mpa"}
            onValueChange={(val) => update({ appType: val as AppType })}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="mpa" id="mpa" />
              <Label htmlFor="mpa" className="text-sm cursor-pointer">Multi-Page App (MPA)</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="spa" id="spa" />
              <Label htmlFor="spa" className="text-sm cursor-pointer">Single-Page App (SPA)</Label>
            </div>
          </RadioGroup>
        </div>
      );

    case "ios":
      return (
        <div className="rounded-xl bg-rokt-gray-300 p-4 space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Language</Label>
            <RadioGroup
              value={opts.iosLanguage || "swift"}
              onValueChange={(val) => update({ iosLanguage: val as IOSLanguage })}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="swift" id="swift" />
                <Label htmlFor="swift" className="text-sm cursor-pointer">Swift</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="objc" id="objc" />
                <Label htmlFor="objc" className="text-sm cursor-pointer">Objective-C</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Package Manager</Label>
            <RadioGroup
              value={opts.packageManager || "cocoapods"}
              onValueChange={(val) => update({ packageManager: val as PackageManager })}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="cocoapods" id="cocoapods" />
                <Label htmlFor="cocoapods" className="text-sm cursor-pointer">CocoaPods</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="spm" id="spm" />
                <Label htmlFor="spm" className="text-sm cursor-pointer">Swift Package Manager</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      );

    case "android":
      return (
        <div className="rounded-xl bg-rokt-gray-300 p-4 space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Language</Label>
            <RadioGroup
              value={opts.androidLanguage || "kotlin"}
              onValueChange={(val) => update({ androidLanguage: val as AndroidLanguage })}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="kotlin" id="kotlin" />
                <Label htmlFor="kotlin" className="text-sm cursor-pointer">Kotlin</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="java" id="java" />
                <Label htmlFor="java" className="text-sm cursor-pointer">Java</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Gradle Type</Label>
            <RadioGroup
              value={opts.gradleType || "kts"}
              onValueChange={(val) => update({ gradleType: val as GradleType })}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="kts" id="kts" />
                <Label htmlFor="kts" className="text-sm cursor-pointer">build.gradle.kts</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="groovy" id="groovy" />
                <Label htmlFor="groovy" className="text-sm cursor-pointer">build.gradle</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      );

    case "flutter":
      return (
        <div className="rounded-xl bg-rokt-gray-300 p-4 space-y-3">
          <Label className="text-sm font-medium">Target Platforms</Label>
          <div className="flex gap-4">
            {(["ios", "android", "web"] as const).map((t) => (
              <div key={t} className="flex items-center gap-2">
                <Checkbox
                  id={`flutter-${t}`}
                  checked={(opts.flutterTargets || ["ios", "android"]).includes(t)}
                  onCheckedChange={(checked) => {
                    const current = opts.flutterTargets || ["ios", "android"];
                    const next = checked
                      ? [...current, t]
                      : current.filter((x) => x !== t);
                    update({ flutterTargets: next as ("ios" | "android" | "web")[] });
                  }}
                />
                <Label htmlFor={`flutter-${t}`} className="text-sm capitalize cursor-pointer">
                  {t}
                </Label>
              </div>
            ))}
          </div>
        </div>
      );

    case "react-native":
      return (
        <div className="rounded-xl bg-rokt-gray-300 p-4 space-y-3">
          <Label className="text-sm font-medium">iOS Framework Linking</Label>
          <RadioGroup
            value={opts.iosLinking || "static"}
            onValueChange={(val) => update({ iosLinking: val as IOSLinking })}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="static" id="static" />
              <Label htmlFor="static" className="text-sm cursor-pointer">Static Libraries (default)</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="dynamic" id="dynamic" />
              <Label htmlFor="dynamic" className="text-sm cursor-pointer">Dynamic Frameworks</Label>
            </div>
          </RadioGroup>
        </div>
      );

    case "tealium":
      return (
        <div className="rounded-xl bg-rokt-gray-300 p-4 space-y-3">
          <Label className="text-sm font-medium">Pages to Trigger Placements</Label>
          <div className="flex gap-4">
            {(["bag", "checkout", "confirmation"] as const).map((page) => (
              <div key={page} className="flex items-center gap-2">
                <Checkbox
                  id={`tealium-${page}`}
                  checked={(opts.tealiumPages || ["confirmation"]).includes(page)}
                  onCheckedChange={(checked) => {
                    const current = opts.tealiumPages || ["confirmation"];
                    const next = checked
                      ? [...current, page]
                      : current.filter((x) => x !== page);
                    update({ tealiumPages: next as ("bag" | "checkout" | "confirmation")[] });
                  }}
                />
                <Label htmlFor={`tealium-${page}`} className="text-sm capitalize cursor-pointer">
                  {page}
                </Label>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}
