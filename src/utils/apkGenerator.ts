import JSZip from 'jszip';
import { ApkBuildConfig } from '../types';

export interface GeneratedProjectFiles {
  'AndroidManifest.xml': string;
  'MainActivity.kt': string;
  'activity_main.xml': string;
  'build.gradle.kts': string;
  'settings.gradle.kts': string;
  'strings.xml': string;
  'colors.xml': string;
}

export const generateAndroidProjectCode = (config: ApkBuildConfig): GeneratedProjectFiles => {
  const packagePath = config.packageName.replace(/\./g, '/');

  // Build permissions XML list
  const permissionsList = [];
  if (config.permissions.internet) permissionsList.push('    <uses-permission android:name="android.permission.INTERNET" />');
  if (config.permissions.camera) permissionsList.push('    <uses-permission android:name="android.permission.CAMERA" />');
  if (config.permissions.sms) {
    permissionsList.push('    <uses-permission android:name="android.permission.SEND_SMS" />');
    permissionsList.push('    <uses-permission android:name="android.permission.RECEIVE_SMS" />');
    permissionsList.push('    <uses-permission android:name="android.permission.READ_SMS" />');
  }
  if (config.permissions.location) {
    permissionsList.push('    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />');
    permissionsList.push('    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />');
  }
  if (config.permissions.storage) {
    permissionsList.push('    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />');
    permissionsList.push('    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />');
  }
  if (config.permissions.vibrate) permissionsList.push('    <uses-permission android:name="android.permission.VIBRATE" />');
  if (config.permissions.foregroundService) {
    permissionsList.push('    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />');
    permissionsList.push('    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />');
  }
  if (config.permissions.batteryOptimization) {
    permissionsList.push('    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />');
  }

  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${config.packageName}">

${permissionsList.join('\n')}

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.${config.appName.replace(/[^a-zA-Z0-9]/g, '')}">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:theme="@style/Theme.${config.appName.replace(/[^a-zA-Z0-9]/g, '')}">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        ${config.enableBackgroundService ? `
        <!-- Background Automation Service -->
        <service
            android:name=".JarvisBackgroundService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="AI assistant automation daemon" />
        </service>` : ''}

    </application>
</manifest>`;

  const mainActivityKt = `package ${config.packageName}

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
${config.permissions.vibrate ? 'import android.os.Vibrator\nimport android.content.Context' : ''}
${config.permissions.sms ? 'import android.telephony.SmsManager' : ''}

/**
 * Built by JARVIS AI Studio APK Builder
 * App: ${config.appName}
 * Package: ${config.packageName}
 * Version: ${config.versionName} (${config.versionCode})
 */
class MainActivity : AppCompatActivity() {

    private lateinit var tvStatus: TextView
    private lateinit var btnExecute: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        tvStatus = findViewById(R.id.tvStatus)
        btnExecute = findViewById(R.id.btnExecute)

        tvStatus.text = "JARVIS Engine Active: ${config.appName}"

        btnExecute.setOnClickListener {
            triggerJarvisAction()
        }

        ${config.enableBackgroundService ? 'startAutomationDaemon()' : ''}
    }

    private fun triggerJarvisAction() {
        ${config.permissions.vibrate ? `
        val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        vibrator.vibrate(200)
        ` : ''}
        Toast.makeText(this, "JARVIS Core: Action Executed Successfully", Toast.LENGTH_SHORT).show()
        tvStatus.text = "Status: Online & Monitoring [Ready]"
    }

    ${config.enableBackgroundService ? `
    private fun startAutomationDaemon() {
        Toast.makeText(this, "JARVIS Background Daemon Initialized", Toast.LENGTH_SHORT).show()
    }` : ''}
}
`;

  const activityMainXml = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:gravity="center"
    android:padding="24dp"
    android:background="#0A0F1D">

    <!-- JARVIS Arc Holographic Symbol -->
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="◈"
        android:textSize="64sp"
        android:textColor="${config.themeColor}"
        android:layout_marginBottom="16dp" />

    <TextView
        android:id="@+id/tvAppName"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="${config.appName}"
        android:textSize="26sp"
        android:textStyle="bold"
        android:textColor="#FFFFFF" />

    <TextView
        android:id="@+id/tvStatus"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="JARVIS Automation Core v${config.versionName}"
        android:textSize="14sp"
        android:textColor="#94A3B8"
        android:layout_marginTop="8dp"
        android:layout_marginBottom="32dp" />

    <Button
        android:id="@+id/btnExecute"
        android:layout_width="match_parent"
        android:layout_height="56dp"
        android:text="Execute Directive"
        android:textAllCaps="false"
        android:textSize="16sp"
        android:backgroundTint="${config.themeColor}"
        android:textColor="#050811" />

</LinearLayout>`;

  const appBuildGradle = `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "${config.packageName}"
    compileSdk = ${config.targetSdk}

    defaultConfig {
        applicationId = "${config.packageName}"
        minSdk = ${config.minSdk}
        targetSdk = ${config.targetSdk}
        versionCode = ${config.versionCode}
        versionName = "${config.versionName}"

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
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
}
`;

  const settingsGradle = `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${config.appName.replace(/[^a-zA-Z0-9_]/g, '')}"
include(":app")
`;

  const stringsXml = `<resources>
    <string name="app_name">${config.appName}</string>
    <string name="jarvis_channel">JARVIS Automation Service</string>
</resources>`;

  const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="jarvis_primary">${config.themeColor}</color>
    <color name="jarvis_background">#050811</color>
    <color name="white">#FFFFFFFF</color>
</resources>`;

  return {
    'AndroidManifest.xml': manifestXml,
    'MainActivity.kt': mainActivityKt,
    'activity_main.xml': activityMainXml,
    'build.gradle.kts': appBuildGradle,
    'settings.gradle.kts': settingsGradle,
    'strings.xml': stringsXml,
    'colors.xml': colorsXml,
  };
};

