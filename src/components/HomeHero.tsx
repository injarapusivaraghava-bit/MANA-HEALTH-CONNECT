import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { healthStore } from '../services/healthStore';
import { ManaHealthLogo } from './ManaHealthLogo';
import {
  Stethoscope,
  Building2,
  Ambulance,
  Clock,
  Bot,
  FolderLock,
  Users,
  FlaskConical,
  Droplet,
  Activity,
  ChevronRight,
  PhoneCall,
  Play,
  UserCheck,
  HeartHandshake,
  Download,
  Smartphone
} from 'lucide-react';

interface HomeHeroProps {
  setCurrentTab: (tab: string) => void;
  openAndroidGuide: (tab?: 'playstore' | 'vivo' | 'cloud' | 'permissions' | 'studio') => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ setCurrentTab, openAndroidGuide }) => {
  const { language } = useLanguage();
  const [profile, setProfile] = useState(healthStore.patientProfile);
  const [medications, setMedications] = useState(healthStore.medications);

  useEffect(() => {
    return healthStore.subscribe(() => {
      setProfile({ ...healthStore.patientProfile });
      setMedications([...healthStore.medications]);
    });
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Large Centered Top Branding Hero (Visible immediately without scrolling on mobile & desktop) */}
      <section
        aria-label="Mana Health Connect Branding"
        className="relative rounded-3xl bg-gradient-to-b from-sky-100/80 via-white to-emerald-50 border-2 border-sky-200 px-4 py-5 sm:px-8 sm:py-7 shadow-md overflow-hidden text-center"
      >
        <div className="max-w-3xl mx-auto flex flex-col items-center space-y-2 sm:space-y-3">
          {/* Large Red, Blue, Green & White Heart + Family + Medical Cross Logo */}
          <div className="p-2.5 sm:p-3.5 rounded-3xl bg-white shadow-md shadow-blue-900/10 border border-sky-200">
            <ManaHealthLogo size="xl" />
          </div>

          {/* Centered App Name & Telugu Subtitle */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-balance">
              <span className="text-blue-900">MANA </span>
              <span className="text-red-600">HEALTH CONNECT</span>
            </h1>
            <p className="text-xs sm:text-sm font-extrabold text-emerald-700">
              మన ఆరోగ్య సేవలు
            </p>
          </div>

          {/* Option 1 (Orange): DOWNLOAD APK & Option 2 (Green): INSTALL FROM GOOGLE PLAY */}
          <div className="w-full flex flex-col items-center gap-2 pt-1.5">
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/ManaHealthConnect.apk"
                download="ManaHealthConnect.apk"
                type="application/vnd.android.package-archive"
                className="w-full sm:w-auto min-h-[54px] bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black px-6 sm:px-8 py-3.5 rounded-2xl shadow-xl shadow-orange-600/30 border-2 border-orange-300 flex items-center justify-center gap-2.5 text-sm sm:text-base tracking-wide transition transform hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <Download className="w-5 h-5 shrink-0" />
                <span>DOWNLOAD APK</span>
              </a>

              <button
                type="button"
                onClick={() => openAndroidGuide('playstore')}
                className="w-full sm:w-auto min-h-[54px] bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-700 hover:to-emerald-700 text-white font-black px-6 sm:px-8 py-3.5 rounded-2xl shadow-xl shadow-green-600/25 border-2 border-green-300 flex items-center justify-center gap-2.5 text-sm sm:text-base tracking-wide transition transform hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <Play className="w-5 h-5 fill-white shrink-0" />
                <span>INSTALL FROM GOOGLE PLAY</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1 text-orange-800 font-bold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Direct APK works on Vivo, Samsung, Redmi &amp; Android (v1.1.0)</span>
              </span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="text-emerald-800 font-bold">
                Play Store AAB Bundle Ready (Pending Console Review)
              </span>
              <button
                type="button"
                onClick={() => openAndroidGuide('vivo')}
                className="font-bold text-orange-700 hover:text-orange-800 underline underline-offset-2"
              >
                {language === 'te' ? 'ఇన్‌స్టాల్ గైడ్' : 'Install Steps'}
              </button>
            </div>
          </div>

          {/* Prominent Green Tagline Banner */}
          <div className="bg-green-600 text-white px-5 py-1.5 rounded-full shadow-xs">
            <p className="text-sm sm:text-lg font-extrabold">
              మీ ఆరోగ్యం – మా ప్రాధాన్యత
            </p>
          </div>

          <p className="text-xs sm:text-sm font-bold italic text-blue-800">
            Your Health... Our Priority...
          </p>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            {language === 'te'
              ? 'డాక్టర్ అపాయింట్‌మెంట్లు · 108 అత్యవసర అంబులెన్స్ · మందుల రిమైండర్లు · ల్యాబ్ పరీక్షలు · తెలుగు & ఇంగ్లీషులో AI ఆరోగ్య మార్గదర్శనం.'
              : 'Andhra Pradesh & Telangana healthcare coordination: verified doctor appointments, 108/102 ambulance support, medicine reminders, lab tests, and bilingual AI health guidance.'}
          </p>

          {/* Primary Quick Action Buttons */}
          <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full">
            <button
              type="button"
              onClick={() => setCurrentTab('ambulance')}
              className="min-h-[44px] bg-red-600 hover:bg-red-700 text-white font-bold px-4 sm:px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-2 text-xs sm:text-sm transition whitespace-nowrap"
            >
              <PhoneCall className="w-4 h-4 shrink-0" />
              <span>{language === 'te' ? '108 అత్యవసర అంబులెన్స్' : '108 Emergency Ambulance'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('doctors')}
              className="min-h-[44px] bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 sm:px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-2 text-xs sm:text-sm transition whitespace-nowrap"
            >
              <Stethoscope className="w-4 h-4 shrink-0" />
              <span>{language === 'te' ? 'డాక్టర్ అపాయింట్‌మెంట్' : 'Book Doctor Appointment'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('ai-assistant')}
              className="min-h-[44px] bg-green-600 hover:bg-green-700 text-white font-bold px-4 sm:px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-2 text-xs sm:text-sm transition whitespace-nowrap"
            >
              <Bot className="w-4 h-4 shrink-0" />
              <span>{language === 'te' ? 'AI ఆరోగ్య సహాయకుడు' : 'AI Health Assistant'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Patient Profile Card & Today's Medicine Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-sky-900">
                {language === 'te' ? 'రోగి ప్రొఫైల్' : 'Patient Profile'}
              </span>
              <span>ABDM Ready</span>
            </div>

            <h3 className="font-bold text-slate-900 text-base">{profile.name}</h3>
            <p className="text-xs text-slate-600">
              Age <span className="tabular-nums">{profile.age}</span> · Blood Group:{' '}
              <strong className="text-red-600">{profile.bloodGroup}</strong>
            </p>
            <p className="text-xs text-slate-600 pt-0.5">
              {profile.village}, {profile.mandal}, {profile.district}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('profile')}
            className="w-full min-h-[44px] py-2.5 px-3.5 bg-sky-50 hover:bg-sky-100 text-sky-950 rounded-2xl border border-sky-200 text-xs font-bold flex items-center justify-between transition"
          >
            <span className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-sky-700" />
              <span>{language === 'te' ? 'ప్రొఫైల్ & OTP నమోదు' : 'Complete Registration & OTP'}</span>
            </span>
            <ChevronRight className="w-4 h-4 text-sky-700" />
          </button>
        </div>

        {/* Today's Medications Due */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-700 shrink-0" />
              <h3 className="font-bold text-slate-900 text-base">
                {language === 'te' ? 'ఈ రోజు మందుల షెడ్యూల్ (Today’s Medications)' : 'Daily Dose Checklist'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('reminders')}
              className="text-xs text-sky-700 font-bold hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              <span>{language === 'te' ? 'రిమైండర్లు చూడండి' : 'Manage Reminders'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {medications.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between gap-3">
              <span>No medicine reminders scheduled yet. Add your prescribed schedule to receive alerts.</span>
              <button
                type="button"
                onClick={() => setCurrentTab('reminders')}
                className="text-emerald-700 font-bold hover:underline shrink-0"
              >
                + Add
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {medications.slice(0, 2).map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-bold text-slate-900">{m.medicineName}</p>
                    <p className="text-slate-500 text-[11px]">
                      {m.dosage} · {m.timing === 'after_food' ? 'ఆహారం తర్వాత' : 'ఆహారం ముందు'}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">{m.patientName}</p>
                  </div>

                  <span
                    className={`text-xs font-bold ${
                      m.statusToday === 'taken' || m.takenToday
                        ? 'text-emerald-700'
                        : m.statusToday === 'missed'
                        ? 'text-rose-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {m.statusToday || (m.takenToday ? 'Taken' : 'Pending')}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-sky-50/70 p-3 rounded-2xl border border-sky-100 text-xs text-sky-950 flex items-center justify-between gap-2">
            <span>వైద్యుల సలహా లేకుండా మందుల మోతాదును ఎప్పుడూ మార్చవద్దు.</span>
            <span className="font-semibold text-sky-800 shrink-0">Safety Note</span>
          </div>
        </div>
      </div>

      {/* Primary Services Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'te' ? 'మన ఆరోగ్య సేవలు (Healthcare Services)' : 'Healthcare Services & Directory'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'te'
              ? 'మీ ఆరోగ్య అవసరాలకు కావలసిన అన్ని సేవలు పెద్ద బటన్లతో సులభంగా'
              : 'Large touch-friendly cards for direct access to every healthcare service'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { id: 'doctors', title: language === 'te' ? 'డాక్టర్లు' : 'Doctors', desc: 'Appointments', icon: Stethoscope, color: 'from-sky-600 to-sky-700' },
            { id: 'hospitals', title: language === 'te' ? 'ఆసుపత్రులు' : 'Hospitals', desc: 'GGH & Private', icon: Building2, color: 'from-blue-600 to-cyan-700' },
            { id: 'ambulance', title: language === 'te' ? '108 అంబులెన్స్' : '108 Ambulance', desc: 'Emergency 24x7', icon: Ambulance, color: 'from-red-600 to-rose-700', tag: 'SOS' },
            { id: 'reminders', title: language === 'te' ? 'మందుల రిమైండర్' : 'Reminders', desc: 'Dose Alarms', icon: Clock, color: 'from-emerald-600 to-teal-700' },
            { id: 'ai-assistant', title: language === 'te' ? 'AI అసిస్టెంట్' : 'AI Assistant', desc: 'Telugu & English', icon: Bot, color: 'from-sky-700 to-emerald-700' },
            { id: 'records', title: language === 'te' ? 'ఆరోగ్య రికార్డులు' : 'Health Locker', desc: 'Reports & Drive', icon: FolderLock, color: 'from-teal-600 to-emerald-700' },
            { id: 'family', title: language === 'te' ? 'కుటుంబ ఆరోగ్యం' : 'Family Health', desc: 'Vaccines & Seniors', icon: Users, color: 'from-sky-600 to-teal-700' },
            { id: 'labs', title: language === 'te' ? 'ల్యాబ్ టెస్టులు' : 'Lab Tests', desc: 'Home Pickup', icon: FlaskConical, color: 'from-blue-700 to-sky-800' },
            { id: 'blood', title: language === 'te' ? 'రక్తదాతలు' : 'Blood Donors', desc: 'Volunteer Donors', icon: Droplet, color: 'from-red-700 to-rose-800' },
            { id: 'tracker', title: language === 'te' ? 'ఆరోగ్య ట్రాకర్' : 'Health Tracker', desc: 'BP, Sugar, Diet', icon: Activity, color: 'from-emerald-700 to-green-800' },
            { id: 'services', title: language === 'te' ? 'ఫార్మసీ & సపోర్ట్' : 'Pharmacy & Care', desc: 'Rx, Physio, Help', icon: HeartHandshake, color: 'from-cyan-600 to-sky-700' },
            { id: 'profile', title: language === 'te' ? 'రోగి ప్రొఫైల్' : 'Profile & OTP', desc: 'DPDP Privacy', icon: UserCheck, color: 'from-slate-700 to-sky-900' }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className="bg-white p-4 rounded-3xl border border-sky-100 shadow-xs hover:shadow-md hover:border-sky-300 transition text-left group flex flex-col justify-between space-y-3 relative overflow-hidden min-h-[116px]"
              >
                <div className="flex items-start justify-between w-full">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {item.tag && (
                    <span className="text-[11px] font-black text-red-600">{item.tag}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-sky-700 transition">{item.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Health Education Banner */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {language === 'te' ? 'తెలుగు ఆరోగ్య అవగాహన (Health Education)' : 'Preventive Health & Medical Guides'}
            </h3>
            <p className="text-xs text-slate-500">
              ప్రజారోగ్యం, గుండె సంరక్షణ, మరియు కాలానుగుణ వ్యాధుల నివారణపై ప్రాథమిక మార్గదర్శకాలు
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCurrentTab('services')}
            className="text-xs bg-sky-50 hover:bg-sky-100 text-sky-800 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap"
          >
            View All Guides →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {healthStore.healthContent.slice(0, 3).map((edu) => (
            <div key={edu.id} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <div className="flex items-center gap-2 text-sky-900 font-bold">
                <Play className="w-4 h-4 fill-emerald-700 text-emerald-700 shrink-0" />
                <span>{language === 'te' ? edu.titleTe : edu.titleEn}</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {language === 'te' ? edu.summaryTe : edu.summaryEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
