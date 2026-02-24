import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  IntegrationType,
  INTEGRATION_LABELS,
  ClientInfo,
  PlatformOptions,
  SdkConfig,
  IdentitySetup,
  UserAttribute,
  EventTracking,
  PlacementConfig,
} from "@/types/wizard";
import { getTemplate } from "@/lib/integration-templates";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface GenerateRequest {
  clientInfo: ClientInfo;
  integrationType: IntegrationType;
  platformOptions: PlatformOptions;
  sdkConfig: SdkConfig;
  identitySetup: IdentitySetup;
  userAttributes: UserAttribute[];
  eventTracking: EventTracking;
  placementConfig: PlacementConfig;
}

export interface GuideSection {
  title: string;
  prose: string;
  triggeringRules?: string;
  codeBlocks: { language: string; code: string }[];
}

export interface GuideContent {
  title: string;
  sections: GuideSection[];
  summaryTable: {
    component: string;
    purpose: string;
    triggeringLogic: string;
    requirementLevel: string;
  }[];
}

function buildCommonContext(req: GenerateRequest) {
  const platformLabel = INTEGRATION_LABELS[req.integrationType];
  const template = getTemplate(req.integrationType);

  const enabledAttrs = req.userAttributes
    .filter((a) => a.enabled || a.isCustom)
    .map((a) => `${a.key}: "${a.exampleValue}"`)
    .join(", ");

  const triggers = [
    ...req.identitySetup.identityTriggers,
    req.identitySetup.customTrigger,
  ]
    .filter(Boolean)
    .join(", ");

  const eventsTable = req.eventTracking.events
    .map((e) => `${e.name} | ${e.description} | ${e.type}`)
    .join("\n");

  const placementAttrs = req.placementConfig.attributes
    .map((a) => `"${a.key}": "${a.exampleValue}"`)
    .join(",\n    ");

  const apiKey = req.clientInfo.apiKey || "YOUR_ROKT_API_KEY";
  const domain = req.sdkConfig.firstPartyDomain
    ? `https://${req.sdkConfig.firstPartyDomain}`
    : "https://apps.rokt-api.com";
  const env = req.sdkConfig.environment;
  const keySecret = req.clientInfo.keyAndSecret;
  const sdkKey = keySecret?.key || "your-key";
  const sdkSecret = keySecret?.secret || "your-secret";
  const platformOpts = JSON.stringify(req.platformOptions, null, 2);

  return {
    platformLabel, template, enabledAttrs, triggers, eventsTable,
    placementAttrs, apiKey, domain, env, sdkKey, sdkSecret, platformOpts,
  };
}

