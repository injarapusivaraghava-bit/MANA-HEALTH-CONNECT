import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { healthStore } from '../services/healthStore';
import { MedicationSchedule } from '../types';
import {
  Clock,
  Pill,
  CheckCircle2,
  XCircle,
  Bell,
  Plus,
  Volume2,
  User,
  Trash2,
  Calendar,
  ShieldAlert,
  X,
  RotateCcw
} from 'lucide-react';

export const MedicineReminder: React.FC = () => {
  const { language, t } = useLanguage();
  const [medications, setMedications] = useState<MedicationSchedule[]>(healthStore.medications);
  const [familyMembers, setFamilyMembers] = useState(healthStore.familyMembers);
  const [selectedPatient, setSelectedPatient] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [alarmStatus, setAlarmStatus] = useState<string | null>(null);
  const [notifPermission, setNotifPermission] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  // Form state
  const [formName, setFormName] = useState('');
  const [formDosage, setFormDosage] = useState('1 Tablet');
  const [formPatient, setFormPatient] = useState(healthStore.patientProfile.name || 'Self');
  const [morning, setMorning] = useState(true);
  const [afternoon, setAfternoon] = useState(false);
  const [night, setNight] = useState(true);
  const [reminderDate, setReminderDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [timing, setTiming] = useState<'before_food' | 'after_food'>('after_food');
  const [daysRemaining, setDaysRemaining] = useState(15);
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    return healthStore.subscribe(() => {
      setMedications([...healthStore.medications]);
      setFamilyMembers([...healthStore.familyMembers]);
    });
  }, []);

  const handleRequestNotifications = async () => {
    if (typeof Notification === 'undefined') {
      setAlarmStatus('Browser notifications are not supported on this device; audio chime will be used.');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        new Notification('MANA HEALTH CONNECT – Medicine Alarm Ready', {
          body: 'You will receive local reminders when testing or checking your scheduled doses.'
        });
        setAlarmStatus('Local browser notifications enabled.');
      } else {
        setAlarmStatus('Notification permission was not granted. Audio alarms remain active.');
      }
    } catch {
      setAlarmStatus('Could not request notification permission in this browser context.');
    }
  };

  const handleTestAlarm = (medName: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.warn('AudioContext error', e);
    }

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(`Medicine Reminder: ${medName}`, {
          body: 'Time to take your prescribed dose. Never change dosage without your doctor.'
        });
      } catch {
        // Ignore if notification blocked in embedded frame
      }
    }
    setAlarmStatus(
      language === 'te'
        ? `"${medName}" అలారం ధ్వని మరియు రిమైండర్ పరీక్షించబడింది.`
        : `Alarm chime & local notification tested for "${medName}".`
    );
    setTimeout(() => setAlarmStatus(null), 3500);
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    healthStore.addMedication({
      patientId: healthStore.currentUser.uid,
      patientName: formPatient,
      medicineName: formName.trim(),
      dosage: formDosage,
      frequency: `${morning ? 'Morning ' : ''}${afternoon ? 'Afternoon ' : ''}${night ? 'Night ' : ''}`.trim() || 'As scheduled',
      morning,
      afternoon,
      night,
      reminderDate,
      reminderTime,
      timing,
      startDate: reminderDate,
      daysRemaining: Number(daysRemaining) || 10,
      takenToday: false,
      instructions: instructions.trim() || 'Take strictly as prescribed by physician'
    });

    setFormName('');
    setInstructions('');
    setShowAddModal(false);
  };

  const patientOptions = [
    'All',
    healthStore.patientProfile.name || 'Self',
    ...familyMembers.map((f) => f.name)
  ];

  const filteredMeds = medications.filter((m) => {
    if (selectedPatient === 'All') return true;
    return m.patientName === selectedPatient;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
            <Clock className="w-4 h-4" />
            <span>DAILY MEDICATION DOSAGE & SCHEDULE MANAGER</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            {language === 'te' ? 'మందుల సమయాలు & రిమైండర్' : 'Daily Medicine Schedule & Reminders'}
          </h1>
          <p className="text-xs text-gray-500">
            {language === 'te'
              ? 'మీరు మరియు మీ కుటుంబ సభ్యులు మందులను సమయానికి తీసుకోవడానికి డిజిటల్ అలారాలు.'
              : 'Track prescribed doses with date/time schedules, taken/missed logs, and refill reminders.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {notifPermission !== 'granted' && notifPermission !== 'unsupported' && (
            <button
              onClick={handleRequestNotifications}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold py-2.5 px-4 rounded-2xl flex items-center gap-1.5 text-xs transition"
            >
              <Bell className="w-4 h-4 text-amber-700" />
              <span>Enable Alerts</span>
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-5 rounded-2xl flex items-center gap-2 text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'te' ? 'కొత్త మందును జోడించండి' : 'Add Medication'}</span>
          </button>
        </div>
      </div>

      {alarmStatus && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-3 text-xs font-semibold flex items-center justify-between">
          <span>{alarmStatus}</span>
          <button onClick={() => setAlarmStatus(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mandatory Clinical Safety Warning Banner */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-4 flex items-start gap-3.5 shadow-xs">
        <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-black text-amber-950 uppercase tracking-wide">
            {language === 'te' ? 'క్లినికల్ సేఫ్టీ హెచ్చరిక (CLINICAL SAFETY MANDATE):' : 'CLINICAL SAFETY MANDATE:'}
          </p>
          <p className="text-amber-900 leading-relaxed font-medium">
            {t('dosageSafetyWarning')}
          </p>
          <p className="text-[11px] text-amber-800">
            {language === 'te'
              ? 'ఈ సిస్టమ్ మీకు మందుల సమయాలను గుర్తు చేయడానికి మాత్రమే. ఎట్టి పరిస్థితుల్లోనూ డాక్టర్ సలహా లేకుండా మోతాదు మార్చబడదు.'
              : 'This scheduler strictly logs your doctor-prescribed dosage and never independently alters doses.'}
          </p>
        </div>
      </div>

      {/* Family Member Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm flex items-center gap-2 overflow-x-auto text-xs font-semibold">
        <span className="text-gray-400 pl-2">కుటుంబ సభ్యులు:</span>
        {patientOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setSelectedPatient(opt)}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition ${
              selectedPatient === opt
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Medicine Schedules Grid */}
      {filteredMeds.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-emerald-100 shadow-sm text-center space-y-3">
          <Pill className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-gray-900 text-base">
            {language === 'te' ? 'మందుల షెడ్యూల్స్ ఇంకా జోడించబడలేదు' : 'No Medicine Reminders Scheduled Yet'}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {language === 'te'
              ? 'మీ డాక్టర్ రాసిన ప్రిస్క్రిప్షన్ ప్రకారం మందు పేరు, తేదీ మరియు సమయాన్ని జోడించండి.'
              : 'Add medicines directly from your doctor prescription with exact date, time, and meal instructions.'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-5 rounded-2xl text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'te' ? 'మొదటి మందును జోడించండి' : 'Add First Medicine Reminder'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMeds.map((med) => {
            const status = med.statusToday || (med.takenToday ? 'taken' : 'pending');
            return (
              <div
                key={med.id}
                className={`rounded-3xl p-5 border transition flex flex-col justify-between space-y-4 shadow-sm ${
                  status === 'taken'
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : status === 'missed'
                    ? 'bg-rose-50/50 border-rose-200'
                    : 'bg-white border-gray-200 hover:border-emerald-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Header: Patient & Refill Warning */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="bg-gray-100 text-gray-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <User className="w-3 h-3 text-emerald-700" />
                      <span>{med.patientName}</span>
                    </span>

                    {med.daysRemaining <= 5 && (
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                        {med.daysRemaining} days left (Refill)
                      </span>
                    )}
                  </div>

                  {/* Medicine Name and Dose */}
                  <div>
                    <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                      <Pill className="w-4 h-4 text-emerald-600" />
                      <span>{med.medicineName}</span>
                    </h3>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">
                      మోతాదు (Dosage): {med.dosage}
                    </p>
                  </div>

                  {/* Timing & Schedule */}
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-2 text-xs">
                    {(med.reminderDate || med.reminderTime) && (
                      <div className="flex items-center justify-between text-[11px] text-gray-700 font-semibold border-b border-gray-200/70 pb-1.5">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{med.reminderDate || med.startDate}</span>
                        </span>
                        <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-mono">
                          {med.reminderTime || '08:00'}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-gray-500">షెడ్యూల్:</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] ${
                            med.morning ? 'bg-amber-100 text-amber-900 font-bold' : 'text-gray-300 line-through'
                          }`}
                        >
                          ఉదయం
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] ${
                            med.afternoon ? 'bg-amber-100 text-amber-900 font-bold' : 'text-gray-300 line-through'
                          }`}
                        >
                          మధ్యాహ్నం
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] ${
                            med.night ? 'bg-indigo-100 text-indigo-900 font-bold' : 'text-gray-300 line-through'
                          }`}
                        >
                          రాత్రి
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-600">
                      <span>ఆహారం:</span>
                      <span className="font-bold text-gray-800">
                        {med.timing === 'after_food' ? 'భోజనం తర్వాత (After Food)' : 'భోజనానికి ముందు (Before Food)'}
                      </span>
                    </div>
                  </div>

                  {med.instructions && (
                    <p className="text-[11px] text-gray-600 bg-white p-2.5 rounded-xl border border-gray-100 leading-relaxed">
                      సూచన: {med.instructions}
                    </p>
                  )}
                </div>

                {/* Action Buttons: Mark Taken / Missed / Reset */}
                <div className="pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => healthStore.setMedicationStatus(med.id, status === 'taken' ? 'pending' : 'taken')}
                      className={`py-2 px-3 rounded-2xl font-bold flex items-center justify-center gap-1.5 text-xs transition ${
                        status === 'taken'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-emerald-600 text-emerald-800 hover:bg-emerald-50'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{status === 'taken' ? t('taken') : t('markTaken')}</span>
                    </button>

                    <button
                      onClick={() => healthStore.setMedicationStatus(med.id, status === 'missed' ? 'pending' : 'missed')}
                      className={`py-2 px-3 rounded-2xl font-bold flex items-center justify-center gap-1.5 text-xs transition ${
                        status === 'missed'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white border border-rose-300 text-rose-700 hover:bg-rose-50'
                      }`}
                    >
                      {status === 'missed' ? <RotateCcw className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{status === 'missed' ? 'Missed' : t('markMissed')}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <button
                      onClick={() => handleTestAlarm(med.medicineName)}
                      className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-semibold"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>అలారం పరీక్ష (Test Alarm)</span>
                    </button>

                    <button
                      onClick={() => setDeleteTargetId(med.id)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>తొలగించు</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">
                {language === 'te' ? 'కొత్త మందుల రిమైండర్ జోడించండి' : 'Add Medicine Schedule'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">ఎవరికి (For Whom):</label>
                <select
                  value={formPatient}
                  onChange={(e) => setFormPatient(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                >
                  <option value={healthStore.patientProfile.name || 'Self'}>
                    {healthStore.patientProfile.name || 'Self'} (Primary)
                  </option>
                  {familyMembers.map((fm) => (
                    <option key={fm.id} value={fm.name}>
                      {fm.name} ({fm.relationship})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">మందు పేరు (Medicine Name):</label>
                <input
                  type="text"
                  required
                  placeholder="Enter prescribed medicine name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">మోతాదు (Prescribed Dosage):</label>
                  <input
                    type="text"
                    value={formDosage}
                    onChange={(e) => setFormDosage(e.target.value)}
                    placeholder="1 Tablet / 5ml"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">రోజులు (Days Remaining):</label>
                  <input
                    type="number"
                    min={1}
                    value={daysRemaining}
                    onChange={(e) => setDaysRemaining(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">తేదీ (Reminder Date):</label>
                  <input
                    type="date"
                    required
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">సమయం (Reminder Time):</label>
                  <input
                    type="time"
                    required
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">రోజులో సమయాలు (Daily Schedule):</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={morning}
                      onChange={(e) => setMorning(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>ఉదయం (Morning)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={afternoon}
                      onChange={(e) => setAfternoon(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>మధ్యాహ్నం (Afternoon)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={night}
                      onChange={(e) => setNight(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>రాత్రి (Night)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">ఆహార సమయం (Meal Relation):</label>
                <select
                  value={timing}
                  onChange={(e) => setTiming(e.target.value as 'before_food' | 'after_food')}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                >
                  <option value="after_food">భోజనం తర్వాత (After Food)</option>
                  <option value="before_food">భోజనానికి ముందు (Before Food / Empty Stomach)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">డాక్టర్ సూచనలు (Prescription Instructions):</label>
                <input
                  type="text"
                  placeholder="Enter instructions from your doctor prescription..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-gray-300 text-gray-700 font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-100 space-y-4">
            <h3 className="font-bold text-gray-900 text-base">
              {language === 'te' ? 'మందు రిమైండర్ తొలగించాలా?' : 'Delete Medicine Reminder?'}
            </h3>
            <p className="text-xs text-gray-600">
              {language === 'te'
                ? 'ఈ మందుల షెడ్యూల్ మీ జాబితా నుండి తొలగించబడుతుంది.'
                : 'This scheduled medicine reminder will be removed from your active list.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2.5 rounded-2xl border border-gray-300 text-gray-700 font-bold text-xs"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  healthStore.deleteMedication(deleteTargetId);
                  setDeleteTargetId(null);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
