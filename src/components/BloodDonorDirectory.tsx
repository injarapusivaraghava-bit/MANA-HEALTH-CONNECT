import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { healthStore } from '../services/healthStore';
import { BloodDonor } from '../types';
import { AP_DISTRICTS } from '../data/mockData';
import {
  Droplet,
  Heart,
  PhoneCall,
  CheckCircle2,
  X,
  AlertCircle
} from 'lucide-react';

export const BloodDonorDirectory: React.FC = () => {
  const { language, t } = useLanguage();
  const [donors, setDonors] = useState<BloodDonor[]>(healthStore.bloodDonors);
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [district, setDistrict] = useState('Kakinada');
  const [mandal, setMandal] = useState('Turangi');
  const [phone, setPhone] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    return healthStore.subscribe(() => {
      setDonors([...healthStore.bloodDonors]);
    });
  }, []);

  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const filteredDonors = donors.filter((d) => {
    const matchGroup = selectedGroup === 'All' || d.bloodGroup === selectedGroup;
    const matchDistrict = selectedDistrict === 'All' || d.district === selectedDistrict;
    return matchGroup && matchDistrict;
  });

  const handleRegisterDonor = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!consentGiven) {
      setFormError(
        language === 'te'
          ? 'రక్తదాన సమాచారాన్ని అత్యవసర వైద్య సేవల కోసం పంచుకోవడానికి మీ సమ్మతి తప్పనిసరి.'
          : 'Informed consent is mandatory before listing donor contact details.'
      );
      return;
    }

    healthStore.registerBloodDonor({
      name: name.trim(),
      bloodGroup,
      district,
      mandal: mandal.trim(),
      phone: phone.trim(),
      lastDonated: new Date().toISOString().split('T')[0],
      available: true,
      consentGiven: true
    });
    healthStore.recordConsent('blood_donor_public', true);

    setName('');
    setPhone('');
    setConsentGiven(false);
    setShowRegisterModal(false);
    setNotice(
      language === 'te'
        ? 'స్వచ్ఛంద రక్తదాతగా నమోదు చేసుకున్నందుకు ధన్యవాదాలు!'
        : 'Thank you for registering as a consenting volunteer blood donor!'
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-red-700 to-amber-700 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-xs font-bold border border-white/20">
            <Heart className="w-3.5 h-3.5 fill-rose-300 text-rose-300" />
            <span>రక్తదానం ప్రాణదానం – CONSENTING BLOOD DONORS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            {language === 'te' ? 'రక్తదాతల డైరెక్టరీ & అత్యవసర నెట్‌వర్క్' : 'Blood Donors Emergency Network'}
          </h1>
          <p className="text-xs md:text-sm text-rose-100 leading-relaxed">
            {language === 'te'
              ? 'అత్యవసర సమయాల్లో రోగులకు సహాయం చేయడానికి తమ స్పష్టమైన అనుమతితో నమోదు చేసుకున్న స్వచ్ఛంద రక్తదాతల డైరెక్టరీ.'
              : 'Only volunteer donors who have provided explicit informed consent are listed here. Contact blood banks or 104/108 in parallel.'}
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="bg-white text-rose-800 hover:bg-rose-50 font-black px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 text-xs md:text-sm transition self-start md:self-auto"
        >
          <Droplet className="w-4 h-4 text-rose-600 fill-rose-600" />
          <span>{language === 'te' ? 'రక్తదాతగా నమోదు చేసుకోండి' : 'Register as Blood Donor'}</span>
        </button>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-3.5 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notice}</span>
          </span>
          <button onClick={() => setNotice(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700">రక్త గ్రూప్ ఎంచుకోండి (Blood Group):</label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedGroup(bg)}
                className={`px-4 py-2 rounded-xl font-black whitespace-nowrap transition ${
                  selectedGroup === bg
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-600"
            >
              <option value="All">{t('allDistricts')}</option>
              {AP_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end text-xs text-gray-500 font-semibold pr-2">
            <span>{filteredDonors.length} Consenting Donors Listed</span>
          </div>
        </div>
      </div>

      {/* Donors Cards Grid */}
      {filteredDonors.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-rose-100 shadow-sm text-center space-y-3">
          <Droplet className="w-10 h-10 text-rose-600 mx-auto" />
          <h3 className="font-bold text-gray-900 text-base">
            {language === 'te' ? 'ప్రస్తుతం నమోదైన రక్తదాతలు లేరు' : 'No Volunteer Blood Donors Registered Yet'}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {language === 'te'
              ? 'నకిలీ ఫోన్ నంబర్లు ఉంచబడవు. స్వచ్ఛందంగా రక్తదానం చేయాలనుకునేవారు పైనున్న బటన్ ద్వారా తమ సమ్మతితో నమోదు చేసుకోవచ్చు.'
              : 'No placeholder donor phone numbers are pre-populated. Volunteers can register above with explicit consent.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDonors.map((donor) => (
            <div
              key={donor.id}
              className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      {donor.bloodGroup}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{donor.name}</h3>
                      <p className="text-xs text-gray-500">
                        📍 {donor.mandal}, {donor.district}
                      </p>
                    </div>
                  </div>

                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    Consent Given
                  </span>
                </div>

                <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-100 text-xs flex items-center justify-between text-gray-600">
                  <span>Registered / Last Donated:</span>
                  <span className="font-semibold text-gray-800">{donor.lastDonated}</span>
                </div>
              </div>

              <a
                href={`tel:${donor.phone}`}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-xs transition"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Donor ({donor.phone})</span>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Register Donor Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">
                {language === 'te' ? 'స్వచ్ఛంద రక్తదాత నమోదు' : 'Volunteer Blood Donor Registration'}
              </h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterDonor} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">మీ పూర్తి పేరు (Full Name):</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-rose-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">రక్త గ్రూప్ (Blood Group):</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-rose-600 focus:outline-none"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">ఫోన్ నంబర్ (Phone Number):</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 XXXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-rose-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">జిల్లా (District):</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-rose-600 focus:outline-none"
                  >
                    {AP_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">మండలం/గ్రామం (Mandal/Town):</label>
                  <input
                    type="text"
                    required
                    value={mandal}
                    onChange={(e) => setMandal(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-rose-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200">
                <label className="flex items-start gap-2 cursor-pointer text-gray-700 font-medium">
                  <input
                    type="checkbox"
                    required
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded mt-0.5"
                  />
                  <span>
                    అత్యవసర రక్త అవసరాల కోసం నా ఫోన్ నంబర్‌ను మరియు రక్త గ్రూప్‌ను రోగులు/ఆసుపత్రులతో పంచుకోవడానికి నేను పూర్తి సమ్మతిని తెలియజేస్తున్నాను (Informed Consent).
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-gray-300 text-gray-700 font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md"
                >
                  నమోదు పూర్తి చేయండి
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
