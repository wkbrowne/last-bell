#!/bin/sh
# Builds dist/LastBell.apk from the web game. Needs the Android SDK (build-tools 34, platform 34) and a JDK.
set -e
cd "$(dirname "$0")/.."
S=${ANDROID_SDK_ROOT:-/opt/homebrew/share/android-commandlinetools}; BT=$S/build-tools/34.0.0; AJ=$S/platforms/android-34/android.jar
[ -x "$JAVA_HOME/bin/javac" ] || export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
B=android/build; rm -rf $B; mkdir -p $B/gen $B/obj $B/assets dist
cp -R index.html manifest.json icon-192.png icon-512.png js tts $B/assets/
# Bundled files are loaded straight from the app, so drop the cache-busting suffixes.
sed -i '' -E 's/\.js\?v=[0-9]+/.js/g' $B/assets/index.html
$BT/aapt2 compile --dir android/res -o $B/res.zip
$BT/aapt2 link -o $B/base.apk -I $AJ --manifest android/AndroidManifest.xml -A $B/assets -0 onnx -0 wasm --java $B/gen $B/res.zip
javac -nowarn --release 8 -cp $AJ -d $B/obj $B/gen/com/wkbrowne/lastbell/R.java android/src/com/wkbrowne/lastbell/MainActivity.java
$S/build-tools/36.0.0/d8 --release --lib $AJ --min-api 22 --output $B $(find $B/obj -name '*.class')
(cd $B && zip -q -j base.apk classes.dex)
$BT/zipalign -f 4 $B/base.apk $B/aligned.apk
KS=android/lastbell.keystore
[ -f $KS ] || keytool -genkeypair -keystore $KS -storepass lastbell -keypass lastbell -alias lastbell -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Last Bell" >/dev/null 2>&1
$BT/apksigner sign --ks $KS --ks-pass pass:lastbell --key-pass pass:lastbell --out dist/LastBell.apk $B/aligned.apk
$BT/apksigner verify --print-certs dist/LastBell.apk | head -2
ls -la dist/LastBell.apk
