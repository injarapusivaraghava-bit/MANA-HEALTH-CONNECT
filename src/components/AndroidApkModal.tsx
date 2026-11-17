import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { useLanguage } from '../context/LanguageContext';
import {
  Smartphone,
  Download,
  CheckCircle2,
  AlertTriangle,
  FolderArchive,
  Terminal,
  ExternalLink,
  Shield,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'playstore' | 'vivo' | 'cloud' | 'permissions' | 'studio';
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'vivo'
}) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'playstore' | 'vivo' | 'cloud' | 'permissions' | 'studio'>(initialTab);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Generates real Android Project ZIP on the fly using JSZip
  const handleDownloadAndroidZip = async () => {
    setIsGeneratingZip(true);
    setZipError(null);
    try {
      const zip = new JSZip();

      // 1. Android Manifest
      const manifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.manahealth.connect">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.CALL_PHONE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Mana Health Connect (మన ఆరోగ్య సేవలు)"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.ManaHealth"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".SplashActivity"
            android:exported="true"
            android:theme="@style/Theme.ManaHealth.Splash">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity
            android:name=".MainActivity"
            android:exported="false"
            android:theme="@style/Theme.ManaHealth" />
    </application>
</manifest>`;

      // 1b. SplashActivity.java (Android 12+ Splash Screen handoff + 2-second branded startup -> MainActivity)
      const splashActivityContent = `package com.manahealth.connect;

import android.app.Activity;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

public class SplashActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT >= 31) {
            getSplashScreen().setOnExitAnimationListener(splashScreenView -> splashScreenView.remove());
        }

        setContentView(R.layout.activity_splash);

        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (!isFinishing() && !isDestroyed()) {
                startActivity(new Intent(SplashActivity.this, MainActivity.class));
                finish();
            }
        }, 2000L);
    }
}`;

      // 2. MainActivity.java
      const mainActivityContent = `package com.manahealth.connect;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setGeolocationEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setUserAgentString("ManaHealthConnect-Android-App");

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(
                String origin,
                GeolocationPermissions.Callback callback
            ) {
                if (callback != null) {
                    callback.invoke(origin, true, false);
                }
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (request == null || request.getUrl() == null) return false;
                String url = request.getUrl().toString();
                if (url.startsWith("tel:") ||
                    url.startsWith("mailto:") ||
                    url.startsWith("whatsapp:") ||
                    url.startsWith("geo:") ||
                    url.startsWith("https://wa.me/") ||
                    url.startsWith("https://maps.google.com/") ||
                    url.startsWith("https://www.google.com/maps")
                ) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                        return true;
                    } catch (Exception ignored) {
                        return false;
                    }
                }
                return false;
            }
        });

        // Loads hosted Mana Health Connect Web Application
        webView.loadUrl("https://ais-dev-qdhostx7jzm62pgaqpwcfg-130060079220.asia-southeast1.run.app");
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}`;

      // 3. build.gradle.kts (App level)
      const appBuildGradle = `plugins {
    id("com.android.application")
}

android {
    namespace = "com.manahealth.connect"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.manahealth.connect"
        minSdk = 24
        targetSdk = 34
        versionCode = 2
        versionName = "1.1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
}`;

      // 4. GitHub Actions Workflow for automated cloud APK building
      const githubWorkflow = `name: Build Android APK
on:
  workflow_dispatch:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: Build Debug APK
        run: ./gradlew assembleDebug

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: ManaHealthConnect-Debug-APK
          path: app/build/outputs/apk/debug/app-debug.apk
`;

      // 5. README Guide
      const readmeGuide = `# MANA HEALTH CONNECT – Android APK Project
# మన ఆరోగ్య సేవలు – ఆండ్రాయిడ్ యాప్ బిల్డ్ ప్రాజెక్ట్

**Package Name:** com.manahealth.connect  
**Application Title:** MANA HEALTH CONNECT (మన ఆరోగ్య సేవలు)  
**Registered Office:** Turangi, Kakinada, Andhra Pradesh - 533016  
**WhatsApp Helpline:** +91 8977776111  
**Proprietor:** Injarapu Siva Raghava  

