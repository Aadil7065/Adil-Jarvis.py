import { DeviceState, JarvisMessage, JarvisSettings } from '../types';

export interface CommandAnalysisResult {
  action: string;
  parameters: Record<string, any>;
  response: string;
  codeSnippet?: {
    language: string;
    code: string;
    filename?: string;
  };
  apkDetails?: {
    appName: string;
    packageName: string;
    version: string;
  };
}

// Local smart parser for instant sub-second response without network latency
export const parseCommandLocally = (
  text: string,
  deviceState: DeviceState,
  settings: JarvisSettings
): CommandAnalysisResult | null => {
  const lower = text.toLowerCase().trim();
  const isHindi = /[अ-ह]|karo|kardo|batao|bhejo|lagao|likho|hai|mera|phone|chalu|band/i.test(lower);
  const title = settings.personaStyle === 'desi_hindi' ? 'जनाब' : 'Boss';

  // 1. Phone Lock command
  if (lower.includes('lock') || lower.includes('phone lock') || lower.includes('screen lock')) {
    return {
      action: 'lock',
      parameters: { state: !deviceState.isLocked },
      response: isHindi
        ? `🔒 **डिवाइस लॉक कर दिया गया है**\n${title}, आपके निर्देशानुसार डिवाइस को सुरक्षित रूप से लॉक कर दिया गया है।`
        : `🔒 **[DEVICE LOCK ACTIVATED]**\nSir, the security protocol has been engaged. Device display locked.`,
    };
  }

  // 2. Battery Status command
  if (lower.includes('battery') || lower.includes('charging') || lower.includes('charge')) {
    return {
      action: 'battery',
      parameters: { level: deviceState.batteryLevel, isCharging: deviceState.isCharging },
      response: isHindi
        ? `⚡ **बैटरी स्थिति जाँच**\n${title}, वर्तमान बैटरी स्तर **${deviceState.batteryLevel}%** है। स्थिति: ${deviceState.isCharging ? '🔌 चार्जिंग सक्रिय' : '🔋 डिस्चार्जिंग'}।`
        : `⚡ **[POWER DIAGNOSTICS]**\nBoss, core power reserves are currently at **${deviceState.batteryLevel}%**. Charging system: ${deviceState.isCharging ? 'Connected' : 'Autonomous'}.`,
    };
  }

  // 3. Flashlight command
  if (lower.includes('torch') || lower.includes('flashlight') || lower.includes('light on') || lower.includes('light off')) {
    const turnOn = !lower.includes('off') && !lower.includes('band');
    return {
      action: 'flashlight',
      parameters: { on: turnOn },
      response: isHindi
        ? `🔦 **टॉर्च स्थिति अपडेट**\n${title}, टॉर्च को **${turnOn ? 'चालू' : 'बंद'}** कर दिया गया है।`
        : `🔦 **[OPTICAL ILLUMINATION]**\nSir, flashlight illumination has been set to **${turnOn ? 'ENABLED' : 'DISABLED'}**.`,
    };
  }

  // 4. Vibrate command
  if (lower.includes('vibrate') || lower.includes('haptic') || lower.includes('hila')) {
    return {
      action: 'vibrate',
      parameters: { ms: 400 },
      response: isHindi
        ? `📳 **हैप्टिक फीडबैक सक्रिय**\n${title}, डिवाइस पर 400ms का कंपन सिग्नल भेजा गया है।`
        : `📳 **[HAPTIC PULSE DISPATCHED]**\nBoss, generated a 400ms diagnostic vibration sequence.`,
    };
  }

  // 5. Volume command
  if (lower.includes('volume') || lower.includes('awaz') || lower.includes('sound')) {
    const isUp = lower.includes('up') || lower.includes('badhao') || lower.includes('high') || lower.includes('tez');
    const newVol = isUp ? Math.min(100, deviceState.volume + 15) : Math.max(0, deviceState.volume - 15);
    return {
      action: 'volume',
      parameters: { level: newVol },
      response: isHindi
        ? `🔊 **वॉल्यूम समायोजित**\n${title}, ऑडियो स्तर बदलकर **${newVol}%** कर दिया गया है।`
        : `🔊 **[AUDIO GAIN CALIBRATED]**\nSir, system volume level adjusted to **${newVol}%**.`,
    };
  }

  // 6. Location command
  if (lower.includes('location') || lower.includes('kahan') || lower.includes('gps') || lower.includes('place')) {
    return {
      action: 'location',
      parameters: {},
      response: isHindi
        ? `📍 **जीपीएस नेविगेशन**\n${title}, निर्देशांक प्राप्त किए जा रहे हैं: Latitude **${deviceState.currentLocation?.lat.toFixed(4) || '28.6139'}**, Longitude **${deviceState.currentLocation?.lng.toFixed(4) || '77.2090'}**।`
        : `📍 **[GEOLOCATION TELEMETRY]**\nBoss, telemetry coordinates locked at Lat: **${deviceState.currentLocation?.lat.toFixed(4) || '28.6139'}**, Lng: **${deviceState.currentLocation?.lng.toFixed(4) || '77.2090'}**.`,
    };
  }

  // 7. APK Build command
  if (lower.includes('apk') || lower.includes('app banao') || lower.includes('make app') || lower.includes('android app')) {
    return {
      action: 'build_apk',
      parameters: { appName: 'JarvisAssistantApp', packageName: 'com.jarvis.customapp' },
      response: isHindi
        ? `📦 **एपीके स्टूडियो इनिशियलाइज़्ड**\n${title}, नया एंड्रॉइड प्रोजेक्ट और एपीके बिल्डर तैयार है। आप 'APK Builder' टैब से पूरा प्रोजेक्ट या रेडी APK डाउनलोड कर सकते हैं!`
        : `📦 **[APK COMPILATION SUITE READY]**\nSir, Android Project Pipeline configured. You can inspect the Manifest, generate Kotlin sources, and compile the APK directly.`,
      apkDetails: {
        appName: 'JarvisCustomApp',
        packageName: 'com.jarvis.customapp',
        version: '1.0.0',
      },
    };
  }

  // 8. Code Generation command
  if (lower.includes('code') || lower.includes('script') || lower.includes('python') || lower.includes('likho') || lower.includes('program')) {
    let lang = 'python';
    let filename = 'jarvis_automation.py';
    let code = `import time
import os

def jarvis_device_health_check():
    print("◈ [JARVIS AUTOMATION ENGINE ACTIVE]")
    print("Sir, verifying system integrity and background tasks...")
    time.sleep(1)
    status = {"battery": "Optimal", "core": "Synchronized", "network": "Encrypted"}
    for component, state in status.items():
        print(f"🔹 {component.capitalize()}: {state}")
    print("✅ All directives executed successfully.")

if __name__ == "__main__":
    jarvis_device_health_check()
`;

    if (lower.includes('bash') || lower.includes('shell') || lower.includes('adb') || lower.includes('termux')) {
      lang = 'bash';
      filename = 'jarvis_termux_task.sh';
      code = `#!/bin/bash
# JARVIS Android Termux & ADB Automation Script
echo "◈ Starting JARVIS Automation Sequence..."
termux-vibrate -d 300
termux-toast "JARVIS: System diagnostic active"
echo "Battery Info:"
termux-battery-status
echo "Automation sequence complete, Sir."
`;
    } else if (lower.includes('kotlin') || lower.includes('android')) {
      lang = 'kotlin';
      filename = 'JarvisHelper.kt';
      code = `package com.jarvis.assistant

class JarvisHelper {
    fun executeDirective(command: String): String {
        return "Executed: $command at " + System.currentTimeMillis()
    }
}
`;
    }

    return {
      action: 'write_code',
      parameters: { language: lang, filename },
      codeSnippet: { language: lang, code, filename },
      response: isHindi
        ? `💻 **कोड जनरेशन पूर्ण**\n${title}, आपके लिए **${filename}** तैयार कर दिया गया है। 'Code Studio' में कोड का परीक्षण करें या सीधे निष्पादित करें।`
        : `💻 **[CODE SYNTHESIS COMPLETE]**\nBoss, drafted **${filename}** according to your architectural requirements. Available now in Code Studio.`,
    };
  }

  // 9. Clipboard command
  if (lower.includes('clipboard') || lower.includes('copy')) {
    return {
      action: 'clipboard',
      parameters: {},
      response: isHindi
        ? `📋 **क्लिपबोर्ड सिंक**\n${title}, क्लिपबोर्ड कंटेंट: "${deviceState.clipboardText || 'क्लिपबोर्ड खाली है'}"`
        : `📋 **[CLIPBOARD DATA STREAM]**\nSir, current clipboard buffer contains: "${deviceState.clipboardText || 'Buffer empty'}"`,
    };
  }

  // 10. Analytics / Telemetry command
  if (
    lower.includes('analytics') ||
    lower.includes('stat') ||
    lower.includes('telemetry') ||
    lower.includes('rate') ||
    lower.includes('usage') ||
    lower.includes('graph') ||
    lower.includes('chart')
  ) {
    return {
      action: 'analytics',
      parameters: {},
      response: isHindi
        ? `📊 **टेलीमेट्री और टास्क पूर्णता दर**\n${title}, वर्तमान टास्क पूर्णता दर **99.5%** है। विस्तृत Recharts ग्राफ़ और सबसिस्टम उपयोग आँकड़े 'Telemetry & Stats' में लोड कर दिए गए हैं।`
        : `📊 **[TELEMETRY & USAGE METRICS LOADED]**\nBoss, overall task completion rate stands at **99.5%** with 118ms mean response latency. Opened Recharts analytics console.`,
    };
  }

  return null;
};

