import { writeFileSync } from "fs";
import {
  GUIDE_STYLES,
  renderGuideBody,
  escapeHtml,
  type GuideContent,
} from "../src/lib/pdf-template";

const BASE_URL = "http://localhost:3000";

const commonPayload = {
  clientInfo: {
    companyName: "Acme Corp",
    apiKey: "rokt-api-key-abc123def456",
    keyAndSecret: { key: "sdk-key-xyz789", secret: "sdk-secret-000111" },
    industry: "ecommerce",
    description:
      "Acme Corp is a leading online retailer specializing in home goods and lifestyle products, serving over 2 million customers monthly across the US and UK.",
  },
  sdkConfig: {
    environment: "development",
    firstPartyDomain: "acmecorp.com",
    functionalCookies: true,
    targetingCookies: true,
  },
  identitySetup: {
    emailFormat: "raw",
    identityTriggers: ["login", "purchase"],
    customTrigger: "",
    sampleEmail: "jenny.smith@acmecorp.com",
  },
  userAttributes: [
    { key: "firstname", exampleValue: "Jenny", enabled: true, isCustom: false },
    { key: "lastname", exampleValue: "Smith", enabled: true, isCustom: false },
    { key: "mobile", exampleValue: "3125551515", enabled: true, isCustom: false },
    { key: "age", exampleValue: "33", enabled: false, isCustom: false },
    { key: "city", exampleValue: "Brooklyn", enabled: true, isCustom: false },
    { key: "state", exampleValue: "NY", enabled: true, isCustom: false },
    { key: "zip", exampleValue: "11201", enabled: true, isCustom: false },
    { key: "language", exampleValue: "en", enabled: true, isCustom: false },
    { key: "value", exampleValue: "52.25", enabled: true, isCustom: false },
    { key: "loyaltyTier", exampleValue: "Gold", enabled: true, isCustom: true },
  ],
  eventTracking: {
    events: [
      { id: "1", name: "page_view", description: "All page views", type: "page_view" },
      { id: "2", name: "sign_in", description: "User signs in", type: "custom" },
      { id: "3", name: "sign_up", description: "User registers", type: "custom" },
      { id: "4", name: "search", description: "Searching for products", type: "custom" },
      { id: "5", name: "add_to_cart", description: "Item added to cart", type: "commerce" },
      { id: "6", name: "begin_checkout", description: "Checkout started", type: "commerce" },
      { id: "7", name: "purchase", description: "Order completed", type: "commerce" },
    ],
    pageViewExample: "confirmation_page",
    customEventName: "sign_in",
    customEventAttribute: { key: "loyaltyTier", value: "Gold" },
    commerceEnabled: true,
    commerceProduct: { name: "Ergonomic Desk Lamp", sku: "LAMP-2024", price: "49.99", quantity: "1" },
    commerceTransaction: { id: "TXN-78901", revenue: "49.99", tax: "4.25" },
  },
  placementConfig: {
    pageIdentifier: "confirmation_page",
    attributes: [
      { key: "email", exampleValue: "jenny.smith@acmecorp.com" },
      { key: "firstname", exampleValue: "Jenny" },
      { key: "lastname", exampleValue: "Smith" },
      { key: "confirmationref", exampleValue: "ORD-78901" },
      { key: "billingzipcode", exampleValue: "11201" },
      { key: "amount", exampleValue: "49.99" },
      { key: "paymenttype", exampleValue: "VISA" },
      { key: "ccbin", exampleValue: "411124" },
      { key: "currency", exampleValue: "USD" },
      { key: "country", exampleValue: "US" },
      { key: "language", exampleValue: "en" },
    ],
    triggeringRules: "Trigger after purchase confirmation once user and transaction context are available.",
  },
};

