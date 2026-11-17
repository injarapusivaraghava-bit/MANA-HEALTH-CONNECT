import { Language } from '../types';

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isEmergency?: boolean;
  timestamp: string;
}

export async function askAiHealthAssistant(
  message: string,
  language: Language,
  conversationHistory: AiMessage[]
): Promise<{ reply: string; isEmergency: boolean }> {
  try {
    const res = await fetch('/api/ai/health-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        language,
        conversationHistory: conversationHistory.map((m) => ({
          role: m.role,
          text: m.text,
        })),
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || errData.details || `Server responded with ${res.status}`);
    }

    const data = await res.json();
    return {
      reply: data.reply,
      isEmergency: Boolean(data.isEmergency),
    };
  } catch (error) {
    console.error('AI assistant request failed:', error);
    // Graceful offline fallback in Telugu / English
    if (language === 'te') {
      return {
        reply: `క్షమించండి, సర్వర్‌ను సంప్రదించడంలో సాంకేతిక అంతరాయం కలిగింది. \n\nముఖ్య గమనిక: ఇది అత్యవసరమైతే వెంటనే 108 కి కాల్ చేయండి లేదా సమీప ప్రభుత్వ ఆసుపత్రి (GGH) కి వెళ్ళండి. సాధారణ ఆరోగ్య సమస్యల కోసం మా వైద్యుల లిస్ట్ నుండి అపాయింట్‌మెంట్ బుక్ చేసుకోండి.`,
        isEmergency: false,
      };
    } else {
      return {
        reply: `We are currently experiencing connectivity with the AI server. \n\nIMPORTANT: If you or anyone is experiencing severe pain, shortness of breath, or emergency symptoms, please call 108 immediately or visit the nearest emergency room. You can also book a consultation with our verified doctors.`,
        isEmergency: false,
      };
    }
  }
}

// Text to speech helper
export function speakText(text: string, language: Language) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    // Clean markdown characters for pleasant listening
    const cleanText = text
      .replace(/[#*`_~-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick Telugu or Indian English voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchVoice = voices.find(
      (v) => (language === 'te' && (v.lang.includes('te') || v.name.includes('Telugu'))) ||
             (language === 'en' && (v.lang.includes('en-IN') || v.name.includes('India')))
    );
    if (matchVoice) {
      utterance.voice = matchVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}
