import React, { useState, useEffect } from 'react';
import { ConfirmationResult } from 'firebase/auth';
import { useLanguage } from '../context/LanguageContext';
import { healthStore } from '../services/healthStore';
import { AP_DISTRICTS } from '../data/mockData';
import { sendPhoneOtp, googleSignIn } from '../firebase';
import { GoogleSignInButton } from './GoogleSignInButton';
import {
  UserCheck,
  Phone,
  ShieldCheck,
  MapPin,
  AlertTriangle,
  Download,
  Trash2,
  CheckCircle2,
  KeyRound,
  Info,
  HeartPulse,
  X
} from 'lucide-react';

export const PatientProfilePanel: React.FC = () => {
  const { language } = useLanguage();
  const [profile, setProfile] = useState(healthStore.patientProfile);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Mobile OTP State
  const [otpPhone, setOtpPhone] = useState(profile.phone || '');
  const [otpCode, setOtpCode] = useState('');
  const [otpConfirmation, setOtpConfirmation] = useState<ConfirmationResult | null>(null);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpStatus, setOtpStatus] = useState<{ type: 'info' | 'error' | 'success'; text: string } | null>(null);

  // DPDP Data Deletion Confirmation
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    return healthStore.subscribe(() => {
      setProfile({ ...healthStore.patientProfile });
    });
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    healthStore.updatePatientProfile(profile);
    healthStore.recordConsent('patient_privacy', profile.consentAccepted);
    setSavedNotice(
      language === 'te'
        ? 'మీ రోగి ప్రొఫైల్ & గోప్యతా సెట్టింగ్స్ సేవ్ చేయబడ్డాయి.'
        : 'Patient profile and privacy preferences saved.'
    );
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpPhone.trim() || otpPhone.replace(/\D/g, '').length < 10) {
      setOtpStatus({
        type: 'error',
        text: language === 'te' ? 'సరైన 10-అంకెల మొబైల్ నంబర్ నమోదు చేయండి.' : 'Please enter a valid 10-digit mobile number.'
      });
      return;
    }

    setOtpSending(true);
    setOtpStatus(null);
    try {
      const confirmation = await sendPhoneOtp(otpPhone.trim(), 'mana-recaptcha-container');
      setOtpConfirmation(confirmation);
      setOtpStatus({
        type: 'success',
        text:
          language === 'te'
            ? 'మీ మొబైల్ నంబర్‌కు OTP పంపబడింది.'
            : 'OTP sent via Firebase Phone Authentication.'
      });
    } catch (err: any) {
      setOtpStatus({
        type: 'error',
        text:
          language === 'te'
            ? `Firebase Console లో Phone Auth ఆన్ చేయబడితేనే నిజమైన OTP వస్తుంది (${err?.code || err?.message}). Google Sign-In లేదా ప్రొఫైల్ ఫారమ్ ఉపయోగించండి.`
            : `Firebase Phone Auth requires enabling Phone provider & billing/test numbers in Firebase Console (${err?.code || err?.message}). You may use Google Sign-In below.`
      });
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpConfirmation || !otpCode.trim()) return;
    setOtpVerifying(true);
    try {
      const cred = await otpConfirmation.confirm(otpCode.trim());
      healthStore.syncAuthenticatedUser(
        cred.user.uid,
        cred.user.email,
        cred.user.displayName,
        cred.user.phoneNumber
      );
      setOtpStatus({
        type: 'success',
        text: language === 'te' ? 'మొబైల్ OTP ధృవీకరణ విజయవంతమైంది!' : 'Mobile OTP verified successfully!'
      });
      setOtpConfirmation(null);
      setOtpCode('');
    } catch (err: any) {
      setOtpStatus({
        type: 'error',
        text: err?.message || 'Invalid OTP code.'
      });
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleExportData = () => {
    const json = healthStore.exportAllPersonalData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mana_health_personal_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConfirmDeleteAll = () => {
    healthStore.eraseAllPersonalData();
    setConfirmDeleteOpen(false);
    setSavedNotice(
      language === 'te'
        ? 'మీ వ్యక్తిగత ఆరోగ్య డేటా పూర్తిగా తొలగించబడింది.'
        : 'All local personal health data has been permanently erased.'
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-1">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
          <UserCheck className="w-4 h-4" />
          <span>PATIENT REGISTRATION, OTP AUTH & PRIVACY CONTROLS</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900">
          {language === 'te'
            ? 'రోగి నమోదు, మొబైల్ OTP & గోప్యతా సెట్టింగ్స్'
            : 'Patient Registration, Auth & ABDM Readiness'}
        </h1>
        <p className="text-xs text-gray-500">
          {language === 'te'
            ? 'జిల్లా, మండలం, గ్రామం వివరాలు, అత్యవసర కాంటాక్ట్ మరియు భారతీయ డేటా రక్షణ చట్టం (DPDP) అనుమతులు.'
            : 'Complete patient demographics, regional address hierarchy, emergency contacts, and DPDP Act 2023 consent management.'}
        </p>
      </div>

      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-3.5 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{savedNotice}</span>
          </span>
          <button onClick={() => setSavedNotice(null)}>
            <X className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      )}

      {/* Auth Section: Mobile OTP + Google Sign-In */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <KeyRound className="w-4 h-4" />
            <span>
              {language === 'te' ? 'మొబైల్ OTP లాగిన్ (Firebase Phone Auth)' : 'Mobile OTP Login'}
            </span>
          </div>

          <div id="mana-recaptcha-container" />

          {!otpConfirmation ? (
            <form onSubmit={handleSendOtp} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">మొబైల్ నంబర్ (+91):</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={otpPhone}
                  onChange={(e) => setOtpPhone(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={otpSending}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-2xl transition"
              >
                {otpSending ? 'Sending OTP...' : language === 'te' ? 'OTP పంపండి' : 'Send Verification OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">6-అంకెల OTP నమోదు చేయండి:</label>
                <input
                  type="text"
                  required
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none tracking-widest font-mono"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOtpConfirmation(null)}
                  className="px-4 py-2.5 border border-gray-300 rounded-2xl font-bold text-gray-700"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={otpVerifying}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl"
                >
                  {otpVerifying ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          )}

          {otpStatus && (
            <div
              className={`p-3 rounded-2xl text-[11px] leading-relaxed border ${
                otpStatus.type === 'error'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              {otpStatus.text}
            </div>
          )}

          <div className="pt-2 border-t border-gray-100 flex flex-col items-center gap-2">
            <span className="text-[11px] text-gray-400 font-semibold">OR SIGN IN WITH GOOGLE</span>
            <GoogleSignInButton
              onClick={async () => {
                try {
                  const res = await googleSignIn();
                  healthStore.syncAuthenticatedUser(
                    res.user.uid,
                    res.user.email,
                    res.user.displayName,
                    res.user.phoneNumber
                  );
                  setSavedNotice('Signed in with Google successfully.');
                } catch (e: any) {
                  setOtpStatus({ type: 'error', text: e?.message || 'Google Sign-In failed' });
                }
              }}
            />
          </div>
        </div>

        {/* ABDM Integration Readiness Card (Strict honesty) */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-6 rounded-3xl shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
              <HeartPulse className="w-4 h-4" />
              <span>AYUSHMAN BHARAT DIGITAL MISSION (ABDM)</span>
            </div>
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
              ARCHITECTURE READY • NOT LIVE
            </span>
          </div>

          <h3 className="text-base font-bold">
            {language === 'te' ? 'ABHA హెల్త్ ఐడీ అనుసంధాన స్థితి' : 'ABHA Health ID Interoperability Status'}
          </h3>

          <div className="bg-white/10 border border-white/15 rounded-2xl p-3 text-xs text-amber-200 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <p>
              {language === 'te'
                ? 'గమనిక: ABDM / ABHA అధికారిక NHA APIలు ఇంకా కనెక్ట్ చేయబడలేదు. భవిష్యత్తులో అధికారిక అనుమతి మరియు టెస్టింగ్ పూర్తయిన తర్వాతే లైవ్ ABHA లింకింగ్ ప్రారంభమవుతుంది.'
                : 'Notice: Live NHA / ABDM & ABHA APIs are NOT connected. This architecture prepares consent & record schemas for future authorized ABDM sandbox/production integration.'}
            </p>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-emerald-200 font-semibold">
              Optional 14-Digit ABHA Number (Local Reference Only):
            </label>
            <input
              type="text"
              placeholder="XX-XXXX-XXXX-XXXX"
              value={profile.abhaId || ''}
              onChange={(e) => setProfile({ ...profile, abhaId: e.target.value })}
              className="w-full p-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-400 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Patient Registration Form */}
      <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-5 text-xs">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
          {language === 'te' ? 'రోగి పూర్తి వివరాలు (Patient Demographics & Address)' : 'Patient Demographics & Address'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="font-bold text-gray-700">పూర్తి పేరు (Full Name):</label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">వయస్సు (Age):</label>
            <input
              type="number"
              min={0}
              max={120}
              required
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">లింగం (Gender):</label>
            <select
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
            >
              <option value="male">Male (పురుషుడు)</option>
              <option value="female">Female (స్త్రీ)</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">ఫోన్ నంబర్ (Contact Phone):</label>
            <input
              type="tel"
              required
              placeholder="+91 XXXXXXXXXX"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">రక్త గ్రూప్ (Blood Group):</label>
            <select
              value={profile.bloodGroup}
              onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
            >
              {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">జిల్లా (District):</label>
            <select
              value={profile.district}
              onChange={(e) => setProfile({ ...profile, district: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
            >
              {AP_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">మండలం (Mandal):</label>
            <input
              type="text"
              required
              value={profile.mandal}
              onChange={(e) => setProfile({ ...profile, mandal: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">గ్రామం / పట్టణం (Village / Town):</label>
            <input
              type="text"
              required
              value={profile.village}
              onChange={(e) => setProfile({ ...profile, village: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">అత్యవసర కాంటాక్ట్ పేరు (Emergency Contact Name):</label>
            <input
              type="text"
              placeholder="e.g. Spouse / Brother / Parent"
              value={profile.emergencyContactName || ''}
              onChange={(e) => setProfile({ ...profile, emergencyContactName: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">అత్యవసర కాంటాక్ట్ ఫోన్ (Emergency Phone):</label>
            <input
              type="tel"
              placeholder="+91 XXXXXXXXXX"
              value={profile.emergencyContact}
              onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Consent & Privacy Settings */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-3">
          <p className="font-bold text-emerald-950 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>గోప్యత మరియు డేటా సమ్మతి సెట్టింగ్స్ (Consent & Privacy Controls - DPDP Act 2023)</span>
          </p>

          <label className="flex items-start gap-2 cursor-pointer text-gray-700">
            <input
              type="checkbox"
              checked={profile.consentAccepted}
              onChange={(e) => setProfile({ ...profile, consentAccepted: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded mt-0.5"
            />
            <span>
              {language === 'te'
                ? 'డాక్టర్ అపాయింట్‌మెంట్లు, అత్యవసర అంబులెన్స్ మరియు ఆరోగ్య రికార్డుల నిర్వహణ కోసం నా వ్యక్తిగత వివరాలను భద్రపరచడానికి నేను సమ్మతిస్తున్నాను.'
                : 'I consent to Mana Health Connect storing my registration and health records securely solely for medical coordination.'}
            </span>
          </label>

          <label className="flex items-start gap-2 cursor-pointer text-gray-700">
            <input
              type="checkbox"
              checked={Boolean(profile.seniorCitizenMode)}
              onChange={(e) => setProfile({ ...profile, seniorCitizenMode: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded mt-0.5"
            />
            <span>
              {language === 'te'
                ? 'సీనియర్ సిటిజన్ సపోర్ట్ మోడ్ (పెద్ద బటన్లు మరియు సులభమైన సహాయం)'
                : 'Enable Senior Citizen Support Mode (high-contrast quick-access layout)'}
            </span>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportData}
              className="px-4 py-2.5 rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-900 font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export My Data (DPDP)</span>
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              className="px-4 py-2.5 rounded-2xl border border-red-200 bg-red-50 text-red-700 font-bold flex items-center gap-1.5 hover:bg-red-100 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Request Data Deletion</span>
            </button>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md transition"
          >
            {language === 'te' ? 'ప్రొఫైల్ సేవ్ చేయండి' : 'Save Patient Profile'}
          </button>
        </div>
      </form>

      {/* Deletion Confirmation Modal */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 text-base">
                  Confirm Personal Health Data Erasure?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Under DPDP Act 2023, this permanently deletes your stored patient profile, family members, medicine reminders, and local health records from this device session.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="flex-1 py-2.5 rounded-2xl border border-gray-300 text-gray-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAll}
                className="flex-1 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Confirm Erase Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
