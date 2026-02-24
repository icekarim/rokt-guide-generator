export const TEALIUM_TEMPLATE = `
# Rokt Tealium Integration Reference

## Documentation
https://docs.rokt.com/developers/integration-guides/getting-started/ecommerce/tag-managers/tealium

---

## Integration Model

Tealium integration uses a **single Custom Container tag** in Tealium iQ. There is NO separate
SDK script to add to the website. Everything — initialization, identity, attribute mapping,
and placement triggering — is handled inside the one Custom Container tag.

The workflow is:
1. Developers populate \`window.utag_data\` on the page
2. A Custom Container tag in Tealium loads the Rokt SDK
3. UDO variables are mapped to Rokt attributes via Tealium's "Mapped Variables" UI
4. Events resolve to page identifiers (bag, checkout, confirmation) within the tag

---

## 1. Data Layer (\`window.utag_data\`)

Developers must populate \`utag_data\` on each page before Tealium fires:

\`\`\`javascript
window.utag_data = window.utag_data || {};

utag_data['email_address'] = 'test@test.com';
utag_data['first_name'] = 'john';
utag_data['last_name'] = 'doe';
utag_data['confirmation_ref'] = '123456789';
utag_data['billing_zipcode'] = '90210';
utag_data['amount'] = '20.00';
utag_data['currency'] = 'USD';
\`\`\`

---

## 2. View Trigger

To trigger the appropriate Rokt event, use \`utag.view()\` when a purchase or page event happens:

\`\`\`javascript
utag.view({
  tealium_event: 'purchase',
  email_address: 'john.doe@example.com',
  amount: '20.00',
  currency: 'USD',
  confirmationref: '123456789'
});
\`\`\`

The \`tealium_event\` value (e.g. "purchase") resolves to the destination configured in
Tealium's "Mapped Variables" — this is how events like bag, checkout, confirmation are triggered.

---

## 3. Creating the Custom Container Tag (Tealium iQ Steps)

1. Log in to your Tealium account
2. Click **Tags** in the left-hand navigation
3. Click **New Tag** → select **Tealium Custom Container**
4. Enter a description name, e.g. "Rokt SDK"
5. Under **Edit Template**, paste the SDK initialization snippet (Section 4 below)
6. Replace \`api_key\` inside \`u.data\` with the Rokt API key
7. Click **Save**

---

## 4. Complete Custom Container Initialization Snippet

This is the ENTIRE script to paste into the Custom Container's Edit Template.
It handles SDK loading, identity, attribute mapping, and placement triggering:

\`\`\`javascript
//~~tv:20010.20230630
//~~tc: Tealium Custom Container

/* Start Tag Library Code */
window.mParticle = window.mParticle || {};
window.mParticle.EventType = {
  Unknown: 0, Navigation: 1, Location: 2, Search: 3,
  Transaction: 4, UserContent: 5, UserPreference: 6,
  Social: 7, Other: 8, Media: 9
};
window.mParticle.eCommerce = { Cart: {} };
window.mParticle.Identity = {};
window.mParticle.Rokt = {};
window.mParticle.config = window.mParticle.config || {};
window.mParticle.config.rq = [];
window.mParticle.config.snippetVersion = 2.8;

window.mParticle.ready = function(e) {
  window.mParticle.config.rq.push(e);
};

["endSession","logError","logBaseEvent","logEvent","logForm",
 "logLink","logPageView","setSessionAttribute","setAppName",
 "setAppVersion","setOptOut","setPosition","startNewSession",
 "startTrackingLocation","stopTrackingLocation"]
.forEach(function(e) {
  window.mParticle[e] = function() {
    var t = Array.prototype.slice.call(arguments);
    t.unshift(e);
    window.mParticle.config.rq.push(t);
  };
});

["setCurrencyCode","logCheckout"].forEach(function(e) {
  window.mParticle.eCommerce[e] = function() {
    var t = Array.prototype.slice.call(arguments);
    t.unshift("eCommerce." + e);
    window.mParticle.config.rq.push(t);
  };
});

["identify","login","logout","modify"].forEach(function(e) {
  window.mParticle.Identity[e] = function() {
    var t = Array.prototype.slice.call(arguments);
    t.unshift("Identity." + e);
    window.mParticle.config.rq.push(t);
  };
});

["selectPlacements","hashAttributes","hashSha256",
 "setExtensionData","use","getVersion","terminate"]
.forEach(function(e) {
  window.mParticle.Rokt[e] = function() {
    var t = Array.prototype.slice.call(arguments);
    t.unshift("Rokt." + e);
    window.mParticle.config.rq.push(t);
  };
});
/* End Tag Library Code */

try {
  (function (id, loader) {
    var u = {};
    utag.o[loader].sender[id] = u;

    if (utag.ut === undefined) { utag.ut = {}; }
    // [Tealium loader 4.35 code — included in template, omitted here for brevity]

    u.ev = { view: 1, link: 1 };
    u.initialized = false;

    ##UTGEN##
    u.send = function(utag_event, data_layer) {
      if (u.ev[utag_event] || u.ev.all !== undefined) {
        var a, b, c, d, e, f, i;
        a = utag_event;
        b = data_layer;

        u.data = {
          api_key: "YOUR_ROKT_API_KEY",
          rokt_domain: "https://apps.rokt-api.com",
          is_development_mode: true,
          // All attribute fields initialized as empty strings
          "amount": "", "billingaddress1": "", "billingaddress2": "",
          "billingzipcode": "", "cardstatus": "", "cartItems": {},
          "confirmationref": "", "conversionType": "conversion",
          "currency": "", "custom": {}, "customertype": "",
          "email": "", "emailEnc": "", "eventtype": "",
          "events": [], "gender": "", "hashedemail": "",
          "locale": "", "Loyaltymember": "", "loyaltystatus": "",
          "majorcat": [], "majorcatid": [], "minorcat": [],
          "minorcatid": [], "placementtype": "", "price": [],
          "productname": [], "paymentserviceprovider": "",
          "quantity": [], "shippingtype": "", "sku": []
        };

        ##UTEXTEND##

        /* --- Mapping Code --- */
        // Maps UDO variables to Rokt attributes using Tealium's u.map
        Object.keys(utag.loader.GV(u.map)).forEach(function(mapping_key) {
          if (data_layer[mapping_key] !== undefined && data_layer[mapping_key] !== '') {
            var destinations = u.map[mapping_key].split(',');
            destinations.forEach(function(parameter) {
              if (!u.data.hasOwnProperty(parameter) &&
                  parameter.indexOf('cartItems') !== 0) {
                u.mapFunc(['custom'].concat(parameter.split('.')), u.data, data_layer[mapping_key]);
                return;
              }
              u.mapFunc(parameter.split('.'), u.data, data_layer[mapping_key]);
            });
          } else {
            // Event resolution: maps "tealium_event:purchase" → "confirmation"
            var event_destinations = mapping_key.split(":");
            if (event_destinations.length === 2 &&
                String(data_layer[event_destinations[0]]) === String(event_destinations[1])) {
              if (u.map[mapping_key]) {
                u.data.events = u.data.events.concat(u.map[mapping_key].split(","));
              }
            }
          }
        });

        // Collect mapped attributes
        var attributes = {
          "amount": u.data.amount,
          "billingaddress1": u.data.billingaddress1,
          "billingaddress2": u.data.billingaddress2,
          "billingzipcode": u.data.billingzipcode,
          "cardstatus": u.data.cardstatus,
          "ccbin": u.data.ccbin,
          "confirmationref": u.data.confirmationref,
          "country": u.data.country,
          "currency": u.data.currency,
          "customertype": u.data.customertype,
          "email": u.data.email,
          "emailEnc": u.data.emailEnc,
          "eventtype": u.data.eventtype,
          "firstname": u.data.firstname,
          "gender": u.data.gender,
          "hashedemail": u.data.hashedemail,
          "language": u.data.language,
          "lastname": u.data.lastname,
          "locale": u.data.locale,
          "Loyaltymember": u.data.Loyaltymember,
          "loyaltystatus": u.data.loyaltystatus,
          "mobile": u.data.mobile,
          "paymentserviceprovider": u.data.paymentserviceprovider,
          "paymenttype": u.data.paymenttype,
          "placementtype": u.data.placementtype,
          "shippingtype": u.data.shippingtype
        };

        if (!u.data.api_key) return;

        /* --- Build script URL --- */
        var t = u.data.is_development_mode ? 1 : 0;
        var n = "?env=" + t;
        src = u.data.rokt_domain + "/js/v2/" + u.data.api_key + "/app.js" + n;

        /* --- triggerPlacement function --- */
        async function triggerPlacement(identifier) {
          var selection = await window.mParticle.Rokt.selectPlacements({
            identifier: identifier,
            attributes: attributes
          });
        }

        /* --- Loader callback: identity + event-to-page mapping --- */
        u.loader_cb = function () {
          u.data.events.forEach(function(event) {
            // Identity: resolve email when on bag/checkout/confirmation
            if (["bag", "checkout", "confirmation"].includes(event)) {
              if (attributes.email || attributes.emailsha256) {
                var userIdentities = {};
                if (attributes.email) userIdentities.email = attributes.email;
                if (attributes.emailsha256) userIdentities.other = attributes.emailsha256;
                mParticle.Identity.identify({ userIdentities: userIdentities });
              }
            }

            // Event → page identifier mapping
            if (event === "bag") {
              window.mParticle.ready(triggerPlacement("bag_page"));
            }
            if (event === "checkout") {
              window.mParticle.ready(triggerPlacement("checkout_page"));
            }
            if (event === "confirmation") {
              window.mParticle.ready(triggerPlacement("confirmation_page"));
            }
          });
        };

        /* --- Load the SDK script --- */
        if (!u.initialized) {
          u.loader({
            "type": "script",
            "src": src,
            "cb": u.loader_cb,
            "loc": "script",
            "id": "utag_##UTID##"
          });
          u.initialized = true;
        } else {
          u.loader_cb();
        }
      }
    };
    utag.o[loader].loader.LOAD(id);
  })("##UTID##", "##UTLOADERID##");
} catch (error) {
  utag.DB(error);
}
\`\`\`

---

## 5. u.data Configuration (Key Settings)

These are the key configuration values INSIDE the script's u.data object:

| Setting | Value | Description |
|---------|-------|-------------|
| api_key | "YOUR_ROKT_API_KEY" | Provided by Rokt account manager |
| rokt_domain | "https://apps.rokt-api.com" | Rokt API domain (or first-party CNAME) |
| is_development_mode | true / false | true for testing, false for production |

A value mapped to "api_key" or "rokt_domain" in Tealium's Mapped Variables will override
these defaults — this allows environment-specific configuration without editing the script.

---

## 6. Mapped Variables (Tealium iQ Configuration)

Under **Mapped Variables** for the Rokt SDK tag, create UDO variable mappings.
This is configured in the Tealium UI, NOT in code.

### Attribute Mappings (UDO Variable → Rokt Attribute)

| UDO Variable (utag_data key) | Rokt Destination | Description |
|-------------------------------|-------------------|-------------|
| email_address | email | User's email address |
| first_name | firstname | User's first name |
| last_name | lastname | User's last name |
| mobile_number | mobile | User's mobile number |
| confirmation_ref | confirmationref | Order confirmation reference |
| billing_zipcode | billingzipcode | Billing zip code |
| order_total | amount | Transaction amount |
| currency_code | currency | Transaction currency |
| country | country | User's country |
| payment_type | paymenttype | Payment method |
| customer_type | customertype | New vs returning customer |
| hashed_email | hashedemail | SHA-256 hashed email |
| loyalty_status | loyaltystatus | Loyalty program status |
| shipping_type | shippingtype | Shipping method selected |

### Custom Attribute Mappings

Any UDO variable mapped to a destination that is NOT a predefined Rokt attribute
is automatically placed under \`u.data.custom\` — e.g. mapping \`loyalty_tier\` to
\`custom.loyaltyTier\` creates a custom attribute.

### Event Mappings (Event:Value → Page Event)

These use the format \`tealium_event:value\` as the mapping key, mapped to the
Rokt event destination. This is how Tealium events resolve to Rokt page identifiers:

| Mapping Key | Destination | Triggers |
|-------------|-------------|----------|
| tealium_event:purchase | confirmation | triggerPlacement("confirmation_page") |
| tealium_event:checkout | checkout | triggerPlacement("checkout_page") |
| tealium_event:bag | bag | triggerPlacement("bag_page") |

---

## 7. Identity Resolution (Automatic in Script)

Identity is handled INSIDE the loader_cb function. When an event resolves to
"bag", "checkout", or "confirmation", the script checks if email or hashed email
is present in the mapped attributes and calls mParticle.Identity.identify().

No separate identity tag or code is needed — it is built into the Custom Container script.

---

## 8. Script Activation (Rules & Events)

Under **Rules & Events** in Tealium iQ:
- Set the Rokt SDK tag to **fire on all pages**
- The tag only triggers placements when a matching event is present (bag/checkout/confirmation)
- On pages without a matching event, the SDK initializes but does not show placements

---

## 9. Testing & Validation

1. Set \`is_development_mode: true\` in the script's u.data
2. Use Tealium's **Trace** feature to verify the tag fires
3. Check browser console for mParticle/Rokt SDK initialization
4. Navigate through the site funnel and verify:
   - Tag fires on all pages
   - Placements appear on target pages (confirmation, checkout, bag)
   - Attributes are correctly mapped from utag_data
5. Switch \`is_development_mode: false\` for production deployment
`;