function buildTealiumPrompt(req: GenerateRequest): string {
  const ctx = buildCommonContext(req);
  const tealiumPages = req.platformOptions.tealiumPages || ["confirmation"];

  const udoMappings = req.placementConfig.attributes
    .map((a) => `| utag_data.${a.key} | ${a.key} | "${a.exampleValue}" |`)
    .join("\n    ");

  const eventMappings = tealiumPages
    .map((page) => {
      const identifier = page === "bag" ? "bag_page" : page === "checkout" ? "checkout_page" : "confirmation_page";
      return `tealium_event:${page} → ${identifier}`;
    })
    .join(", ");

  return `You are writing a professional, client-facing Tealium integration guide document.
This is a TAG MANAGER integration — NOT a direct SDK integration. The entire Rokt SDK is deployed
as a single Tealium Custom Container tag. There is NO separate code to add to the website beyond
populating the data layer.

CLIENT: ${req.clientInfo.companyName}
INDUSTRY: ${req.clientInfo.industry}
DESCRIPTION: ${req.clientInfo.description || "N/A"}
PLATFORM: Tealium
API KEY: ${ctx.apiKey}
DOMAIN: ${ctx.domain}
ENVIRONMENT: ${ctx.env}
EMAIL FORMAT: ${req.identitySetup.emailFormat}
SAMPLE EMAIL: ${req.identitySetup.sampleEmail}
TEALIUM PAGES: ${tealiumPages.join(", ")}
USER ATTRIBUTES: ${ctx.enabledAttrs}
PLACEMENT ATTRIBUTES:
    ${ctx.placementAttrs}
EVENT MAPPINGS: ${eventMappings}
FUNCTIONAL COOKIES: ${req.sdkConfig.functionalCookies}
TARGETING COOKIES: ${req.sdkConfig.targetingCookies}

UDO VARIABLE MAPPINGS FOR THIS CLIENT:
    ${udoMappings}

PLATFORM TECHNICAL REFERENCE (use this to generate CORRECT code):
${ctx.template}

---

Generate a JSON object with this exact structure. Output ONLY valid JSON, no markdown fences:

{
  "title": "Rokt + ${req.clientInfo.companyName} Tealium Integration Guide",
  "sections": [
    {
      "title": "Overview",
      "prose": "2-3 sentences about how Rokt integrates with ${req.clientInfo.companyName} via Tealium. Emphasize that this is a tag-manager deployment — no direct code changes to the website are needed beyond populating the data layer. Mention that the Rokt SDK handles identity resolution, attribute collection, and real-time placements all within a single Tealium Custom Container tag. Reference ${req.clientInfo.companyName} by name and use their description for context.",
      "codeBlocks": []
    },
    {
      "title": "1. Data Layer Implementation",
      "prose": "Explain that ${req.clientInfo.companyName}'s developers must populate window.utag_data with user and transaction data on each page. List the specific variables needed for this integration. This is the ONLY code change required on ${req.clientInfo.companyName}'s website.",
      "triggeringRules": "Populate utag_data before Tealium fires on each page load",
      "codeBlocks": [{"language": "javascript", "code": "Complete window.utag_data setup with ${req.clientInfo.companyName}-specific variables and example values from the placement attributes provided. Show all relevant UDO variables populated with actual example values."}]
    },
    {
      "title": "2. View Trigger",
      "prose": "Explain how to trigger the Tealium event for each page in the funnel. The tealium_event value resolves to the destination configured in Mapped Variables. Show the utag.view() call for each of ${req.clientInfo.companyName}'s target pages: ${tealiumPages.join(", ")}.",
      "codeBlocks": [{"language": "javascript", "code": "utag.view() call(s) showing how each target page event is triggered, using actual attribute values from this client's configuration"}]
    },
    {
      "title": "3. Creating the Custom Container Tag",
      "prose": "Step-by-step instructions for creating the tag in Tealium iQ: 1) Log in to Tealium iQ, 2) Click Tags in the left navigation, 3) Click New Tag and select Tealium Custom Container, 4) Name it 'Rokt SDK', 5) Under Edit Template paste the initialization snippet below, 6) Replace api_key with the provided API key, 7) Click Save. This single script handles everything — SDK loading, identity resolution, attribute mapping, and placement triggering.",
      "codeBlocks": [{"language": "javascript", "code": "The complete Custom Container initialization snippet from the platform reference, with ${req.clientInfo.companyName}'s API key (${ctx.apiKey}) and domain (${ctx.domain}) filled in, and is_development_mode set to ${ctx.env === "development" ? "true" : "false"}. Include the FULL script — mParticle shim, u.data config, mapping code, triggerPlacement function, loader_cb with identity resolution and event-to-page mapping for ${tealiumPages.join("/")}, and the script loader. This should be a complete, paste-ready snippet."}]
    },
    {
      "title": "4. Mapped Variables Configuration",
      "prose": "In Tealium iQ, navigate to the Rokt SDK tag's Mapped Variables section. Create the following UDO variable mappings. This maps ${req.clientInfo.companyName}'s data layer variables to Rokt attributes. Include a pipe-delimited data list in the prose with columns: UDO Variable | Rokt Destination | Example Value — one row per attribute mapping for this client. Also include the event mappings: for each target page (${tealiumPages.join(", ")}), map tealium_event:<value> to the corresponding Rokt event (e.g., tealium_event:purchase → confirmation). Any UDO variable mapped to a non-predefined destination automatically becomes a custom attribute under u.data.custom.",
      "codeBlocks": []
    },
    {
      "title": "5. Identity Resolution",
      "prose": "Identity is handled automatically inside the Custom Container script. When a target event fires (${tealiumPages.join(", ")}), the loader_cb function checks if email or hashed email is present in the mapped attributes and calls mParticle.Identity.identify(). ${req.identitySetup.emailFormat === "hashed" ? "Since " + req.clientInfo.companyName + " uses hashed emails, the emailsha256 field will be used as the identity type 'Other'." : req.identitySetup.emailFormat === "both" ? "Since " + req.clientInfo.companyName + " provides both raw and hashed emails, both email and emailsha256 identity types will be used." : req.clientInfo.companyName + "'s raw email address will be used for identity resolution."} No separate identity tag or additional code is needed.",
      "codeBlocks": []
    },
    {
      "title": "6. Script Activation",
      "prose": "Under Rules & Events in Tealium iQ, configure the Rokt SDK tag to fire on all pages. The tag only triggers placements when a matching event is present in the data layer (${tealiumPages.join(", ")}). On other pages, the SDK initializes but does not show placements. This ensures the SDK is ready to fire placements immediately when a user reaches a target page.",
      "triggeringRules": "Fire the Rokt SDK tag on all pages via Tealium Rules & Events",
      "codeBlocks": []
    },
    {
      "title": "7. Testing & Validation",
      "prose": "Steps to verify the integration: 1) Ensure is_development_mode is set to true in the script's u.data section, 2) Use Tealium's Trace feature to verify the Rokt SDK tag fires on each page, 3) Open browser developer tools and check for mParticle/Rokt SDK initialization in the console, 4) Navigate through ${req.clientInfo.companyName}'s funnel and confirm placements appear on target pages (${tealiumPages.join(", ")}), 5) Verify that attributes from utag_data are correctly passed through to Rokt, 6) Once validated, set is_development_mode to false for production deployment.",
      "codeBlocks": []
    },
    {
      "title": "Key Benefits for ${req.clientInfo.companyName}",
      "prose": "5 bullet points (use bullet characters) tailored to ${req.clientInfo.companyName}, their industry, and the Tealium deployment model. Highlight benefits like: zero code changes to the site (tag-manager-only), fast deployment, centralized tag management, easy attribute mapping through the Tealium UI, and real-time personalized placements.",
      "codeBlocks": []
    },
    {
      "title": "Developer Documentation",
      "prose": "Links to relevant Rokt Tealium documentation. Include: ● https://docs.rokt.com/developers/integration-guides/getting-started/ecommerce/tag-managers/tealium — Tealium Integration Guide. Format as bullet list.",
      "codeBlocks": []
    }
  ],
  "summaryTable": [
    {"component": "Data Layer (utag_data)", "purpose": "Provides user and transaction data to Tealium for the Rokt SDK", "triggeringLogic": "Populate on every page before Tealium fires", "requirementLevel": "Functional Requirement"},
    {"component": "Custom Container Tag", "purpose": "Loads and initializes the Rokt SDK, handles identity, attributes, and placements", "triggeringLogic": "Fire on all pages via Tealium Rules & Events", "requirementLevel": "Functional Requirement"},
    {"component": "Mapped Variables", "purpose": "Maps UDO variables to Rokt attributes in the Tealium UI", "triggeringLogic": "Configure in Tealium iQ for the Rokt SDK tag", "requirementLevel": "Functional Requirement"},
    {"component": "Event Mapping", "purpose": "Maps tealium_event values to Rokt page identifiers (${tealiumPages.join(", ")})", "triggeringLogic": "Configure event:value pairs in Mapped Variables", "requirementLevel": "Functional Requirement"},
    {"component": "Identity (in-script)", "purpose": "Resolves user identity via email or hashed email within the Custom Container", "triggeringLogic": "Automatic when email attribute is present on target pages", "requirementLevel": "Functional Requirement"},
    {"component": "View Trigger", "purpose": "Fires the appropriate Tealium event on funnel pages", "triggeringLogic": "Call utag.view() with tealium_event on target pages", "requirementLevel": "Functional Requirement"}
  ]
}

RULES:
- This is a TEALIUM integration — do NOT generate code for direct SDK methods like Rokt.init(), rokt.selectPlacements(), etc.
- The only code ${req.clientInfo.companyName} adds to their site is the utag_data population and utag.view() calls
- The Custom Container script is pasted into Tealium iQ, not into the website
- Use ${req.clientInfo.companyName} by name throughout the prose
- Keep prose SHORT and business-friendly (2-4 sentences per section max)
- The Custom Container code block MUST be the complete, paste-ready script from the platform reference with actual values filled in
- For the Mapped Variables section, include the full attribute mapping list in the prose using pipe-delimited rows
- For the language field in codeBlocks, always use "javascript"
- Output ONLY valid JSON. No markdown, no explanation, no code fences.`;
}

