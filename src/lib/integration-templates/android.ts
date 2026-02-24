export const ANDROID_TEMPLATE = `
# Rokt Android SDK Integration Reference

## Documentation
https://docs.rokt.com/developers/integration-guides/getting-started/ecommerce/ecommerce-android-integration

---

## 1. Dependencies

### build.gradle
\`\`\`groovy
dependencies {
  implementation("com.mparticle:android-rokt-kit:5.77.0")
  implementation("com.mparticle:android-core:5.77.0")
}
\`\`\`

### build.gradle.kts
\`\`\`kotlin
dependencies {
  implementation("com.mparticle:android-rokt-kit:5.77.0")
  implementation("com.mparticle:android-core:5.77.0")
}
\`\`\`

---

## 2. SDK Initialization

### Kotlin
\`\`\`kotlin
import com.mparticle.MParticle
import com.mparticle.MParticleOptions

class YourApplicationClass : Application() {
  override fun onCreate() {
    super.onCreate()
    val identifyRequest = IdentityApiRequest.withEmptyUser()
      .email("j.smith@example.com")
      .build()

    val identifyTask = BaseIdentityTask()
      .addSuccessListener { identityApiResult ->
        identityApiResult.user.setUserAttribute("example attribute key", "example attribute value")
      }
      .addFailureListener { identityHttpResponse -> /* handle error */ }

    val options = MParticleOptions.builder(this)
      .credentials("your-key", "your-secret")
      .environment(MParticle.Environment.Development)  // or .Production, .AutoDetect
      .build()

    MParticle.start(options)
  }
}
\`\`\`

### Java
\`\`\`java
MParticleOptions options = MParticleOptions.builder(this)
  .credentials("your-key", "your-secret")
  .environment(MParticle.Environment.Development)
  .build();
MParticle.start(options);
\`\`\`

---

## 3. Identity

### IdentityApiRequest
\`\`\`kotlin
val identifyRequest = IdentityApiRequest.withEmptyUser()
  .email("j.smith@example.com")
  .userIdentity(MParticle.IdentityType.Other, "sha256 hashed email")
  .build()
\`\`\`

### BaseIdentityTask with listeners
\`\`\`kotlin
val identifyTask = BaseIdentityTask()
  .addSuccessListener { identityApiResult ->
    identityApiResult.user.setUserAttribute("key", "value")
  }
  .addFailureListener { identityHttpResponse ->
    // Handle IdentityApi.UNKNOWN_ERROR, THROTTLE_ERROR, etc.
  }
\`\`\`

### Call identify
\`\`\`kotlin
MParticle.getInstance()?.Identity()?.identify(identifyRequest)
\`\`\`

---

## 4. User Attributes

\`\`\`kotlin
val currentUser = MParticle.getInstance()?.Identity()?.currentUser

currentUser?.setUserAttribute("firstname", "John")
currentUser?.setUserAttribute("lastname", "Doe")
currentUser?.setUserAttribute("mobile", "3125551515")
currentUser?.setUserAttributeList("favorite-genres", arrayListOf("doc", "comedy"))
currentUser?.removeUserAttribute("attribute-to-remove")
\`\`\`

---

## 5. Screen Views

\`\`\`kotlin
val screenInfo = hashMapOf("rating" to "5", "property_type" to "hotel")
MParticle.getInstance()?.logScreen("Details", screenInfo)
\`\`\`

---

## 6. Custom Events

\`\`\`kotlin
val event = MPEvent.Builder("Video Watched", EventType.Navigation)
  .customAttributes(mapOf("category" to "Destination Intro", "title" to "Paris"))
  .build()
MParticle.getInstance()?.logEvent(event)
\`\`\`

Event types: Social, UserPreference, UserContent, Transaction, Search, Location, Navigation

---

## 7. Commerce Events

### Product.Builder
\`\`\`kotlin
val product = Product.Builder("Double Room - Econ Rate", "econ-1", 100.00)
  .quantity(4.0)
  .customAttributes(mutableMapOf("ocean-view" to "true"))
  .build()
\`\`\`

### TransactionAttributes
\`\`\`kotlin
val attributes = TransactionAttributes("foo-transaction-id")
  .setRevenue(430.00)
  .setTax(30.00)
\`\`\`

### CommerceEvent.Builder
\`\`\`kotlin
val event = CommerceEvent.Builder(Product.PURCHASE, product)
  .transactionAttributes(attributes)
  .customAttributes(mapOf("sale" to "true"))
  .build()
MParticle.getInstance()?.logEvent(event)
\`\`\`

---

## 8. Placements

### Overlay
\`\`\`kotlin
val attributes = mapOf(
  "email" to "j.smith@example.com",
  "firstname" to "Jenny",
  "lastname" to "Smith",
  "billingzipcode" to "90210",
  "confirmationref" to "54321"
)
val roktConfig = RoktConfig.Builder()
  .colorMode(RoktConfig.ColorMode.LIGHT)  // LIGHT, DARK, SYSTEM
  .build()
MParticle.getInstance()?.Rokt()?.selectPlacements(
  identifier = "RoktExperience",
  attributes = attributes,
  fontTypefaces = fontTypefaces,
  config = roktConfig,
  embeddedViews = null,
  callbacks = null
)
\`\`\`

### RoktConfig.Builder
\`\`\`kotlin
RoktConfig.Builder()
  .colorMode(RoktConfig.ColorMode.LIGHT)
  .edgeToEdgeDisplay(true)
  .cacheConfig(CacheConfig(cacheDurationInSeconds = 1200, cacheAttributes = mapOf(...)))
  .build()
\`\`\`

### RoktEmbeddedView (XML)
\`\`\`xml
<com.mparticle.rokt.RoktEmbeddedView
  android:id="@+id/roktEmbeddedView"
  android:layout_width="match_parent"
  android:layout_height="wrap_content"
  app:layout_constraintTop_toTopOf="parent" />
\`\`\`

### MpRoktEventCallback
\`\`\`kotlin
val callbacks = object : MpRoktEventCallback {
  override fun onLoad() { }
  override fun onUnload(reason: UnloadReasons) { }
  override fun onShouldShowLoadingIndicator() { }
  override fun onShouldHideLoadingIndicator() { }
}
\`\`\`

### Embedded with placeholders
\`\`\`kotlin
val roktWidget = findViewById<RoktEmbeddedView>(R.id.roktEmbeddedView)
val placeHolders = mapOf(Pair("RoktEmbedded1", WeakReference(roktWidget)))
instance?.Rokt()?.selectPlacements(
  identifier = "RoktExperience",
  attributes = attributes,
  embeddedViews = placeHolders,
  callbacks = callbacks,
  config = roktConfig
)
\`\`\`

### Close placement
\`\`\`kotlin
Rokt.close()
\`\`\`

---

## 9. Font Configuration

### fontFilePathMap (assets)
\`\`\`kotlin
val options = MParticleOptions.builder(this)
  .credentials("key", "secret")
  .roktOptions(RoktOptions(fontFilePathMap = mapOf("Arial-Bold" to "fonts/arialbold.otf")))
  .build()
\`\`\`

### fontTypefaces
\`\`\`kotlin
val fontTypefaces: MutableMap<String, WeakReference<Typeface>> = HashMap()
fontTypefaces["Arial-Bold"] = WeakReference(yourTypefaceObject)
\`\`\`

---

## 10. Edge-to-Edge Display
\`\`\`kotlin
val roktConfig = RoktConfig.Builder()
  .edgeToEdgeDisplay(true)  // default true
  .build()
\`\`\`

---

## 11. Events Flow API
\`\`\`kotlin
owner.lifecycleScope.launch {
  owner.lifecycle.repeatOnLifecycle(Lifecycle.State.CREATED) {
    MParticle.getInstance()?.Rokt()?.events("RoktExperience").collect { roktEvent ->
      Log.d("RoktEvent", "Event: $roktEvent")
    }
  }
}
\`\`\`

Events: ShowLoadingIndicator, HideLoadingIndicator, OfferEngagement, PositiveEngagement, FirstPositiveEngagement, PlacementInteractive, PlacementReady, PlacementClosed, PlacementCompleted, PlacementFailure, OpenUrl, CartItemInstantPurchase

---

## 12. Global Events API
\`\`\`kotlin
import com.rokt.roktsdk.RoktEvent
owner.lifecycleScope.launch {
  Rokt.globalEvents().collect { event ->
    if (event is RoktEvent.InitComplete) Log.d("Rokt", "init completed")
  }
}
\`\`\`

---

## 13. CacheConfig
\`\`\`kotlin
import com.mparticle.rokt.CacheConfig
val roktConfig = RoktConfig.Builder()
  .cacheConfig(CacheConfig(
    cacheDurationInSeconds = 1200,
    cacheAttributes = mapOf("email" to "j.smith@example.com", "orderNumber" to "123")
  ))
  .build()
\`\`\`

---

## 14. Session ID Passing
Pass session ID via attributes when available for continuity.

---

## 15. Jetpack Compose - RoktLayout
\`\`\`kotlin
import com.mparticle.kits.RoktLayout

@Composable
fun MainScreen(modifier: Modifier = Modifier) {
  val attributes = mapOf(
    "email" to "j.smith@example.com",
    "firstname" to "Jenny",
    "lastname" to "Smith",
    "postcode" to "90210",
    "country" to "US"
  )
  val roktConfig = RoktConfig.Builder()
    .colorMode(RoktConfig.ColorMode.DARK)
    .cacheConfig(CacheConfig(cacheDurationInSeconds = 1200, cacheAttributes = mapOf(...)))
    .build()
  RoktLayout(
    sdkTriggered = true,
    identifier = "RoktExperience",
    attributes = attributes,
    location = "Location1",
    modifier = Modifier.fillMaxWidth(),
    mpRoktEventCallback = callbacks,
    config = roktConfig
  )
}
\`\`\`

Parameters: sdkTriggered, identifier, location (optional), attributes, modifier, mpRoktEventCallback, config

---

## 16. Error Handling
\`\`\`kotlin
MParticle.getInstance()?.Identity()?.identify(identifyRequest)
  ?.addFailureListener { identityHttpResponse ->
    when (identityHttpResponse?.httpCode) {
      IdentityApi.UNKNOWN_ERROR -> // device offline, retry
      IdentityApi.THROTTLE_ERROR -> // throttled, retry
      else -> // inspect error
    }
  }
\`\`\`

---

## 17. Debugging
\`\`\`kotlin
Rokt.setLoggingEnabled(enable = true)
\`\`\`
`;
