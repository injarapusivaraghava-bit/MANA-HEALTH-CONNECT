import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { healthStore } from '../services/healthStore';
import { LabTest, LabBooking } from '../types';
import {
  FlaskConical,
  Home,
  Clock,
  Search,
  Calendar,
  X,
  AlertCircle,
  Download,
  Building2
} from 'lucide-react';

export const LaboratoryServices: React.FC = () => {
  const { language, t } = useLanguage();
  const [labTests, setLabTests] = useState<LabTest[]>(healthStore.labTests);
  const [labBookings, setLabBookings] = useState<LabBooking[]>(healthStore.labBookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingTest, setBookingTest] = useState<LabTest | null>(null);
  const [homeCollection, setHomeCollection] = useState(true);
  const [address, setAddress] = useState(
    `${healthStore.patientProfile.village}, ${healthStore.patientProfile.mandal}, ${healthStore.patientProfile.district}`
  );
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [bookingSubmitted, setBookingSubmitted] = useState<LabBooking | null>(null);

  useEffect(() => {
    return healthStore.subscribe(() => {
      setLabTests([...healthStore.labTests]);
      setLabBookings([...healthStore.labBookings]);
    });
  }, []);

  const filteredTests = labTests.filter((test) => {
    return (
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.labName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleBookTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingTest) return;

    const bk = healthStore.bookLabTest(bookingTest, homeCollection, address, preferredDate);
    setBookingSubmitted(bk);
    setBookingTest(null);
  };

  const handleDownloadLabReport = (bk: LabBooking) => {
    const content = `MANA HEALTH CONNECT - DIAGNOSTIC LAB REPORT\n=========================================\nTest: ${bk.testName}\nLaboratory: ${bk.labName}\nPatient: ${bk.patientName}\nPreferred Date: ${bk.preferredDate}\nStatus: ${bk.status}\nReport Notes:\n${bk.reportNotes || 'No clinical notes added yet.'}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bk.testName.replace(/\s+/g, '_')}_Lab_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
          <FlaskConical className="w-4 h-4" />
          <span>DIAGNOSTIC LABORATORY DIRECTORY & SAMPLE TRACKING</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900">
          {language === 'te' ? 'ల్యాబ్ టెస్టులు & డయాగ్నోస్టిక్స్' : 'Diagnostic Lab Tests & Home Sample Collection'}
        </h1>
        <p className="text-xs text-gray-500">
          {language === 'te'
            ? 'ధృవీకరించబడిన పార్ట్‌నర్ ల్యాబ్స్ అందించే పారదర్శక ధరలతో టెస్ట్ బుకింగ్ అభ్యర్థనలు మరియు రిపోర్ట్ ట్రాకింగ్.'
            : 'Partner-verified diagnostic catalog with transparent pricing, home sample pickup requests, and real-time lab verification status.'}
        </p>

        {bookingSubmitted && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-xs text-amber-950 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-700 shrink-0" />
              <span>
                Request sent for <strong>{bookingSubmitted.testName}</strong> ({bookingSubmitted.labName}). Status: <strong>Awaiting Lab Verification</strong>.
              </span>
            </div>
            <button onClick={() => setBookingSubmitted(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 pl-1" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search partner lab tests: CBC, Thyroid, HbA1c, Lipid Profile..."
          className="w-full bg-transparent text-xs text-gray-800 focus:outline-none"
        />
      </div>

      {/* Tests Catalog Grid */}
      {filteredTests.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm text-center space-y-3">
          <Building2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-gray-900 text-base">
            {language === 'te' ? 'పార్ట్‌నర్ ల్యాబ్ టెస్టులు ఇంకా జోడించబడలేదు' : 'No Partner Lab Tests Published Yet'}
          </h3>
          <p className="text-xs text-gray-600 max-w-lg mx-auto leading-relaxed">
            {language === 'te'
              ? 'నకిలీ ధరలు చూపకుండా ఉండేందుకు, హాస్పిటల్ అడ్మిన్ లేదా సూపర్ అడ్మిన్ ధృవీకరించిన ల్యాబ్ టెస్టులు మరియు అసలు ధరలు జోడించిన తర్వాతే ఇక్కడ కనిపిస్తాయి.'
              : 'To prevent fabricated pricing, diagnostic tests appear only when published by a Hospital Admin or Super Admin with verified laboratory rates.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">
                    {test.category}
                  </span>

                  {test.homeCollection && (
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                      <Home className="w-3 h-3" />
                      <span>Home Pickup</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug">
                    {language === 'te' && test.nameTe ? test.nameTe : test.name}
                  </h3>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                    {test.labName} ({test.district})
                  </p>
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed">{test.description}</p>

                <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    Report in: <strong>{test.reportTime}</strong>
                  </span>
                  <span className="text-gray-500">
                    {test.fastingRequired ? '⚠️ Fasting Req.' : 'No Fasting'}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-xl font-black text-gray-900">₹{test.price}</span>
                  {test.originalPrice && test.originalPrice > test.price && (
                    <span className="text-xs text-gray-400 line-through">₹{test.originalPrice}</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setBookingTest(test)}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-xs transition"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{language === 'te' ? 'టెస్ట్ బుకింగ్ అభ్యర్థన' : 'Request Lab Test'}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* My Lab Bookings & Report Tracking */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-emerald-600" />
          <span>{language === 'te' ? 'నా ల్యాబ్ బుకింగ్స్ & రిపోర్ట్ ట్రాకింగ్' : 'My Lab Bookings & Report Tracking'}</span>
        </h2>

        {labBookings.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">No lab test bookings submitted yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {labBookings.map((bk) => (
              <div key={bk.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{bk.testName}</h4>
                    <p className="text-emerald-700 font-semibold">{bk.labName}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      bk.status === 'report_ready'
                        ? 'bg-emerald-100 text-emerald-800'
                        : bk.status === 'verified_by_lab' || bk.status === 'sample_collected'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {bk.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-gray-600">
                  Date: {bk.preferredDate} • {bk.homeCollection ? 'Home Collection' : 'Walk-in'} • ₹{bk.price}
                </p>
                {bk.reportNotes && (
                  <p className="bg-white p-2.5 rounded-xl border border-gray-100 text-gray-700">
                    <strong>Lab Findings:</strong> {bk.reportNotes}
                  </p>
                )}
                {bk.status === 'report_ready' && (
                  <button
                    onClick={() => handleDownloadLabReport(bk)}
                    className="inline-flex items-center gap-1.5 text-emerald-700 font-bold hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Lab Report Summary</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingTest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Request Diagnostic Test</h3>
                <p className="text-xs text-emerald-700 font-semibold">{bookingTest.name}</p>
              </div>
              <button onClick={() => setBookingTest(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookTest} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">నమూనా సేకరణ విధానం (Sample Mode):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setHomeCollection(true)}
                    className={`py-2 px-3 rounded-2xl font-bold border flex items-center justify-center gap-1.5 ${
                      homeCollection
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Home Collection</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHomeCollection(false)}
                    className={`py-2 px-3 rounded-2xl font-bold border flex items-center justify-center gap-1.5 ${
                      !homeCollection
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Lab Walk-in</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">తేదీ (Preferred Date):</label>
                <input
                  type="date"
                  required
                  value={preferredDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {homeCollection && (
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">ఇంటి చిరునామా (Collection Address):</label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                  ></textarea>
                </div>
              )}

              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>Booking enters "Requested" status until verified by {bookingTest.labName}.</span>
              </div>

              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 flex items-center justify-between font-bold">
                <span>Lab Rate:</span>
                <span className="text-base text-gray-900">₹{bookingTest.price}</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingTest(null)}
                  className="flex-1 py-2.5 rounded-2xl border border-gray-300 text-gray-700 font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
