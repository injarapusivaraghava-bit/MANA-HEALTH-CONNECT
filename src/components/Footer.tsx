import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  PhoneCall,
  Mail,
  MapPin,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ExternalLink,
  Smartphone,
  Download
} from 'lucide-react';
import { ManaHealthLogo } from './ManaHealthLogo';

interface FooterProps {
  openLegalModal: (type: 'privacy' | 'terms' | 'disclaimer') => void;
  openAndroidGuide: (tab?: 'playstore' | 'vivo' | 'cloud' | 'permissions' | 'studio') => void;
}

export const Footer: React.FC<FooterProps> = ({ openLegalModal, openAndroidGuide }) => {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 lg:pb-12 border-t border-slate-800">
      <div className="container mx-auto px-4">
        {/* Top Highlight Banner */}
        <div className="bg-gradient-to-r from-emerald-900/80 to-teal-900/80 border border-emerald-700/50 rounded-2xl p-6 mb-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>ఆయుష్మాన్ భారత్ డిజిటల్ మిషన్ (ABDM Ready Architecture)</span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {language === 'te'
                ? 'మన ఆరోగ్య సేవలు వేదిక నేషనల్ డిజిటల్ హెల్త్ మిషన్ (NDHM) మరియు ABHA (14-Digit Health ID) ప్రమాణాలకు అనుగుణంగా రూపొందించబడింది. పౌరుల ఆరోగ్య రికార్డులు అత్యున్నత భద్రతతో సంరక్షించబడతాయి.'
                : 'Mana Health Connect is designed in alignment with Ayushman Bharat Digital Mission (ABDM) and ABHA ID interoperability standards. Patient records adhere to strict Indian Data Protection (DPDP 2023) privacy regulations.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <a
              href="/ManaHealthConnect.apk"
              download="ManaHealthConnect.apk"
              type="application/vnd.android.package-archive"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black px-5 py-3 rounded-xl shadow-lg transition text-xs whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD APK</span>
            </a>
            <button
              type="button"
              onClick={() => openAndroidGuide('playstore')}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black px-5 py-3 rounded-xl shadow-lg transition text-xs whitespace-nowrap"
            >
              <Smartphone className="w-4 h-4" />
              <span>INSTALL FROM GOOGLE PLAY</span>
            </button>
          </div>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800 text-xs">
          {/* Column 1: Brand Info & Office */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <ManaHealthLogo size="xs" />
              <span className="font-black text-white text-base">MANA HEALTH CONNECT</span>
            </div>
            <p className="text-emerald-400 font-semibold">{t('tagline')}</p>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{t('registeredOffice')}</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href="tel:+918977776111" className="hover:text-white transition">
                  {t('whatsappHelpline')}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href="mailto:injarapusivaraghava@gmail.com" className="hover:text-white transition">
                  injarapusivaraghava@gmail.com
                </a>
              </div>
              <p className="text-slate-300 font-medium pt-1">{t('proprietor')}</p>
            </div>
          </div>

          {/* Column 2: Emergency Helplines */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs border-l-2 border-red-500 pl-2">
              అత్యవసర హెల్ప్‌లైన్లు (Emergency)
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg">
                <span>108 ఉచిత అంబులెన్స్ (AP & TS)</span>
                <a href="tel:108" className="bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-1 rounded text-[11px]">
                  Call 108
                </a>
              </li>
              <li className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg">
                <span>102 తల్లి & శిశు రక్షణ వాహనం</span>
                <a href="tel:102" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded text-[11px]">
                  Call 102
                </a>
              </li>
              <li className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg">
                <span>112 జాతీయ అత్యవసర కాల్</span>
                <a href="tel:112" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded text-[11px]">
                  Call 112
                </a>
              </li>
              <li className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg">
                <span>104 వైద్య సలహాల హెల్ప్‌లైన్</span>
                <a href="tel:104" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded text-[11px]">
                  Call 104
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Services */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs border-l-2 border-emerald-500 pl-2">
              ముఖ్య సేవలు (Key Services)
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>• డాక్టర్ అపాయింట్‌మెంట్లు (Doctor Consultation)</li>
              <li>• ప్రభుత్వ & ప్రైవేట్ ఆసుపత్రులు (Hospital Directory)</li>
              <li>• మందుల రిమైండర్లు & టైమింగ్స్ (Medicine Reminder)</li>
              <li>• Gemini AI ఆరోగ్య సహాయకుడు (AI Assistant)</li>
              <li>• డిజిటల్ ల్యాబ్ టెస్టులు & హోమ్ కలెక్షన్ (Lab Tests)</li>
              <li>• రక్తదాతల డైరెక్టరీ (Blood Donors Network)</li>
              <li>• పిల్లల టీకాల షెడ్యూల్ (Child Vaccinations)</li>
              <li>• డిజిటల్ హెల్త్ రికార్డ్స్ లాకర్ (Health Records)</li>
            </ul>
          </div>

          {/* Column 4: Legal & Quality Standards */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs border-l-2 border-teal-500 pl-2">
              నిబంధనలు & నాణ్యత (Legal & Safety)
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => openLegalModal('disclaimer')}
                className="w-full text-left bg-slate-800 hover:bg-slate-700/80 p-2 rounded-lg text-slate-300 flex items-center justify-between transition"
              >
                <span className="flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>వైద్య హెచ్చరిక (Medical Disclaimer)</span>
                </span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </button>

              <button
                onClick={() => openLegalModal('privacy')}
                className="w-full text-left bg-slate-800 hover:bg-slate-700/80 p-2 rounded-lg text-slate-300 flex items-center justify-between transition"
              >
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>గోప్యతా విధానం (Privacy Policy)</span>
                </span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </button>

              <button
                onClick={() => openLegalModal('terms')}
                className="w-full text-left bg-slate-800 hover:bg-slate-700/80 p-2 rounded-lg text-slate-300 flex items-center justify-between transition"
              >
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <span>వినియోగ నిబంధనలు (Terms of Use)</span>
                </span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Compliant with Digital Personal Data Protection (DPDP) Act 2023 & Indian Telemedicine Practice Guidelines.
            </p>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-6 text-center text-slate-500 text-[11px] space-y-2">
          <p className="max-w-4xl mx-auto leading-relaxed text-slate-400">
            {t('medicalDisclaimer')}
          </p>
          <p className="text-slate-400">
            © {new Date().getFullYear()} MANA HEALTH CONNECT (మన ఆరోగ్య సేవలు). All Rights Reserved. Built with pride for the health and wellness of Andhra Pradesh & Telangana.
          </p>
        </div>
      </div>
    </footer>
  );
};