function buildGtmPrompt(req: GenerateRequest): string {
  const ctx = buildCommonContext(req);
  const appType = req.platformOptions.appType || "mpa";
  const isSpa = appType === "spa";

  const variableMappings = req.placementConfig.attributes
    .map((a) => `| ${a.key} | ${a.key} | "${a.exampleValue}" |`)
    .join("\n    ");

  return `You are writing a professional, client-facing Google Tag Manager integration guide document.
This is a TAG MANAGER integration — NOT a direct SDK integration. The Rokt SDK is deployed
using pre-built tags from the GTM Community Template Gallery. No custom JavaScript snippets are
needed on the site beyond the standard data layer.

There are two GTM tag templates:
1. "mParticle by Rokt - Initialization and Log Page View" — loads the SDK and logs page views
2. "mParticle by Rokt - Events" — handles identity, placements, and attributes

CLIENT: ${req.clientInfo.companyName}
INDUSTRY: ${req.clientInfo.industry}
DESCRIPTION: ${req.clientInfo.description || "N/A"}
PLATFORM: Google Tag Manager
APP TYPE: ${appType.toUpperCase()} (${isSpa ? "Single-Page Application" : "Multi-Page Application"})
API KEY: ${ctx.apiKey}
DOMAIN: ${ctx.domain}
ENVIRONMENT: ${ctx.env}
EMAIL FORMAT: ${req.identitySetup.emailFormat}
SAMPLE EMAIL: ${req.identitySetup.sampleEmail}
IDENTITY TRIGGERS: ${ctx.triggers}
USER ATTRIBUTES: ${ctx.enabledAttrs}
PLACEMENT ATTRIBUTES:
    ${ctx.placementAttrs}
PAGE IDENTIFIER: ${req.placementConfig.pageIdentifier}
PLACEMENT TRIGGERING RULES: ${req.placementConfig.triggeringRules}
FUNCTIONAL COOKIES: ${req.sdkConfig.functionalCookies}
TARGETING COOKIES: ${req.sdkConfig.targetingCookies}

VARIABLE MAPPINGS FOR THIS CLIENT:
    ${variableMappings}

PLATFORM TECHNICAL REFERENCE (use this to generate CORRECT configuration):
${ctx.template}

---

Generate a JSON object with this exact structure. Output ONLY valid JSON, no markdown fences:

{
  "title": "Rokt + ${req.clientInfo.companyName} Google Tag Manager Integration Guide",
  "sections": [
    {
      "title": "Overview",
      "prose": "2-3 sentences about how Rokt integrates with ${req.clientInfo.companyName} via Google Tag Manager. Emphasize that this uses pre-built GTM tags from the Community Template Gallery — no custom JavaScript is needed on the site beyond the data layer. Mention identity resolution, attribute collection, and real-time placements. Reference ${req.clientInfo.companyName} by name and use their description for context.",
      "codeBlocks": []
    },
    {
      "title": "Prerequisites",
      "prose": "List what ${req.clientInfo.companyName} needs before starting: 1) Access to the correct GTM container for their site, 2) A data layer implemented on the site by their developers, 3) Their Rokt API key (${ctx.apiKey}). Mention that the data layer is typically implemented by the site's development team.",
      "codeBlocks": []
    },
    {
      "title": "1. Data Layer Implementation",
      "prose": "Explain that ${req.clientInfo.companyName}'s developers must populate window.dataLayer with user and transaction data. This is the ONLY code change required on the website. The data layer structure determines the GTM variable names. Show how nested objects use dot notation for variable names.",
      "triggeringRules": "Populate dataLayer before GTM tags fire on each page",
      "codeBlocks": [{"language": "javascript", "code": "Complete window.dataLayer.push() example with ${req.clientInfo.companyName}-specific variables and example values from the placement attributes provided. Show a realistic data layer push with actual attribute values."}]
    },
    {
      "title": "2. Creating GTM Variables",
      "prose": "For each attribute ${req.clientInfo.companyName} wants to send to Rokt, create a Data Layer Variable in GTM: 1) Click Variables, 2) Under User-defined variables click New, 3) Choose Data Layer Variable type, 4) Enter the Data Layer Variable Name, 5) Click Save. Include a pipe-delimited data list in the prose with columns: Variable Name | Data Layer Path | Example Value — one row per variable ${req.clientInfo.companyName} should create based on their configured attributes.",
      "codeBlocks": []
    },
    {
      "title": "3. Initialization & Log Page View Tag",
      "prose": "Step-by-step setup from the Community Template Gallery: 1) Click Tags → New, 2) Select Tag Configuration → Discover more tag types in the Community Template Gallery, 3) Search for 'Rokt' and select 'mParticle by Rokt - Initialization and Log Page View', 4) Name it (e.g., '[Rokt] Initialize and Log Page Views'). Include a table of configuration settings in the prose: API Key (${ctx.apiKey}), Development Mode (${ctx.env === "development" ? "Checked" : "Unchecked"}), Log Page Views (Checked), Log Level, ${!req.sdkConfig.functionalCookies ? "Disallow Functional Cookies (Checked), " : ""}${!req.sdkConfig.targetingCookies ? "Disallow Targeting Cookies (Checked), " : ""}etc.",
      "triggeringRules": "${isSpa ? "Trigger: All Pages + History Change (SPA)" : "Trigger: All Pages (MPA)"}",
      "codeBlocks": []
    },
    {
      "title": "4. Events Tag — Identify the User",
      "prose": "Create an Events tag to identify ${req.clientInfo.companyName}'s users: 1) Create a new tag using 'mParticle by Rokt - Events' from the Community Template Gallery, 2) Name it '[Rokt] Identify user', 3) In the Identity section enable Identity, 4) Set IDSync Method to Identify, 5) Under Identity Type add a row — ${req.identitySetup.emailFormat === "hashed" ? "select 'Other' for hashed email and enter the GTM variable for hashed email" : req.identitySetup.emailFormat === "both" ? "add rows for both 'Email' (raw email variable) and 'Other' (hashed email variable)" : "select 'Email' and enter the GTM variable for email"}. ${req.identitySetup.emailFormat === "raw" ? "Optionally enable 'Hash Raw Email?' to hash before sending." : ""} Configure the trigger to fire only after initialization and when email is available.",
      "triggeringRules": "Trigger: Custom Event = roktInitComplete, Condition: fire on Some Custom Events where email is available (e.g., Page URL contains checkout/confirmation)",
      "codeBlocks": []
    },
    {
      "title": "5. Events Tag — Select Placements",
      "prose": "Create an Events tag (or combine with the Identify tag) to render Rokt placements on ${req.clientInfo.companyName}'s target page: 1) In the Select Placements section enable Select Placements, 2) Enable Sandbox for testing (disable for production), 3) Set Page Identifier to '${req.placementConfig.pageIdentifier || "confirmation_page"}'. ${isSpa ? "For " + req.clientInfo.companyName + "'s SPA, use a History Change trigger with a Page Path condition matching the target URL." : "For " + req.clientInfo.companyName + "'s MPA, use a Custom Event trigger = roktInitComplete with a Page URL condition matching the target page."}",
      "triggeringRules": "${isSpa ? "Trigger: History Change, Condition: Page Path matches target URL" : "Trigger: Custom Event = roktInitComplete, Condition: Page URL contains target page path"}",
      "codeBlocks": []
    },
    {
      "title": "6. Events Tag — Attributes",
      "prose": "In the Attributes section of the Events tag, add all available attributes for ${req.clientInfo.companyName}. Rokt automatically categorizes predefined attributes as user or event attributes. Include a pipe-delimited data list in the prose showing: Attribute Key | GTM Variable | Type (User/Event) — one row per configured attribute for ${req.clientInfo.companyName}. For any additional attributes not in the predefined list, click Add Row under Custom Attributes.",
      "codeBlocks": []
    },
    {
      "title": "7. Tag Firing Order",
      "prose": "The correct firing order is critical: 1) Initialization & Log Page View tag fires FIRST on all pages, 2) When initialization completes, it pushes 'roktInitComplete' to the data layer, 3) Events tag(s) fire ONLY after roktInitComplete is present. ${req.clientInfo.companyName} must use roktInitComplete as the Custom Event trigger for all Events tags to ensure the SDK is ready before identity or placement calls.",
      "codeBlocks": []
    },
    {
      "title": "8. Testing & Validation",
      "prose": "Steps to verify the integration: 1) Enable Development Mode in the Initialization tag, 2) Enable GTM Preview mode, 3) Navigate through ${req.clientInfo.companyName}'s funnel, 4) Verify: Initialization tag fires on all pages → roktInitComplete appears in data layer → Events tag fires on target page → user identity resolves → placements render correctly, 5) Check the GTM debug panel for correct tag firing sequence, 6) Disable Development Mode for production deployment.",
      "codeBlocks": []
    },
    {
      "title": "Key Benefits for ${req.clientInfo.companyName}",
      "prose": "5 bullet points (use bullet characters) tailored to ${req.clientInfo.companyName}, their industry, and the GTM deployment model. Highlight benefits like: no custom code (pre-built GTM tags), quick deployment via Community Template Gallery, centralized tag management, easy attribute mapping through GTM variables, and real-time personalized placements.",
      "codeBlocks": []
    },
    {
      "title": "Developer Documentation",
      "prose": "Links to relevant Rokt GTM documentation. Include: ● https://docs.rokt.com/developers/integration-guides/getting-started/ecommerce/tag-managers/google-tag-manager — Google Tag Manager Integration Guide. Format as bullet list.",
      "codeBlocks": []
    }
  ],
  "summaryTable": [
    {"component": "Data Layer", "purpose": "Provides user and transaction data to GTM for the Rokt SDK", "triggeringLogic": "Populate on every page before GTM tags fire", "requirementLevel": "Functional Requirement"},
    {"component": "GTM Variables", "purpose": "Data Layer Variables that read values from the data layer for Rokt tags", "triggeringLogic": "Create in GTM for each attribute to send to Rokt", "requirementLevel": "Functional Requirement"},
    {"component": "Initialization & Log Page View Tag", "purpose": "Loads the Rokt SDK and logs page views", "triggeringLogic": "${isSpa ? "All Pages + History Change (SPA)" : "All Pages (MPA)"}", "requirementLevel": "Functional Requirement"},
    {"component": "Events Tag — Identity", "purpose": "Identifies the user by email for personalization", "triggeringLogic": "Custom Event = roktInitComplete, when email is available", "requirementLevel": "Functional Requirement"},
    {"component": "Events Tag — Select Placements", "purpose": "Renders personalized Rokt offers on target pages", "triggeringLogic": "${isSpa ? "History Change + Page Path condition" : "roktInitComplete + Page URL condition"}", "requirementLevel": "Functional Requirement"},
    {"component": "Events Tag — Attributes", "purpose": "Sends user and event attributes to improve offer relevance", "triggeringLogic": "Configured in the Events tag Attributes section", "requirementLevel": "Functional Requirement"},
    {"component": "roktInitComplete Event", "purpose": "Ensures Events tags fire only after SDK initialization completes", "triggeringLogic": "Automatically pushed to data layer by Initialization tag", "requirementLevel": "Functional Requirement"}
  ]
}

RULES:
- This is a GTM integration — do NOT generate code for direct SDK methods like Rokt.init(), rokt.selectPlacements(), etc.
- The only code ${req.clientInfo.companyName} adds to their site is the data layer population (window.dataLayer.push)
- All tag configuration is done through the GTM UI using pre-built Community Template Gallery tags
- Use ${req.clientInfo.companyName} by name throughout the prose
- Keep prose SHORT and business-friendly (2-4 sentences per section max)
- For variable/attribute data, include them as pipe-delimited rows in the prose
- The data layer code block should be a realistic, complete example with actual values
- For the language field in codeBlocks, always use "javascript"
- This is a ${isSpa ? "Single-Page Application (SPA)" : "Multi-Page Application (MPA)"} — use the correct trigger configuration throughout
- Output ONLY valid JSON. No markdown, no explanation, no code fences.`;
}

