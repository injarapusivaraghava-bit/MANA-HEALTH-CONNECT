import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { healthStore } from '../services/healthStore';
import { AmbulanceContact } from '../types';
import {
  PhoneCall,
  MapPin,
  AlertOctagon,
  Navigation,
  Share2,
  Clock,
  HeartPulse,
  CheckCircle2,
  Info,
  Settings,
  Users,
  X
} from 'lucide-react';

export const EmergencyAmbulance: React.FC = () => {
  const { language } = useLanguage();
  const [ambulances, setAmbulances] = useState<AmbulanceContact[]>(healthStore.ambulances);
  const [emergencyConfig, setEmergencyConfig] = useState(healthStore.emergencyConfig);
  const [familyMembers, setFamilyMembers] = useState(healthStore.familyMembers);
  const [patientProfile, setPatientProfile] = useState(healthStore.patientProfile);

  const [filterType, setFilterType] = useState<string>('all');
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const [cfg108, setCfg108] = useState(emergencyConfig.primary108);
  const [cfg102, setCfg102] = useState(emergencyConfig.motherChild102);
  const [cfg112, setCfg112] = useState(emergencyConfig.national112);

  const [dispatchLogs, setDispatchLogs] = useState<
    { id: string; service: string; time: string; status: 'awaiting_operator' | 'confirmed_dispatch'; label: string }[]
  >([]);

  useEffect(() => {
    return healthStore.subscribe(() => {
      setAmbulances([...healthStore.ambulances]);
      setEmergencyConfig({ ...healthStore.emergencyConfig });
      setFamilyMembers([...healthStore.familyMembers]);
      setPatientProfile({ ...healthStore.patientProfile });
    });
  }, []);

  const handleShareLocation = () => {
    setLocationStatus(language === 'te' ? 'జీపీఎస్ లొకేషన్ గుర్తిస్తున్నాము...' : 'Fetching GPS coordinates...');
    if (!navigator.geolocation) {
      setLocationStatus(language === 'te' ? 'మీ బ్రౌజర్ లొకేషన్ సపోర్ట్ చేయదు.' : 'Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setLocationStatus(
          language === 'te'
            ? `లొకేషన్ సిద్ధంగా ఉంది: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            : `GPS ready: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        );

        const sosMessage = encodeURIComponent(
          `EMERGENCY MEDICAL SOS from MANA HEALTH CONNECT:\nPatient: ${patientProfile.name}\nPhone: ${patientProfile.phone || 'Not set'}\nAddress: ${patientProfile.village}, ${patientProfile.mandal}, ${patientProfile.district}\nLive Location: ${mapsLink}\nPlease send ambulance support immediately.`
        );
        setShareUrl(`https://api.whatsapp.com/send?text=${sosMessage}`);
      },
      (error) => {
        setLocationStatus(
          language === 'te'
            ? 'లొకేషన్ అనుమతి నిరాకరించబడింది లేదా GPS అందుబాటులో లేదు.'
            : `GPS permission denied or unavailable: ${error.message}`
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCallEmergency = (serviceName: string) => {
    setDispatchLogs((prev) => [
      {
        id: `disp-${Date.now()}`,
        service: serviceName,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'awaiting_operator',
        label: language === 'te' ? 'కాల్ ప్రారంభమైంది — ఆపరేటర్ నిర్ధారణ కోసం వేచి ఉంది' : 'Call Initiated — Awaiting Operator Confirmation'
      },
      ...prev
    ]);
  };

  const handleConfirmDispatchByOperator = (logId: string) => {
    setDispatchLogs((prev) =>
      prev.map((l) =>
        l.id === logId
          ? {
              ...l,
              status: 'confirmed_dispatch',
              label: language === 'te' ? 'ఆపరేటర్ ద్వారా డిస్పాచ్ నిర్ధారించబడింది' : 'Dispatch Confirmed by Operator'
            }
          : l
      )
    );
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    healthStore.updateEmergencyConfig({
      primary108: cfg108.trim() || '108',
      motherChild102: cfg102.trim() || '102',
      national112: cfg112.trim() || '112'
    });
    setShowConfigModal(false);
  };

  const filteredAmbulances = ambulances.filter((amb) => {
    if (filterType === 'icu' && !amb.hasVentilator) return false;
    if (filterType === 'govt' && !amb.type.startsWith('government') && amb.type !== 'emergency_112') return false;
    if (filterType === 'private' && amb.type.startsWith('government')) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Emergency Red Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-700 text-white rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 bg-black/25 px-3.5 py-1 rounded-full text-xs font-bold border border-white/20">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-300 animate-ping"></span>
              <span>24x7 EMERGENCY CALL & DISPATCH INTERFACE</span>
            </div>

            <button
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl text-xs font-bold border border-white/20 transition"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure 108 / 102 Numbers</span>
            </button>
          </div>

          <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
            {language === 'te'
              ? `అత్యవసర అంబులెన్స్ సేవలు – ${emergencyConfig.primary108} & ${emergencyConfig.motherChild102}`
              : `Emergency Ambulance Dispatch – ${emergencyConfig.primary108} & ${emergencyConfig.motherChild102}`}
          </h1>

          <p className="text-sm md:text-base text-rose-100 leading-relaxed">
            {language === 'te'
              ? 'తక్షణ వైద్య సహాయం కోసం ఉచిత 108, తల్లి-బిడ్డల కోసం 102, జాతీయ హెల్ప్‌లైన్ 112 మరియు ధృవీకరించబడిన ప్రైవేట్ అంబులెన్స్‌లకు వన్-టచ్ కాల్ చేయండి.'
              : 'One-touch emergency dialing for toll-free 108, 102 Mother & Child transport, 112 national helpline, and verified local private ambulances.'}
          </p>

          {/* Quick Call Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href={`tel:${emergencyConfig.primary108}`}
              onClick={() => handleCallEmergency(`${emergencyConfig.primary108} Emergency Ambulance`)}
              className="bg-white text-red-700 hover:bg-red-50 font-black px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-base md:text-lg transition"
            >
              <PhoneCall className="w-5 h-5 text-red-600" />
              <span>DIAL {emergencyConfig.primary108} (ఉచితం)</span>
            </a>

            <a
              href={`tel:${emergencyConfig.motherChild102}`}
              onClick={() => handleCallEmergency(`${emergencyConfig.motherChild102} Mother & Child Transport`)}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-5 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 text-sm md:text-base transition"
            >
              <HeartPulse className="w-5 h-5 text-red-600" />
              <span>DIAL {emergencyConfig.motherChild102} (తల్లి & బిడ్డ)</span>
            </a>

            <a
              href={`tel:${emergencyConfig.national112}`}
              onClick={() => handleCallEmergency(`${emergencyConfig.national112} National Emergency`)}
              className="bg-red-950/60 hover:bg-red-950 text-white font-bold px-4 py-3.5 rounded-2xl border border-white/20 flex items-center gap-2 text-sm transition"
            >
              <AlertOctagon className="w-5 h-5 text-rose-400" />
              <span>{emergencyConfig.national112} Emergency</span>
            </a>
          </div>
        </div>
      </div>

      {/* GPS Location Sharing + Family Emergency Contacts + Dispatch Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GPS Live Sharing & Family Contacts Card */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {language === 'te' ? 'ఐచ్ఛిక GPS లొకేషన్ షేరింగ్' : 'Optional Emergency Location Sharing'}
                </h3>
                <p className="text-xs text-gray-500">
                  {language === 'te'
                    ? 'మీ సమ్మతితో మాత్రమే GPS కోఆర్డినేట్లు తీసుకోబడతాయి.'
                    : 'Fetches coordinates only when clicked to share with family or emergency responders.'}
                </p>
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-4 text-xs space-y-2">
              <p className="font-semibold text-emerald-900">
                {language === 'te' ? 'నమోదైన చిరునామా (Saved Address):' : 'Registered Patient Address:'}
              </p>
              <p className="text-emerald-800 font-medium">
                {patientProfile.village}, {patientProfile.mandal}, {patientProfile.district}
              </p>
              {locationStatus && (
                <p className="text-emerald-700 font-bold bg-white px-2.5 py-1.5 rounded-lg border border-emerald-200">
                  {locationStatus}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleShareLocation}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md transition"
              >
                <Share2 className="w-4 h-4" />
                <span>
                  {language === 'te' ? 'GPS లొకేషన్ సిద్ధం చేయండి' : 'Prepare GPS Location Link'}
                </span>
              </button>

              {shareUrl && (
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md transition"
                >
                  <span>Send on WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          {/* Family Emergency Contacts */}
          <div className="pt-4 border-t border-gray-100 space-y-2.5">
            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>కుటుంబ అత్యవసర కాంటాక్ట్స్ (Family Emergency Contacts)</span>
            </h4>
            {patientProfile.emergencyContact ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-900">
                    {patientProfile.emergencyContactName || 'Primary Emergency Contact'}
                  </p>
                  <p className="text-rose-800 font-mono">{patientProfile.emergencyContact}</p>
                </div>
                <a
                  href={`tel:${patientProfile.emergencyContact}`}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>
            ) : (
              <p className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                No emergency contact saved yet. Add one in the Patient Profile tab for one-touch family SOS dialing.
              </p>
            )}
            {familyMembers.length > 0 && (
              <p className="text-[11px] text-emerald-700 font-medium">
                {familyMembers.length} family profile(s) linked under {patientProfile.name}.
              </p>
            )}
          </div>
        </div>

        {/* Emergency Dispatch Log & Honesty Guarantee */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {language === 'te' ? 'కాల్ & డిస్పాచ్ స్థితి' : 'Call & Dispatch Status Log'}
                </h3>
                <p className="text-xs text-gray-500">
                  {language === 'te' ? 'నిర్ధారించబడిన వివరాలు మాత్రమే' : 'Shows call state accurately — never fakes dispatch'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto">
            {dispatchLogs.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-500 text-center">
                No emergency calls initiated in this session. Dial 108, 102, 112, or a verified local unit to log a call.
              </div>
            ) : (
              dispatchLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-900">{log.service}</p>
                      <p className="text-gray-500 text-[11px]">Call Logged: {log.time}</p>
                    </div>
                    <span
                      className={`font-bold px-2.5 py-1 rounded-full text-[10px] ${
                        log.status === 'confirmed_dispatch'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {log.label}
                    </span>
                  </div>
                  {log.status === 'awaiting_operator' && (
                    <button
                      onClick={() => handleConfirmDispatchByOperator(log.id)}
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      ✓ Mark "Operator Confirmed Dispatch" (only after operator confirms on call)
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-2xl text-[11px] text-amber-900 border border-amber-200">
            <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <p>
              {language === 'te'
                ? 'గమనిక: 108/ప్రైవేట్ అంబులెన్స్ ఆపరేటర్ ఫోన్‌లో వాహనం పంపినట్లు నిర్ధారించే వరకు మేము "డిస్పాచ్ అయింది" అని చూపము.'
                : 'Honesty Guarantee: We never claim an ambulance has been dispatched or show fake live vehicle tracking without operator confirmation.'}
            </p>
          </div>
        </div>
      </div>

      {/* Directory of Local Verified Ambulance Units */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'te' ? 'అంబులెన్స్ డైరెక్టరీ' : 'Verified Emergency & Local Ambulance Directory'}
            </h2>
            <p className="text-xs text-gray-500">
              {language === 'te'
                ? 'అధికారిక 108/102/112 నంబర్లు మరియు అడ్మిన్ ధృవీకరించిన ప్రైవేట్ అంబులెన్స్‌లు'
                : 'Official toll-free helplines and verified local private ambulance units added by Admin/Hospitals'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Units' },
              { id: 'govt', label: 'Govt 108 / 102 / 112' },
              { id: 'icu', label: 'Ventilator / ICU' },
              { id: 'private', label: 'Verified Private' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterType === f.id ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAmbulances.length === 0 ? (
            <div className="col-span-full text-center py-8 text-xs text-gray-500 bg-gray-50 rounded-2xl border border-gray-100">
              No private ambulance units added for this filter yet. Hospitals or Super Admin can add verified local private ambulances in the Admin Portal.
            </div>
          ) : (
            filteredAmbulances.map((amb) => (
              <div
                key={amb.id}
                className="p-5 rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition bg-gradient-to-br from-white to-gray-50/50 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl">🚑</span>
                    <div className="flex gap-1.5">
                      {amb.hasVentilator && (
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                          ICU / Ventilator
                        </span>
                      )}
                      {(amb.type.startsWith('government') || amb.type === 'emergency_112') && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          Govt Toll-Free
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm leading-snug">
                    {language === 'te' ? amb.serviceNameTe : amb.serviceName}
                  </h3>

                  <p className="text-xs text-gray-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{amb.district} • {amb.mandal}</span>
                  </p>

                  {amb.notes && (
                    <p className="text-[11px] text-gray-500 bg-white p-2 rounded-xl border border-gray-100">
                      {amb.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{amb.verified ? 'Verified Contact' : 'Pending Verification'} • {amb.hasOxygen ? 'Oxygen' : 'Basic'}</span>
                  </div>
                </div>

                <a
                  href={`tel:${amb.phone}`}
                  onClick={() => handleCallEmergency(amb.serviceName)}
                  className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-xs transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call {amb.phone}</span>
                </a>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Configurable 108 / 102 / 112 Settings Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">
                Configure Emergency Helplines (108 / 102 / 112)
              </h3>
              <button onClick={() => setShowConfigModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Primary Emergency Ambulance (Default 108):</label>
                <input
                  type="tel"
                  value={cfg108}
                  onChange={(e) => setCfg108(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Mother & Child Ambulance (Default 102):</label>
                <input
                  type="tel"
                  value={cfg102}
                  onChange={(e) => setCfg102(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-700">National Unified Emergency (Default 112):</label>
                <input
                  type="tel"
                  value={cfg112}
                  onChange={(e) => setCfg112(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-gray-300 font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-emerald-700 text-white font-bold"
                >
                  Save Contacts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
