import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

export const translations = {
  // Brand & Slogans
  appName: {
    en: 'MANA HEALTH CONNECT',
    te: 'మన ఆరోగ్య సేవలు',
  },
  tagline: {
    en: 'Your Health – Our Priority',
    te: 'మీ ఆరోగ్యం – మా ప్రాధాన్యత',
  },
  subtitle: {
    en: 'Unified Digital Healthcare Platform for Andhra Pradesh & Telangana',
    te: 'ఆంధ్రప్రదేశ్ మరియు తెలంగాణ ప్రజల కోసం సమగ్ర డిజిటల్ ఆరోగ్య వేదిక',
  },

  // Navigation
  navHome: { en: 'Home', te: 'హోమ్' },
  navDoctors: { en: 'Doctors', te: 'వైద్యులు' },
  navHospitals: { en: 'Hospitals', te: 'ఆసుపత్రులు' },
  navAmbulance: { en: 'Ambulance 108', te: 'అంబులెన్స్ 108' },
  navReminders: { en: 'Medicine Reminders', te: 'మందుల రిమైండర్' },
  navAiAssistant: { en: 'AI Health Assistant', te: 'AI ఆరోగ్య సహాయకుడు' },
  navRecords: { en: 'Health Records', te: 'ఆరోగ్య రికార్డులు' },
  navFamily: { en: 'Family Health', te: 'కుటుంబ ఆరోగ్యం' },
  navLabs: { en: 'Lab Tests', te: 'ల్యాబ్ పరీక్షలు' },
  navBlood: { en: 'Blood Donors', te: 'రక్తదాతలు' },
  navTracker: { en: 'Health Tracker', te: 'ఆరోగ్య ట్రాకర్' },
  navPlans: { en: 'Plans', te: 'సబ్‌స్క్రిప్షన్' },
  navProfile: { en: 'Profile & OTP', te: 'రోగి ప్రొఫైల్' },
  navServices: { en: 'Pharmacy & Care', te: 'ఫార్మసీ & సహాయం' },
  navAdmin: { en: 'Admin Portal', te: 'అడ్మిన్ పోర్టల్' },
  navAndroidApp: { en: 'Android App & Vivo Guide', te: 'ఆండ్రాయిడ్ యాప్ & వివో గైడ్' },

  // Emergency Banner
  emergencyAlert: {
    en: 'EMERGENCY MEDICAL ASSISTANCE: Dial 108 (Free Ambulance) or 112 (Emergency Police & Medical)',
    te: 'అత్యవసర వైద్య సహాయం: వెంటనే 108 (ఉచిత అంబులెన్స్) లేదా 112 కి కాల్ చేయండి',
  },
  call108Now: {
    en: 'Call 108 Ambulance Now',
    te: 'వెంటనే 108 కి కాల్ చేయండి',
  },
  call102Now: {
    en: 'Call 102 Mother & Child Care',
    te: '102 తల్లి & శిశు రక్షణ కాల్',
  },

  // Actions
  bookAppointment: { en: 'Book Consultation', te: 'అపాయింట్‌మెంట్ బుక్ చేయండి' },
  viewDetails: { en: 'View Details', te: 'వివరాలు చూడండి' },
  searchPlaceholder: { en: 'Search doctors, hospitals, specialties...', te: 'వైద్యులు, ఆసుపత్రులు, విభాగాలు వెతకండి...' },
  filterByDistrict: { en: 'Select District', te: 'జిల్లా ఎంచుకోండి' },
  filterBySpecialty: { en: 'Select Specialty', te: 'విభాగం ఎంచుకోండి' },
  allDistricts: { en: 'All Districts', te: 'అన్ని జిల్లాలు' },
  allSpecialties: { en: 'All Specialties', te: 'అన్ని విభాగాలు' },
  save: { en: 'Save', te: 'సేవ్ చేయండి' },
  cancel: { en: 'Cancel', te: 'రద్దు చేయండి' },
  delete: { en: 'Delete', te: 'తొలగించండి' },
  upload: { en: 'Upload Report', te: 'రిపోర్ట్ అప్‌లోడ్ చేయండి' },
  download: { en: 'Download', te: 'డౌన్‌లోడ్' },
  login: { en: 'Sign In / Register', te: 'లాగిన్ / నమోదు' },
  logout: { en: 'Sign Out', te: 'లాగౌట్' },
  confirm: { en: 'Confirm', te: 'ఖరారు చేయండి' },

  // Roles
  rolePatient: { en: 'Patient', te: 'రోగి / పేషెంట్' },
  roleDoctor: { en: 'Doctor', te: 'వైద్యులు' },
  roleHospital: { en: 'Hospital Admin', te: 'ఆసుపత్రి మేనేజర్' },
  roleSuperAdmin: { en: 'Super Admin', te: 'సూపర్ అడ్మిన్' },

  // Status & Badges
  verifiedBadge: { en: 'Verified by Medical Board', te: 'ధృవీకరించబడిన వైద్యులు' },
  governmentGov: { en: 'Government Hospital', te: 'ప్రభుత్వ ఆసుపత్రి' },
  privateHospital: { en: 'Private Hospital', te: 'ప్రైవేట్ ఆసుపత్రి' },
  aarogyasriAvailable: { en: 'Aarogyasri / Ayushman Bharat Accepted', te: 'ఆరోగ్యశ్రీ / ఆయుష్మాన్ భారత్ అందుబాటులో ఉంది' },

  // Medical Disclaimer
  medicalDisclaimer: {
    en: 'Clinical Disclaimer: Mana Health Connect is a digital healthcare coordination platform. Medical content, doctor specialty suggestions, and AI responses are for health education purposes only and do not replace professional in-person medical examination, diagnosis, or treatment. In medical emergencies, immediately dial 108 or reach the nearest emergency hospital.',
    te: 'వైద్య హెచ్చరిక: మన ఆరోగ్య సేవలు ఒక డిజిటల్ ఆరోగ్య వేదిక. AI మరియు వెబ్‌సైట్ సమాచారం కేవలం ప్రజారోగ్య అవగాహన కోసం మాత్రమే. ఇది వైద్యుల ప్రత్యక్ష పరీక్ష లేదా చికిత్సకు ప్రత్యామ్నాయం కాదు. అత్యవసర పరిస్థితుల్లో వెంటనే 108 కి కాల్ చేయండి లేదా సమీప ఆసుపత్రికి వెళ్ళండి.',
  },

  // Medicine Reminders
  dosageSafetyWarning: {
    en: 'SAFETY WARNING: Never alter prescribed medicine dosages independently without consulting your doctor.',
    te: 'భద్రతా సూచన: వైద్యుల సలహా లేకుండా మందుల మోతాదును మీరే ఎప్పుడూ మార్చవద్దు.',
  },
  markTaken: { en: 'Mark as Taken', te: 'వేసుకున్నాను' },
  markMissed: { en: 'Mark as Missed', te: 'మిస్ అయ్యింది' },
  taken: { en: 'Taken', te: 'తీసుకున్నారు' },
  refillAlert: { en: 'Refill Reminder: Only few days left', te: 'మందులు అయిపోతున్నాయి: కొత్త ప్రిస్క్రిప్షన్ పొందండి' },

  // AI Assistant
  aiPromptPlaceholder: {
    en: 'Describe your symptoms or ask medical report questions in Telugu or English...',
    te: 'మీ సమస్య లేదా రిపోర్టుల గురించి తెలుగులో లేదా ఇంగ్లీషులో అడగండి...',
  },
  listening: { en: 'Listening to your voice...', te: 'మీ గొంతు వింటున్నాము...' },
  speakInTelugu: { en: 'Voice input in Telugu', te: 'తెలుగులో మాట్లాడండి' },
  speakInEnglish: { en: 'Voice input in English', te: 'ఇంగ్లీషులో మాట్లాడండి' },
  readOutLoud: { en: 'Listen audio response', te: 'వాయిస్ వినండి' },

  // Footer & Contact
  registeredOffice: {
    en: 'Registered Office: Turangi, Kakinada, Andhra Pradesh - 533016',
    te: 'రిజిస్టర్డ్ కార్యాలయం: తురంగి, కాకినాడ, ఆంధ్రప్రదేశ్ - 533016',
  },
  whatsappHelpline: {
    en: 'WhatsApp & Helpline: +91 8977776111',
    te: 'వాట్సాప్ & హెల్ప్‌లైన్: +91 8977776111',
  },
  proprietor: {
    en: 'Proprietor: Injarapu Siva Raghava',
    te: 'నిర్వాహకులు: ఇంజరపు శివ రాఘవ',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'te',
  setLanguage: () => {},
  t: () => '',
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('mana_health_lang') as Language;
    return saved === 'en' ? 'en' : 'te'; // default Telugu as requested
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mana_health_lang', lang);
  };

  const t = (key: keyof typeof translations): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
