export const GTM_TEMPLATE = `
# Rokt Google Tag Manager Integration Reference

## Documentation
https://docs.rokt.com/developers/integration-guides/getting-started/ecommerce/tag-managers/google-tag-manager

---

## Integration Model

GTM integration uses **pre-built tags from the Community Template Gallery** — no custom scripts.
There are two tag templates:

1. **mParticle by Rokt - Initialization and Log Page View** — loads the SDK and logs page views
2. **mParticle by Rokt - Events** — handles identity, placements, and attributes

The workflow is:
1. Developers populate \`window.dataLayer\` on the site
2. GTM variables read values from the data layer
3. The Initialization tag loads the Rokt SDK on all pages
4. The Events tag(s) fire on target pages to identify users and show placements

---

## 1. Data Layer

Developers must implement a data layer on the site:

\`\`\`javascript
window.dataLayer = window.dataLayer || [];

window.dataLayer.push({
  email: "jenny.smith@rokt.com",
  user: {
    firstname: "Jenny",
    lastname: "Smith",
  },
  ecommerce: {
    transaction: {
      amount: "12.36",
    },
  },
  event: "gtm.transactionComplete",
});
\`\`\`

### Variable Name Structure

The data layer structure determines the GTM variable name:
- Flat: \`email\` → variable name: \`email\`
- Nested: \`user.firstname\` → variable name: \`user.firstname\`
- Deep nested: \`ecommerce.transaction.amount\` → variable name: \`ecommerce.transaction.amount\`

---

## 2. Creating GTM Variables

For each attribute you want to send to Rokt, create a Data Layer Variable in GTM:

1. Log in to your GTM container
2. Click **Variables**
3. Under **User-defined variables**, click **New**
4. Enter a name for your variable
5. Click **Choose a variable type** → under Page Variables select **Data Layer Variable**
6. Enter the **Data Layer Variable Name** (matching your data layer structure)
7. Click **Save**

### Recommended Variables to Create

| Variable Name | Data Layer Path | Description |
|---------------|-----------------|-------------|
| email | email | User's email address |
| firstname | user.firstname | User's first name |
| lastname | user.lastname | User's last name |
| mobile | mobile | User's mobile number |
| age | age | User's age |
| gender | gender | User's gender |
| billingaddress1 | billingaddress1 | Billing address line 1 |
| billingaddress2 | billingaddress2 | Billing address line 2 |
| confirmationref | confirmationref | Order confirmation reference |
| billingzipcode | billingzipcode | Billing zip code |
| amount | ecommerce.transaction.amount | Transaction amount |
| paymenttype | paymenttype | Payment method |
| ccbin | ccbin | Credit card BIN |
| country | country | User's country |
| language | language | User's language |
| currency | currency | Transaction currency |

---

## 3. Initialization & Log Page View Tag

### Source: Community Template Gallery
Tag: **"mParticle by Rokt - Initialization and Log Page View"**

### Setup Steps
1. Click **Tags** → **New**
2. Select **Tag Configuration** → **Discover more tag types in the Community Template Gallery**
3. Search for \`Rokt\` → select **mParticle by Rokt - Initialization and Log Page View**
4. Enter a descriptive name (e.g., "[Rokt] Initialize and Log Page Views")

### Configuration Settings

| Setting | Value | Description |
|---------|-------|-------------|
| API Key | Your Rokt API key | Provided by Rokt account manager |
| Development Mode | Checked (testing) / Unchecked (production) | Enables sandbox mode for testing |
| Log Page Views | Checked | Records page view events with screen_name, url, referring-page |
| Log Level | Verbose / Warning / None | Logging detail level |
| Disallow Functional Cookies | Unchecked (default) | Disable functional cookies if needed |
| Disallow Targeting Cookies | Unchecked (default) | Disable targeting cookies if needed |
| Use Cookie Storage | Optional | Persists identifiers across pages/sessions |

### Triggers

**MPA (Multi-Page Application):**
- Trigger: **All Pages**

**SPA (Single-Page Application):**
- Trigger: **All Pages** + **History Change**

### roktInitComplete Event
When the Initialization tag completes, it pushes a \`roktInitComplete\` custom event to the
data layer. Use this as the trigger for subsequent Events tags.

---

## 4. Events Tag — Identify the User

### Source: Community Template Gallery
Tag: **"mParticle by Rokt - Events"**

### Setup Steps
1. Click **Tags** → **New**
2. Select **mParticle by Rokt - Events** from the Community Template Gallery
3. Name it (e.g., "[Rokt] Identify user")

### Identity Configuration
1. Navigate to the **Identity** section → select **Enable Identity**
2. Under **IDSync Method**, select **Identify**
3. Under **Identity Type**, click **Add Row**:
   - For raw email: select \`Email\` from Key dropdown, enter GTM variable for email
   - For hashed email: select \`Other\` from Key dropdown, enter GTM variable for hashed email
4. (Optional) Select **Hash Raw Email?** to hash the raw email before sending

### Trigger
- Trigger: **Custom Event** = \`roktInitComplete\`
- Condition: Fire on **Some Custom Events** where email variable is available
- Example condition: Page URL contains \`checkout\` AND email variable matches RegEx \`.+@.+\\..+\`

---

## 5. Events Tag — Select Placements

Use the same **mParticle by Rokt - Events** tag template. You can combine this with Identity
in one tag, or create a separate tag.

### Placement Configuration
1. Navigate to the **Select Placements** section → select **Enable Select Placements**
2. Configuration options:
   - **Sandbox**: Enable while testing, disable for production
   - **Page Identifier**: Optional unique page ID (useful for multi-step checkout on same URL)
     - Examples: \`stg.rokt.conf\`, \`prod.rokt.conf\`, \`stg.rokt.payments\`, \`prod.rokt.payments\`
   - **Placement Event Subscriptions**: Optional — subscribe to placement lifecycle events

### Trigger

**MPA:**
- Trigger: **Custom Event** = \`roktInitComplete\`
- Condition: **Some Custom Events** with URL condition (e.g., Page URL contains \`confirmation\`)

**SPA:**
- Trigger: **History Change**
- Condition: **Some History Changes** with URL/Path condition

---

## 6. Events Tag — Attributes

In the **mParticle by Rokt - Events** tag, navigate to the **Attributes** section.

### Predefined Attributes

| Attribute Key | Example Value | Type | Description |
|---------------|---------------|------|-------------|
| First Name | John | User | Customer's first name |
| Last Name | Doe | User | Customer's last name |
| Mobile | 3125551515 | User | Phone number |
| Age | 33 | User | Customer's age |
| Date of Birth | 19900717 | User | Format: yyyymmdd |
| Gender | M | User | M, Male, F, Female |
| Payment Type | Credit Card | Event | Payment method used |
| Confirmation Reference | ORD-123456 | Event | Transaction reference ID |
| Amount | 52.25 | Event | Transaction amount |
| Conversion Type | Purchase | Event | Purchase, Signup, Lead |
| Address Line 1 | 123 Main Street | User | Primary address |
| Address Line 2 | Apt 4B | User | Secondary address |
| City | Brooklyn | User | Customer's city |
| State | NY | User | Customer's state |
| ZIP Code | 11201 | User | ZIP or postal code |
| Country | US | User | Customer's country |
| Title | Mr | User | Mr, Mrs, Ms, Dr |
| Language | en | User | Language preference |

### Custom Attributes
Click **Add Row** under Custom Attributes for additional attributes not in the predefined list.
Enter the attribute name and value, and select **User Attribute** if it relates to the user.

---

## 7. Tag Firing Order

1. **Initialization & Log Page View** tag fires first (All Pages / History Change)
2. Tag pushes \`roktInitComplete\` to data layer when ready
3. **Events tag(s)** fire when \`roktInitComplete\` is present (with optional page conditions)

IMPORTANT: The Initialization tag MUST run before any Events tags.
Use \`roktInitComplete\` Custom Event trigger to ensure correct ordering.

---

## 8. Testing & Validation

1. Enable **Development Mode** in the Initialization tag
2. Use GTM **Preview** mode
3. Navigate through the site funnel and verify:
   - Initialization tag fires on all pages
   - \`roktInitComplete\` appears in the data layer
   - Events tag fires on target pages
   - User identity is resolved
   - Placements render correctly
4. Check the GTM debug panel for tag firing sequence
5. Disable Development Mode for production
`;