function buildAdobePrompt(req: GenerateRequest): string {
  const ctx = buildCommonContext(req);
  const appType = req.platformOptions.appType || "mpa";
  const isSpa = appType === "spa";

  const dataElementMappings = req.placementConfig.attributes
    .map((a) => `| ${a.key} | JavaScript Variable | adobeDataLayer.${a.key} | "${a.exampleValue}" |`)
    .join("\n    ");

  return `You are writing a professional, client-facing Adobe Experience Platform integration guide document.
This is a TAG MANAGER integration — NOT a direct SDK integration. The Rokt SDK is deployed
using the "mParticle by Rokt" Extension from the Adobe Extensions Catalog. Configuration is done
entirely through Extension settings, Data Elements, and Rules in the Adobe Experience Platform UI.
No custom JavaScript snippets are needed on the site beyond the standard data layer.

CLIENT: ${req.clientInfo.companyName}
INDUSTRY: ${req.clientInfo.industry}
DESCRIPTION: ${req.clientInfo.description || "N/A"}
PLATFORM: Adobe Experience Platform
APP TYPE: ${appType.toUpperCase()} (${isSpa ? "Single-Page Application" : "Multi-Page Application"})
API KEY: ${ctx.apiKey}
DOMAIN: ${ctx.domain}
CNAME DOMAIN: ${req.sdkConfig.firstPartyDomain || "N/A"}
ENVIRONMENT: ${ctx.env}
EMAIL FORMAT: ${req.identitySetup.emailFormat}
SAMPLE EMAIL: ${req.identitySetup.sampleEmail}
IDENTITY TRIGGERS: ${ctx.triggers}
USER ATTRIBUTES: ${ctx.enabledAttrs}
PLACEMENT ATTRIBUTES:
    ${ctx.placementAttrs}
PAGE IDENTIFIER: ${req.placementConfig.pageIdentifier}
PLACEMENT TRIGGERING RULES: ${req.placementConfig.triggeringRules}
FUNCTIONAL COOKIES: ${req.sdkConfig.functionalCookies}
TARGETING COOKIES: ${req.sdkConfig.targetingCookies}

DATA ELEMENT MAPPINGS FOR THIS CLIENT:
    ${dataElementMappings}

PLATFORM TECHNICAL REFERENCE (use this to generate CORRECT configuration):
${ctx.template}

---

Generate a JSON object with this exact structure. Output ONLY valid JSON, no markdown fences:

{
  "title": "Rokt + ${req.clientInfo.companyName} Adobe Experience Platform Integration Guide",
  "sections": [
    {
      "title": "Overview",
      "prose": "2-3 sentences about how Rokt integrates with ${req.clientInfo.companyName} via Adobe Experience Platform. Emphasize that this uses the mParticle by Rokt Extension from the Extensions Catalog — no custom JavaScript is needed on the site beyond the data layer. Mention identity resolution, page view tracking, and real-time placements. Reference ${req.clientInfo.companyName} by name and use their description for context.",
      "codeBlocks": []
    },
    {
      "title": "1. Data Layer Implementation",
      "prose": "Explain that ${req.clientInfo.companyName}'s developers must populate the data layer (e.g., window.adobeDataLayer) with user and transaction data. This is the ONLY code change required on the website. The data layer path determines the Data Element configuration in Adobe. Note: array references use dots not brackets.",
      "triggeringRules": "Populate data layer before Adobe rules fire on each page",
      "codeBlocks": [{"language": "javascript", "code": "Complete adobeDataLayer.push() example with ${req.clientInfo.companyName}-specific variables and example values from the placement attributes provided. Show a realistic data layer push with actual attribute values."}]
    },
    {
      "title": "2. Install & Configure the mParticle by Rokt Extension",
      "prose": "Step-by-step: 1) Sign in to Adobe Experience Platform, 2) Navigate to Extensions tab → search 'mParticle by Rokt' in the Catalog, 3) Click Install, 4) Click Configure. Include a table in the prose showing the Configuration Tab settings: API Key (${ctx.apiKey}), Use Cookie Storage (${req.sdkConfig.firstPartyDomain ? "Enabled — site uses subdomains" : "Optional"}), Development Mode (${ctx.env === "development" ? "Enabled" : "Disabled"}), Log Level (${ctx.env === "development" ? "Verbose" : "Warning"}), ${req.sdkConfig.firstPartyDomain ? "CNAME Domain (rkt." + req.sdkConfig.firstPartyDomain + "), " : ""}${!req.sdkConfig.targetingCookies ? "noTargeting (Enabled), " : ""}${!req.sdkConfig.functionalCookies ? "noFunctional (Enabled)" : ""}. Then describe the User Identities tab: ${req.identitySetup.emailFormat === "hashed" ? "Enter the Email SHA256 Data Element for hashed email." : req.identitySetup.emailFormat === "both" ? "Enter both the Email Data Element for raw email and Email SHA256 Data Element for hashed email." : "Enter the Email Data Element for raw email."}",
      "codeBlocks": []
    },
    {
      "title": "3. Create Data Elements",
      "prose": "For each attribute ${req.clientInfo.companyName} wants to send to Rokt, create a Data Element: 1) Navigate to Data Elements tab → Add Data Element, 2) Name the variable and choose Core as the extension, 3) Select the Data Element Type (JavaScript Variable, Custom Code, Page Info, etc.), 4) Enter the path matching the data layer. Include a pipe-delimited data list in the prose with columns: Data Element | Type | Path | Example Value — one row per Data Element for ${req.clientInfo.companyName}. Also include the recommended screen view attributes: screen_name (Custom Code: return location.pathname.split('/').filter(Boolean).pop() || 'home'), url (Page Info → URL), referring-page (Page Info → Referrer).",
      "codeBlocks": []
    },
    {
      "title": "4. Rule: Initialize Rokt",
      "prose": "Create the initialization rule: 1) Navigate to Rules tab → Add Rule, 2) Name it 'Rokt - Initialization', 3) Event: Library Loaded (Page Top) — fire on all pages, 4) Action: Extension = mParticle by Rokt, Action Type = Initialize Rokt. To ensure correct rule ordering, add a second Action in this rule: Extension = Core, Action Type = Custom Code, with the roktInitComplete dispatch. Enable 'Wait to run next action' in the Initialize Rokt action's Advanced Options. Subsequent rules use Core → Custom Event = roktInitComplete as their trigger.",
      "triggeringRules": "Event: Library Loaded (Page Top) — fire on all pages",
      "codeBlocks": [{"language": "javascript", "code": "window.dispatchEvent(new CustomEvent('roktInitComplete'));"}]
    },
    {
      "title": "5. Rule: Identify the User",
      "prose": "Create a rule to identify ${req.clientInfo.companyName}'s users: 1) Navigate to Rules tab → Add Rule, 2) Name it 'Rokt - Identify', 3) Event: Core → Custom Event = roktInitComplete (with page path condition if needed), 4) Action: Extension = mParticle by Rokt, Action Type = Identity Events, Identity Method = Identify. The action uses the Email/Email SHA256 values configured in the Extension settings. ${req.identitySetup.emailFormat === "hashed" ? "Since " + req.clientInfo.companyName + " uses hashed emails, the SHA256 value from the extension's User Identities tab will be used." : "The raw email from the extension's User Identities tab will be used for identification."}",
      "triggeringRules": "Event: Core → Custom Event = roktInitComplete, when email is available",
      "codeBlocks": []
    },
    {
      "title": "6. Rule: Log Page Views",
      "prose": "Create a rule (or combine with Initialize Rokt) to log page views: 1) Action: Extension = mParticle by Rokt, Action Type = Log Page View, 2) Event Name: 'page view', 3) Custom Attributes: screen_name = %screen_name%, url = %url%, referring-page = %referring-page%. Rokt recommends combining Initialize Rokt + Log Page View into a single rule since both fire on all pages — this ensures correct action ordering.",
      "triggeringRules": "Fire on all pages (combine with Initialize Rokt rule)",
      "codeBlocks": []
    },
    {
      "title": "7. Rule: Show Rokt Placements",
      "prose": "Create a rule to show placements on ${req.clientInfo.companyName}'s target page: 1) Name it 'Rokt - Show Placement'. ${isSpa ? "For " + req.clientInfo.companyName + "'s SPA: Event Type = Core → History Change, Condition = Path Without Query String matches target page." : "For " + req.clientInfo.companyName + "'s MPA: Event Type = Core → DOM Ready or Custom Event = roktInitComplete, Condition = Path Without Query String matches target page."} Action: Extension = mParticle by Rokt, Action Type = Show Placements. Placement Settings: Page Identifier = '${req.placementConfig.pageIdentifier || "confirmation_page"}', ${req.identitySetup.emailFormat === "raw" ? "enable Hash raw email attribute (SHA256)." : "hashed email is already configured."} In the Core Attributes tab, fill in: email, firstname, lastname, billingzipcode, confirmationref (minimum recommended) plus all other available attributes. In the Custom Attributes tab, add any additional key-value pairs. NOTE: If email is set in Show Placements, the Identity action triggers automatically — a separate Identify rule may not be needed on this page.",
      "triggeringRules": "${isSpa ? "Event: History Change, Condition: Path matches target page" : "Event: DOM Ready or roktInitComplete, Condition: Path matches target page"}",
      "codeBlocks": []
    },
    {
      "title": "8. Rule Ordering & Combining Rules",
      "prose": "Adobe does NOT guarantee rule execution order across different rules. ${req.clientInfo.companyName} must use the roktInitComplete Custom Event pattern to ensure Initialize fires before any Events rules. Recommended order: 1) Initialize Rokt (Library Loaded — all pages), 2) Identify (after roktInitComplete, when email available), 3) Log Page View (after roktInitComplete, all pages), 4) Show Placements (after roktInitComplete, target pages only). Rokt recommends combining Initialize Rokt + Log Page View into one rule since both fire on all pages.",
      "codeBlocks": []
    },
    {
      "title": "9. Testing & Validation",
      "prose": "Steps to verify the integration: 1) Enable Development Mode in the Extension configuration and set Log Level to Verbose, 2) Use Adobe's Staging/Development environment, 3) Navigate through ${req.clientInfo.companyName}'s funnel, 4) Verify: Initialize Rokt fires on all pages → roktInitComplete dispatches → Identity fires when email available → Show Placements fires on target page → placements render with correct attributes, 5) Check browser console for mParticle/Rokt SDK logs, 6) Disable Development Mode for production.",
      "codeBlocks": []
    },
    {
      "title": "Key Benefits for ${req.clientInfo.companyName}",
      "prose": "5 bullet points (use bullet characters) tailored to ${req.clientInfo.companyName}, their industry, and the Adobe deployment model. Highlight benefits like: no custom code (Extension from Catalog), native Adobe integration, centralized rule management, easy attribute mapping through Data Elements, and real-time personalized placements.",
      "codeBlocks": []
    },
    {
      "title": "Developer Documentation",
      "prose": "Links to relevant Rokt Adobe documentation. Include: ● https://docs.rokt.com/developers/integration-guides/getting-started/ecommerce/tag-managers/adobe-experience-platform — Adobe Experience Platform Integration Guide. Format as bullet list.",
      "codeBlocks": []
    }
  ],
  "summaryTable": [
    {"component": "Data Layer", "purpose": "Provides user and transaction data for Rokt via Adobe Data Elements", "triggeringLogic": "Populate on every page before Adobe rules fire", "requirementLevel": "Functional Requirement"},
    {"component": "mParticle by Rokt Extension", "purpose": "Installs and configures the Rokt SDK within Adobe Experience Platform", "triggeringLogic": "Install from Catalog, configure API key and settings", "requirementLevel": "Functional Requirement"},
    {"component": "Data Elements", "purpose": "Map data layer values to attributes for Rokt rules", "triggeringLogic": "Create in Adobe for each attribute to send to Rokt", "requirementLevel": "Functional Requirement"},
    {"component": "Rule: Initialize Rokt", "purpose": "Loads the Rokt SDK on every page", "triggeringLogic": "Library Loaded (Page Top) — all pages", "requirementLevel": "Functional Requirement"},
    {"component": "Rule: Identify", "purpose": "Identifies the user by email for personalization", "triggeringLogic": "After roktInitComplete, when email is available", "requirementLevel": "Functional Requirement"},
    {"component": "Rule: Log Page Views", "purpose": "Records page view events with screen name, URL, referrer", "triggeringLogic": "All pages (combine with Initialize Rokt rule)", "requirementLevel": "Functional Requirement"},
    {"component": "Rule: Show Placements", "purpose": "Renders personalized Rokt offers on target pages", "triggeringLogic": "${isSpa ? "History Change + Path condition" : "DOM Ready/roktInitComplete + Path condition"}", "requirementLevel": "Functional Requirement"},
    {"component": "roktInitComplete Event", "purpose": "Ensures subsequent rules fire only after SDK initialization", "triggeringLogic": "Dispatched via Custom Code action after Initialize Rokt", "requirementLevel": "Functional Requirement"}
  ]
}

RULES:
- This is an Adobe Experience Platform integration — do NOT generate code for direct SDK methods like Rokt.init(), rokt.selectPlacements(), etc.
- The only code ${req.clientInfo.companyName} adds to their site is the data layer population (adobeDataLayer.push)
- All configuration is done through the Adobe Extension UI, Data Elements, and Rules
- Use ${req.clientInfo.companyName} by name throughout the prose
- Keep prose SHORT and business-friendly (2-4 sentences per section max)
- For Data Element/attribute data, include them as pipe-delimited rows in the prose
- The data layer code block should be a realistic, complete example with actual values
- The only other code block should be the roktInitComplete custom event dispatch
- For the language field in codeBlocks, always use "javascript"
- This is a ${isSpa ? "Single-Page Application (SPA)" : "Multi-Page Application (MPA)"} — use the correct trigger configuration throughout
- Output ONLY valid JSON. No markdown, no explanation, no code fences.`;
}

