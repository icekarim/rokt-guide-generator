export const WEB_TEMPLATE = `
# Rokt Web SDK Integration Reference

## Documentation
https://docs.rokt.com/developers/integration-guides/getting-started/ecommerce/ecommerce-sdk-integration

---

## 1. SDK Initialization

### Loader Snippet
Copy the full initialization script into your site. Place on every page for lowest latency and highest identification accuracy.

\`\`\`javascript
const API_KEY = "YOUR_API_KEY";
const ROKT_DOMAIN = "https://apps.rokt-api.com"; // Optional: use first-party domain

window.mParticle = {
  config: {
    isDevelopmentMode: true,  // true = testing, false = production
    identifyRequest: {
      userIdentities: {
        email: 'j.smith@example.com',      // Un-hashed email
        other: 'sha256 hashed email'        // Or hashed in 'other'
      }
    },
    identityCallback: function(result) {
      if (result.getUser()) {
        result.getUser().setUserAttribute('attribute-key', 'attribute-value');
      }
    }
  }
};

(function(e) {
  window.mParticle = window.mParticle || {};
  window.mParticle.EventType = { Unknown: 0, Navigation: 1, Location: 2, Search: 3, Transaction: 4, UserContent: 5, UserPreference: 6, Social: 7, Other: 8, Media: 9 };
  window.mParticle.eCommerce = { Cart: {} };
  window.mParticle.Identity = {};
  window.mParticle.Rokt = {};
  window.mParticle.config = window.mParticle.config || {};
  window.mParticle.config.rq = [];
  window.mParticle.config.snippetVersion = 2.8;
  window.mParticle.ready = function(e) { window.mParticle.config.rq.push(e); };
  ["endSession","logError","logBaseEvent","logEvent","logForm","logLink","logPageView","setSessionAttribute","setAppName","setAppVersion","setOptOut","setPosition","startNewSession","startTrackingLocation","stopTrackingLocation"].forEach(function(e) {
    window.mParticle[e] = function() { var t = Array.prototype.slice.call(arguments); t.unshift(e); window.mParticle.config.rq.push(t); };
  });
  ["setCurrencyCode","logCheckout"].forEach(function(e) {
    window.mParticle.eCommerce[e] = function() { var t = Array.prototype.slice.call(arguments); t.unshift("eCommerce." + e); window.mParticle.config.rq.push(t); };
  });
  ["identify","login","logout","modify"].forEach(function(e) {
    window.mParticle.Identity[e] = function() { var t = Array.prototype.slice.call(arguments); t.unshift("Identity." + e); window.mParticle.config.rq.push(t); };
  });
  ["selectPlacements","hashAttributes","hashSha256","setExtensionData","use","getVersion","terminate"].forEach(function(e) {
    window.mParticle.Rokt[e] = function() { var t = Array.prototype.slice.call(arguments); t.unshift("Rokt." + e); window.mParticle.config.rq.push(t); };
  });
  var t = window.mParticle.config.isDevelopmentMode ? 1 : 0, n = "?env=" + t;
  var c = document.createElement("script");
  c.type = "text/javascript";
  c.async = !0;
  window.ROKT_DOMAIN = ROKT_DOMAIN || 'https://apps.rokt-api.com';
  mParticle.config.domain = ROKT_DOMAIN.split('//')[1];
  c.src = ROKT_DOMAIN + "/js/v2/" + e + "/app.js" + n;
  var l = document.getElementsByTagName("script")[0];
  l.parentNode.insertBefore(c, l);
})(API_KEY);
\`\`\`

### Launcher Options (config)
- \`isDevelopmentMode\`: boolean — true for testing, false for production
- \`noFunctional\`: boolean — disable functional cookies
- \`noTargeting\`: boolean — disable targeting cookies
- \`pageInitTimestamp\`: number — optional timestamp for page init
- \`sessionId\`: string — optional session ID to pass through
- \`overrideLinkNavigation\`: boolean — override default link navigation behavior

### Cookie Preferences
- \`noFunctional\`: When true, disables functional cookies
- \`noTargeting\`: When true, disables targeting cookies

---

## 2. SPA vs MPA Guidance

### Multi-Page Applications (MPA)
- Place the initialization script in the primary shared layout file (template-based rendering)
- If no template system: place in each HTML file

### Single-Page Applications (SPA)
- Insert script in <head> of main index.html (or primary render location)
- Call \`selection.close()\` when user navigates away from a placement page to prevent stale placements

---

## 3. First-Party Domain Configuration

Set \`ROKT_DOMAIN\` to your custom subdomain when using first-party domain:
\`\`\`javascript
const ROKT_DOMAIN = "https://your-subdomain.yourdomain.com";
\`\`\`
Default: \`https://apps.rokt-api.com\`

---

## 4. Identity

### identifyRequest Object
\`\`\`javascript
// Un-hashed email
const identifyRequest = {
  userIdentities: { email: 'j.smith@example.com' }
};

// Hashed email
const identifyRequest = {
  userIdentities: { other: 'sha256 hashed email goes here' }
};
\`\`\`

### identityCallback Function
\`\`\`javascript
const identityCallback = function(result) {
  if (result.getUser()) {
    result.getUser().setUserAttribute('attribute-key', 'attribute-value');
  }
};
\`\`\`

### Identify Call
\`\`\`javascript
mParticle.Identity.identify(identifyRequest, identityCallback);
\`\`\`

---

## 5. Hash Utilities

### hashAttributes (multiple attributes)
\`\`\`javascript
mParticle.ready(async function() {
  const hashedAttributes = await mParticle.Rokt.hashAttributes({
    email: 'j.smith@example.com',
    mobile: '3125551515',
  });
  // Returns: { email, mobile, emailsha256, mobilesha256 }
  const identifyRequest = {
    userIdentities: {
      email: 'j.smith@example.com',
      other: hashedAttributes.emailsha256
    }
  };
});
\`\`\`

### hashSha256 (single attribute)
\`\`\`javascript
mParticle.ready(async function() {
  const emailSha256 = await mParticle.Rokt.hashSha256('j.smith@example.com');
  const identifyRequest = {
    userIdentities: { email: 'j.smith@example.com', other: emailSha256 }
  };
});
\`\`\`

---

## 6. User Attributes

\`\`\`javascript
const currentUser = mParticle.Identity.getCurrentUser();

currentUser.setUserAttribute("key", "value");
currentUser.setUserAttribute("favorite-genres", ["doc", "comedy", "drama"]);
currentUser.removeUserAttribute("attribute-to-remove");
\`\`\`

Recommended: firstname, lastname, mobile, age, dob, gender, city, state, zip, title, language, value, predictedltv

---

## 7. Page Views

\`\`\`javascript
mParticle.ready(function() {
  mParticle.logPageView("page view", {
    screen_name: location.pathname.split("/").filter(Boolean).pop() || "home",
    url: window.location.toString(),
    "referring-page": document.referrer
  });
});
\`\`\`

---

## 8. Custom Events

\`\`\`javascript
mParticle.logEvent(
  'event-name',
  mParticle.EventType.Other,  // Other, Social, UserPreference, UserContent, Transaction, Search, Location, Navigation
  { 'custom-attribute-name': 'custom-attribute-value' }
);
\`\`\`

---

## 9. Commerce Events

### createProduct
\`\`\`javascript
var product = mParticle.eCommerce.createProduct(
  'Product Name',   // name (required)
  'sku-1',          // SKU (required)
  100.00,           // price (required)
  4,                // quantity
  'variant',        // variant
  'category',       // category
  'brand',          // brand
  'position',       // position
  null,             // coupon code
  { 'custom': true } // custom attributes
);
\`\`\`

### TransactionAttributes
\`\`\`javascript
var transactionAttributes = {
  Id: 'transaction-id',
  Revenue: 430.00,
  Tax: 30
};
\`\`\`

### logProductAction
\`\`\`javascript
mParticle.eCommerce.logProductAction(
  mParticle.ProductActionType.Purchase,  // AddToCart, RemoveFromCart, Checkout, Purchase, etc.
  [product],
  transactionAttributes,
  { customEventAttr: 'value' }
);
\`\`\`

---

## 10. Placements

### selectPlacements
\`\`\`javascript
mParticle.ready(async function() {
  const selection = await mParticle.Rokt.selectPlacements({
    identifier: "prod.rokt.conf",
    attributes: {
      email: "j.smith@example.com",
      firstname: "Jenny",
      lastname: "Smith",
      confirmationref: "54321",
      billingzipcode: "90210",
      amount: "100.00",
      paymenttype: "VISA",
      mobile: "123-456-7890",
      country: "USA",
      language: "en",
      currency: "USD"
    }
  });
});
\`\`\`

### selection.on() Events
\`\`\`javascript
selection.on('PLACEMENT_INTERACTIVE').subscribe(() => { /* placement ready */ });
selection.on('OFFER_ENGAGEMENT').subscribe(() => { /* user engaged */ });
\`\`\`

### SPA: Close placement on navigation
\`\`\`javascript
selection.close();
\`\`\`

---

## 11. Extensions

\`\`\`javascript
mParticle.ready(async function() {
  await mParticle.Rokt.use("ThankYouJourney");
  const selection = await mParticle.Rokt.selectPlacements({
    identifier: "yourPageIdentifier",
    attributes: { email: "j.smith@example.com" }
  });
});
\`\`\`

---

## 12. Recommended Page Identifiers
- prod.rokt.payments / stg.rokt.payments
- prod.rokt.conf / stg.rokt.conf
`;
