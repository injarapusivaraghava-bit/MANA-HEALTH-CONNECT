/**
 * MANA HEALTH CONNECT – మన ఆరోగ్య సేవలు
 * Tagline: "మీ ఆరోగ్యం – మా ప్రాధాన్యత"
 * Registered Office: Turangi, Kakinada, Andhra Pradesh - 533016
 * WhatsApp Helpline: +91 8977776111
 * Email: injarapusivaraghava@gmail.com
 * Proprietor: Injarapu Siva Raghava
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SplashScreen } from './components/SplashScreen';
import { HomeHero } from './components/HomeHero';
import { PatientProfilePanel } from './components/PatientProfilePanel';
import { EmergencyAmbulance } from './components/EmergencyAmbulance';
import { DoctorAppointments } from './components/DoctorAppointments';
import { HospitalDirectory } from './components/HospitalDirectory';
import { MedicineReminder } from './components/MedicineReminder';
import { AiHealthAssistant } from './components/AiHealthAssistant';
import { HealthRecords } from './components/HealthRecords';
import { FamilyHealth } from './components/FamilyHealth';
import { LaboratoryServices } from './components/LaboratoryServices';
import { BloodDonorDirectory } from './components/BloodDonorDirectory';
import { HealthTracker } from './components/HealthTracker';
import { OtherServices } from './components/OtherServices';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { AdminDashboard } from './components/AdminDashboard';
import { AndroidApkModal } from './components/AndroidApkModal';
import { LegalModals } from './components/LegalModals';
import { verifyFirestoreConnection } from './firebase';
import { healthStore } from './services/healthStore';
import {
  PhoneCall,
  Home,
  Stethoscope,
  Clock,
  Bot,
  UserCheck
} from 'lucide-react';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [seniorMode, setSeniorMode] = useState<boolean>(Boolean(healthStore.patientProfile.seniorCitizenMode));
  const [emergency108, setEmergency108] = useState<string>(healthStore.emergencyConfig.primary108);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [androidModalTab, setAndroidModalTab] = useState<'playstore' | 'vivo' | 'cloud' | 'permissions' | 'studio'>('vivo');
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'disclaimer' | null>(null);

  const openAndroidGuideModal = (tab: 'playstore' | 'vivo' | 'cloud' | 'permissions' | 'studio' = 'vivo') => {
    setAndroidModalTab(tab);
    setIsAndroidModalOpen(true);
  };

  useEffect(() => {
    verifyFirestoreConnection();
    return healthStore.subscribe(() => {
      setSeniorMode(Boolean(healthStore.patientProfile.seniorCitizenMode));
      setEmergency108(healthStore.emergencyConfig.primary108);
    });
  }, []);

  const handleDismissSplash = () => {
    setShowSplash(false);
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950 ${seniorMode ? 'text-[15px]' : ''}`}>
      {/* Animated Splash Screen */}
      {showSplash && <SplashScreen onDismiss={handleDismissSplash} />}

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAndroidGuide={() => openAndroidGuideModal('vivo')}
      />

      {/* Main Body View */}
      <main className="flex-1 container mx-auto px-3 sm:px-4 pt-3 pb-24 lg:py-6 max-w-7xl">
        {currentTab === 'home' && (
          <HomeHero
            setCurrentTab={setCurrentTab}
            openAndroidGuide={openAndroidGuideModal}
          />
        )}
        {currentTab === 'profile' && <PatientProfilePanel />}
        {currentTab === 'doctors' && <DoctorAppointments />}
        {currentTab === 'hospitals' && <HospitalDirectory />}
        {currentTab === 'ambulance' && <EmergencyAmbulance />}
        {currentTab === 'reminders' && <MedicineReminder />}
        {currentTab === 'ai-assistant' && <AiHealthAssistant />}
        {currentTab === 'records' && <HealthRecords />}
        {currentTab === 'family' && <FamilyHealth onNavigate={setCurrentTab} />}
        {currentTab === 'labs' && <LaboratoryServices />}
        {currentTab === 'blood' && <BloodDonorDirectory />}
        {currentTab === 'tracker' && <HealthTracker />}
        {currentTab === 'services' && <OtherServices />}
        {currentTab === 'plans' && <SubscriptionPlans />}
        {currentTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Floating Emergency Speed Dial Action Button */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40">
        <a
          href={`tel:${emergency108}`}
          className="bg-red-600 hover:bg-red-700 text-white font-black px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white ring-4 ring-red-600/30 transition transform hover:scale-105 active:scale-95"
          title={`Direct Toll-Free ${emergency108} Ambulance Call`}
        >
          <PhoneCall className="w-5 h-5" />
          <span className="text-xs font-black">{emergency108} అంబులెన్స్</span>
        </a>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 px-2 py-1.5 flex items-center justify-around text-[10px] font-bold text-gray-600 shadow-xl">
        <button
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            currentTab === 'home' ? 'text-emerald-700 font-black' : 'hover:text-emerald-600'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>హోమ్</span>
        </button>

        <button
          onClick={() => setCurrentTab('doctors')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            currentTab === 'doctors' ? 'text-emerald-700 font-black' : 'hover:text-emerald-600'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>వైద్యులు</span>
        </button>

        <button
          onClick={() => setCurrentTab('reminders')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            currentTab === 'reminders' ? 'text-emerald-700 font-black' : 'hover:text-emerald-600'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>మందులు</span>
        </button>

        <button
          onClick={() => setCurrentTab('ai-assistant')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            currentTab === 'ai-assistant' ? 'text-emerald-700 font-black' : 'hover:text-emerald-600'
          }`}
        >
          <Bot className="w-4 h-4 text-purple-600" />
          <span>AI గైడ్</span>
        </button>

        <button
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            currentTab === 'profile' ? 'text-emerald-700 font-black' : 'hover:text-emerald-600'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-700" />
          <span>ప్రొఫైల్</span>
        </button>
      </nav>

      {/* Comprehensive Footer */}
      <Footer
        openLegalModal={(type) => setLegalModalType(type)}
        openAndroidGuide={openAndroidGuideModal}
      />

      {/* Android APK & Google Play AAB Modal */}
      <AndroidApkModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        initialTab={androidModalTab}
      />

      {/* Legal & Compliance Modals */}
      <LegalModals
        modalType={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