function buildDefaultPrompt(req: GenerateRequest): string {
  const ctx = buildCommonContext(req);

  const hasCustomEvents = req.eventTracking.events.some((e) => e.type === "custom");
  const hasCommerceEvents = req.eventTracking.commerceEnabled || req.eventTracking.events.some((e) => e.type === "commerce");

  const eventTypeLabels = ["Pageview"];
  if (hasCustomEvents) eventTypeLabels.push("Custom");
  if (hasCommerceEvents) eventTypeLabels.push("Commerce");
  const eventSectionTitle = `Tracking ${eventTypeLabels.join(", ")} Events`;

  let eventContext = `EVENTS TABLE:\n${ctx.eventsTable}\nPAGE VIEW EXAMPLE: ${req.eventTracking.pageViewExample}`;
  if (hasCustomEvents) {
    eventContext += `\nCUSTOM EVENT: ${req.eventTracking.customEventName} with {${req.eventTracking.customEventAttribute.key}: "${req.eventTracking.customEventAttribute.value}"}`;
  }
  if (hasCommerceEvents) {
    eventContext += `\nCOMMERCE PRODUCT: ${JSON.stringify(req.eventTracking.commerceProduct)}`;
    eventContext += `\nCOMMERCE TRANSACTION: ${JSON.stringify(req.eventTracking.commerceTransaction)}`;
  }

  return `You are writing a professional, client-facing SDK integration guide document.

CLIENT: ${req.clientInfo.companyName}
INDUSTRY: ${req.clientInfo.industry}
DESCRIPTION: ${req.clientInfo.description || "N/A"}
PLATFORM: ${ctx.platformLabel}
PLATFORM OPTIONS: ${ctx.platformOpts}
API KEY: ${ctx.apiKey}
SDK KEY: ${ctx.sdkKey}
SDK SECRET: ${ctx.sdkSecret}
DOMAIN: ${ctx.domain}
ENVIRONMENT: ${ctx.env}
EMAIL FORMAT: ${req.identitySetup.emailFormat}
SAMPLE EMAIL: ${req.identitySetup.sampleEmail}
IDENTITY TRIGGERS: ${ctx.triggers}
USER ATTRIBUTES: ${ctx.enabledAttrs}
${eventContext}
PAGE IDENTIFIER: ${req.placementConfig.pageIdentifier}
PLACEMENT TRIGGERING RULES: ${req.placementConfig.triggeringRules}
PLACEMENT ATTRIBUTES:
    ${ctx.placementAttrs}
FUNCTIONAL COOKIES: ${req.sdkConfig.functionalCookies}
TARGETING COOKIES: ${req.sdkConfig.targetingCookies}

PLATFORM TECHNICAL REFERENCE (use this to generate CORRECT code):
${ctx.template}

---

Generate a JSON object with this exact structure. Output ONLY valid JSON, no markdown fences:

{
  "title": "Rokt + ${req.clientInfo.companyName} ${ctx.platformLabel} Integration Guide",
  "sections": [
    {
      "title": "Overview: Powering the Transaction Moment™",
      "prose": "3-4 sentences about what the Rokt SDK does for ${req.clientInfo.companyName}. Mention identity resolution, funnel tracking, and real-time placements. Use the client description for context. Reference ${req.clientInfo.companyName} by name.",
      "codeBlocks": []
    },
    {
      "title": "Lightweight ${ctx.platformLabel} Deployment",
      "prose": "Brief paragraph on where/how to add the SDK. Mention key deployment details for this platform.",
      "triggeringRules": "Initialize the SDK on all pages / on app launch",
      "codeBlocks": [{"language": "...", "code": "Complete init code block with actual values filled in"}]
    },
    {
      "title": "Identity & Attribute Integration",
      "prose": "Paragraph about how ${req.clientInfo.companyName}'s integration connects user identity. Mention known vs anonymous users.",
      "codeBlocks": []
    },
    {
      "title": "Identify the User",
      "prose": "Brief explanation of the identify call.",
      "triggeringRules": "Fire the identify call as soon as user self-identifies (i.e. ${ctx.triggers})",
      "codeBlocks": [{"language": "...", "code": "One clean identify code example using ${req.identitySetup.sampleEmail}"}]
    },
    ${
      ctx.enabledAttrs
        ? `{
      "title": "Set User Attributes",
      "prose": "Brief explanation of setting attributes.",
      "triggeringRules": "Set User Attributes at the time of ${ctx.triggers}",
      "codeBlocks": [{"language": "...", "code": "Short code example setting 2-3 of the selected attributes"}]
    },`
        : ""
    }
    {
      "title": "${eventSectionTitle}",
      "prose": "Overview paragraph about event tracking. Only reference the event types that are configured: ${eventTypeLabels.join(", ")}. Then include the event summary as a pipe-delimited data list in prose.",
      "codeBlocks": []
    },
    {
      "title": "${hasCustomEvents || hasCommerceEvents ? "A. " : ""}Funnel / Pageview Events (baseline)",
      "prose": "Brief explanation.",
      "triggeringRules": "Trigger immediately on page or screen load",
      "codeBlocks": [{"language": "...", "code": "Page view code example using ${req.eventTracking.pageViewExample}"}]
    },
    ${
      hasCustomEvents
        ? `{
      "title": "B. Custom Events (${req.clientInfo.companyName}-defined)",
      "prose": "Brief explanation of custom events.",
      "triggeringRules": "Trigger on meaningful user actions",
      "codeBlocks": [{"language": "...", "code": "Custom event code example"}]
    },`
        : ""
    }
    ${
      hasCommerceEvents
        ? `{
      "title": "${hasCustomEvents ? "C" : "B"}. Commerce Events (transactional)",
      "prose": "Brief explanation of commerce events.",
      "triggeringRules": "Fire after ecommerce milestones",
      "codeBlocks": [{"language": "...", "code": "Commerce event code example with product and transaction"}]
    },`
        : ""
    }
    {
      "title": "Requesting & Rendering Placements",
      "prose": "Explain selectPlacements as core functionality. Mention what happens after: placements evaluated in real time, content rendered, interaction events captured.",
      "triggeringRules": "${req.placementConfig.triggeringRules}",
      "codeBlocks": [{"language": "...", "code": "selectPlacements code with all placement attributes filled in"}]
    },
    {
      "title": "Key Benefits for ${req.clientInfo.companyName}",
      "prose": "5 bullet points (use bullet characters) tailored to ${req.clientInfo.companyName} and their industry.",
      "codeBlocks": []
    },
    {
      "title": "Developer Documentation",
      "prose": "Links to relevant Rokt docs for ${ctx.platformLabel}. Format as bullet list.",
      "codeBlocks": []
    }
  ],
  "summaryTable": [
    {"component": "Initialization", "purpose": "Loads and configures the Rokt SDK", "triggeringLogic": "Fire on all pages as early as possible", "requirementLevel": "Functional Requirement"},
    {"component": "Identify (User Identity)", "purpose": "Associates user sessions with identifiers to enable personalization", "triggeringLogic": "Trigger as soon as user identity is known (${ctx.triggers})", "requirementLevel": "Functional Requirement"},
    {"component": "Placements (Rokt Offers)", "purpose": "Requests and renders personalized offers", "triggeringLogic": "${req.placementConfig.triggeringRules}", "requirementLevel": "Functional Requirement"},
    {"component": "Page View Events", "purpose": "Tracks navigation and funnel progression", "triggeringLogic": "Fire on page load across key funnel pages", "requirementLevel": "Functional Requirement"},
    ${ctx.enabledAttrs ? `{"component": "User Attributes", "purpose": "Enriches profiles with contextual data", "triggeringLogic": "Set after identity and update dynamically", "requirementLevel": "Optimal Setup"},` : ""}
    ${hasCustomEvents ? `{"component": "Custom Events", "purpose": "Captures ${req.clientInfo.companyName}-defined interactions", "triggeringLogic": "Fire on relevant user actions", "requirementLevel": "Optimal Setup"},` : ""}
    ${hasCommerceEvents ? `{"component": "Commerce Events", "purpose": "Tracks transactional activities", "triggeringLogic": "Fire at key transaction milestones", "requirementLevel": "Optimal Setup"}` : ""}
  ]
}

RULES:
- Replace ALL placeholder values with ${req.clientInfo.companyName}-specific examples
- Use ${req.clientInfo.companyName} by name throughout the prose (e.g., "${req.clientInfo.companyName}'s integration")
- Keep prose SHORT and business-friendly (2-4 sentences per section max)
- Code blocks must be COMPLETE and CORRECT for the ${ctx.platformLabel} platform
- Use the platform technical reference above to generate correct code syntax
- Code should use the actual API key, domain, email, attributes provided
- Do NOT reference event types that are not configured. Only include sections for: ${eventTypeLabels.join(", ")} events
- For the language field in codeBlocks, use the appropriate language: "javascript" for Web/GTM/Tealium/Adobe, "swift" or "objc" for iOS, "kotlin" or "java" for Android, "dart" for Flutter, "javascript" for React Native
- Output ONLY valid JSON. No markdown, no explanation, no code fences.`;
}

function buildPrompt(req: GenerateRequest): string {
  switch (req.integrationType) {
    case "tealium":
      return buildTealiumPrompt(req);
    case "gtm":
      return buildGtmPrompt(req);
    case "adobe":
      return buildAdobePrompt(req);
    default:
      return buildDefaultPrompt(req);
  }
}

export async function generateGuideContent(
  req: GenerateRequest
): Promise<GuideContent> {
  const prompt = buildPrompt(req);

  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-pro-preview",
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 20480,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const cleaned = text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned) as GuideContent;
}