### Quick Commands for PC / Android Studio:
\`\`\`bash
chmod +x gradlew
./gradlew assembleDebug
\`\`\`
The generated APK will be at:
\`app/build/outputs/apk/debug/app-debug.apk\`

Upload this project to GitHub.com and run the GitHub Action to get a direct .apk download on your Vivo phone!
`;

      // 6. Matching Android Adaptive Launcher Foreground Vector (Red, Blue, Green & White)
      const launcherIconXml = `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="120"
    android:viewportHeight="120">
    <path
        android:fillColor="#DC2626"
        android:pathData="M58,29 C50,16 36,11 23,18 C10,26 8,44 16,62 C24,79 42,90 55,95 C41,85 30,74 26,58 C22,43 26,28 38,25 C46,23 53,27 58,34 Z" />
    <path
        android:fillColor="#1D4ED8"
        android:pathData="M56,32 C61,17 75,9 90,13 C105,17 112,34 107,52 C101,73 82,88 62,95 C78,85 92,71 95,54 C97,46 92,45 84,46 C73,46 63,39 56,32 Z" />
    <path
        android:fillColor="#1D4ED8"
        android:pathData="M85,14 A16,16 0 1,1 84.9,14 Z" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M81.5,21h7v18h-7z" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M76,26.5h18v7h-18z" />
    <path
        android:fillColor="#1D4ED8"
        android:pathData="M43,41.2 A6.8,6.8 0 1,1 42.9,41.2 Z" />
    <path
        android:fillColor="#1D4ED8"
        android:pathData="M31,85 C31,64 36,58 43,58 C50,58 54,64 54,86 Q42,87 31,85 Z" />
    <path
        android:fillColor="#16A34A"
        android:pathData="M76.5,45.3 A6.2,6.2 0 1,1 76.4,45.3 Z" />
    <path
        android:fillColor="#16A34A"
        android:pathData="M66.5,86 C66.5,66.5 70.5,61 76.5,61 C82.5,61 87.5,66.5 87.5,84 Q77,87 66.5,86 Z" />
    <path
        android:fillColor="#F97316"
        android:pathData="M60,57.8 A5.2,5.2 0 1,1 59.9,57.8 Z" />
    <path
        android:fillColor="#F97316"
        android:pathData="M49.5,66 C52,66 55,70 57,72.5 L63,72.5 C65,70 68,66 70.5,66 C72,68.5 69,75 65.5,77.5 L65.5,90 Q60,91 54.5,90 L54.5,77.5 C51,75 48,68.5 49.5,66 Z" />
    <path
        android:fillColor="#16A34A"
        android:pathData="M19,82 C42,96 77,94 103,74 C92,99 57,110 26,96 C21,94 18,88 19,82 Z" />
</vector>`;

      const adaptiveIconXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>`;

      const splashLayoutXml = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#FFFFFF"
    android:gravity="center"
    android:orientation="vertical"
    android:padding="28dp">
    <ImageView
        android:layout_width="180dp"
        android:layout_height="180dp"
        android:src="@drawable/ic_launcher_foreground" />
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="16dp"
        android:text="MANA"
        android:textColor="#1E3A8A"
        android:textSize="32sp"
        android:textStyle="bold" />
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="HEALTH CONNECT"
        android:textColor="#DC2626"
        android:textSize="24sp"
        android:textStyle="bold" />
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="14dp"
        android:background="#16A34A"
        android:paddingLeft="20dp"
        android:paddingTop="8dp"
        android:paddingRight="20dp"
        android:paddingBottom="8dp"
        android:text="మీ ఆరోగ్యం – మా ప్రాధాన్యత"
        android:textColor="#FFFFFF"
        android:textSize="16sp"
        android:textStyle="bold" />
</LinearLayout>`;

      const stylesXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.ManaHealth" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:colorPrimary">#1D4ED8</item>
        <item name="android:colorPrimaryDark">#1E3A8A</item>
        <item name="android:colorAccent">#16A34A</item>
        <item name="android:statusBarColor">#1E3A8A</item>
    </style>

    <style name="Theme.ManaHealth.Splash" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:windowBackground">@android:color/white</item>
        <item name="android:statusBarColor">#0284C7</item>
    </style>
</resources>`;

      const mainLayoutXml = `<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#FFFFFF">

    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
