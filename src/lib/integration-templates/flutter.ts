export const FLUTTER_TEMPLATE = `
# Rokt Flutter SDK Integration Reference

## Documentation
https://docs.rokt.com/developers/integration-guides/getting-started/ecommerce/ecommerce-flutter-integration

---

## 1. Dependencies

### pubspec.yaml
\`\`\`yaml
dependencies:
  mparticle_flutter_sdk: ^latest
\`\`\`

\`\`\`bash
flutter pub add mparticle_flutter_sdk
\`\`\`

---

## 2. Platform-Specific Setup

### iOS (CocoaPods)
\`\`\`ruby
# ios/Podfile
pod 'mParticle-Apple-SDK', '~> 8.0'
pod 'mParticle-Rokt', '~> 8.0'
\`\`\`

### iOS (Swift Package Manager)
Add mParticle-Apple-SDK and mParticle-Rokt via SPM:
- mParticle SDK: \`https://github.com/mparticle-integrations/mparticle-apple-sdk.git\`
- Rokt Kit: \`https://github.com/mparticle-integrations/mparticle-apple-integration-rokt.git\`

### Android
\`\`\`groovy
// android/app/build.gradle
dependencies {
  implementation("com.mparticle:android-rokt-kit:5.77.0")
  implementation("com.mparticle:android-core:5.77.0")
}
\`\`\`

**Requirement:** Main Activity must extend \`FlutterFragmentActivity\` (not \`FlutterActivity\`).

### Web
\`\`\`html
<!-- Add to index.html before closing </body> -->
<script>
  (function(m,p,a,r,t,i,c,l,e,s){
    m.mp_=m.mp_||{};m.mp_.init=m.mp_.init||function(){
      m.mp_.init.called||(m.mp_.init.called=!0,m.mp_.init.queue=[]);
    };m.mp_.init.queue.push(arguments);
  })(window,document,"script","https://jssdkcdns.rokt.com/js/v1/rokt.js","rokt");
  rokt("init","YOUR_API_KEY",{isDevelopmentMode:true});
</script>
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

## 4. Dart SDK Usage

### Get Instance
\`\`\`dart
import 'package:mparticle_flutter_sdk/mparticle_flutter_sdk.dart';

final sdk = MparticleFlutterSdk.getInstance();
\`\`\`

---

## 5. Identity

\`\`\`dart
final identityRequest = IdentityRequest()
  ..identityType = IdentityType.Email
  ..identityValue = "j.smith@example.com";

final result = await sdk.identity.identify(identityRequest);
// identify() returns Future<IdentityApiResult>
\`\`\`

---

## 6. User Attributes

\`\`\`dart
final user = sdk.identity.currentUser;

user?.setUserAttribute("firstname", "John");
user?.setUserAttribute("lastname", "Doe");
user?.setUserAttribute("mobile", "3125551515");

user?.setUserAttributeArray("favorite-genres", ["documentary", "comedy"]);
user?.removeUserAttribute("attribute-to-remove");
\`\`\`

---

## 7. Screen Views

\`\`\`dart
final screenEvent = ScreenEvent("Details")
  ..customAttributes = {"rating": "5", "property_type": "hotel"};

sdk.logScreenEvent(screenEvent);
\`\`\`

---

## 8. Custom Events

\`\`\`dart
final event = MPEvent("Video Watched", EventType.Navigation)
  ..customAttributes = {"category": "Destination Intro", "title": "Paris"};

sdk.logEvent(event);
\`\`\`

---

## 9. Commerce Events

\`\`\`dart
final product = Product(
  name: "Double Room - Econ Rate",
  sku: "econ-1",
  price: 100.00,
  quantity: 4.0,
)..customAttributes = {"ocean-view": "true"};

final transactionAttributes = TransactionAttributes("foo-transaction-id")
  ..revenue = 430.00
  ..tax = 30.00;

final commerceEvent = CommerceEvent.withProduct(
  ProductAction.Purchase,
  product,
  transactionAttributes: transactionAttributes,
)..customAttributes = {"sale": "true"};

sdk.logEvent(commerceEvent);
\`\`\`

---

## 10. Placements

### selectPlacements with RoktConfig
\`\`\`dart
final roktConfig = RoktConfig(
  colorMode: RoktColorMode.Light,  // Light, Dark, System
  fontFilePathMap: {
    "Arial-Bold": "fonts/arialbold.otf",
  },
);

final attributes = {
  "email": "j.smith@example.com",
  "firstname": "Jenny",
  "lastname": "Smith",
  "billingzipcode": "90210",
  "confirmationref": "54321",
};

sdk.rokt.selectPlacements(
  identifier: "RoktExperience",
  attributes: attributes,
  config: roktConfig,
);
\`\`\`

### fontFilePathMap
\`\`\`dart
// Map font names to asset paths for custom typography
final roktConfig = RoktConfig(
  fontFilePathMap: {
    "Arial-Bold": "fonts/arialbold.otf",
    "CustomFont": "assets/fonts/custom.otf",
  },
);
\`\`\`

### RoktLayout Widget (Embedded)
\`\`\`dart
RoktLayout(
  identifier: "RoktExperience",
  location: "RoktEmbedded1",
  attributes: attributes,
  config: roktConfig,
)
\`\`\`

### EventChannel for Rokt Events
\`\`\`dart
// Listen to placement events via EventChannel
const EventChannel('MPRoktEvents').receiveBroadcastStream().listen((event) {
  // Handle: ShowLoadingIndicator, HideLoadingIndicator, OfferEngagement,
  // PositiveEngagement, PlacementInteractive, PlacementReady, PlacementClosed,
  // PlacementCompleted, PlacementFailure, OpenUrl, CartItemInstantPurchase
});
\`\`\`

---

## 11. CacheConfig (Mobile Only)

\`\`\`dart
final cacheConfig = CacheConfig(
  cacheDurationInSeconds: 1200,
  cacheAttributes: {
    "email": "j.smith@example.com",
    "orderNumber": "123",
  },
);

final roktConfig = RoktConfig(
  cacheConfig: cacheConfig,
);
\`\`\`

---

## 12. Debugging
\`\`\`dart
// Enable verbose logging during development
sdk.logLevel = LogLevel.Verbose;
\`\`\`
`;
