import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { healthStore } from '../services/healthStore';
import { UserRole } from '../types';
import { initGoogleAuth, googleSignIn, getGoogleAccessToken } from '../firebase';
import { GoogleSignInButton } from './GoogleSignInButton';
import { ManaHealthLogo } from './ManaHealthLogo';
import {
  PhoneCall,
  Bell,
  Globe,
  User,
  Smartphone,
  Menu,
  X,
  CheckCircle2,
  Cloud,
  Wifi
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAndroidGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, openAndroidGuide }) => {
  const { language, setLanguage, t } = useLanguage();
  const [user, setUser] = useState(healthStore.currentUser);
  const [lowBandwidth, setLowBandwidth] = useState(healthStore.lowBandwidthMode);
  const [emergencyConfig, setEmergencyConfig] = useState(healthStore.emergencyConfig);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [googleSigningIn, setGoogleSigningIn] = useState(false);

  useEffect(() => {
    return healthStore.subscribe(() => {
      setUser({ ...healthStore.currentUser });
      setLowBandwidth(healthStore.lowBandwidthMode);
      setEmergencyConfig({ ...healthStore.emergencyConfig });
    });
  }, []);

  useEffect(() => {
    const unsub = initGoogleAuth(
      (authedUser) => {
        setGoogleConnected(true);
        setGoogleEmail(authedUser.email);
        healthStore.syncAuthenticatedUser(
          authedUser.uid,
          authedUser.email,
          authedUser.displayName,
          authedUser.phoneNumber
        );
      },
      (firebaseUser) => {
        setGoogleConnected(false);
        setGoogleEmail(firebaseUser?.email || null);
        if (firebaseUser) {
          healthStore.syncAuthenticatedUser(
            firebaseUser.uid,
            firebaseUser.email,
            firebaseUser.displayName,
            firebaseUser.phoneNumber
          );
        }
      }
    );
    getGoogleAccessToken().then((tok) => {
      if (tok) setGoogleConnected(true);
    });
    return () => unsub();
  }, []);

  const handleGoogleSignIn = async () => {
    setGoogleSigningIn(true);
    try {
      const res = await googleSignIn();
      setGoogleConnected(true);
      setGoogleEmail(res.user.email);
      healthStore.syncAuthenticatedUser(
        res.user.uid,
        res.user.email,
        res.user.displayName,
        res.user.phoneNumber
      );
    } catch (e) {
      console.warn('Google sign-in cancelled or failed', e);
    } finally {
      setGoogleSigningIn(false);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    healthStore.setRole(role);
    setShowRoleMenu(false);
    if (role === 'superadmin' || role === 'doctor' || role === 'hospital') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('home');
    }
  };

  const unreadNotifs = healthStore.notifications.filter((n) => !n.read).length;

  const adminNavLabel =
    user.role === 'doctor'
      ? language === 'te'
        ? 'డాక్టర్ ప్యానెల్'
        : 'Doctor Panel'
      : user.role === 'hospital'
      ? language === 'te'
        ? 'హాస్పిటల్ ప్యానెల్'
        : 'Hospital Panel'
      : t('navAdmin');

  const navItems = [
    { id: 'home', label: t('navHome'), icon: '🏠' },
    { id: 'profile', label: t('navProfile'), icon: '🪪' },
    { id: 'doctors', label: t('navDoctors'), icon: '🩺' },
    { id: 'hospitals', label: t('navHospitals'), icon: '🏥' },
    { id: 'ambulance', label: t('navAmbulance'), icon: '🚑', highlight: true },
    { id: 'reminders', label: t('navReminders'), icon: '⏰' },
    { id: 'ai-assistant', label: t('navAiAssistant'), icon: '🤖', badge: 'AI' },
    { id: 'records', label: t('navRecords'), icon: '📁' },
    { id: 'family', label: t('navFamily'), icon: '👨‍👩‍👧‍👦' },
    { id: 'labs', label: t('navLabs'), icon: '🔬' },
    { id: 'blood', label: t('navBlood'), icon: '🩸' },
    { id: 'tracker', label: t('navTracker'), icon: '📊' },
    { id: 'services', label: t('navServices'), icon: '💊' },
    { id: 'plans', label: t('navPlans'), icon: '⭐' },
    { id: 'admin', label: adminNavLabel, icon: '🛡️' }
  ];

  return (
    <header className={`sticky top-0 z-40 bg-white ${!lowBandwidth ? 'bg-white/95 backdrop-blur-md' : ''} border-b border-sky-100 shadow-xs`}>
      {/* Emergency Top Hotline Bar */}
      <div className="bg-gradient-to-r from-sky-800 via-teal-700 to-emerald-700 text-white px-3 py-1 text-[11px] sm:text-xs font-medium flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between gap-2">
          <span className="font-semibold truncate">{t('emergencyAlert')}</span>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${emergencyConfig.primary108}`}
              className="bg-red-600 text-white hover:bg-red-700 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs transition shrink-0"
            >
              <PhoneCall className="w-3 h-3" />
              <span>{emergencyConfig.primary108} (ఉచితం)</span>
            </a>
            <a
              href={`tel:${emergencyConfig.motherChild102}`}
              className="hidden sm:inline-flex bg-white/15 hover:bg-white/25 text-white font-medium px-2 py-0.5 rounded-full items-center gap-1 shrink-0"
            >
              <PhoneCall className="w-3 h-3" />
              <span>{emergencyConfig.motherChild102} (తల్లి-బిడ్డ)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Branding & Navigation Header */}
      <div className="container mx-auto px-3 sm:px-4 py-1.5 sm:py-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Wordmark */}
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2 text-left focus:outline-none group min-w-0"
          >
            <div className="shrink-0">
              <ManaHealthLogo size="sm" className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-lg md:text-xl tracking-tight transition truncate">
                  <span className="text-blue-900">MANA </span>
                  <span className="text-red-600">HEALTH CONNECT</span>
                </span>
                <span className="hidden md:inline-block text-xs text-green-700 font-bold whitespace-nowrap">
                  · మన ఆరోగ్య సేవలు
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-green-700 font-bold truncate">
                మీ ఆరోగ్యం – మా ప్రాధాన్యత
              </p>
            </div>
          </button>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Data Saver / Slow Mobile Internet Toggle */}
            <button
              onClick={() => healthStore.toggleLowBandwidthMode()}
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                lowBandwidth
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
              title="Toggle Data Saver Mode for slow mobile networks"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>{lowBandwidth ? 'Lite ON' : 'Data Saver'}</span>
            </button>

            {/* Google Drive Auth Button */}
            <div className="hidden md:block">
              {googleConnected ? (
                <button
                  onClick={() => setCurrentTab('records')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold transition"
                  title={`Connected to Google Drive (${googleEmail || 'Signed in'})`}
                >
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Drive Connected</span>
                </button>
              ) : (
                <GoogleSignInButton
                  onClick={handleGoogleSignIn}
                  disabled={googleSigningIn}
                  compact
                  label={googleSigningIn ? 'Signing in...' : 'Google Sign-In'}
                />
              )}
            </div>

            {/* Android APK Guide Button */}
            <button
              onClick={openAndroidGuide}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-xl text-xs font-semibold shadow-xs hover:from-emerald-800 hover:to-teal-900 transition"
              title="Android APK & Vivo Phone Guide"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-300" />
              <span>Android APK</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'te' ? 'en' : 'te')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold text-gray-700 border border-gray-200 transition"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'te' ? 'English' : 'తెలుగు'}</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 border border-gray-200 transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-800">నోటిఫికేషన్లు (Notifications)</span>
                    <button
                      onClick={() => healthStore.markAllNotificationsRead()}
                      className="text-[11px] text-emerald-600 hover:underline font-semibold"
                    >
                      Mark All Read
                    </button>
                  </div>
                  <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {healthStore.notifications.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">No notifications yet</p>
                    ) : (
                      healthStore.notifications.map((n) => (
                        <div key={n.id} className="py-2.5 px-1 hover:bg-emerald-50/50 rounded-lg">
                          <p className="text-xs font-semibold text-gray-900">{n.title}</p>
                          <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-semibold text-emerald-900 transition"
              >
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span className="capitalize">
                  {t(`role${user.role === 'superadmin' ? 'SuperAdmin' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}` as 'rolePatient')}
                </span>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-emerald-100 p-2 z-50">
                  <div className="px-3 py-2 bg-emerald-50/80 rounded-xl mb-1.5">
                    <p className="text-[11px] font-bold text-emerald-900">ప్రస్తుత యూజర్ (Active User)</p>
                    <p className="text-xs font-medium text-emerald-800 truncate">{user.displayName}</p>
                    <p className="text-[10px] text-emerald-700 truncate">{user.email || 'Local Session'}</p>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">
                    Switch Role (రోల్ మార్చుకోండి):
                  </p>
                  {(['patient', 'doctor', 'hospital', 'superadmin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                        user.role === r ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="capitalize">
                        {r === 'patient' && '👤 '}
                        {r === 'doctor' && '🩺 '}
                        {r === 'hospital' && '🏥 '}
                        {r === 'superadmin' && '🛡️ '}
                        {t(`role${r === 'superadmin' ? 'SuperAdmin' : r.charAt(0).toUpperCase() + r.slice(1)}` as 'rolePatient')}
                      </span>
                      {user.role === r && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 border border-gray-200"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Primary Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 mt-2.5 pt-2 border-t border-gray-100 text-xs font-semibold text-gray-700 overflow-x-auto">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-2.5 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
                  active
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : item.highlight
                    ? 'text-red-700 bg-red-50 hover:bg-red-100 font-bold'
                    : 'hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 rounded-full font-bold ${
                      active ? 'bg-white text-emerald-800' : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 px-4 py-3 space-y-1.5 shadow-xl max-h-[75vh] overflow-y-auto">
          <div className="flex gap-2 pb-1">
            <a
              href="/ManaHealthConnect.apk"
              download="ManaHealthConnect.apk"
              type="application/vnd.android.package-archive"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-left px-3 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-black flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-white" />
                <span>DOWNLOAD APK</span>
              </span>
            </a>
            <button
              onClick={() => healthStore.toggleLowBandwidthMode()}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold border ${
                lowBandwidth ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-gray-100 border-gray-200 text-gray-700'
              }`}
            >
              {lowBandwidth ? 'Lite ON' : 'Data Saver'}
            </button>
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                currentTab === item.id ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
