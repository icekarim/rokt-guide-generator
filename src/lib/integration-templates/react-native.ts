export const REACT_NATIVE_TEMPLATE = `
# Rokt React Native SDK Integration Reference

## Documentation
https://docs.rokt.com/developers/integration-guides/getting-started/ecommerce/ecommerce-react-native-integration

---

## 1. Dependencies

\`\`\`bash
npm install react-native-mparticle
\`\`\`

\`\`\`javascript
import MParticle from 'react-native-mparticle';
\`\`\`

---

## 2. Platform-Specific Setup

### iOS Podfile
\`\`\`ruby
# ios/Podfile
pod 'mParticle-Rokt', '~> 8.0'
\`\`\`

### iOS - Static Libraries (Swift projects)
\`\`\`ruby
# Add pre_install block for Swift/static library compatibility
pre_install do |installer|
  installer.pod_targets.each do |pod|
    if pod.name.eql?('mParticle-Rokt')
      def pod.build_type
        Pod::BuildType.static_library
      end
    end
  end
end
\`\`\`

### iOS - Dynamic Frameworks
\`\`\`ruby
# Use frameworks for dynamic linking
use_frameworks! :linkage => :static
# or
use_frameworks!
\`\`\`

### Android build.gradle
\`\`\`groovy
dependencies {
  implementation("com.mparticle:android-rokt-kit:5.77.0")
}
\`\`\`

---

## 3. SDK Initialization

### iOS AppDelegate (Swift)
\`\`\`swift
import mParticle_Apple_SDK

func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
  let options = MParticleOptions(key: "your-key", secret: "your-secret")
  options.environment = .development
  MParticle.sharedInstance().start(with: options)
  return true
}
\`\`\`

### iOS AppDelegate (Objective-C)
\`\`\`objc
#import <mParticle_Apple_SDK/mParticle_Apple_SDK.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  MParticleOptions *options = [MParticleOptions optionsWithKey:@"your-key" secret:@"your-secret"];
  options.environment = MParticleEnvironmentDevelopment;
  [[MParticle sharedInstance] startWithOptions:options];
  return YES;
}
\`\`\`

### Android Application (Kotlin)
\`\`\`kotlin
import com.mparticle.MParticle
import com.mparticle.MParticleOptions

class MainApplication : Application() {
  override fun onCreate() {
    super.onCreate()
    val options = MParticleOptions.builder(this)
      .credentials("your-key", "your-secret")
      .environment(MParticle.Environment.Development)
      .build()
    MParticle.start(options)
  }
}
\`\`\`

### Android Application (Java)
\`\`\`java
MParticleOptions options = MParticleOptions.builder(this)
  .credentials("your-key", "your-secret")
  .environment(MParticle.Environment.Development)
  .build();
MParticle.start(options);
\`\`\`

---

## 4. Identity

\`\`\`javascript
const identityRequest = new MParticle.IdentityRequest();
identityRequest.email = "j.smith@example.com";
identityRequest.userIdentity(MParticle.IdentityType.Other, "sha256-hashed-email");

MParticle.Identity.identify(identityRequest, (result) => {
  if (result.getUser()) {
    result.getUser().setUserAttribute("example attribute key", "example attribute value");
  }
});
\`\`\`

---

## 5. User Attributes

\`\`\`javascript
const user = MParticle.Identity.getCurrentUser();

user.setUserAttribute("firstname", "John");
user.setUserAttribute("lastname", "Doe");
user.setUserAttribute("mobile", "3125551515");
user.setUserAttributeArray("favorite-genres", ["documentary", "comedy"]);
user.removeUserAttribute("attribute-to-remove");
\`\`\`

---

## 6. Screen Views

\`\`\`javascript
MParticle.logScreenEvent("Details", {
  rating: "5",
  property_type: "hotel",
});
\`\`\`

---

## 7. Custom Events

\`\`\`javascript
const event = new MParticle.Event("Video Watched", MParticle.EventType.Navigation);
event.customAttributes = {
  category: "Destination Intro",
  title: "Paris",
};
MParticle.logMPEvent(event);
\`\`\`

---

## 8. Commerce Events

\`\`\`javascript
const product = new MParticle.Product("Double Room - Econ Rate", "econ-1", 100.00, 4);
product.customAttributes = { "ocean-view": "true" };

const transactionAttributes = new MParticle.TransactionAttributes("foo-transaction-id");
transactionAttributes.revenue = 430.00;
transactionAttributes.tax = 30.00;

const commerceEvent = MParticle.CommerceEvent.createProductActionEvent(
  MParticle.ProductAction.Purchase,
  [product],
  transactionAttributes
);
commerceEvent.customAttributes = { sale: "true" };

MParticle.logEvent(commerceEvent);
\`\`\`

---

## 9. Placements

### selectPlacements with createRoktConfig
\`\`\`javascript
const roktConfig = MParticle.Rokt.createRoktConfig({
  colorMode: MParticle.Rokt.ColorMode.Light,  // Light, Dark, System
});

const cacheConfig = MParticle.Rokt.createCacheConfig({
  cacheDurationInSeconds: 1200,
  cacheAttributes: {
    email: "j.smith@example.com",
    orderNumber: "123",
  },
});

const attributes = {
  email: "j.smith@example.com",
  firstname: "Jenny",
  lastname: "Smith",
  billingzipcode: "90210",
  confirmationref: "54321",
};

MParticle.Rokt.selectPlacements("RoktExperience", attributes, roktConfig, cacheConfig);
\`\`\`

### RoktLayoutView (Embedded)
\`\`\`javascript
import { RoktLayoutView } from 'react-native-mparticle';

<RoktLayoutView
  identifier="RoktExperience"
  location="RoktEmbedded1"
  attributes={attributes}
  config={roktConfig}
/>
\`\`\`

### NativeEventEmitter for Events
\`\`\`javascript
import { NativeEventEmitter, NativeModules } from 'react-native';

const roktEventEmitter = new NativeEventEmitter(NativeModules.MPRoktEvents);
roktEventEmitter.addListener('RoktEvent', (event) => {
  // Handle: ShowLoadingIndicator, HideLoadingIndicator, OfferEngagement,
  // PositiveEngagement, PlacementInteractive, PlacementReady, PlacementClosed,
  // PlacementCompleted, PlacementFailure, OpenUrl, CartItemInstantPurchase
});
\`\`\`

---

## 10. Debugging
\`\`\`javascript
MParticle.setLogLevel(MParticle.LogLevel.Verbose);
\`\`\`
`;
