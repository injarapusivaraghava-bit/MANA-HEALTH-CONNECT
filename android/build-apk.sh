#!/usr/bin/env bash
set -euo pipefail

ANDROID_SDK="${ANDROID_HOME:-/opt/android-sdk}"
BUILD_TOOLS="$ANDROID_SDK/build-tools/34.0.0"
PLATFORM_JAR="$ANDROID_SDK/platforms/android-34/android.jar"
BUNDLETOOL="$ANDROID_SDK/bundletool.jar"
RES_DIR="android/app/src/main/res"
MANIFEST="android/app/src/main/AndroidManifest.xml"
JAVA_SRC="android/app/src/main/java"
OUT_APK="public/ManaHealthConnect.apk"
OUT_AAB="public/ManaHealthConnect.aab"

WORK_DIR="/tmp/manahealth-android-release"
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR/compiled_res" "$WORK_DIR/gen" "$WORK_DIR/classes" "$WORK_DIR/dex" "$WORK_DIR/proto_unpack" "$WORK_DIR/aab_base"

# 1. Compile all Android resources (mipmap PNGs, adaptive XML, Android 12+ values-v31, layouts)
"$BUILD_TOOLS/aapt2" compile --dir "$RES_DIR" -o "$WORK_DIR/compiled_res/res.zip"

# 2. Link resources into binary APK + R.java
"$BUILD_TOOLS/aapt2" link \
  -I "$PLATFORM_JAR" \
  --manifest "$MANIFEST" \
  --java "$WORK_DIR/gen" \
  --min-sdk-version 24 \
  --target-sdk-version 34 \
  --version-code 2 \
  --version-name 1.1.0 \
  --auto-add-overlay \
  -o "$WORK_DIR/unaligned.apk" \
  "$WORK_DIR/compiled_res/res.zip"

# 3. Compile R.java, SplashActivity.java, and MainActivity.java
javac --release 11 \
  -classpath "$PLATFORM_JAR" \
  -d "$WORK_DIR/classes" \
  $(find "$WORK_DIR/gen" "$JAVA_SRC" -name "*.java")

# 4. Convert .class files into classes.dex with D8
"$BUILD_TOOLS/d8" \
  --release \
  --min-api 24 \
  --lib "$PLATFORM_JAR" \
  --output "$WORK_DIR/dex" \
  $(find "$WORK_DIR/classes" -name "*.class")

# 5. Package, zipalign, and sign APK
cp "$WORK_DIR/unaligned.apk" "$WORK_DIR/with_dex.apk"
python3 -c "import zipfile; z = zipfile.ZipFile('$WORK_DIR/with_dex.apk', 'a', zipfile.ZIP_DEFLATED); z.write('$WORK_DIR/dex/classes.dex', 'classes.dex'); z.close()"
"$BUILD_TOOLS/zipalign" -f -p 4 "$WORK_DIR/with_dex.apk" "$WORK_DIR/aligned.apk"

KEYSTORE="$ANDROID_SDK/manahealth-release.jks"
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -noprompt \
    -keystore "$KEYSTORE" \
    -alias manahealth \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass manahealth2025 -keypass manahealth2025 \
    -dname "CN=Injarapu Siva Raghava, OU=Mana Health Connect, O=Mana Health Connect, L=Kakinada, ST=Andhra Pradesh, C=IN"
fi

"$BUILD_TOOLS/apksigner" sign \
  --ks "$KEYSTORE" \
  --ks-key-alias manahealth \
  --ks-pass pass:manahealth2025 \
  --key-pass pass:manahealth2025 \
  --out "$OUT_APK" \
  "$WORK_DIR/aligned.apk"

echo "=== APK VERIFICATION ==="
"$BUILD_TOOLS/apksigner" verify --verbose --print-certs "$OUT_APK"
"$BUILD_TOOLS/aapt" dump badging "$OUT_APK" | head -n 20
ls -lh "$OUT_APK"

# 6. Build and validate Google Play Android App Bundle (AAB) via aapt2 --proto-format + bundletool
if [ -f "$BUNDLETOOL" ]; then
  "$BUILD_TOOLS/aapt2" link \
    --proto-format \
    -I "$PLATFORM_JAR" \
    --manifest "$MANIFEST" \
    --min-sdk-version 24 \
    --target-sdk-version 34 \
    --version-code 2 \
    --version-name 1.1.0 \
    --auto-add-overlay \
    -o "$WORK_DIR/proto_base.apk" \
    "$WORK_DIR/compiled_res/res.zip"

  unzip -q "$WORK_DIR/proto_base.apk" -d "$WORK_DIR/proto_unpack"
  mkdir -p "$WORK_DIR/aab_base/manifest" "$WORK_DIR/aab_base/dex"
  cp "$WORK_DIR/proto_unpack/AndroidManifest.xml" "$WORK_DIR/aab_base/manifest/AndroidManifest.xml"
  cp "$WORK_DIR/proto_unpack/resources.pb" "$WORK_DIR/aab_base/resources.pb"
  if [ -d "$WORK_DIR/proto_unpack/res" ]; then
    cp -r "$WORK_DIR/proto_unpack/res" "$WORK_DIR/aab_base/res"
  fi
  cp "$WORK_DIR/dex/classes.dex" "$WORK_DIR/aab_base/dex/classes.dex"

  (cd "$WORK_DIR/aab_base" && python3 -c "
import os, zipfile
with zipfile.ZipFile('$WORK_DIR/base.zip', 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, _, files in os.walk('.'):
        for f in sorted(files):
            full = os.path.join(root, f)
            arc = os.path.relpath(full, '.')
            zf.write(full, arc)
")

  rm -f "$OUT_AAB"
  java -jar "$BUNDLETOOL" build-bundle \
    --modules="$WORK_DIR/base.zip" \
    --output="$OUT_AAB"

  jarsigner -keystore "$KEYSTORE" \
    -storepass manahealth2025 \
    -keypass manahealth2025 \
    -sigalg SHA256withRSA \
    -digestalg SHA-256 \
    "$OUT_AAB" \
    manahealth

  echo "=== AAB VERIFICATION ==="
  java -jar "$BUNDLETOOL" validate --bundle="$OUT_AAB"
  jarsigner -verify -verbose -certs "$OUT_AAB" | tail -n 10
  ls -lh "$OUT_AAB"
fi

rm -rf "$WORK_DIR"
