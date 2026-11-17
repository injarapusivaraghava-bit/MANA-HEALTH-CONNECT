import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { healthStore } from '../services/healthStore';
import { auth, googleSignIn } from '../firebase';
import { AP_DISTRICTS, SPECIALTIES } from '../data/mockData';
import { Appointment, Doctor } from '../types';
import {
  ShieldCheck,
  Users,
  Stethoscope,
  Building2,
  Calendar,
  Ambulance,
  AlertCircle,
  FileText,
  Activity,
  CheckCircle2,
  FlaskConical,
  Droplet,
  Clock,
  BookOpen,
  CreditCard,
  Bell,
  Plus,
  X,
  Lock
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { language } = useLanguage();
  const [user, setUser] = useState(healthStore.currentUser);
  const [doctors, setDoctors] = useState<Doctor[]>(healthStore.doctors);
  const [hospitals, setHospitals] = useState(healthStore.hospitals);
  const [appointments, setAppointments] = useState<Appointment[]>(healthStore.appointments);
  const [labTests, setLabTests] = useState(healthStore.labTests);
  const [labBookings, setLabBookings] = useState(healthStore.labBookings);
  const [ambulances, setAmbulances] = useState(healthStore.ambulances);
  const [medications, setMedications] = useState(healthStore.medications);
  const [bloodDonors, setBloodDonors] = useState(healthStore.bloodDonors);
  const [healthContent, setHealthContent] = useState(healthStore.healthContent);
  const [complaints, setComplaints] = useState(healthStore.complaints);
  const [payments, setPayments] = useState(healthStore.payments);
  const [adminLogs, setAdminLogs] = useState(healthStore.adminLogs);
  const [prescriptions, setPrescriptions] = useState(healthStore.prescriptions);

  const [adminTab, setAdminTab] = useState<
    | 'overview'
    | 'users'
    | 'doctors'
    | 'hospitals'
    | 'appointments'
    | 'labs'
    | 'ambulances'
    | 'reminders'
    | 'donors'
    | 'content'
    | 'complaints'
    | 'subscriptions'
    | 'logs'
  >('overview');

  const [notice, setNotice] = useState<string | null>(null);

  // Doctor Registration Form State
  const [docName, setDocName] = useState('');
  const [docSpec, setDocSpec] = useState(SPECIALTIES[0].en);
  const [docQual, setDocQual] = useState('MBBS, MD');
  const [docReg, setDocReg] = useState('');
  const [docCouncil, setDocCouncil] = useState('APMC');
  const [docHosp, setDocHosp] = useState('');
  const [docDistrict, setDocDistrict] = useState('Kakinada');
  const [docCity, setDocCity] = useState('Kakinada');
  const [docFee, setDocFee] = useState(400);
  const [docExp, setDocExp] = useState(5);
  const [docTele, setDocTele] = useState(true);

  // Digital Prescription Modal State
  const [rxApt, setRxApt] = useState<Appointment | null>(null);
  const [rxDiagnosis, setRxDiagnosis] = useState('');
  const [rxMedName, setRxMedName] = useState('');
  const [rxDosage, setRxDosage] = useState('1 Tablet');
  const [rxTiming, setRxTiming] = useState('Morning & Night after food');
  const [rxDays, setRxDays] = useState(5);
  const [rxInstructions, setRxInstructions] = useState('');

  // Hospital Form State
  const [hospName, setHospName] = useState('');
  const [hospType, setHospType] = useState<'government' | 'private'>('private');
  const [hospDistrict, setHospDistrict] = useState('Kakinada');
  const [hospAddress, setHospAddress] = useState('');
  const [hospPhone, setHospPhone] = useState('');
  const [hospICU, setHospICU] = useState(true);
  const [hospBlood, setHospBlood] = useState(false);

  // Lab Test Form State
  const [testName, setTestName] = useState('');
  const [testCat, setTestCat] = useState('Blood Panel');
  const [testLab, setTestLab] = useState('');
  const [testPrice, setTestPrice] = useState(450);
  const [testDistrict, setTestDistrict] = useState('Kakinada');
  const [testTime, setTestTime] = useState('Same Day');

  // Lab Report Note Input
  const [reportDrafts, setReportDrafts] = useState<Record<string, string>>({});

  // Ambulance Form State
  const [ambName, setAmbName] = useState('');
  const [ambPhone, setAmbPhone] = useState('');
  const [ambDistrict, setAmbDistrict] = useState('Kakinada');
  const [ambMandal, setAmbMandal] = useState('Kakinada Urban');
  const [ambVentilator, setAmbVentilator] = useState(false);

  // Health Content & Directory Additions (Super Admin)
  const [eduTitleEn, setEduTitleEn] = useState('');
  const [eduTitleTe, setEduTitleTe] = useState('');
  const [eduSummaryEn, setEduSummaryEn] = useState('');
  const [eduSummaryTe, setEduSummaryTe] = useState('');
  const [eduVideoUrl, setEduVideoUrl] = useState('');

  const [pharmName, setPharmName] = useState('');
  const [pharmPhone, setPharmPhone] = useState('');
  const [pharmAddress, setPharmAddress] = useState('');

  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');

  useEffect(() => {
    return healthStore.subscribe(() => {
      setUser({ ...healthStore.currentUser });
      setDoctors([...healthStore.doctors]);
      setHospitals([...healthStore.hospitals]);
      setAppointments([...healthStore.appointments]);
      setLabTests([...healthStore.labTests]);
      setLabBookings([...healthStore.labBookings]);
      setAmbulances([...healthStore.ambulances]);
      setMedications([...healthStore.medications]);
      setBloodDonors([...healthStore.bloodDonors]);
      setHealthContent([...healthStore.healthContent]);
      setComplaints([...healthStore.complaints]);
      setPayments([...healthStore.payments]);
      setAdminLogs([...healthStore.adminLogs]);
      setPrescriptions([...healthStore.prescriptions]);
    });
  }, []);

  const showTempNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleRegisterDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !docReg.trim()) return;
    const specMatch = SPECIALTIES.find((s) => s.en === docSpec);
    healthStore.registerDoctor({
      name: docName.trim(),
      nameTe: docName.trim(),
      specialty: docSpec,
      specialtyTe: specMatch?.te || docSpec,
      qualifications: docQual.trim(),
      registrationNumber: docReg.trim(),
      council: docCouncil,
      hospitalName: docHosp.trim() || 'Independent Clinic',
      experienceYears: Number(docExp) || 1,
      consultationFee: Number(docFee) || 300,
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      slots: ['10:00 AM', '11:30 AM', '04:30 PM', '06:00 PM'],
      district: docDistrict,
      city: docCity.trim() || docDistrict,
      phone: healthStore.patientProfile.phone || 'Verified via Clinic',
      teleconsultSupported: docTele
    });
    setDocName('');
    setDocReg('');
    setDocHosp('');
    showTempNotice('Doctor registration submitted! Pending Super Admin verification before appearing in public directory.');
  };

  const handleIssueRx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxApt || !rxMedName.trim()) return;
    healthStore.issuePrescription({
      appointmentId: rxApt.id,
      patientId: rxApt.patientId,
      patientName: rxApt.patientName,
      doctorId: rxApt.doctorId,
      doctorName: rxApt.doctorName,
      date: new Date().toISOString().split('T')[0],
      diagnosisSummary: rxDiagnosis.trim() || 'General Consultation Advice',
      medicines: [
        {
          name: rxMedName.trim(),
          dosage: rxDosage.trim(),
          timing: rxTiming.trim(),
          durationDays: Number(rxDays) || 5
        }
      ],
      instructions: rxInstructions.trim() || 'Follow prescribed dosage strictly.'
    });
    setRxApt(null);
    setRxDiagnosis('');
    setRxMedName('');
    setRxInstructions('');
    showTempNotice('Digital Prescription issued and saved to Patient Health Records.');
  };

  const handleAddHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospName.trim() || !hospAddress.trim()) return;
    healthStore.addHospital({
      name: hospName.trim(),
      nameTe: hospName.trim(),
      type: hospType,
      district: hospDistrict,
      mandal: hospDistrict,
      address: hospAddress.trim(),
      phone: hospPhone.trim() || 'Verify Hospital Desk',
      emergencyPhone: '108',
      specialties: ['General Medicine', 'Emergency Care'],
      hasICU: hospICU,
      hasBloodBank: hospBlood,
      hasEmergency24x7: true,
      hasAyushmanAarogyasri: hospType === 'government',
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospName + ' ' + hospDistrict)}`,
      verified: user.role === 'superadmin'
    });
    setHospName('');
    setHospAddress('');
    setHospPhone('');
    showTempNotice('Hospital entry added.');
  };

  const handleAddLabTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim() || !testLab.trim()) return;
    healthStore.addLabTest({
      name: testName.trim(),
      nameTe: testName.trim(),
      category: testCat,
      price: Number(testPrice) || 400,
      labName: testLab.trim(),
      labVerified: true,
      homeCollection: true,
      reportTime: testTime,
      fastingRequired: false,
      district: testDistrict,
      description: `Verified test offered by ${testLab.trim()} (${testDistrict}).`
    });
    setTestName('');
    setTestLab('');
    showTempNotice('Verified laboratory test published to Lab Services catalog.');
  };

  const handleAddAmbulance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ambName.trim() || !ambPhone.trim()) return;
    healthStore.addAmbulanceContact({
      serviceName: ambName.trim(),
      serviceNameTe: ambName.trim(),
      type: ambVentilator ? 'private_icu' : 'private_basic',
      phone: ambPhone.trim(),
      district: ambDistrict,
      mandal: ambMandal.trim(),
      is24x7: true,
      hasVentilator: ambVentilator,
      hasOxygen: true,
      verified: user.role === 'superadmin',
      notes: 'Verified private ambulance partner contact.'
    });
    setAmbName('');
    setAmbPhone('');
    showTempNotice('Ambulance service added to Emergency Directory.');
  };

  const isFirebaseSuperAdmin = auth.currentUser?.email === 'injarapusivaraghava@gmail.com';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Role Workspace Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>
              {user.role === 'doctor'
                ? 'DOCTOR CLINICAL WORKSPACE'
                : user.role === 'hospital'
                ? 'HOSPITAL ADMINISTRATOR PORTAL'
                : 'SUPER ADMIN & PLATFORM GOVERNANCE CONSOLE'}
            </span>
          </div>
          <h1 className="text-2xl font-black">
            {user.role === 'doctor'
              ? language === 'te'
                ? 'వైద్యుల పోర్టల్ (Doctor Panel)'
                : 'Doctor Consultation & Prescription Desk'
              : user.role === 'hospital'
              ? language === 'te'
                ? 'ఆసుపత్రి నిర్వాహక పోర్టల్ (Hospital Panel)'
                : 'Hospital, Lab & Fleet Management'
              : language === 'te'
              ? 'సూపర్ అడ్మిన్ పోర్టల్ (Super Admin)'
              : 'Super Admin Control Center'}
          </h1>
          <p className="text-xs text-emerald-200">
            Operator: <strong className="text-white">{auth.currentUser?.displayName || user.displayName}</strong> ({user.role.toUpperCase()})
            {auth.currentUser?.email ? ` • ${auth.currentUser.email}` : ' • Local Role Preview'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {(['patient', 'doctor', 'hospital', 'superadmin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => healthStore.setRole(r)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize border transition ${
                user.role === r
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-white/10 text-emerald-100 border-white/15 hover:bg-white/20'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl p-3.5 text-xs flex items-center justify-between font-semibold">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notice}</span>
          </span>
          <button onClick={() => setNotice(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ==================== PATIENT NOTICE IF VIEWING ADMIN ROUTE ==================== */}
      {user.role === 'patient' && (
        <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-sm text-center space-y-4">
          <Lock className="w-10 h-10 text-amber-600 mx-auto" />
          <h2 className="text-lg font-bold text-gray-900">Role-Based Access Control Active</h2>
          <p className="text-xs text-gray-600 max-w-lg mx-auto leading-relaxed">
            You are currently signed in as a <strong>Patient</strong>. Switch your role above or in the Header Role Switcher to <strong>Doctor</strong>, <strong>Hospital</strong>, or <strong>Super Admin</strong> to access clinical or administrative dashboards.
          </p>
        </div>
      )}

      {/* ==================== DOCTOR PANEL ==================== */}
      {user.role === 'doctor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Submit Doctor Profile */}
            <form onSubmit={handleRegisterDoctor} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3.5 text-xs">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                <Stethoscope className="w-4 h-4 text-emerald-700" />
                <span>Register / Submit Verified Doctor Profile</span>
              </h2>
              <p className="text-[11px] text-gray-500">
                Submitted profiles remain in "Pending Verification" until approved by Super Admin.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Dr. Full Name"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl col-span-2"
                />
                <select
                  value={docSpec}
                  onChange={(e) => setDocSpec(e.target.value)}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s.en} value={s.en}>{s.en}</option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  placeholder="Qualifications (e.g. MBBS, MD)"
                  value={docQual}
                  onChange={(e) => setDocQual(e.target.value)}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
                <input
                  type="text"
                  required
                  placeholder="Medical Council Reg No."
                  value={docReg}
                  onChange={(e) => setDocReg(e.target.value)}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
                <select
                  value={docCouncil}
                  onChange={(e) => setDocCouncil(e.target.value)}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                >
                  <option value="APMC">APMC (Andhra Pradesh)</option>
                  <option value="TSMC">TSMC (Telangana)</option>
                  <option value="NMC">NMC (National)</option>
                </select>
                <input
                  type="text"
                  placeholder="Hospital / Clinic Name"
                  value={docHosp}
                  onChange={(e) => setDocHosp(e.target.value)}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl col-span-2"
                />
                <select
                  value={docDistrict}
                  onChange={(e) => setDocDistrict(e.target.value)}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                >
                  {AP_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="City / Town"
                  value={docCity}
                  onChange={(e) => setDocCity(e.target.value)}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
                <input
                  type="number"
                  placeholder="Consultation Fee (₹)"
                  value={docFee}
                  onChange={(e) => setDocFee(Number(e.target.value))}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
                <input
                  type="number"
                  placeholder="Experience (Years)"
                  value={docExp}
                  onChange={(e) => setDocExp(Number(e.target.value))}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                <input
                  type="checkbox"
                  checked={docTele}
                  onChange={(e) => setDocTele(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>Supports Tele-Consultation (Video OPD)</span>
              </label>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl"
              >
                Submit Doctor Profile for Verification
              </button>
            </form>

            {/* Incoming Patient Appointments */}
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4 text-xs">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
                Patient Appointment Queue ({appointments.length})
              </h2>
              {appointments.length === 0 ? (
                <p className="text-gray-400 py-8 text-center">No patient appointment requests yet.</p>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{apt.patientName}</p>
                          <p className="text-emerald-700 font-semibold">{apt.doctorName} • {apt.date} {apt.slot}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] uppercase">
                          {apt.status}
                        </span>
                      </div>
                      {apt.symptoms && <p className="text-gray-600">Symptoms: {apt.symptoms}</p>}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {apt.status !== 'confirmed' && apt.status !== 'completed' && (
                          <button
                            onClick={() => healthStore.updateAppointmentStatus(apt.id, 'confirmed')}
                            className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl font-bold"
                          >
                            Confirm Slot
                          </button>
                        )}
                        <button
                          onClick={() => setRxApt(apt)}
                          className="px-3 py-1.5 bg-blue-700 text-white rounded-xl font-bold"
                        >
                          Issue Prescription
                        </button>
                        {apt.status !== 'cancelled' && (
                          <button
                            onClick={() => healthStore.updateAppointmentStatus(apt.id, 'cancelled')}
                            className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== HOSPITAL ADMIN PANEL ==================== */}
      {user.role === 'hospital' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Register Hospital */}
            <form onSubmit={handleAddHospital} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3 text-xs">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>Register / Add Hospital Facility</span>
              </h2>
              <input
                type="text"
                required
                placeholder="Hospital Name"
                value={hospName}
                onChange={(e) => setHospName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={hospType}
                  onChange={(e) => setHospType(e.target.value as 'government' | 'private')}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                >
                  <option value="private">Private Hospital</option>
                  <option value="government">Government Hospital</option>
                </select>
                <select
                  value={hospDistrict}
                  onChange={(e) => setHospDistrict(e.target.value)}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                >
                  {AP_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                required
                placeholder="Full Street Address"
                value={hospAddress}
                onChange={(e) => setHospAddress(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
              />
              <input
                type="tel"
                placeholder="OPD Contact Phone"
                value={hospPhone}
                onChange={(e) => setHospPhone(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
              />
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked={hospICU} onChange={(e) => setHospICU(e.target.checked)} />
                  <span>Has 24x7 ICU</span>
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked={hospBlood} onChange={(e) => setHospBlood(e.target.checked)} />
                  <span>Has Blood Bank</span>
                </label>
              </div>
              <button type="submit" className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-2xl">
                Submit Hospital Facility
              </button>
            </form>

            {/* Add Lab Test & Private Ambulance */}
            <div className="space-y-6">
              <form onSubmit={handleAddLabTest} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3 text-xs">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <FlaskConical className="w-4 h-4 text-emerald-700" />
                  <span>Publish Verified Lab Test</span>
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Test Name (e.g. Complete Blood Count)"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl col-span-2"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Partner Lab Name"
                    value={testLab}
                    onChange={(e) => setTestLab(e.target.value)}
                    className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Price (₹)"
                    value={testPrice}
                    onChange={(e) => setTestPrice(Number(e.target.value))}
                    className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-2xl">
                  Add Test to Catalog
                </button>
              </form>

              <form onSubmit={handleAddAmbulance} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3 text-xs">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Ambulance className="w-4 h-4 text-red-600" />
                  <span>Register Verified Local Ambulance</span>
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Ambulance Service Name"
                    value={ambName}
                    onChange={(e) => setAmbName(e.target.value)}
                    className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="24x7 Dispatch Phone"
                    value={ambPhone}
                    onChange={(e) => setAmbPhone(e.target.value)}
                    className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-red-600 text-white font-bold rounded-2xl">
                  Add Ambulance Contact
                </button>
              </form>
            </div>
          </div>

          {/* Manage Lab Bookings */}
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4 text-xs">
            <h2 className="text-base font-bold text-gray-900">Hospital / Lab Booking Queue ({labBookings.length})</h2>
            {labBookings.length === 0 ? (
              <p className="text-gray-400">No lab bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {labBookings.map((bk) => (
                  <div key={bk.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">{bk.testName} — {bk.patientName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                        {bk.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <button
                        onClick={() => healthStore.updateLabBookingStatus(bk.id, 'verified_by_lab')}
                        className="px-3 py-1 bg-blue-700 text-white rounded-xl font-bold"
                      >
                        Verify Booking
                      </button>
                      <button
                        onClick={() => healthStore.updateLabBookingStatus(bk.id, 'sample_collected')}
                        className="px-3 py-1 bg-amber-600 text-white rounded-xl font-bold"
                      >
                        Sample Collected
                      </button>
                      <input
                        type="text"
                        placeholder="Enter lab result summary..."
                        value={reportDrafts[bk.id] || ''}
                        onChange={(e) => setReportDrafts({ ...reportDrafts, [bk.id]: e.target.value })}
                        className="p-1.5 bg-white border border-gray-200 rounded-xl flex-1 min-w-[180px]"
                      />
                      <button
                        onClick={() =>
                          healthStore.updateLabBookingStatus(
                            bk.id,
                            'report_ready',
                            reportDrafts[bk.id] || 'Lab report verified and ready for download.'
                          )
                        }
                        className="px-3 py-1 bg-emerald-700 text-white rounded-xl font-bold"
                      >
                        Upload Report Ready
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== SUPER ADMIN PANEL ==================== */}
      {user.role === 'superadmin' && (
        <div className="space-y-6">
          {/* Firebase Super Admin Auth Verification Notice */}
          {!isFirebaseSuperAdmin && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Cloud Write Authorization Notice (Firestore Security Rules)</p>
                  <p className="text-amber-900">
                    Cloud Firestore admin writes require signing in with verified Super Admin Google account (<strong>injarapusivaraghava@gmail.com</strong>). Local session edits remain active for workflow review.
                  </p>
                </div>
              </div>
              <button
                onClick={() => googleSignIn().catch(() => {})}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shrink-0"
              >
                Verify Super Admin Google Account
              </button>
            </div>
          )}

          {/* Super Admin Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
            {[
              { id: 'overview', label: 'Analytics', icon: Activity },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'doctors', label: `Doctors (${doctors.length})`, icon: Stethoscope },
              { id: 'hospitals', label: `Hospitals (${hospitals.length})`, icon: Building2 },
              { id: 'appointments', label: `Appointments (${appointments.length})`, icon: Calendar },
              { id: 'labs', label: `Labs (${labTests.length})`, icon: FlaskConical },
              { id: 'ambulances', label: `Ambulances (${ambulances.length})`, icon: Ambulance },
              { id: 'reminders', label: `Meds (${medications.length})`, icon: Clock },
              { id: 'donors', label: `Donors (${bloodDonors.length})`, icon: Droplet },
              { id: 'content', label: 'Content & Directories', icon: BookOpen },
              { id: 'complaints', label: `Complaints (${complaints.length})`, icon: AlertCircle },
              { id: 'subscriptions', label: 'Plans & Notifs', icon: CreditCard },
              { id: 'logs', label: `Audit Logs (${adminLogs.length})`, icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id as typeof adminTab)}
                  className={`px-3.5 py-2 rounded-2xl flex items-center gap-1.5 whitespace-nowrap transition ${
                    adminTab === tab.id
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 1. Analytics Overview (Real Counts Only) */}
          {adminTab === 'overview' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Verified Doctors', val: doctors.filter((d) => d.verified).length, sub: `${doctors.length} total submitted` },
                { label: 'Hospitals Listed', val: hospitals.length, sub: `${hospitals.filter((h) => h.verified).length} verified` },
                { label: 'Appointments', val: appointments.length, sub: `${appointments.filter((a) => a.status === 'pending').length} pending review` },
                { label: 'Prescriptions Issued', val: prescriptions.length, sub: 'Synced to Health Locker' },
                { label: 'Lab Bookings', val: labBookings.length, sub: `${labTests.length} published tests` },
                { label: 'Ambulance Contacts', val: ambulances.length, sub: 'Official 108/102/112 + verified' },
                { label: 'Blood Donors', val: bloodDonors.length, sub: 'Consent-verified volunteers' },
                { label: 'Open Complaints', val: complaints.filter((c) => c.status !== 'resolved').length, sub: `${complaints.length} total tickets` }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs space-y-1">
                  <span className="text-xs text-gray-500 font-semibold">{stat.label}</span>
                  <p className="text-3xl font-black text-emerald-800">{stat.val}</p>
                  <p className="text-[11px] text-gray-500">{stat.sub}</p>
                </div>
              ))}
            </div>
          )}

          {/* 2. User Management */}
          {adminTab === 'users' && (
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-gray-900 text-base">Active Session & Registered Account</h3>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{healthStore.patientProfile.name}</p>
                  <p className="text-gray-500">
                    UID: {user.uid} • Role: {user.role} • {healthStore.patientProfile.district}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] self-start">
                  {auth.currentUser ? 'Firebase Authenticated' : 'Guest / Local Session'}
                </span>
              </div>
            </div>
          )}

          {/* 3. Doctor Verification */}
          {adminTab === 'doctors' && (
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-gray-900 text-base">Doctor Credential Verification</h3>
              {doctors.length === 0 ? (
                <p className="text-gray-500">
                  No doctor profiles submitted yet. Switch to the <strong>Doctor</strong> role to submit a practitioner profile for approval.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {doctors.map((doc) => (
                    <div key={doc.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-bold text-gray-900 text-sm">{doc.name} ({doc.specialty})</p>
                        <p className="text-gray-500">
                          Reg No: <strong className="font-mono">{doc.registrationNumber}</strong> ({doc.council}) • {doc.qualifications} • {doc.hospitalName}
                        </p>
                      </div>
                      <button
                        onClick={() => healthStore.toggleDoctorVerify(doc.id)}
                        className={`px-4 py-2 rounded-xl font-bold ${
                          doc.verified
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-emerald-700 text-white'
                        }`}
                      >
                        {doc.verified ? 'Verified (Click to Revoke)' : 'Approve & Publish Doctor'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Hospitals Management */}
          {adminTab === 'hospitals' && (
            <div className="space-y-6">
              <form onSubmit={handleAddHospital} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3 text-xs">
                <h3 className="font-bold text-gray-900 text-base">Add Verified Hospital</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Hospital Name"
                    value={hospName}
                    onChange={(e) => setHospName(e.target.value)}
                    className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                  />
                  <select
                    value={hospDistrict}
                    onChange={(e) => setHospDistrict(e.target.value)}
                    className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                  >
                    {AP_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select
                    value={hospType}
                    onChange={(e) => setHospType(e.target.value as 'government' | 'private')}
                    className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                  >
                    <option value="private">Private</option>
                    <option value="government">Government</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Address"
                    value={hospAddress}
                    onChange={(e) => setHospAddress(e.target.value)}
                    className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl md:col-span-2"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={hospPhone}
                    onChange={(e) => setHospPhone(e.target.value)}
                    className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                  />
                </div>
                <button type="submit" className="px-5 py-2.5 bg-emerald-700 text-white font-bold rounded-2xl">
                  Add Hospital
                </button>
              </form>

              <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3 text-xs">
                <h3 className="font-bold text-gray-900 text-base">Hospitals Directory ({hospitals.length})</h3>
                <div className="divide-y divide-gray-100">
                  {hospitals.map((h) => (
                    <div key={h.id} className="py-3 flex justify-between items-center gap-3">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{h.name}</p>
                        <p className="text-gray-500">{h.address} • {h.phone}</p>
                      </div>
                      <button
                        onClick={() => healthStore.toggleHospitalVerify(h.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold ${
                          h.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-500 text-white'
                        }`}
                      >
                        {h.verified ? 'Verified' : 'Approve'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. Appointments Management */}
          {adminTab === 'appointments' && (
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-gray-900 text-base">All Appointments ({appointments.length})</h3>
              {appointments.length === 0 ? (
                <p className="text-gray-400">No appointment requests logged yet.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-900">{apt.patientName} → {apt.doctorName}</p>
                        <p className="text-gray-500">{apt.date} {apt.slot} • Status: {apt.status}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => healthStore.updateAppointmentStatus(apt.id, 'confirmed')}
                          className="px-3 py-1 bg-emerald-700 text-white rounded-xl font-bold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => healthStore.updateAppointmentStatus(apt.id, 'cancelled')}
                          className="px-3 py-1 bg-red-50 text-red-700 rounded-xl font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. Lab Management */}
          {adminTab === 'labs' && (
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-gray-900 text-base">Publish Lab Test & Manage Bookings</h3>
              <form onSubmit={handleAddLabTest} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl">
                <input
                  type="text"
                  required
                  placeholder="Test Name"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="p-2.5 bg-white border border-gray-200 rounded-xl"
                />
                <input
                  type="text"
                  required
                  placeholder="Lab Name"
                  value={testLab}
                  onChange={(e) => setTestLab(e.target.value)}
                  className="p-2.5 bg-white border border-gray-200 rounded-xl"
                />
                <input
                  type="number"
                  required
                  placeholder="Price (₹)"
                  value={testPrice}
                  onChange={(e) => setTestPrice(Number(e.target.value))}
                  className="p-2.5 bg-white border border-gray-200 rounded-xl"
                />
                <button type="submit" className="bg-emerald-700 text-white font-bold rounded-xl px-4 py-2.5">
                  Publish Lab Test
                </button>
              </form>
              <p className="font-semibold text-gray-700">Published Tests: {labTests.length} | Active Bookings: {labBookings.length}</p>
            </div>
          )}

          {/* 7. Ambulance Management */}
          {adminTab === 'ambulances' && (
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-gray-900 text-base">Ambulance Directory Management</h3>
              <form onSubmit={handleAddAmbulance} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl">
                <input
                  type="text"
                  required
                  placeholder="Ambulance Name"
                  value={ambName}
                  onChange={(e) => setAmbName(e.target.value)}
                  className="p-2.5 bg-white border border-gray-200 rounded-xl"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone"
                  value={ambPhone}
                  onChange={(e) => setAmbPhone(e.target.value)}
                  className="p-2.5 bg-white border border-gray-200 rounded-xl"
                />
                <label className="flex items-center gap-2 px-2">
                  <input type="checkbox" checked={ambVentilator} onChange={(e) => setAmbVentilator(e.target.checked)} />
                  <span>ICU Ventilator</span>
                </label>
                <button type="submit" className="bg-red-600 text-white font-bold rounded-xl px-4 py-2.5">
                  Add Verified Unit
                </button>
              </form>
              <div className="divide-y divide-gray-100">
                {ambulances.map((a) => (
                  <div key={a.id} className="py-2.5 flex justify-between">
                    <span className="font-bold text-gray-900">{a.serviceName}</span>
                    <span className="font-mono text-emerald-700">{a.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Medicine Reminder Oversight */}
          {adminTab === 'reminders' && (
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-gray-900 text-base">Medicine Reminder System Oversight</h3>
              <p className="text-gray-600">
                Total Active Schedules: <strong>{medications.length}</strong> • Taken Today: <strong>{medications.filter((m) => m.takenToday).length}</strong> • Clinical Dose-Safety Guardrail: <strong>ENFORCED</strong>
              </p>
            </div>
          )}

          {/* 9. Blood Donors Management */}
          {adminTab === 'donors' && (
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-gray-900 text-base">Consenting Blood Donors ({bloodDonors.length})</h3>
              {bloodDonors.length === 0 ? (
                <p className="text-gray-400">No volunteer blood donors registered yet.</p>
              ) : (
                bloodDonors.map((d) => (
                  <div key={d.id} className="p-3 bg-gray-50 rounded-2xl flex justify-between">
                    <span className="font-bold">{d.name} ({d.bloodGroup}) — {d.district}</span>
                    <span>{d.phone}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 10. Health Content & Allied Directories */}
          {adminTab === 'content' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!eduTitleEn.trim()) return;
                  healthStore.addHealthContent({
                    titleEn: eduTitleEn.trim(),
                    titleTe: eduTitleTe.trim() || eduTitleEn.trim(),
                    category: 'Public Health',
                    summaryEn: eduSummaryEn.trim(),
                    summaryTe: eduSummaryTe.trim() || eduSummaryEn.trim(),
                    videoUrl: eduVideoUrl.trim() || undefined,
                    published: true
                  });
                  setEduTitleEn('');
                  setEduTitleTe('');
                  setEduSummaryEn('');
                  setEduSummaryTe('');
                  setEduVideoUrl('');
                  showTempNotice('Health Education article published.');
                }}
                className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3"
              >
                <h3 className="font-bold text-gray-900 text-base">Publish Health Education Content ({healthContent.length})</h3>
                <input
                  type="text"
                  required
                  placeholder="Title (English)"
                  value={eduTitleEn}
                  onChange={(e) => setEduTitleEn(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
                <input
                  type="text"
                  placeholder="Title (Telugu)"
                  value={eduTitleTe}
                  onChange={(e) => setEduTitleTe(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
                <textarea
                  rows={2}
                  required
                  placeholder="Summary (English)"
                  value={eduSummaryEn}
                  onChange={(e) => setEduSummaryEn(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
                <input
                  type="url"
                  placeholder="Optional Video URL"
                  value={eduVideoUrl}
                  onChange={(e) => setEduVideoUrl(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
                <button type="submit" className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-2xl">
                  Publish Content
                </button>
              </form>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!pharmName.trim()) return;
                  healthStore.addPharmacy({
                    name: pharmName.trim(),
                    nameTe: pharmName.trim(),
                    district: 'Kakinada',
                    address: pharmAddress.trim() || 'Kakinada',
                    phone: pharmPhone.trim(),
                    is24x7: true,
                    homeDelivery: true,
                    verified: true
                  });
                  setPharmName('');
                  setPharmPhone('');
                  setPharmAddress('');
                  showTempNotice('Verified pharmacy added to directory.');
                }}
                className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3"
              >
                <h3 className="font-bold text-gray-900 text-base">Add Verified Partner Pharmacy</h3>
                <input
                  type="text"
                  required
                  placeholder="Pharmacy Name"
                  value={pharmName}
                  onChange={(e) => setPharmName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
                <input
                  type="text"
                  required
                  placeholder="Address"
                  value={pharmAddress}
                  onChange={(e) => setPharmAddress(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
                <input
                  type="tel"
                  required
                  placeholder="Contact Phone"
                  value={pharmPhone}
                  onChange={(e) => setPharmPhone(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
                <button type="submit" className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-2xl">
                  Add Pharmacy
                </button>
              </form>
            </div>
          )}

          {/* 11. Complaints */}
          {adminTab === 'complaints' && (
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-gray-900 text-base">Citizen Complaints & Grievance Cell</h3>
              {complaints.length === 0 ? (
                <p className="text-gray-400">No citizen complaints logged yet.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {complaints.map((c) => (
                    <div key={c.id} className="py-3 flex justify-between items-center gap-3">
                      <div>
                        <p className="font-bold text-gray-900">{c.subject} ({c.category})</p>
                        <p className="text-gray-500">By {c.userName} on {c.createdAt} • {c.description}</p>
                      </div>
                      {c.status !== 'resolved' ? (
                        <button
                          onClick={() => healthStore.resolveComplaint(c.id)}
                          className="px-3 py-1.5 bg-emerald-700 text-white font-bold rounded-xl"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold">Resolved</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 12. Subscriptions, Sandbox Payments & Notifications */}
          {adminTab === 'subscriptions' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
              <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
                <h3 className="font-bold text-gray-900 text-base">Subscription & Sandbox Payment Reports</h3>
                <p className="text-gray-600">Current Account Plan: <strong className="uppercase text-emerald-700">{healthStore.activePlan}</strong></p>
                {payments.length === 0 ? (
                  <p className="text-gray-400">No subscription transactions recorded yet.</p>
                ) : (
                  payments.map((p) => (
                    <div key={p.id} className="p-3 bg-gray-50 rounded-2xl flex justify-between">
                      <span>{p.userName} • {p.plan.toUpperCase()}</span>
                      <span className="font-bold">₹{p.amount} ({p.status})</span>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!notifTitle.trim()) return;
                  healthStore.addNotification({
                    userId: healthStore.currentUser.uid,
                    title: notifTitle.trim(),
                    message: notifMsg.trim(),
                    type: 'general'
                  });
                  setNotifTitle('');
                  setNotifMsg('');
                  showTempNotice('Alert notification broadcast.');
                }}
                className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3"
              >
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-700" />
                  <span>Send Public Health Notification</span>
                </h3>
                <input
                  type="text"
                  required
                  placeholder="Notification Title"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
                <textarea
                  rows={2}
                  required
                  placeholder="Message body..."
                  value={notifMsg}
                  onChange={(e) => setNotifMsg(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
                <button type="submit" className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-2xl">
                  Send Notification
                </button>
              </form>
            </div>
          )}

          {/* 13. Real Admin Activity Logs */}
          {adminTab === 'logs' && (
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4 text-xs font-mono">
              <h3 className="font-bold text-gray-900 text-base font-sans">Live Admin Activity Logs</h3>
              <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl space-y-2 max-h-72 overflow-y-auto">
                {adminLogs.length === 0 ? (
                  <p>[System] No administrative actions recorded in this session yet.</p>
                ) : (
                  adminLogs.map((l) => (
                    <p key={l.id}>
                      [{l.timestamp}] ({l.actorRole} | {l.actorEmail}) → {l.action}
                    </p>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Digital Prescription Modal (Doctor Role) */}
      {rxApt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Issue Digital Prescription</h3>
                <p className="text-xs text-emerald-700 font-semibold">Patient: {rxApt.patientName}</p>
              </div>
              <button onClick={() => setRxApt(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleIssueRx} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Clinical Impression / Diagnosis Summary"
                value={rxDiagnosis}
                onChange={(e) => setRxDiagnosis(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
              />
              <input
                type="text"
                required
                placeholder="Prescribed Medicine Name"
                value={rxMedName}
                onChange={(e) => setRxMedName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Dosage (e.g. 500mg)"
                  value={rxDosage}
                  onChange={(e) => setRxDosage(e.target.value)}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="Days"
                  value={rxDays}
                  onChange={(e) => setRxDays(Number(e.target.value))}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
              </div>
              <input
                type="text"
                required
                placeholder="Timing (e.g. Morning & Night after food)"
                value={rxTiming}
                onChange={(e) => setRxTiming(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
              />
              <textarea
                rows={2}
                placeholder="Special Clinical Instructions..."
                value={rxInstructions}
                onChange={(e) => setRxInstructions(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
              />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setRxApt(null)} className="flex-1 py-2.5 rounded-2xl border border-gray-300 font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-2xl bg-emerald-700 text-white font-bold">
                  Save & Issue Rx
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
