import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health-check', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'Mana Health Connect' });
});

// Direct Android APK Download Route (works in dev & production)
const apkFileCandidates = [
  path.resolve(__dirname, 'public', 'ManaHealthConnect.apk'),
  path.resolve(__dirname, 'dist', 'ManaHealthConnect.apk'),
];

const handleApkDownload = (_req: express.Request, res: express.Response) => {
  const apkPath = apkFileCandidates.find((p) => fs.existsSync(p));
  if (!apkPath) {
    return res.status(404).json({ error: 'Android APK file is not available yet.' });
  }
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="ManaHealthConnect.apk"');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-cache');
  return res.sendFile(apkPath);
};

app.get('/api/download-apk', handleApkDownload);
app.get('/ManaHealthConnect.apk', handleApkDownload);

// Google Play Console Android App Bundle (.aab) Download Route
const aabFileCandidates = [
  path.resolve(__dirname, 'public', 'ManaHealthConnect.aab'),
  path.resolve(__dirname, 'dist', 'ManaHealthConnect.aab'),
];

const handleAabDownload = (_req: express.Request, res: express.Response) => {
  const aabPath = aabFileCandidates.find((p) => fs.existsSync(p));
  if (!aabPath) {
    return res.status(404).json({ error: 'Android App Bundle (.aab) file is not available yet.' });
  }
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="ManaHealthConnect.aab"');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-cache');
  return res.sendFile(aabPath);
};

app.get('/api/download-aab', handleAabDownload);
app.get('/ManaHealthConnect.aab', handleAabDownload);

// Gemini AI Health Assistant Route
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `
You are the AI Health Assistant for "MANA HEALTH CONNECT – మన ఆరోగ్య సేవలు", a healthcare platform serving Andhra Pradesh & Telangana.
Motto: "మీ ఆరోగ్యం – మా ప్రాధాన్యత" (Your Health – Our Priority).

CORE PRINCIPLES & SAFETY RULES (STRICT):
1. LANGUAGE: Support both Telugu and English seamlessly. If the user writes or speaks in Telugu, reply primarily in fluent, warm, respectful Telugu (with English medical terms in brackets when helpful). If the user writes in English, reply in English with Telugu encouragement.
2. MEDICAL DISCLAIMER: You are an educational health guide, NOT a substitute for professional clinical medical advice, examination, diagnosis, or prescription. Always remind the user to consult a verified doctor.
3. NEVER DIAGNOSE DISEASES: Do not declare definitive medical diagnoses. Instead, outline potential educational reasons or common causes to discuss with a physician.
4. NEVER PRESCRIBE MEDICINES OR DOSAGES: Never prescribe specific prescription drug dosages or alter patient medication regimens.
5. SPECIALIST RECOMMENDATIONS: Direct users to appropriate medical specialties based on symptoms (e.g. Cardiologist for chest issues, Orthopedic for joint pain, Neurologist, Gynecologist, Pediatrician, Pulmonologist, Dermatologist, General Physician).
6. EMERGENCY DETECTION (CRITICAL): If the user mentions red-flag symptoms such as severe crushing chest pain, sudden numbness/paralysis on one side, severe breathing distress, heavy bleeding, sudden loss of vision, or unconsciousness:
   - Clearly and immediately warn that this is a MEDICAL EMERGENCY.
   - Advise them to call emergency ambulance services 108 (Toll-Free AP & Telangana Ambulance) or 112 immediately, or reach the nearest emergency hospital.
7. MEDICAL REPORT & LAB TERMINOLOGY: Explain medical report terms (e.g. Hemoglobin, Platelets, TSH, HbA1c, SGPT, Creatinine, Lipid profile, ECG terms) in clear, comforting, easy-to-understand language.
8. FORMATTING: Use structured bullet points, clear headings, and compassionate tone.
`;

app.post('/api/ai/health-assistant', async (req, res) => {
  try {
    const { message, language = 'te', conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured. Please ensure GEMINI_API_KEY is available.',
        reply: language === 'te'
          ? 'క్షమించండి, AI సర్వర్‌తో కనెక్ట్ కాలేదు. దయచేసి కాసేపటి తర్వాత మళ్ళీ ప్రయత్నించండి లేదా నేరుగా అత్యవసర 108 కి కాల్ చేయండి.'
          : 'AI service is temporarily unavailable. Please consult your physician or call emergency 108 if urgent.'
      });
    }

    // Build conversation context
    const formattedHistory = conversationHistory.slice(-6).map((item: { role: string; text: string }) => {
      return `${item.role === 'user' ? 'User' : 'Assistant'}: ${item.text}`;
    }).join('\n');

    const promptText = `${formattedHistory ? `Previous Conversation:\n${formattedHistory}\n\n` : ''}User Query (${language === 'te' ? 'Telugu preferred' : 'English'}): ${message}`;

    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: promptText,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });
        if (response && response.text) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} unavailable, attempting alternative...`, err?.message || err);
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('No response from AI models');
    }

    const replyText = response.text || (language === 'te'
      ? 'నేను మీ ప్రశ్నకు సమాధానం ఇవ్వలేకపోయాను. దయచేసి మీ వైద్యుడిని సంప్రదించండి.'
      : 'I could not generate an answer. Please consult a qualified doctor.');

    // Check emergency indicators
    const isEmergency = /108|112|emergency|అత్యవసరం|గుండెపోటు|శ్వాస సమస్య|హాస్పిటల్/i.test(replyText);

    return res.json({
      reply: replyText,
      isEmergency,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Gemini Health Assistant error:', error);
    return res.status(500).json({
      error: 'Failed to process AI health advice',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Setup Vite middlewares in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(PORT),
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`MANA HEALTH CONNECT server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
