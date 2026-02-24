export type IntegrationType =
  | "web"
  | "ios"
  | "android"
  | "flutter"
  | "react-native"
  | "gtm"
  | "tealium"
  | "adobe";

export type Industry =
  | "ecommerce"
  | "travel"
  | "entertainment"
  | "finance"
  | "other";

export type AppType = "spa" | "mpa";
export type IOSLanguage = "swift" | "objc";
export type AndroidLanguage = "java" | "kotlin";
export type GradleType = "groovy" | "kts";
export type PackageManager = "cocoapods" | "spm";
export type IOSLinking = "static" | "dynamic";
export type EmailFormat = "raw" | "hashed" | "both";
export type Environment = "development" | "production";

export interface PlatformOptions {
  appType?: AppType;
  iosLanguage?: IOSLanguage;
  androidLanguage?: AndroidLanguage;
  gradleType?: GradleType;
  packageManager?: PackageManager;
  iosLinking?: IOSLinking;
  flutterTargets?: ("ios" | "android" | "web")[];
  tealiumPages?: ("bag" | "checkout" | "confirmation")[];
}

export interface ClientInfo {
  companyName: string;
  apiKey: string;
  keyAndSecret?: { key: string; secret: string };
  industry: Industry;
  description: string;
}

export interface SdkConfig {
  environment: Environment;
  firstPartyDomain: string;
  functionalCookies: boolean;
  targetingCookies: boolean;
}

export interface IdentitySetup {
  emailFormat: EmailFormat;
  identityTriggers: string[];
  customTrigger: string;
  sampleEmail: string;
}

export interface UserAttribute {
  key: string;
  exampleValue: string;
  enabled: boolean;
  isCustom: boolean;
}

export interface EventRow {
  id: string;
  name: string;
  description: string;
  type: "page_view" | "custom" | "commerce";
}

export interface EventTracking {
  events: EventRow[];
  pageViewExample: string;
  customEventName: string;
  customEventAttribute: { key: string; value: string };
  commerceEnabled: boolean;
  commerceProduct: {
    name: string;
    sku: string;
    price: string;
    quantity: string;
  };
  commerceTransaction: {
    id: string;
    revenue: string;
    tax: string;
  };
}

export interface PlacementAttribute {
  key: string;
  exampleValue: string;
}

export interface PlacementConfig {
  pageIdentifier: string;
  attributes: PlacementAttribute[];
  triggeringRules: string;
}

export interface WizardState {
  currentStep: number;
  clientInfo: ClientInfo;
  integrationType: IntegrationType | null;
  platformOptions: PlatformOptions;
  sdkConfig: SdkConfig;
  identitySetup: IdentitySetup;
  userAttributes: UserAttribute[];
  eventTracking: EventTracking;
  placementConfig: PlacementConfig;
  isGenerating: boolean;
  generatedPdfUrl: string | null;
}

export const DEFAULT_USER_ATTRIBUTES: UserAttribute[] = [
  { key: "firstname", exampleValue: "Jenny", enabled: true, isCustom: false },
  { key: "lastname", exampleValue: "Smith", enabled: true, isCustom: false },
  { key: "mobile", exampleValue: "3125551515", enabled: true, isCustom: false },
  { key: "age", exampleValue: "33", enabled: false, isCustom: false },
  { key: "dob", exampleValue: "19900717", enabled: false, isCustom: false },
  { key: "gender", exampleValue: "F", enabled: false, isCustom: false },
  { key: "city", exampleValue: "Brooklyn", enabled: false, isCustom: false },
  { key: "state", exampleValue: "NY", enabled: false, isCustom: false },
  { key: "zip", exampleValue: "11201", enabled: false, isCustom: false },
  { key: "title", exampleValue: "Ms", enabled: false, isCustom: false },
  { key: "language", exampleValue: "en", enabled: false, isCustom: false },
  { key: "value", exampleValue: "52.25", enabled: false, isCustom: false },
  { key: "predictedltv", exampleValue: "136.23", enabled: false, isCustom: false },
];

export const DEFAULT_EVENTS: EventRow[] = [
  { id: "1", name: "page_view", description: "All page views", type: "page_view" },
  { id: "2", name: "sign_in", description: "User signs in", type: "custom" },
  { id: "3", name: "sign_up", description: "User registers", type: "custom" },
  { id: "4", name: "search", description: "Searching for products", type: "custom" },
  { id: "5", name: "add_to_cart", description: "Item added to cart", type: "commerce" },
  { id: "6", name: "begin_checkout", description: "Checkout started", type: "commerce" },
  { id: "7", name: "purchase", description: "Order completed", type: "commerce" },
];

export const DEFAULT_PLACEMENT_ATTRIBUTES: PlacementAttribute[] = [
  { key: "email", exampleValue: "guest@example.com" },
  { key: "firstname", exampleValue: "Jenny" },
  { key: "lastname", exampleValue: "Smith" },
  { key: "confirmationref", exampleValue: "ORD-12345" },
  { key: "billingzipcode", exampleValue: "90210" },
  { key: "amount", exampleValue: "100.00" },
  { key: "paymenttype", exampleValue: "VISA" },
  { key: "ccbin", exampleValue: "411124" },
  { key: "currency", exampleValue: "USD" },
  { key: "country", exampleValue: "US" },
  { key: "language", exampleValue: "en" },
];

export const INITIAL_WIZARD_STATE: WizardState = {
  currentStep: 0,
  clientInfo: {
    companyName: "",
    apiKey: "",
    keyAndSecret: { key: "", secret: "" },
    industry: "ecommerce",
    description: "",
  },
  integrationType: null,
  platformOptions: {},
  sdkConfig: {
    environment: "development",
    firstPartyDomain: "",
    functionalCookies: true,
    targetingCookies: true,
  },
  identitySetup: {
    emailFormat: "raw",
    identityTriggers: ["login", "purchase"],
    customTrigger: "",
    sampleEmail: "guest@example.com",
  },
  userAttributes: [...DEFAULT_USER_ATTRIBUTES],
  eventTracking: {
    events: [...DEFAULT_EVENTS],
    pageViewExample: "confirmation_page",
    customEventName: "sign_in",
    customEventAttribute: { key: "loyaltyTier", value: "Gold" },
    commerceEnabled: true,
    commerceProduct: {
      name: "Product Name",
      sku: "SKU-001",
      price: "34.99",
      quantity: "1",
    },
    commerceTransaction: {
      id: "TXN-12345",
      revenue: "34.99",
      tax: "3.00",
    },
  },
  placementConfig: {
    pageIdentifier: "",
    attributes: [...DEFAULT_PLACEMENT_ATTRIBUTES],
    triggeringRules:
      "Trigger after purchase confirmation once user and transaction context are available.",
  },
  isGenerating: false,
  generatedPdfUrl: null,
};

export const INTEGRATION_LABELS: Record<IntegrationType, string> = {
  web: "Web SDK",
  ios: "iOS SDK",
  android: "Android SDK",
  flutter: "Flutter SDK",
  "react-native": "React Native SDK",
  gtm: "Google Tag Manager",
  tealium: "Tealium",
  adobe: "Adobe Experience Platform",
};

export const STEP_LABELS = [
  "Client Info",
  "Integration Type",
  "SDK Config",
  "Identity",
  "Set User Attributes",
  "Events",
  "Placements",
  "Review & Generate",
];

export const TOTAL_STEPS = STEP_LABELS.length;
