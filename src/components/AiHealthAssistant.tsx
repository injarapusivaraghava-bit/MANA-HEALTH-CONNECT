import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { healthStore } from '../services/healthStore';
import { askAiHealthAssistant, speakText, AiMessage } from '../services/aiService';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  AlertTriangle,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  Info,
  RotateCcw,
  Lock
} from 'lucide-react';

export const AiHealthAssistant: React.FC = () => {
  const { language, t } = useLanguage();
  const [aiConsentAccepted, setAiConsentAccepted] = useState<boolean>(
    Boolean(healthStore.patientProfile.aiConsentAccepted)
  );
  const [consentChecked, setConsentChecked] = useState<boolean>(false);
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        language === 'te'
          ? `నమస్కారం! నేను "మన హెల్త్ కనెక్ట్" AI ఆరోగ్య సహాయకుడిని. \n\nమీ ఆరోగ్యం, ఆహార నియమాలు, ల్యాబ్ రిపోర్టుల అర్థాలు లేదా ఏ స్పెషలిస్ట్ డాక్టర్‌ను కలవాలి అనే సందేహాలను ఇక్కడ అడగవచ్చు.\n\n⚠️ గమనిక: నేను వైద్యుడిని కాదు. వ్యాధి నిర్ధారణ లేదా మందుల ప్రిస్క్రిప్షన్ ఇవ్వను. అత్యవసర పరిస్థితుల్లో వెంటనే 108 కి కాల్ చేయండి.`
          : `Hello! I am your Mana Health Connect AI Health Assistant. \n\nYou can ask about general health education, understanding medical report terminology, or which specialist doctor to consult in Telugu or English.\n\n⚠️ Disclaimer: I do not diagnose diseases or prescribe medicines/dosages. In an emergency, immediately dial 108 or 112.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return healthStore.subscribe(() => {
      setAiConsentAccepted(Boolean(healthStore.patientProfile.aiConsentAccepted));
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleGrantAiConsent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) return;
    healthStore.recordConsent('ai_health_assistant', true);
    setAiConsentAccepted(true);
  };

  // Voice recognition using Web Speech API
  const handleToggleListening = () => {
    setVoiceNotice(null);
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice(
        language === 'te'
          ? 'మీ బ్రౌజర్ వాయిస్ రికగ్నిషన్ సపోర్ట్ చేయదు. దయచేసి టైప్ చేయండి.'
          : 'Voice input is not supported in this browser. Please type your question.'
      );
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRecognition as any)();
      recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (userPrompt?: string) => {
    if (!aiConsentAccepted) return;
    const textToSend = (userPrompt || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMsg: AiMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { reply, isEmergency } = await askAiHealthAssistant(
        textToSend,
        language,
        [...messages, userMsg]
      );

      const assistantMsg: AiMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: reply,
        isEmergency,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    {
      te: 'రక్తపోటు (BP) అధికంగా ఉంటే ఆహారంలో ఎలాంటి జాగ్రత్తలు తీసుకోవాలి?',
      en: 'What diet precautions should I take for high blood pressure?'
    },
    {
      te: 'HbA1c 7.5% అంటే ఏమిటి? ఎవరిని సంప్రదించాలి?',
      en: 'What does HbA1c 7.5% mean? Which specialist to see?'
    },
    {
      te: 'ఛాతీలో విపరీతమైన నొప్పి వస్తే ఏమి చేయాలి?',
      en: 'What should I do for sudden severe chest pain?'
    },
    {
      te: 'CBC రిపోర్ట్‌లో హీమోగ్లోబిన్ తక్కువగా ఉంటే అర్థం ఏమిటి?',
      en: 'What does low hemoglobin in a CBC report mean?'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Top AI Card Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 text-emerald-300">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">
                  {language === 'te' ? 'మన AI ఆరోగ్య సహాయకుడు' : 'Mana AI Health Assistant'}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Secure Backend AI
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                {language === 'te'
                  ? 'తెలుగు & ఇంగ్లీషులో ఆరోగ్య అవగాహన, ల్యాబ్ రిపోర్టుల అర్థాలు & స్పెషలిస్ట్ సూచనలు'
                  : 'Bilingual health education, report terminology explanations & specialist guidance'}
              </p>
            </div>
          </div>

          {aiConsentAccepted && (
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'reset',
                    role: 'assistant',
                    text: language === 'te' ? 'నమస్కారం! మీ ఆరోగ్య సందేహాలను అడగండి.' : 'Hello! How can I assist with your health education today?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-emerald-100 transition self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'కొత్త సంభాషణ' : 'New Chat'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Strict Medical Disclaimer Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-bold">వైద్య హెచ్చరిక (Clinical Notice):</strong> ఈ AI సహాయకుడు కేవలం సాధారణ ఆరోగ్య అవగాహన కోసం మాత్రమే. ఇది వ్యాధి నిర్ధారణ (Diagnosis) చేయదు, మందులు లేదా మోతాదులు ప్రిస్క్రైబ్ చేయదు. అత్యవసరమైతే వెంటనే 108 లేదా 112 కి కాల్ చేయండి.
        </p>
      </div>

      {/* Informed Consent Gate (Mandatory before sending health queries) */}
      {!aiConsentAccepted ? (
        <form
          onSubmit={handleGrantAiConsent}
          className="bg-white rounded-3xl border-2 border-emerald-200 shadow-md p-6 md:p-8 space-y-5"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black text-gray-900">
                {language === 'te'
                  ? 'AI ఆరోగ్య సహాయకుడికి మీ అనుమతి (Informed Consent Required)'
                  : 'Informed Consent for Health Information Processing'}
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                {language === 'te'
                  ? 'భారతీయ డిజిటల్ పర్సనల్ డేటా ప్రొటెక్షన్ (DPDP Act 2023) ప్రకారం, మీరు పంపే ఆరోగ్య ప్రశ్నలు సురక్షిత సర్వర్ ద్వారా ప్రాసెస్ చేయడానికి మీ స్పష్టమైన సమ్మతి అవసరం.'
                  : 'Under DPDP Act 2023, explicit consent is required before processing your health questions via our secure Gemini backend.'}
              </p>
            </div>
          </div>

          <ul className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 space-y-2 text-xs text-emerald-950 list-disc pl-8">
            <li>AI responses provide general education, medical report terminology help, and specialist guidance only.</li>
            <li>AI will NOT diagnose medical conditions, prescribe drugs, or alter prescribed dosages.</li>
            <li>Avoid sharing unnecessary identifiers (Aadhaar/bank details) in chat prompts.</li>
            <li>Emergency symptoms trigger immediate guidance to dial 108 / 112.</li>
          </ul>

          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-800 font-medium bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
            <input
              type="checkbox"
              required
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded mt-0.5"
            />
            <span>
              {language === 'te'
                ? 'పై నిబంధనలను చదివాను. AI కేవలం అవగాహన కోసమేనని మరియు వైద్యుడి పరీక్షకు ప్రత్యామ్నాయం కాదని అర్థం చేసుకుని నా ఆరోగ్య ప్రశ్నలను ప్రాసెస్ చేయడానికి సమ్మతిస్తున్నాను.'
                : 'I understand the AI is for general health education only (not diagnosis or prescriptions), and I consent to processing my health queries securely.'}
            </span>
          </label>

          <button
            type="submit"
            disabled={!consentChecked}
            className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'te' ? 'సమ్మతి ఇచ్చి AI చాట్ ప్రారంభించండి' : 'Grant Consent & Start AI Assistant'}</span>
          </button>
        </form>
      ) : (
        <>
          {/* Suggested Quick Question Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-gray-400 font-semibold pl-1 whitespace-nowrap">తరచూ అడిగే ప్రశ్నలు:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(language === 'te' ? p.te : p.en)}
                className="px-3 py-1.5 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-900 rounded-xl whitespace-nowrap transition font-medium shadow-2xs"
              >
                {language === 'te' ? p.te : p.en}
              </button>
            ))}
          </div>

          {voiceNotice && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-2xl text-xs">
              {voiceNotice}
            </div>
          )}

          {/* Chat Messages Stream */}
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-4 md:p-6 min-h-[380px] max-h-[520px] overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-700 text-white rounded-tr-xs'
                      : msg.isEmergency
                      ? 'bg-red-50 border-2 border-red-300 text-red-950 rounded-tl-xs shadow-md'
                      : 'bg-gray-50 border border-gray-200 text-gray-800 rounded-tl-xs'
                  }`}
                >
                  {msg.isEmergency && (
                    <div className="bg-red-600 text-white p-2.5 rounded-2xl mb-3 flex items-center justify-between gap-2 font-bold text-xs">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>అత్యవసర హెచ్చరిక! తక్షణ వైద్య సహాయం అవసరం</span>
                      </span>
                      <a
                        href="tel:108"
                        className="bg-white text-red-700 px-3 py-1 rounded-xl text-[11px] font-black hover:bg-red-50 flex items-center gap-1 shadow-xs"
                      >
                        <PhoneCall className="w-3 h-3 text-red-600" />
                        <span>Call 108</span>
                      </a>
                    </div>
                  )}

                  <div className="whitespace-pre-line space-y-2">{msg.text}</div>

                  <div className="flex items-center justify-between gap-4 mt-2 pt-1 border-t border-black/5 text-[10px]">
                    <span className={msg.role === 'user' ? 'text-emerald-100' : 'text-gray-400'}>
                      {msg.timestamp}
                    </span>

                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => speakText(msg.text, language)}
                        className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold"
                        title="Listen response"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{t('readOutLoud')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-2xl w-fit">
                <Sparkles className="w-4 h-4 animate-spin text-emerald-600" />
                <span>AI సమాధానం ఆలోచిస్తోంది...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form Bar */}
          <div className="bg-white p-3 rounded-3xl border border-emerald-200 shadow-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={handleToggleListening}
                className={`p-3 rounded-2xl transition ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                }`}
                title={language === 'te' ? 'తెలుగులో మాట్లాడండి' : 'Speak to AI'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isListening ? t('listening') : t('aiPromptPlaceholder')}
                className="flex-1 py-2.5 px-3 bg-transparent text-xs text-gray-800 focus:outline-none"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white p-3 rounded-2xl shadow-sm transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
