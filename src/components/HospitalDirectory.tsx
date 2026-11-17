import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { healthStore } from '../services/healthStore';
import { Hospital } from '../types';
import { AP_DISTRICTS } from '../data/mockData';
import {
  Building2,
  MapPin,
  Phone,
  PhoneCall,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  HeartPulse,
  Activity,
  Bed,
  Droplet
} from 'lucide-react';

export const HospitalDirectory: React.FC = () => {
  const { language, t } = useLanguage();
  const [hospitals, setHospitals] = useState<Hospital[]>(healthStore.hospitals);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [hospitalType, setHospitalType] = useState<'all' | 'government' | 'private'>('all');
  const [onlyICU, setOnlyICU] = useState(false);
  const [onlyBloodBank, setOnlyBloodBank] = useState(false);

  React.useEffect(() => {
    return healthStore.subscribe(() => {
      setHospitals([...healthStore.hospitals]);
    });
  }, []);

  const filteredHospitals = hospitals.filter((hosp) => {
    const matchSearch =
      hosp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hosp.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hosp.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchDistrict = selectedDistrict === 'All' || hosp.district === selectedDistrict;
    const matchType = hospitalType === 'all' || hosp.type === hospitalType;
    const matchICU = !onlyICU || hosp.hasICU;
    const matchBlood = !onlyBloodBank || hosp.hasBloodBank;

    return matchSearch && matchDistrict && matchType && matchICU && matchBlood;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title & Overview Banner */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
          <Building2 className="w-4 h-4" />
          <span>GOVERNMENT & PRIVATE HOSPITAL DIRECTORY</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900">
          {language === 'te' ? 'ఆసుపత్రుల వివరాలు & డైరెక్టరీ' : 'Hospital & Emergency Care Directory'}
        </h1>
        <p className="text-xs text-gray-500">
          {language === 'te'
            ? 'ప్రభుత్వ జనరల్ ఆసుపత్రులు (GGH), జిల్లా ఆసుపత్రులు మరియు ధృవీకరించబడిన ప్రైవేట్ సూపర్ స్పెషాలిటీ ఆసుపత్రుల వివరాలు.'
            : 'Find verified government teaching hospitals, district medical centers, and private super-specialty hospitals with ICU and 24x7 trauma care.'}
        </p>
      </div>

      {/* Search and Filter Panel */}
      <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by hospital name, specialty, area..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* District selector */}
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

          {/* Government / Private Pills */}
          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-2xl border border-gray-200 text-xs font-semibold">
            <button
              onClick={() => setHospitalType('all')}
              className={`flex-1 py-1.5 rounded-xl transition ${
                hospitalType === 'all' ? 'bg-emerald-700 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setHospitalType('government')}
              className={`flex-1 py-1.5 rounded-xl transition ${
                hospitalType === 'government' ? 'bg-emerald-700 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Govt (ప్రభుత్వ)
            </button>
            <button
              onClick={() => setHospitalType('private')}
              className={`flex-1 py-1.5 rounded-xl transition ${
                hospitalType === 'private' ? 'bg-emerald-700 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Private (ప్రైవేట్)
            </button>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
            <input
              type="checkbox"
              checked={onlyICU}
              onChange={(e) => setOnlyICU(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300"
            />
            <span>24x7 ICU Available</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
            <input
              type="checkbox"
              checked={onlyBloodBank}
              onChange={(e) => setOnlyBloodBank(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300"
            />
            <span>In-House Blood Bank</span>
          </label>
        </div>
      </div>

      {/* Hospitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHospitals.map((hosp) => (
          <div
            key={hosp.id}
            className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Header Badge */}
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    hosp.type === 'government'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {hosp.type === 'government' ? 'ప్రభుత్వ ఆసుపత్రి' : 'ప్రైవేట్ ఆసుపత్రి'}
                </span>

                {hosp.hasAyushmanAarogyasri && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                    Aarogyasri
                  </span>
                )}
              </div>

              {/* Title & Address */}
              <div>
                <h3 className="font-bold text-gray-900 text-base leading-snug">
                  {language === 'te' ? hosp.nameTe : hosp.name}
                </h3>
                <p className="text-xs text-gray-600 flex items-start gap-1.5 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{hosp.address}</span>
                </p>
              </div>

              {/* Badges: Bed count, ICU, Blood bank */}
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                {hosp.bedCount && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold">
                    <Bed className="w-3 h-3 text-gray-500" />
                    <span>{hosp.bedCount} Beds</span>
                  </span>
                )}
                {hosp.hasICU && (
                  <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold border border-purple-100">
                    <HeartPulse className="w-3 h-3 text-purple-600" />
                    <span>ICU</span>
                  </span>
                )}
                {hosp.hasBloodBank && (
                  <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold border border-rose-100">
                    <Droplet className="w-3 h-3 text-rose-600" />
                    <span>Blood Bank</span>
                  </span>
                )}
              </div>

              {/* Specialties List */}
              <div className="bg-gray-50/70 p-3 rounded-2xl text-[11px] text-gray-600 space-y-1 border border-gray-100">
                <p className="font-bold text-gray-800">విభాగాలు (Departments):</p>
                <p className="line-clamp-2 leading-relaxed">
                  {hosp.specialties.join(', ')}
                </p>
              </div>

              {/* Contacts */}
              <div className="space-y-1 text-xs pt-1">
                <div className="flex items-center justify-between text-gray-700">
                  <span className="text-gray-500">OPD Help:</span>
                  <a href={`tel:${hosp.phone}`} className="font-semibold text-emerald-700 hover:underline">
                    {hosp.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between text-red-700 font-bold">
                  <span>Emergency 24x7:</span>
                  <a href={`tel:${hosp.emergencyPhone}`} className="hover:underline flex items-center gap-1">
                    <PhoneCall className="w-3 h-3" />
                    <span>{hosp.emergencyPhone}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Actions: Google Maps Directions & Call */}
            <div className="pt-2 flex items-center gap-2">
              <a
                href={hosp.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs shadow-xs transition"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Google Maps రూట్</span>
              </a>

              <a
                href={`tel:${hosp.phone}`}
                className="p-2.5 rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                aria-label="Call Hospital"
              >
                <Phone className="w-4 h-4 text-emerald-700" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
