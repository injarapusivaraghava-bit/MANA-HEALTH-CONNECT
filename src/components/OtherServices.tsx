import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { healthStore } from '../services/healthStore';
import {
  Pill,
  Activity,
  ShieldCheck,
  MessageSquareHeart,
  BookOpen,
  PhoneCall,
  CheckCircle2,
  MapPin,
  Send,
  Video
} from 'lucide-react';

export const OtherServices: React.FC = () => {
  const { language } = useLanguage();
  const [subTab, setSubTab] = useState<'pharmacy' | 'physio' | 'packages' | 'support' | 'education'>('pharmacy');

  const [pharmacies, setPharmacies] = useState(healthStore.pharmacies);
  const [pharmacyRequests, setPharmacyRequests] = useState(healthStore.pharmacyRequests);
  const [physioCenters, setPhysioCenters] = useState(healthStore.physiotherapyCenters);
  const [packages, setPackages] = useState(healthStore.healthPackages);
  const [complaints, setComplaints] = useState(healthStore.complaints);
  const [healthContent, setHealthContent] = useState(healthStore.healthContent);

  // Pharmacy Prescription Request Form
  const [selectedPharmacy, setSelectedPharmacy] = useState('');
  const [rxTitle, setRxTitle] = useState('');
  const [rxNotes, setRxNotes] = useState('');
  const [rxSubmitted, setRxSubmitted] = useState(false);

  // Support / Complaint Form
  const [cmpCategory, setCmpCategory] = useState('Appointment / OPD Issue');
  const [cmpSubject, setCmpSubject] = useState('');
  const [cmpDesc, setCmpDesc] = useState('');
  const [cmpSubmitted, setCmpSubmitted] = useState(false);

  useEffect(() => {
    return healthStore.subscribe(() => {
      setPharmacies([...healthStore.pharmacies]);
      setPharmacyRequests([...healthStore.pharmacyRequests]);
      setPhysioCenters([...healthStore.physiotherapyCenters]);
      setPackages([...healthStore.healthPackages]);
      setComplaints([...healthStore.complaints]);
      setHealthContent([...healthStore.healthContent]);
    });
  }, []);

  const handleSubmitPharmacyReq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxTitle.trim()) return;
    healthStore.submitPharmacyRequest(
      selectedPharmacy || 'Partner Pharmacy Desk',
      rxTitle.trim(),
      rxNotes.trim()
    );
    setRxTitle('');
    setRxNotes('');
    setRxSubmitted(true);
    setTimeout(() => setRxSubmitted(false), 3000);
  };

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmpSubject.trim()) return;
    healthStore.submitComplaint(cmpCategory, cmpSubject.trim(), cmpDesc.trim());
    setCmpSubject('');
    setCmpDesc('');
    setCmpSubmitted(true);
    setTimeout(() => setCmpSubmitted(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-1">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>PHARMACIES, PHYSIOTHERAPY, PREVENTIVE PACKAGES & CITIZEN SUPPORT</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900">
          {language === 'te' ? 'ఫార్మసీ, ఫిజియోథెరపీ & సహాయ కేంద్రం' : 'Allied Healthcare, Pharmacies & Support'}
        </h1>
        <p className="text-xs text-gray-500">
          {language === 'te'
            ? 'ప్రిస్క్రిప్షన్ ఆధారిత మందుల అభ్యర్థనలు, ఫిజియోథెరపీ కేంద్రాలు, నివారణ ఆరోగ్య ప్యాకేజీలు, తెలుగు ఆరోగ్య విద్య మరియు ఫిర్యాదుల పోర్టల్.'
            : 'Prescription-based pharmacy requests, physiotherapy directory, preventive health packages, Telugu health literacy, and grievance support.'}
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'pharmacy', label: 'Pharmacy & Rx Request', icon: Pill },
          { id: 'physio', label: 'Physiotherapy Directory', icon: Activity },
          { id: 'packages', label: 'Preventive Packages', icon: ShieldCheck },
          { id: 'education', label: 'Telugu Health Content', icon: BookOpen },
          { id: 'support', label: 'Support & Complaints', icon: MessageSquareHeart }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as typeof subTab)}
              className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 whitespace-nowrap transition ${
                subTab === tab.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Pharmacy & Prescription Requests */}
      {subTab === 'pharmacy' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Verified Pharmacy Directory</h2>
            {pharmacies.length === 0 ? (
              <p className="text-xs text-gray-500 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                No verified pharmacies onboarded yet. Super Admin can add verified partner pharmacies in the Admin Portal.
              </p>
            ) : (
              <div className="space-y-3 text-xs">
                {pharmacies.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl border border-gray-200 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{language === 'te' ? p.nameTe : p.name}</p>
                      <p className="text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{p.address}, {p.district}</span>
                      </p>
                    </div>
                    <a
                      href={`tel:${p.phone}`}
                      className="px-3 py-2 bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 shrink-0"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Prescription-Based Medicine Request</h2>
            <p className="text-xs text-gray-500">
              Prescription verification by a licensed pharmacist is mandatory before dispensing Schedule H/H1 medicines.
            </p>
            {rxSubmitted && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-2xl text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Medicine request submitted for pharmacist prescription check.</span>
              </div>
            )}
            <form onSubmit={handleSubmitPharmacyReq} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Pharmacy Name (Optional):</label>
                <input
                  type="text"
                  placeholder="Preferred partner pharmacy"
                  value={selectedPharmacy}
                  onChange={(e) => setSelectedPharmacy(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Prescription Reference / Medicine List:</label>
                <input
                  type="text"
                  required
                  placeholder="Enter prescription ID or doctor-prescribed medicine names"
                  value={rxTitle}
                  onChange={(e) => setRxTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Delivery Address & Notes:</label>
                <textarea
                  rows={2}
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  placeholder="Delivery location or pickup preference..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Prescription Request</span>
              </button>
            </form>

            {pharmacyRequests.length > 0 && (
              <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                <p className="font-bold text-gray-700">Your Recent Requests:</p>
                {pharmacyRequests.map((req) => (
                  <div key={req.id} className="p-2.5 bg-gray-50 rounded-xl flex justify-between items-center">
                    <span>{req.prescriptionTitle}</span>
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Physiotherapy Directory */}
      {subTab === 'physio' && (
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Physiotherapy & Rehabilitation Directory</h2>
          {physioCenters.length === 0 ? (
            <p className="text-xs text-gray-500 bg-gray-50 p-6 rounded-2xl text-center">
              No verified physiotherapy centers onboarded yet. Super Admin can add verified rehabilitation centers via Admin Portal.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {physioCenters.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl border border-gray-200 space-y-2">
                  <h3 className="font-bold text-gray-900 text-sm">{c.name}</h3>
                  <p className="text-emerald-700 font-semibold">{c.specialty}</p>
                  <p className="text-gray-600">{c.address}, {c.district}</p>
                  {c.homeVisitAvailable && (
                    <span className="inline-block bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      Home Visit Available
                    </span>
                  )}
                  <a
                    href={`tel:${c.phone}`}
                    className="block w-full text-center py-2 bg-emerald-700 text-white rounded-xl font-bold mt-2"
                  >
                    Call {c.phone}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preventive Health Packages */}
      {subTab === 'packages' && (
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Preventive Health Checkup Packages</h2>
          {packages.length === 0 ? (
            <p className="text-xs text-gray-500 bg-gray-50 p-6 rounded-2xl text-center">
              No preventive health packages published yet. Verified partner hospitals and labs can publish packages via Admin Portal.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {packages.map((pkg) => (
                <div key={pkg.id} className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/30 space-y-2">
                  <h3 className="font-bold text-gray-900 text-sm">{language === 'te' ? pkg.nameTe : pkg.name}</h3>
                  <p className="text-emerald-700 font-semibold">{pkg.provider}</p>
                  <p className="text-gray-600">Target: {pkg.targetGroup}</p>
                  <p className="text-gray-700">Includes: {pkg.testsIncluded.join(', ')}</p>
                  <p className="text-lg font-black text-gray-900">₹{pkg.price}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Telugu Health Education & Videos */}
      {subTab === 'education' && (
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">
            {language === 'te' ? 'తెలుగు ఆరోగ్య విద్యా సమాచారం & వీడియోలు' : 'Telugu Health Education & Awareness'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {healthContent.filter((c) => c.published).map((item) => (
              <div key={item.id} className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/40 space-y-2">
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {item.category}
                </span>
                <h3 className="font-bold text-gray-900 text-sm">
                  {language === 'te' ? item.titleTe : item.titleEn}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {language === 'te' ? item.summaryTe : item.summaryEn}
                </p>
                {item.videoUrl && (
                  <a
                    href={item.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-700 font-bold hover:underline pt-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Watch Educational Video</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Support & Complaints */}
      {subTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Submit Support Request / Complaint</h2>
            {cmpSubmitted && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-2xl text-xs font-semibold">
                Grievance logged and routed to Super Admin Complaints Desk.
              </div>
            )}
            <form onSubmit={handleSubmitComplaint} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Category:</label>
                <select
                  value={cmpCategory}
                  onChange={(e) => setCmpCategory(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                >
                  <option value="Appointment / OPD Issue">Appointment / OPD Issue</option>
                  <option value="Hospital Service Feedback">Hospital Service Feedback</option>
                  <option value="Lab Report Query">Lab Report Query</option>
                  <option value="Technical / Data Privacy">Technical / Data Privacy</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Subject:</label>
                <input
                  type="text"
                  required
                  value={cmpSubject}
                  onChange={(e) => setCmpSubject(e.target.value)}
                  placeholder="Brief summary of your issue"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Description:</label>
                <textarea
                  rows={3}
                  required
                  value={cmpDesc}
                  onChange={(e) => setCmpDesc(e.target.value)}
                  placeholder="Describe details so our Turangi, Kakinada desk can resolve it..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl"
              >
                Submit Grievance
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4 text-xs">
            <h2 className="text-lg font-bold text-gray-900">Direct Helpline & My Tickets</h2>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <p className="font-bold text-emerald-950">MANA HEALTH CONNECT Helpdesk</p>
              <p className="text-emerald-800">Turangi, Kakinada, Andhra Pradesh - 533016</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href="tel:+918977776111"
                  className="bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold inline-flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>+91 8977776111</span>
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=918977776111"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-3 py-1.5 rounded-xl font-bold"
                >
                  WhatsApp Support
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-gray-700">Submitted Tickets ({complaints.length}):</p>
              {complaints.length === 0 ? (
                <p className="text-gray-400">No complaints submitted in this session.</p>
              ) : (
                complaints.map((c) => (
                  <div key={c.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{c.subject}</p>
                      <p className="text-gray-500">{c.category} • {c.createdAt}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] uppercase">
                      {c.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