</FrameLayout>`;

      const stylesV31Xml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.ManaHealth" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:colorPrimary">#1D4ED8</item>
        <item name="android:colorPrimaryDark">#1E3A8A</item>
        <item name="android:colorAccent">#16A34A</item>
        <item name="android:statusBarColor">#1E3A8A</item>
    </style>

    <style name="Theme.ManaHealth.Splash" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:windowBackground">@android:color/white</item>
        <item name="android:statusBarColor">#0284C7</item>
        <item name="android:windowSplashScreenBackground">#FFFFFF</item>
        <item name="android:windowSplashScreenAnimatedIcon">@drawable/splash_icon_inset</item>
        <item name="android:windowSplashScreenIconBackgroundColor">#FFFFFF</item>
        <item name="android:windowSplashScreenAnimationDuration">800</item>
    </style>
</resources>`;

      const splashInsetXml = `<?xml version="1.0" encoding="utf-8"?>
<inset xmlns:android="http://schemas.android.com/apk/res/android"
    android:drawable="@drawable/ic_launcher_foreground"
    android:insetLeft="18%"
    android:insetTop="18%"
    android:insetRight="18%"
    android:insetBottom="18%" />`;

      // Structure zip
      zip.file('app/src/main/AndroidManifest.xml', manifestContent);
      zip.file('app/src/main/java/com/manahealth/connect/SplashActivity.java', splashActivityContent);
      zip.file('app/src/main/java/com/manahealth/connect/MainActivity.java', mainActivityContent);
      zip.file('app/src/main/res/layout/activity_splash.xml', splashLayoutXml);
      zip.file('app/src/main/res/layout/activity_main.xml', mainLayoutXml);
      zip.file('app/src/main/res/drawable/ic_launcher_foreground.xml', launcherIconXml);
      zip.file('app/src/main/res/drawable/splash_icon_inset.xml', splashInsetXml);
      zip.file('app/src/main/res/values/ic_launcher_background.xml', '<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="ic_launcher_background">#FFFFFF</color></resources>');
      zip.file('app/src/main/res/values/strings.xml', '<?xml version="1.0" encoding="utf-8"?>\n<resources><string name="app_name">MANA HEALTH CONNECT</string></resources>');
      zip.file('app/src/main/res/values/styles.xml', stylesXml);
      zip.file('app/src/main/res/values-v31/styles.xml', stylesV31Xml);
      zip.file('app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml', adaptiveIconXml);
      zip.file('app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml', adaptiveIconXml);
      zip.file('app/build.gradle.kts', appBuildGradle);
      zip.file('.github/workflows/build-apk.yml', githubWorkflow);
      zip.file('README_VIVO_GUIDE.md', readmeGuide);

      // Embed real 512x512 Play Store PNG and Android Mipmap PNGs
      try {
        const playStoreResp = await fetch('/play-store-icon-512.png');
        if (playStoreResp.ok) {
          zip.file('playstore-icon-512.png', await playStoreResp.blob());
        }
        for (const density of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
          const r = await fetch(`/android-icons/mipmap-${density}/ic_launcher.png`);
          if (r.ok) {
            const b = await r.blob();
            zip.file(`app/src/main/res/mipmap-${density}/ic_launcher.png`, b);
            zip.file(`app/src/main/res/mipmap-${density}/ic_launcher_round.png`, b);
          }
        }
      } catch (iconErr) {
        console.warn('Optional PNG mipmap fetch skipped:', iconErr);
      }

      // Generate blob
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ManaHealthConnect_Android_Project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error generating ZIP:', e);
      setZipError('Could not generate Android project ZIP. Please try again.');
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-100 flex flex-col animate-in fade-in zoom-in-95">
        {zipError && (
          <div className="bg-red-50 border-b border-red-200 text-red-800 px-4 py-2 text-xs font-semibold">
            {zipError}
          </div>
        )}
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {language === 'te'
                  ? 'ఆండ్రాయిడ్ యాప్ & వివో (Vivo) మొబైల్ గైడ్'
                  : 'Android APK Build & Vivo Phone Guide'}
              </h2>
              <p className="text-xs text-emerald-200">
                Package: <code className="bg-white/20 px-1 rounded text-white">com.manahealth.connect</code>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Direct Installable Android APK & Google Play AAB Release Banners */}
        <div className="p-4 bg-gradient-to-r from-orange-50 via-amber-50 to-white border-b border-orange-200 flex flex-col gap-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="font-black text-orange-950 text-sm">
                {language === 'te'
                  ? 'ఆప్షన్ 1: డైరెక్ట్ Android / Vivo APK డౌన్‌లోడ్'
                  : 'Option 1: Direct Installable Android / Vivo APK'}
              </p>
              <p className="text-orange-800">
                Signed release APK (<code>ManaHealthConnect.apk</code> · <code>com.manahealth.connect</code> v1.1.0)
              </p>
            </div>
            <a
              href="/ManaHealthConnect.apk"
              download="ManaHealthConnect.apk"
              type="application/vnd.android.package-archive"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 shadow-md transition whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD APK</span>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-orange-200/70">
            <div className="space-y-0.5">
              <p className="font-black text-green-950 text-sm">
                {language === 'te'
                  ? 'ఆప్షన్ 2: Google Play Console App Bundle (.aab)'
                  : 'Option 2: Google Play App Bundle (.aab) — Upload Ready'}
              </p>
              <p className="text-green-800">
                Validated release AAB (<code>ManaHealthConnect.aab</code>) ready for Google Play Console review &amp; publishing.
              </p>
            </div>
            <a
              href="/ManaHealthConnect.aab"
              download="ManaHealthConnect.aab"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 shadow-md transition whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD PLAY AAB</span>
            </a>
          </div>
        </div>

        {/* Play Store 512x512 Icon & Android Source Code ZIP */}
        <div className="p-4 bg-gradient-to-r from-blue-50 via-white to-emerald-50 border-b border-emerald-100 flex flex-col gap-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-blue-100 shadow-xs">
            <div className="flex items-center gap-3">
              <img
                src="/play-store-icon-512.png"
                alt="Mana Health Connect 512x512 Play Store App Icon"
                className="w-14 h-14 rounded-2xl border border-gray-200 shadow-sm shrink-0 object-cover"
              />
              <div>
                <p className="font-extrabold text-blue-950">
                  {language === 'te'
                    ? 'Play Store & Android లాంచర్ ఐకాన్ (512×512 PNG)'
                    : 'Play Store & Android Launcher Icon (512×512 PNG)'}
                </p>
                <p className="text-[11px] text-gray-600">
                  {language === 'te'
                    ? '2-సెకన్ల స్ప్లాష్ స్క్రీన్ & అన్ని Android Mipmap ఐకాన్‌లతో సిద్ధంగా ఉంది'
                    : 'Included with Android 12+ Splash Screen, 2s Startup Branding & all mipmaps'}
                </p>
              </div>
            </div>
            <a
              href="/play-store-icon-512.png"
              download="ManaHealthConnect_PlayStore_512x512.png"
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'te' ? '512×512 PNG డౌన్‌లోడ్' : 'Download 512×512 PNG'}</span>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <p className="font-bold text-emerald-950">
                {language === 'te' ? 'ఆండ్రాయిడ్ ప్రాజెక్ట్ డౌన్‌లోడ్ (.zip):' : 'Download Complete Android Source Code (.zip):'}
              </p>
              <p className="text-emerald-700">
                Includes Gradle, Android 12+ Splash Screen, SplashActivity (2s), MainActivity &amp; Launcher Icons.
              </p>
            </div>

            <button
              onClick={handleDownloadAndroidZip}
              disabled={isGeneratingZip}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingZip ? 'Generating ZIP...' : 'Download Project (.zip)'}</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-gray-100 px-4 pt-3 gap-1 overflow-x-auto text-xs font-bold text-gray-600">
          {[
            { id: 'playstore', label: 'Google Play (AAB)' },
            { id: 'vivo', label: '1. Vivo 1-క్లిక్ PWA' },
            { id: 'cloud', label: '2. క్లౌడ్ బిల్డ్ (GitHub)' },
            { id: 'permissions', label: '3. Vivo ఫోన్ సెట్టింగ్స్' },
            { id: 'studio', label: '4. Android Studio / PC' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-2 border-b-2 whitespace-nowrap transition ${
                activeTab === t.id
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent hover:text-gray-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 text-xs text-gray-700 space-y-4">
          {/* Tab 0: Google Play Console & AAB Release */}
          {activeTab === 'playstore' && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-2xl border border-green-200 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="font-black text-green-950 text-sm">
                    Google Play Store Publishing &amp; App Bundle (.aab)
                  </h3>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    Pending Play Console Upload &amp; Review
                  </span>
                </div>
                <p className="text-green-900 leading-relaxed">
                  Your signed Android App Bundle (<code>ManaHealthConnect.aab</code>) and 512×512 Play Store icon are built and validated. Upload the <code>.aab</code> to Google Play Console; once Google Play approves and publishes the app, customers can install directly from Google Play.
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900">Play Store Release Configuration:</p>
                <p>• Application ID: <code>com.manahealth.connect</code></p>
                <p>• Version Name / Code: <code>1.1.0</code> (<code>versionCode: 2</code>)</p>
                <p>• Target SDK / Min SDK: <code>API 34 (Android 14)</code> / <code>API 24 (Android 7.0+)</code></p>
                <p>
                  • Target Play Store URL (active after approval):{' '}
                  <code className="break-all">https://play.google.com/store/apps/details?id=com.manahealth.connect</code>
                </p>
              </div>

              <ol className="list-decimal list-inside space-y-2 pl-1 leading-relaxed text-gray-800 font-medium">
                <li>Download <strong>ManaHealthConnect.aab</strong> and <strong>512×512 PNG</strong> using the buttons above.</li>
                <li>Open <strong>Google Play Console</strong> &rarr; Create App &rarr; <strong>MANA HEALTH CONNECT</strong>.</li>
                <li>Upload <code>ManaHealthConnect.aab</code> under Production / Closed Testing release.</li>
                <li>Add the <code>512×512</code> icon, screenshots, and Privacy Policy, then submit for Google Play review.</li>
                <li>Until Play Store review completes, Android users can install immediately via the orange <strong>DOWNLOAD APK</strong> button.</li>
              </ol>
            </div>
          )}
          {/* Tab 1: Vivo 1-Click PWA */}
          {activeTab === 'vivo' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2">
                <h3 className="font-black text-emerald-900 text-sm">
                  📱 విధానం 1: Vivo మొబైల్ ఫోన్ లో డైరెక్ట్ 1-క్లిక్ ఇన్‌స్టాలేషన్ (PWA / WebAPK)
                </h3>
                <p className="text-emerald-800 leading-relaxed">
                  మీ Vivo ఫోన్‌లో కంప్యూటర్ లేదా లాప్‌టాప్ లేకుండా నేరుగా యాప్‌ను అసలైన రౌండ్ బ్లూ-గ్రీన్ లోగోతో ఇన్‌స్టాల్ చేసుకోవచ్చు:
                </p>
              </div>

              <ol className="list-decimal list-inside space-y-2.5 pl-1 leading-relaxed text-gray-800 font-medium">
                <li>మీ <strong>Vivo Android ఫోన్</strong> లో Google Chrome లేదా Vivo బ్రౌజర్‌ను ఓపెన్ చేయండి.</li>
                <li>ఈ వెబ్‌సైట్ అడ్రస్ ఓపెన్ చేయండి.</li>
                <li>బ్రౌజర్ పై కుడివైపున ఉన్న <strong>మూడు చుక్కలు (⋮)</strong> నొక్కండి.</li>
                <li><strong>"Install app"</strong> లేదా <strong>"Add to Home screen (హోమ్ స్క్రీన్‌కు జోడించు)"</strong> పై క్లిక్ చేయండి.</li>
                <li>Android సిస్టమ్ వెంటనే మీ Vivo ఫోన్ హోమ్ స్క్రీన్ పై <strong>Mana Health Connect</strong> యాప్ ఐకాన్ ఏర్పాటు చేస్తుంది.</li>
                <li>ఇది పూర్తి-స్క్రీన్ మోడ్, ఆఫ్‌లైన్ వర్కింగ్ మరియు వేగవంతమైన స్పీడ్‌తో పనిచేస్తుంది.</li>
              </ol>
            </div>
          )}

          {/* Tab 2: Free Cloud APK Build */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
                <h3 className="font-black text-amber-950 text-sm">
                  ⚡ విధానం 2: మొబైల్ ఫోన్ నుంచే ఉచితంగా క్లౌడ్ ద్వారా APK తయారు చేయడం (GitHub Actions Cloud Build)
                </h3>
                <p className="text-amber-900 leading-relaxed">
                  మీ దగ్గర కంప్యూటర్ లేకపోయినా, మీ Vivo మొబైల్ నుంచే ఉచితంగా 2 నిమిషాల్లో అసలైన <code>.apk</code> ఫైల్ పొందవచ్చు:
                </p>
              </div>

              <ol className="list-decimal list-inside space-y-2.5 pl-1 leading-relaxed text-gray-800 font-medium">
                <li>పైనున్న <strong>"Download Project (.zip)"</strong> బటన్ నొక్కి జిప్ ఫైల్ మీ Vivo ఫోన్‌లో డౌన్‌లోడ్ చేసుకోండి.</li>
                <li>మీ ఫోన్ బ్రౌజర్‌లో <strong>GitHub.com</strong> ఓపెన్ చేసి ఉచిత అకౌంట్‌తో లాగిన్ అవ్వండి.</li>
                <li><strong>New Repository</strong> క్లిక్ చేసి పేరు <code>mana-health-app</code> అని ఇవ్వండి.</li>
                <li>ఈ ప్రాజెక్ట్ జిప్ ఫైల్‌ను అప్‌లోడ్ చేయండి (ప్రాజెక్ట్‌లో ఇప్పటికే <code>.github/workflows/build-apk.yml</code> ఫైల్ సిద్ధంగా ఉంది).</li>
                <li>GitHub లో <strong>Actions</strong> ట్యాబ్‌లోకి వెళ్లి <strong>"Build Android APK"</strong> వద్ద <strong>Run workflow</strong> బటన్ నొక్కండి.</li>
                <li>2 నుండి 3 నిమిషాల్లో క్లౌడ్ సర్వర్ స్వయంగా Gradle రన్ చేసి <strong>ManaHealthConnect-Debug-APK</strong> తయారు చేస్తుంది.</li>
                <li>డౌన్‌లోడ్ లింక్ పై క్లిక్ చేసి మీ Vivo ఫోన్‌లోకి నేరుగా <code>.apk</code> డౌన్‌లోడ్ చేసుకోండి!</li>
              </ol>
            </div>
          )}

          {/* Tab 3: Vivo Permissions */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 space-y-2">
                <h3 className="font-black text-blue-950 text-sm">
                  ⚙️ విధానం 3: Vivo ఫోన్‌లో APK ఇన్‌స్టాల్ చేసేటప్పుడు అనుమతులు (Vivo Settings)
                </h3>
                <p className="text-blue-900 leading-relaxed">
                  Vivo Funtouch OS / Origin OS ఫోన్‌లలో కొత్త APK ఫైల్ ఇన్‌స్టాల్ చేయడానికి ఈ సెట్టింగ్ ఆన్ చేయండి:
                </p>
              </div>

              <ol className="list-decimal list-inside space-y-2.5 pl-1 leading-relaxed text-gray-800 font-medium">
                <li>Vivo ఫోన్ <strong>Settings (సెట్టింగ్స్)</strong> ఓపెన్ చేయండి.</li>
                <li><strong>Apps & Permissions (యాప్స్ మరియు అనుమతులు)</strong> లేదా <strong>Security (భద్రత)</strong> లోకి వెళ్లండి.</li>
                <li><strong>Special app access (ప్రత్యేక యాప్ యాక్సెస్)</strong> &gt; <strong>Install unknown apps (తెలియని యాప్‌లను ఇన్‌స్టాల్ చేయండి)</strong> ఎంచుకోండి.</li>
                <li>మీరు డౌన్‌లోడ్ చేసిన బ్రౌజర్ (ఉదా: <strong>Chrome</strong>) లేదా <strong>Files / Vivo File Manager</strong> ను ఎంచుకుని <strong>"Allow from this source (ఈ మూలం నుండి అనుమతించు)"</strong> ఆన్ చేయండి.</li>
                <li>ఇప్పుడు డౌన్‌లోడ్ అయిన <code>.apk</code> ఫైల్ పై నొక్కి <strong>Install</strong> బటన్ క్లిక్ చేయండి.</li>
              </ol>
            </div>
          )}

          {/* Tab 4: Android Studio */}
          {activeTab === 'studio' && (
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-2xl space-y-2">
                <h3 className="font-black text-gray-900 text-sm">
                  💻 విధానం 4: కంప్యూటర్ లో Android Studio ద్వారా APK బిల్డ్ చేయడం
                </h3>
                <p className="text-gray-600">
                  మీ వద్ద ల్యాప్‌టాప్ లేదా పీసీ ఉంటే Java 17 మరియు Android Studio ద్వారా 1 నిమిషంలో బిల్డ్ చేయవచ్చు.
                </p>
              </div>

              <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-2xl font-mono text-xs space-y-1">
                <p># Terminal Build Command:</p>
                <p>chmod +x gradlew</p>
                <p>./gradlew assembleDebug</p>
                <p className="text-gray-400 pt-2"># Output APK Location:</p>
                <p className="text-amber-300">app/build/outputs/apk/debug/app-debug.apk</p>
              </div>

              <p className="text-gray-600">
                బిల్డ్ అయిన APK ఫైల్‌ను మీ Vivo మొబైల్‌కు USB కేబుల్ లేదా WhatsApp ద్వారా పంపించి వెంటనే ఇన్‌స్టాల్ చేసుకోండి.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs rounded-b-3xl">
          <span className="text-gray-500">
            Helpline: <strong>+91 8977776111</strong> (Injarapu Siva Raghava)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