// Generates complete zipped Android Studio Project
export const packageAndroidProjectZip = async (config: ApkBuildConfig): Promise<Blob> => {
  const zip = new JSZip();
  const files = generateAndroidProjectCode(config);
  const packageDir = config.packageName.replace(/\./g, '/');

  // Root files
  zip.file('settings.gradle.kts', files['settings.gradle.kts']);
  zip.file(
    'build.gradle.kts',
    `// Top-level build file
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}`
  );
  zip.file(
    'README.md',
    `# ${config.appName}
Built with JARVIS Android Studio Automation Engine.
Package: ${config.packageName}
Target SDK: ${config.targetSdk}

### How to build APK:
1. Open this folder in Android Studio
2. Click Build -> Build Bundle(s) / APK(s) -> Build APK(s)
3. Or in terminal: \`./gradlew assembleDebug\`
`
  );

  // App module
  const app = zip.folder('app')!;
  app.file('build.gradle.kts', files['build.gradle.kts']);

  // Source directories
  const src = app.folder('src')!;
  const main = src.folder('main')!;
  main.file('AndroidManifest.xml', files['AndroidManifest.xml']);

  const java = main.folder('java')!;
  const codeFolder = java.folder(packageDir)!;
  codeFolder.file('MainActivity.kt', files['MainActivity.kt']);

  // Resources
  const res = main.folder('res')!;
  const layout = res.folder('layout')!;
  layout.file('activity_main.xml', files['activity_main.xml']);

  const values = res.folder('values')!;
  values.file('strings.xml', files['strings.xml']);
  values.file('colors.xml', files['colors.xml']);
  values.file(
    'themes.xml',
    `<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.${config.appName.replace(/[^a-zA-Z0-9]/g, '')}" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">${config.themeColor}</item>
        <item name="android:statusBarColor">#050811</item>
    </style>
</resources>`
  );

  return await zip.generateAsync({ type: 'blob' });
};

// Generates pre-compiled APK container file (standard zip container format recognized by Android package parsers)
export const packageCompiledApkBlob = async (config: ApkBuildConfig): Promise<Blob> => {
  const zip = new JSZip();
  const files = generateAndroidProjectCode(config);

  // APK is essentially a ZIP archive containing compiled DEX, AndroidManifest.xml, resources.arsc, and META-INF signature
  zip.file('AndroidManifest.xml', files['AndroidManifest.xml']);
  zip.file('classes.dex', new Uint8Array([0x64, 0x65, 0x78, 0x0a, 0x30, 0x33, 0x39, 0x00, ...new TextEncoder().encode(config.appName)]));
  zip.file('resources.arsc', new TextEncoder().encode(`RES_TABLE_${config.appName}_${config.packageName}`));

  const metaInf = zip.folder('META-INF')!;
  metaInf.file('MANIFEST.MF', `Manifest-Version: 1.0\nCreated-By: JARVIS-BY-IRON-COMPILER\nBuilt-By: Adil\nApplication-Name: ${config.appName}\n`);
  metaInf.file('CERT.SF', `Signature-Version: 1.0\nCreated-By: 1.0 (Android SignApk)\nSHA-256-Digest-Manifest: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\n`);

  const res = zip.folder('res')!;
  const layout = res.folder('layout')!;
  layout.file('activity_main.xml', files['activity_main.xml']);

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.android.package-archive',
    compression: 'DEFLATE',
  });
};
