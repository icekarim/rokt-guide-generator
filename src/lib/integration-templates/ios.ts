export const IOS_TEMPLATE = `
# Rokt iOS SDK Integration Reference

## Documentation
https://docs.rokt.com/developers/integration-guides/getting-started/ecommerce/ecommerce-ios-integration

---

## 1. Dependencies

### CocoaPods
\`\`\`ruby
pod 'mParticle-Apple-SDK', '~> 8.0'
pod 'mParticle-Rokt', '~> 8.0'
\`\`\`

### Swift Package Manager
- mParticle SDK: \`https://github.com/mparticle-integrations/mparticle-apple-sdk.git\`
- Rokt Kit: \`https://github.com/mparticle-integrations/mparticle-apple-integration-rokt.git\`
- If using mParticle-Apple-SDK-NoLocation: \`import mParticle_Apple_SDK_NoLocation\`

---

## 2. SDK Initialization

### Swift
\`\`\`swift
import mParticle_Apple_SDK

func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
  let options = MParticleOptions(key: "your-key", secret: "your-secret")
  options.environment = .development  // or .production, .autoDetect

  let identifyRequest = MPIdentityApiRequest.withEmptyUser()
  identifyRequest.email = "j.smith@example.com"
  identifyRequest.setIdentity("sha256 hashed email", identityType: .other)
  options.identifyRequest = identifyRequest

  options.onIdentifyComplete = { (result: MPIdentityApiResult?, error: Error?) in
    if let user = result?.user {
      user.setUserAttribute("example attribute key", value: "example attribute value")
    }
  }

  MParticle.sharedInstance().start(with: options)
  return true
}
\`\`\`

### Objective-C
\`\`\`objc
#import <mParticle_Apple_SDK/mParticle_Apple_SDK.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  MParticleOptions *options = [MParticleOptions optionsWithKey:@"your-key" secret:@"your-secret"];
  options.environment = MParticleEnvironmentDevelopment;

  MPIdentityApiRequest *identifyRequest = [MPIdentityApiRequest withEmptyUser];
  identifyRequest.email = @"j.smith@example.com";
  [identifyRequest setIdentity:@"sha256 hashed email" identityType:MPIdentityOther];
  options.identifyRequest = identifyRequest;

  options.onIdentifyComplete = ^(MPIdentityApiResult *result, NSError *error) {
    if (result.user) {
      [result.user setUserAttribute:@"example attribute key" value:@"example attribute value"];
    }
  };

  [[MParticle sharedInstance] startWithOptions:options];
  return YES;
}
\`\`\`

---

## 3. Identity

### Create identifyRequest
\`\`\`swift
let identifyRequest = MPIdentityApiRequest.withEmptyUser()
identifyRequest.email = "j.smith@example.com"
identifyRequest.setIdentity("sha256 hashed email", identityType: .other)
\`\`\`

### Call identify
\`\`\`swift
let identityCallback = { (result: MPIdentityApiResult?) in
  if let user = result?.user {
    user.setUserAttribute("example attribute key", value: "example attribute value")
  }
}
MParticle.sharedInstance().identity.identify(identifyRequest, completion: identityCallback)
\`\`\`

---

## 4. User Attributes

\`\`\`swift
let currentUser = MParticle.sharedInstance().identity.currentUser

currentUser?.setUserAttribute("firstname", value: "John")
currentUser?.setUserAttribute("lastname", value: "Doe")
currentUser?.setUserAttribute("mobile", value: "3125551515")
currentUser?.setUserAttributeList("favorite-genres", values: ["documentary", "comedy"])
currentUser?.removeAttribute("attribute-to-remove")
\`\`\`

Recommended: firstname, lastname, mobile, age, gender, city, state, zip, dob, title, language, value, predictedltv

---

## 5. Screen Views

\`\`\`swift
MParticle.sharedInstance().logScreen("homepage", eventInfo: ["custom-attribute": "custom-value"])
\`\`\`

---

## 6. Custom Events

\`\`\`swift
if let event = MPEvent(name: "Video Watched", type: .navigation) {
  event.customAttributes = ["category": "Destination Intro", "title": "Paris"]
  MParticle.sharedInstance().logEvent(event)
}
\`\`\`

Event types: .social, .userPreference, .userContent, .transaction, .search, .location, .navigation

---

## 7. Commerce Events

### MPProduct
\`\`\`swift
let product = MPProduct(name: "Double Room", sku: "econ-1", quantity: 4, price: 100.00)
\`\`\`

### MPTransactionAttributes
\`\`\`swift
let attributes = MPTransactionAttributes()
attributes.transactionId = "foo-transaction-id"
attributes.revenue = 430.00
attributes.tax = 30.00
\`\`\`

### MPCommerceEvent
\`\`\`swift
let event = MPCommerceEvent(action: .purchase, product: product)
event.transactionAttributes = attributes
MParticle.sharedInstance().logEvent(event)
\`\`\`

Action types: .addToCart, .removeFromCart, .checkout, .purchase, .viewDetail, .refund, etc.

---

## 8. Placements

### Overlay
\`\`\`swift
let attributes = [
  "email": "test@gmail.com",
  "firstname": "Jenny",
  "lastname": "Smith",
  "billingzipcode": "07762",
  "confirmationref": "54321"
]
MParticle.sharedInstance().rokt.selectPlacements("RoktExperience", attributes: attributes)
\`\`\`

### With MPRoktConfig
\`\`\`swift
let roktConfig = MPRoktConfig()
roktConfig.colorMode = .light  // .light, .dark, .system
MParticle.sharedInstance().rokt.selectPlacements("RoktExperience", attributes: attributes, embeddedViews: nil, callbacks: nil, config: roktConfig)
\`\`\`

### Embedded with MPRoktEmbeddedView
\`\`\`swift
let roktFrame = CGRect(x: 0, y: 0, width: 320, height: 50)
let roktView = MPRoktEmbeddedView(frame: roktFrame)
let embeddedViews = ["RoktEmbedded1": roktView]

let callbacks = MPRoktEventCallback()
callbacks.onLoad = { }
callbacks.onUnLoad = { }
callbacks.onShouldShowLoadingIndicator = { }
callbacks.onShouldHideLoadingIndicator = { }
callbacks.onEmbeddedSizeChange = { (placement: String, size: CGFloat) in }

MParticle.sharedInstance().rokt.selectPlacements("RoktExperience", attributes: attributes, embeddedViews: embeddedViews, config: roktConfig, callbacks: callbacks)
\`\`\`

### Close placement
\`\`\`swift
Rokt.close()
\`\`\`

---

## 9. MPRoktEventCallback Events
- onLoad, onUnLoad
- onShouldShowLoadingIndicator, onShouldHideLoadingIndicator
- onEmbeddedSizeChange(placement, size)

---

## 10. Events API (per view)
\`\`\`swift
MParticle.sharedInstance().rokt.events("RoktLayout", onEvent: { roktEvent in
  if let event = roktEvent as? MPRoktEvent.MPRoktPlacementInteractive { }
  else if let event = roktEvent as? MPRoktEvent.MPRoktOfferEngagement { }
  else if let event = roktEvent as? MPRoktEvent.MPRoktPlacementClosed { }
  // MPRoktShowLoadingIndicator, MPRoktHideLoadingIndicator, MPRoktPlacementReady,
  // MPRoktOpenUrl, MPRoktPositiveEngagement, MPRoktPlacementCompleted, MPRoktPlacementFailure,
  // MPRoktFirstPositiveEngagement, MPRoktCartItemInstantPurchase
})
\`\`\`

---

## 11. Global Events API
\`\`\`swift
import Rokt_Widget
Rokt.globalEvents() { roktEvent in
  if let initEvent = roktEvent as? RoktEvent.InitComplete {
    print("Rokt init completed: \\(initEvent.success)")
  }
}
// Must be placed prior to MParticle.sharedInstance().start
\`\`\`

---

## 12. CacheConfig
\`\`\`swift
let roktConfig = MPRoktConfig()
roktConfig.cacheDuration = TimeInterval(1200)  // Max 90 min
roktConfig.cacheAttributes = ["email": "j.smith@example.com", "orderNumber": "123"]
\`\`\`

---

## 13. Session ID Passing
Pass session ID via attributes or config when available for continuity.

---

## 14. SwiftUI - MPRoktLayout
\`\`\`swift
import SwiftUI
import mParticle_Apple_SDK
import mParticle_Rokt_Swift

struct OrderConfirmationView: View {
  let attributes = [
    "email": "test@gmail.com",
    "firstname": "Jenny",
    "lastname": "Smith",
    "billingzipcode": "07762",
    "confirmationref": "54321"
  ]
  @State private var sdkTriggered = true

  var body: some View {
    MPRoktLayout(
      sdkTriggered: $sdkTriggered,
      viewName: "RoktExperience",
      locationName: "RoktEmbedded1",
      attributes: attributes,
      config: roktConfig,
      onEvent: { roktEvent in }
    ).roktLayout
  }
}
\`\`\`

Parameters: sdkTriggered, viewName, locationName (optional), attributes, config, onEvent

---

## 15. Debugging
\`\`\`swift
Rokt.setLoggingEnabled(enable: true)
\`\`\`

---

## 16. Error Handling (IDSync)
\`\`\`swift
let identityCallback = { (result: MPIdentityApiResult?, error: Error?) in
  if result?.user != nil {
    result?.user.setUserAttribute("key", value: "value")
  } else {
    let resultCode = MPIdentityErrorResponseCode(rawValue: UInt((error! as NSError).code))
    switch resultCode! {
    case .clientNoConnection, .clientSideTimeout: break  // retry
    case .requestInProgress, .retry: break
    default: break
    }
  }
}
\`\`\`

Client codes: MPIdentityErrorResponseCodeRequestInProgress, ClientSideTimeout, ClientNoConnection, SSLError, OptOut, Unknown
HTTP: 400, 401, 403, 429, 5xx
`;