const allIntegrationConfigs = [
  { type: "web", platformOptions: { appType: "spa" } },
  { type: "ios", platformOptions: { iosLanguage: "swift", packageManager: "spm" } },
  { type: "android", platformOptions: { androidLanguage: "kotlin", gradleType: "kts" } },
  { type: "flutter", platformOptions: { flutterTargets: ["ios", "android", "web"] } },
  { type: "react-native", platformOptions: { iosLinking: "dynamic" } },
  { type: "gtm", platformOptions: { appType: "mpa" } },
  { type: "tealium", platformOptions: { tealiumPages: ["bag", "checkout", "confirmation"] } },
  { type: "adobe", platformOptions: { appType: "spa" } },
];

const filterArg = process.argv[2];
const integrationConfigs = filterArg
  ? allIntegrationConfigs.filter((c) => c.type === filterArg)
  : allIntegrationConfigs;

const labels: Record<string, string> = {
  web: "Web SDK",
  ios: "iOS SDK",
  android: "Android SDK",
  flutter: "Flutter SDK",
  "react-native": "React Native SDK",
  gtm: "Google Tag Manager",
  tealium: "Tealium",
  adobe: "Adobe Experience Platform",
};

async function generateForType(config: (typeof integrationConfigs)[number]) {
  const payload = {
    ...commonPayload,
    integrationType: config.type,
    platformOptions: config.platformOptions,
  };

  console.log(`  Generating: ${labels[config.type]}...`);
  const start = Date.now();

  try {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`  FAILED ${config.type}: ${res.status} — ${err}`);
      return null;
    }

    const data = await res.json();
    console.log(`  Done: ${labels[config.type]} (${((Date.now() - start) / 1000).toFixed(1)}s)`);
    return { type: config.type, content: data.content as GuideContent };
  } catch (err) {
    console.error(`  FAILED ${config.type}: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

async function main() {
  console.log(`Generating guides for ${integrationConfigs.length} integration type(s)...\n`);

  const results = await Promise.all(integrationConfigs.map((cfg) => generateForType(cfg)));
  const successful = results.filter(
    (r): r is { type: string; content: GuideContent } => r !== null
  );
  console.log(`\n${successful.length}/${integrationConfigs.length} guides generated.`);

  const tocLinks = successful
    .map(
      (r) =>
        `<a href="#${r.type}" style="display:inline-block;padding:8px 16px;margin:4px;background:#000;color:#FFF;text-decoration:none;border-radius:4px;font-size:12px;font-family:'Archivo',sans-serif">${escapeHtml(labels[r.type])}</a>`
    )
    .join("\n");

  const guideSections = successful
    .map(
      (r) => `
    <div style="page-break-before:always;margin-top:48px" id="${r.type}">
      ${renderGuideBody(r.content)}
    </div>`
    )
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Rokt Guide Generator — All Integration Previews</title>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Roboto+Mono:wght@400&display=swap" rel="stylesheet">
  <style>
    ${GUIDE_STYLES}

    /* Preview-specific overrides */
    body { max-width: 900px; margin: 0 auto; padding: 30px; }
    @media print { body { max-width: 100%; } }
    .header-bar { margin: 0 -30px 28px -30px; }
  </style>
</head>
<body>
  <div style="text-align:center;padding:40px 0 30px">
    <h1 style="border-bottom:none;margin-bottom:8px">Rokt Guide Generator — Preview</h1>
    <p style="color:#6E6E73;font-size:13px;margin-bottom:24px">All 8 integration types with dummy values (Acme Corp)</p>
    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px">
      ${tocLinks}
    </div>
  </div>
  ${guideSections}
  <div style="margin-top:40px;padding:16px 0;border-top:1px solid #E0E0E4;text-align:center;font-family:'Roboto Mono',monospace;font-size:9px;color:#86868b">
    Generated ${new Date().toISOString().slice(0, 10)} — Preview only
  </div>
</body>
</html>`;

  const outPath = "preview-all-integrations.html";
  writeFileSync(outPath, html, "utf-8");
  console.log(`\nPreview saved to: ${outPath}`);
  console.log("Open it in a browser to review all guides.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
