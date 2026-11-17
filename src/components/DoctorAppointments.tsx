import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { healthStore } from '../services/healthStore';
import { Doctor, Appointment } from '../types';
import { SPECIALTIES, AP_DISTRICTS } from '../data/mockData';
import {
  Stethoscope,
  Calendar,
  MapPin,
  CheckCircle2,
  Award,
  Search,
  Video,
  Building,
  X,
  AlertCircle,
  Clock,
  RefreshCw,
  UserPlus
} from 'lucide-react';

export const DoctorAppointments: React.FC = () => {
  const { language, t } = useLanguage();
  const [doctors, setDoctors] = useState<Doctor[]>(healthStore.doctors);
  const [appointments, setAppointments] = useState<Appointment[]>(healthStore.appointments);
  const [familyMembers, setFamilyMembers] = useState(healthStore.familyMembers);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  // Booking Modal State
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultationType, setConsultationType] = useState<'in-person' | 'video'>('in-person');
  const [selectedPatientName, setSelectedPatientName] = useState(healthStore.patientProfile.name);
  const [symptoms, setSymptoms] = useState('');
  const [bookingSubmitted, setBookingSubmitted] = useState<Appointment | null>(null);

  // Reschedule Modal State
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('10:00 AM');

  useEffect(() => {
    return healthStore.subscribe(() => {
      setDoctors([...healthStore.doctors]);
      setAppointments([...healthStore.appointments]);
      setFamilyMembers([...healthStore.familyMembers]);
    });
  }, []);

  const verifiedDoctors = doctors.filter((d) => d.verified);

  const filteredDoctors = verifiedDoctors.filter((doc) => {
    const matchSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.hospitalName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSpecialty = selectedSpecialty === 'All' || doc.specialty.includes(selectedSpecialty);
    const matchDistrict = selectedDistrict === 'All' || doc.district === selectedDistrict;

    return matchSearch && matchSpecialty && matchDistrict;
  });

  const handleOpenBooking = (doc: Doctor) => {
    setBookingDoctor(doc);
    setSelectedSlot(doc.slots[0] || '10:00 AM');
    setConsultationType('in-person');
    setSelectedPatientName(healthStore.patientProfile.name);
    setSymptoms('');
    setBookingSubmitted(null);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDoctor) return;

    const newApt = healthStore.bookAppointment({
      patientId: healthStore.currentUser.uid,
      patientName: selectedPatientName || healthStore.patientProfile.name,
      patientPhone: healthStore.patientProfile.phone || 'Not provided',
      doctorId: bookingDoctor.id,
      doctorName: bookingDoctor.name,
      specialty: bookingDoctor.specialty,
      hospitalName: bookingDoctor.hospitalName,
      date: selectedDate,
      slot: selectedSlot,
      fee: bookingDoctor.consultationFee,
      type: consultationType,
      symptoms: symptoms.trim() || undefined
    });

    setBookingSubmitted(newApt);
    setBookingDoctor(null);
  };

  const handleOpenReschedule = (apt: Appointment) => {
    setRescheduleApt(apt);
    setRescheduleDate(apt.date);
    setRescheduleSlot(apt.slot);
  };

  const handleSubmitReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleApt) return;
    healthStore.rescheduleAppointment(rescheduleApt.id, rescheduleDate, rescheduleSlot);
    setRescheduleApt(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <Stethoscope className="w-4 h-4" />
              <span>VERIFIED MEDICAL SPECIALISTS DIRECTORY</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">
              {language === 'te' ? 'వైద్యుల సంప్రదింపులు & అపాయింట్‌మెంట్లు' : 'Doctor Consultations & Appointments'}
            </h1>
            <p className="text-xs text-gray-500">
              {language === 'te'
                ? 'ఆంధ్రప్రదేశ్ / తెలంగాణ మెడికల్ కౌన్సిల్ ధృవీకరించబడిన డాక్టర్ల అపాయింట్‌మెంట్ అభ్యర్థనలు.'
                : 'Request appointments with verified registered practitioners. Confirmations are issued only after doctor/hospital review.'}
            </p>
          </div>
        </div>

        {/* Honest Transparency Banner */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-950 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {language === 'te'
              ? 'పారదర్శకత గమనిక: మేము ఎటువంటి నకిలీ డాక్టర్ ప్రొఫైల్స్ లేదా తప్పుడు అపాయింట్‌మెంట్ నిర్ధారణలను చూపము. డాక్టర్ ప్యానెల్ ద్వారా రిజిస్టర్ అయి, సూపర్ అడ్మిన్ ధృవీకరించిన వైద్యులు మాత్రమే ఇక్కడ కనిపిస్తారు.'
              : 'Zero-Fabrication Policy: Only real doctors registered via the Doctor Panel and verified by Super Admin appear here. Appointment bookings remain "Pending" until confirmed by the Doctor or Hospital Admin.'}
          </p>
        </div>

        {bookingSubmitted && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center gap-3">
            <Clock className="w-7 h-7 text-amber-600 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-amber-950">
                {language === 'te'
                  ? 'అపాయింట్‌మెంట్ అభ్యర్థన పంపబడింది (నిర్ధారణ పెండింగ్‌లో ఉంది)'
                  : 'Appointment Request Submitted (Pending Doctor Confirmation)'}
              </p>
              <p className="text-amber-800">
                {bookingSubmitted.doctorName} • {bookingSubmitted.date} at {bookingSubmitted.slot}
              </p>
            </div>
            <button
              onClick={() => setBookingSubmitted(null)}
              className="text-amber-800 hover:text-amber-950 ml-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-600"
            />
          </div>

          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-600"
          >
            <option value="All">{t('allSpecialties')}</option>
            {SPECIALTIES.map((s) => (
              <option key={s.en} value={s.en}>
                {language === 'te' ? s.te : s.en}
              </option>
            ))}
          </select>

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
      </div>

      {/* Verified Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-emerald-100 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <UserPlus className="w-7 h-7" />
          </div>
          <div className="max-w-lg mx-auto space-y-1.5">
            <h3 className="font-bold text-gray-900 text-base">
              {language === 'te'
                ? 'ప్రస్తుతం ధృవీకరించబడిన డాక్టర్ల జాబితా ఖాళీగా ఉంది'
                : 'No Verified Doctors Onboarded Yet'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {language === 'te'
                ? 'మేము నకిలీ డాక్టర్ ప్రొఫైల్స్ జోడించము. డాక్టర్లు పైనున్న రోల్ స్విచ్చర్ ద్వారా "Doctor" ప్యానెల్‌లో నమోదు చేసుకుని, "Super Admin" ఆమోదించిన తర్వాత ఇక్కడ కనిపిస్తారు.'
                : 'To avoid fake profiles, no placeholder doctors are pre-populated. Switch to the "Doctor" role in the top menu to submit a real practitioner registration, then approve it via "Super Admin" to enable live booking.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        {language === 'te' && doc.nameTe ? doc.nameTe : doc.name}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-700">
                        {language === 'te' && doc.specialtyTe ? doc.specialtyTe : doc.specialty}
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    <Award className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                </div>

                <div className="bg-gray-50/70 p-3 rounded-2xl border border-gray-100 text-xs space-y-1">
                  <p className="font-medium text-gray-800">
                    <span className="text-gray-500">Qualifications:</span> {doc.qualifications}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Reg No: <span className="font-mono text-gray-700 font-semibold">{doc.registrationNumber}</span> ({doc.experienceYears} Yrs)
                  </p>
                  <p className="text-[11px] text-gray-600 flex items-center gap-1 pt-0.5">
                    <Building className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{doc.hospitalName}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{doc.city}, {doc.district}</span>
                  </span>
                  <span className="font-black text-gray-900 text-sm">
                    ₹{doc.consultationFee}
                  </span>
                </div>

                {doc.teleconsultSupported && (
                  <div className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" />
                    <span>Online Video Consultation Supported</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleOpenBooking(doc)}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-sm transition"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t('bookAppointment')}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Patient Appointment History & Status */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <span>{language === 'te' ? 'మీ అపాయింట్‌మెంట్స్ హిస్టరీ' : 'My Appointment History'}</span>
        </h2>

        {appointments.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">
            {language === 'te' ? 'ఇంకా ఎటువంటి అపాయింట్‌మెంట్లు బుక్ చేయలేదు.' : 'No appointment requests yet.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{apt.doctorName}</h4>
                      <p className="text-xs text-emerald-700 font-semibold">{apt.specialty}</p>
                      <p className="text-[11px] text-gray-500">Patient: {apt.patientName}</p>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        apt.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : apt.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : apt.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {apt.status === 'pending' ? 'Pending Confirmation' : apt.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{apt.date} • {apt.slot} ({apt.type})</span>
                  </p>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-gray-400" />
                    <span>{apt.hospitalName}</span>
                  </p>
                  {apt.symptoms && (
                    <p className="text-[11px] text-gray-600 bg-white p-2 rounded-xl border border-gray-100 mt-1">
                      Reason: {apt.symptoms}
                    </p>
                  )}
                </div>

                {(apt.status === 'pending' || apt.status === 'confirmed' || apt.status === 'rescheduled') && (
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-100 text-xs">
                    <button
                      onClick={() => handleOpenReschedule(apt)}
                      className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reschedule</span>
                    </button>
                    <span className="text-gray-300">•</span>
                    <button
                      onClick={() => healthStore.cancelAppointment(apt.id)}
                      className="text-red-600 hover:text-red-700 font-semibold"
                    >
                      Cancel
                    </button>
                    <span className="text-gray-300 ml-auto">Fee: ₹{apt.fee}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingDoctor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 space-y-5">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {language === 'te' ? 'అపాయింట్‌మెంట్ అభ్యర్థన' : 'Request Appointment'}
                </h3>
                <p className="text-xs text-emerald-700 font-semibold">
                  {bookingDoctor.name} ({bookingDoctor.specialty})
                </p>
              </div>
              <button onClick={() => setBookingDoctor(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">రోగి పేరు (Patient / Family Member):</label>
                <select
                  value={selectedPatientName}
                  onChange={(e) => setSelectedPatientName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                >
                  <option value={healthStore.patientProfile.name}>
                    {healthStore.patientProfile.name} (Self)
                  </option>
                  {familyMembers.map((fm) => (
                    <option key={fm.id} value={fm.name}>
                      {fm.name} ({fm.relationship})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">కన్సల్టేషన్ విధానం (Consultation Mode):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultationType('in-person')}
                    className={`py-2.5 px-3 rounded-2xl font-bold border transition flex items-center justify-center gap-2 ${
                      consultationType === 'in-person'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <Building className="w-4 h-4 text-emerald-700" />
                    <span>In-Person OPD</span>
                  </button>
                  <button
                    type="button"
                    disabled={!bookingDoctor.teleconsultSupported}
                    onClick={() => setConsultationType('video')}
                    className={`py-2.5 px-3 rounded-2xl font-bold border transition flex items-center justify-center gap-2 disabled:opacity-40 ${
                      consultationType === 'video'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <Video className="w-4 h-4 text-emerald-700" />
                    <span>{bookingDoctor.teleconsultSupported ? 'Video Consult' : 'Video Not Supported'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">తేదీ (Preferred Date):</label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">సమయం (Available Slot):</label>
                <div className="grid grid-cols-3 gap-2">
                  {bookingDoctor.slots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSlot(s)}
                      className={`py-2 px-2 rounded-xl text-center font-semibold border transition ${
                        selectedSlot === s
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">సమస్య / లక్షణాలు (Symptoms):</label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe symptoms or visit reason..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingDoctor(null)}
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

      {/* Reschedule Modal */}
      {rescheduleApt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Reschedule Appointment</h3>
              <button onClick={() => setRescheduleApt(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitReschedule} className="space-y-3 text-xs">
              <p className="text-gray-600">Doctor: <strong>{rescheduleApt.doctorName}</strong></p>
              <div className="space-y-1">
                <label className="font-bold text-gray-700">New Date:</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-700">New Time Slot:</label>
                <select
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl"
                >
                  {['09:30 AM', '10:00 AM', '11:30 AM', '02:30 PM', '04:30 PM', '06:00 PM'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleApt(null)}
                  className="flex-1 py-2.5 rounded-2xl border border-gray-300 font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-emerald-700 text-white font-bold"
                >
                  Save Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
