import { IntegrationType } from "@/types/wizard";
import { WEB_TEMPLATE } from "./web";
import { IOS_TEMPLATE } from "./ios";
import { ANDROID_TEMPLATE } from "./android";
import { FLUTTER_TEMPLATE } from "./flutter";
import { REACT_NATIVE_TEMPLATE } from "./react-native";
import { GTM_TEMPLATE } from "./gtm";
import { TEALIUM_TEMPLATE } from "./tealium";
import { ADOBE_TEMPLATE } from "./adobe";

export const TEMPLATES: Record<IntegrationType, string> = {
  web: WEB_TEMPLATE,
  ios: IOS_TEMPLATE,
  android: ANDROID_TEMPLATE,
  flutter: FLUTTER_TEMPLATE,
  "react-native": REACT_NATIVE_TEMPLATE,
  gtm: GTM_TEMPLATE,
  tealium: TEALIUM_TEMPLATE,
  adobe: ADOBE_TEMPLATE,
};

export function getTemplate(type: IntegrationType): string {
  return TEMPLATES[type];
}
