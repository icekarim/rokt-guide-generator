export const ADOBE_TEMPLATE = `
# Rokt Adobe Experience Platform (Launch) Integration Reference

## Documentation
https://docs.rokt.com/developers/integration-guides/getting-started/ecommerce/tag-managers/adobe-experience-platform

---

## Integration Model

Adobe Experience Platform integration uses the **mParticle by Rokt Extension** from the
Extensions Catalog. Everything is configured through Extension settings, Data Elements, and Rules
in the Adobe Experience Platform UI. No custom JavaScript snippets need to be added to the site
beyond the standard data layer.

The workflow is:
1. Install and configure the mParticle by Rokt Extension
2. Create Data Elements mapped to the site's data layer
3. Create Rules to: Initialize Rokt, Identify users, Log Page Views, Show Placements
4. Use Rule Ordering (roktInitComplete custom event) to ensure correct execution order

---

## 1. Data Layer

Developers must implement a data layer on the site. Adobe recommends the Adobe Client Data Layer:

\`\`\`javascript
window.adobeDataLayer = window.adobeDataLayer || [];

window.adobeDataLayer.push({
  email: "jenny.smith@rokt.com",
  user: { firstname: "Jenny", lastname: "Smith" },
  ecommerce: { transaction: { amount: "12.36" } },
  event: "page loaded",
});
\`\`\`

### Data Element Path Structure
- Flat: \`adobeDataLayer.email\`
- Nested: \`adobeDataLayer.user.firstname\`
- Deep nested: \`adobeDataLayer.ecommerce.transaction.amount\`

NOTE: Array references use dots not brackets (\`user[0].firstname\` will NOT work).

---

## 2. Install the mParticle by Rokt Extension

1. Sign in to Adobe Experience Platform
2. Navigate to the **Extensions** tab → search **mParticle by Rokt** in the Catalog
3. Click **Install**
4. Navigate to the installed extension → click **Configure**

### Configuration Tab Settings

| Setting | Value | Description |
|---------|-------|-------------|
| API Key | Your Rokt API key | Provided by Rokt account manager |
| Use Cookie Storage | true/false | Enable if site uses multiple subdomains |
| Development Mode | true (testing) / false (production) | Sandbox mode for testing |
| Log Level | Verbose / Warning / None | Logging detail level (Verbose for testing) |
| CNAME Domain | rkt.yourcompany.com | Optional first-party domain |
| noTargeting | true/false | Disable targeting cookies |
| noFunctional | true/false | Disable functional cookies |

### User Identities Tab
- **Email**: Data Element for raw email (e.g., JavaScript Variable type)
- **Email SHA256**: Data Element for hashed email value

Click **Save** after configuration.

---

## 3. Create Data Elements

For each attribute you want to send to Rokt, create a Data Element:

1. Navigate to the **Data Elements** tab → **Add Data Element**
2. Name your variable, choose **Core** as the extension
3. Select the appropriate **Data Element Type**:
   - **JavaScript Variable** for in-memory values (e.g., \`adobeDataLayer.email\`)
   - **Local Storage** for persisted browser values
   - **Custom Code** for computed values
   - **Page Info** for URL, Referrer, etc.
4. Enter the path name matching your data layer

### Recommended Data Elements

| Data Element | Type | Path / Code | Description |
|-------------|------|-------------|-------------|
| email | JavaScript Variable | adobeDataLayer.email | User's email address |
| firstname | JavaScript Variable | adobeDataLayer.user.firstname | User's first name |
| lastname | JavaScript Variable | adobeDataLayer.user.lastname | User's last name |
| confirmationref | JavaScript Variable | adobeDataLayer.confirmationref | Order reference |
| amount | JavaScript Variable | adobeDataLayer.ecommerce.transaction.amount | Transaction amount |
| billingzipcode | JavaScript Variable | adobeDataLayer.billingzipcode | Billing zip code |
| screen_name | Custom Code | \`return location.pathname.split("/").filter(Boolean).pop() \\|\\| "home";\` | Current page name |
| url | Page Info → URL | (built-in) | Current page URL |
| referring-page | Page Info → Referrer | (built-in) | Referrer URL |

---

## 4. Rule: Initialize Rokt

1. Navigate to **Rules** tab → **Add Rule**
2. Name it (e.g., "Rokt - Initialization")

### Event
- Event Type: **Library Loaded (Page Top)**
- Fire on: **All pages** (recommended for lowest latency)

### Action
- Extension: **mParticle by Rokt**
- Action Type: **Initialize Rokt**

### roktInitComplete Custom Event (Rule Ordering)
To ensure subsequent rules fire AFTER initialization:
1. In the Initialize Rokt Action, enable **Wait to run next action** in Advanced Options
2. Add a second Action: Extension **Core**, Action Type **Custom Code**
3. Paste: \`window.dispatchEvent(new CustomEvent("roktInitComplete"));\`
4. Subsequent rules use Event Type **Core → Custom Event** with type \`roktInitComplete\`

Click **Keep Changes** and **Save to Library**.

---

## 5. Rule: Identify the User

1. Navigate to **Rules** tab → **Add Rule**
2. Name it (e.g., "Rokt - Identify")

### Event
- Fire when email is available (e.g., on checkout page load, after form submit)
- Use **Core → Custom Event** = \`roktInitComplete\` with page path condition

### Action
- Extension: **mParticle by Rokt**
- Action Type: **Identity Events**
- Identity Method: **Identify**

The action uses the Email / Email SHA256 values configured in the Extension settings.

Click **Keep Changes** and **Save to Library**.

---

## 6. Rule: Log Page Views

1. Navigate to **Rules** tab → **Add Rule**
2. Name it (e.g., "Rokt - Page View")

### Event
- Fire on page load after Initialize Rokt has fired
- Recommended: combine with Initialize Rokt rule (see Combining Rules below)

### Action
- Extension: **mParticle by Rokt**
- Action Type: **Log Page View**
- Configuration:
  - Event Name: "page view"
  - Custom Attributes:
    - screen_name: Data Element (e.g., \`%screen_name%\`)
    - url: Data Element (e.g., \`%url%\`)
    - referring-page: Data Element (e.g., \`%referring-page%\`)

Click **Keep Changes** and **Save to Library**.

---

## 7. Rule: Show Rokt Placements

1. Navigate to **Rules** tab → **Add Rule**
2. Name it (e.g., "Rokt - Show Placement")

### Trigger (Event)

**MPA (Multi-Page Application):**
- Event Type: **Core → DOM Ready** or **Core → Custom Event** = \`roktInitComplete\`
- Condition: **Core → Path Without Query String** matches target page
  (e.g., contains \`/confirmation\`)

**SPA (Single-Page Application):**
- Event Type: **Core → History Change**
- Condition: **Core → Path Without Query String** matches target page

### Action — Placement Settings
- Extension: **mParticle by Rokt**
- Action Type: **Show Placements**
- **Page Identifier**: Optional unique page ID
  - Examples: \`stg.rokt.conf\`, \`prod.rokt.conf\`, \`stg.rokt.payments\`, \`prod.rokt.payments\`
- **Hash raw email attribute (SHA256)**: Enable to hash the Email attribute

### Core Attributes Tab
Fill in all available attributes:
- email, firstname, lastname, billingzipcode, confirmationref (minimum recommended)
- amount, paymenttype, ccbin, country, language, currency, etc.

### Custom Attributes Tab
Add any additional key-value pairs not in the predefined list.

NOTE: If you set the Email attribute in Show Placements, the Identity Events action
will be triggered automatically — a separate Identify rule is not needed on the same page.

Click **Keep Changes** and **Save**.

---

## 8. Rule Ordering & Combining Rules

### Rule Ordering
Adobe does NOT guarantee rule execution order across different rules.
Use the roktInitComplete Custom Event pattern (Section 4) to ensure Initialize fires first.

### Recommended Order
1. **Initialize Rokt** (Library Loaded — fires on all pages)
2. **Identify** (after roktInitComplete, when email is available)
3. **Log Page View** (after roktInitComplete, on all pages)
4. **Show Placements** (after roktInitComplete, on target pages only)

### Combining Rules
Rokt recommends combining Initialize Rokt + Log Page View into a single rule since both
fire on all pages. This ensures correct action ordering within the rule.

---

## 9. Predefined Attributes Reference

| Attribute Key | Example Value | Type | Description |
|---------------|---------------|------|-------------|
| First Name | John | User | Customer's first name |
| Last Name | Doe | User | Customer's last name |
| Mobile | 3125551515 | User | Phone number |
| Age | 33 | User | Customer's age |
| Date of Birth | 19900717 | User | Format: yyyymmdd |
| Gender | M | User | M, Male, F, Female |
| Payment Type | Credit Card | Event | Payment method |
| Confirmation Reference | ORD-123456 | Event | Transaction reference ID |
| Amount | 52.25 | Event | Transaction amount |
| Address Line 1 | 123 Main Street | User | Primary address |
| Address Line 2 | Apt 4B | User | Secondary address |
| City | Brooklyn | User | Customer's city |
| State | NY | User | Customer's state |
| ZIP Code | 11201 | User | ZIP or postal code |
| Country | US | User | Customer's country |
| Title | Mr | User | Mr, Mrs, Ms, Dr |
| Language | en | User | Language preference |

---

## 10. Testing & Validation

1. Enable **Development Mode** in the Extension configuration
2. Set **Log Level** to **Verbose**
3. Use Adobe's **Staging/Development** environment
4. Navigate through the site funnel and verify:
   - Initialize Rokt rule fires on all pages
   - roktInitComplete custom event dispatches
   - Identity rule fires when email is available
   - Show Placements rule fires on target pages
   - Placements render correctly with correct attributes
5. Check browser console for mParticle/Rokt SDK logs
6. Disable Development Mode for production deployment
`;