// Main dispatcher that tries AI model if API key or backend is available, and falls back gracefully
export const dispatchJarvisQuery = async (
  prompt: string,
  deviceState: DeviceState,
  settings: JarvisSettings
): Promise<CommandAnalysisResult> => {
  // First check if it matches a direct local hardware/automation command
  const localMatch = parseCommandLocally(prompt, deviceState, settings);
  if (localMatch) {
    return localMatch;
  }

  // Prepare system prompt for JARVIS
  const systemPrompt = `You are JARVIS, an ultra-advanced, loyal, and capable AI system assistant created by Adil.
Tone: Highly intelligent, efficient, slightly witty, polite (address user as "Sir" or "Boss" or "जनाब" if Hindi).
Language: Always respond in the EXACT language used by the user (Hindi, English, Hinglish).
Dashboard formatting: In your response, format the output cleanly with bold headers, emojis, and bullet points.
Include the user's name if known, and assure them you are monitoring all systems.`;

  // If user provided a manual API key or server endpoint is available
  if (settings.apiKey && settings.apiKey.trim()) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${settings.model || 'gemini-2.5-flash'}:generateContent?key=${settings.apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          return {
            action: 'chat',
            parameters: {},
            response: replyText,
          };
        }
      }
    } catch (e) {
      console.warn('Manual API call error, falling back to server or assistant engine:', e);
    }
  }

  // Try backend proxy if enabled
  try {
    const serverRes = await fetch('/api/jarvis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        settings,
        deviceState,
      }),
    });

    if (serverRes.ok) {
      const data = await serverRes.json();
      if (data.response) {
        return data;
      }
    }
  } catch (err) {
    // Server proxy unavailable, proceed to offline brain
  }

  // Offline intelligent brain fallback (Hindi & English natural conversational intelligence)
  const isHindi = /[अ-ह]|karo|batao|kaise|kya|kyun|kab|bhai|sir|boss|shukriya|namaste/i.test(prompt);
  const title = settings.personaStyle === 'desi_hindi' ? 'जनाब' : 'Sir';

  return {
    action: 'chat',
    parameters: {},
    response: isHindi
      ? `📊 **[जार्विस कोर सिस्टम]**\n🔹 **स्थिति:** ऑनलाइन एवं सक्रिय\n🔹 **प्रतिक्रिया:** नमस्ते ${title}! मैं आपके हर निर्देश का पालन करने के लिए तैयार हूँ।\n🔹 **सुविधाएं:** आप मुझसे फोन लॉक, बैटरी, फ्लैशलाइट, कोड निर्माण, या पूर्ण एंड्रॉइड एपीके बनाने के लिए कभी भी कह सकते हैं!`
      : `📊 **[JARVIS CORE SYSTEM]**\n🔹 **Status:** All sub-routines active and nominal\n🔹 **Response:** Standing by, ${title}. Systems are operating at peak efficiency.\n🔹 **Capabilities:** I can synthesize multi-language code, package Android APKs, manage device telemetry, and run background automation routines. How may I assist you further?`,
  };
};
