import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ManaHealthLogo } from './ManaHealthLogo';

interface SplashScreenProps {
  onDismiss: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  const { language } = useLanguage();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onDismiss();
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      role="status"
      aria-label="MANA HEALTH CONNECT Startup Splash Screen"
      className="fixed inset-0 z-50 bg-gradient-to-b from-sky-100 via-white to-sky-50 flex flex-col items-center justify-between select-none overflow-hidden cursor-pointer"
    >
      {/* Top Healthcare Leaf & Sky Accent Strip */}
      <div className="w-full px-6 pt-5 flex items-center justify-between max-w-2xl text-[11px] sm:text-xs font-bold text-blue-900/80">
        <span>ANDHRA PRADESH & TELANGANA</span>
        <span className="text-green-700">ABDM Ready</span>
      </div>

      {/* Centered Large MANA HEALTH CONNECT Logo + Branding */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-lg w-full">
        <div className="p-4 sm:p-5 rounded-[2.25rem] bg-white shadow-xl shadow-blue-900/10 border-2 border-sky-200 mb-5">
          <ManaHealthLogo size="xl" className="w-32 h-32 sm:w-40 sm:h-40" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-blue-900 leading-none">
          MANA
        </h1>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-red-600 mt-1">
          HEALTH CONNECT
        </h2>

        <div className="mt-4 bg-green-600 text-white px-6 py-2 rounded-full shadow-md">
          <p className="text-base sm:text-xl font-extrabold tracking-wide">
            మీ ఆరోగ్యం – మా ప్రాధాన్యత
          </p>
        </div>

        <p className="text-sm sm:text-base font-bold italic text-blue-800 mt-2.5">
          Your Health... Our Priority...
        </p>

        <p className="text-xs text-slate-600 mt-3 max-w-sm">
          {language === 'te'
            ? 'మన ఆరోగ్య సేవలు · వైద్యులు · 108 అంబులెన్స్ · మందుల రిమైండర్'
            : 'Doctors · 108 Ambulance · Medicine Reminders · Health Locker'}
        </p>
      </div>

      {/* Bottom Green & Blue Pulse Wave + Loading Bar */}
      <div className="w-full relative pt-6">
        <div className="h-2.5 w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600"></div>
        <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-900 text-white py-5 px-6 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2.5 text-sm font-bold">
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
            <span>{language === 'te' ? 'ప్రారంభమవుతోంది...' : 'Loading...'}</span>
          </div>
          <p className="text-[11px] text-sky-200">
            Turangi, Kakinada · Helpline: +91 8977776111
          </p>
        </div>
      </div>
    </div>
  );
};
