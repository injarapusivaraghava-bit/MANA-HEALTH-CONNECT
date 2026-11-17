import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { healthStore } from '../services/healthStore';
import { HealthRecord, Prescription, Appointment } from '../types';
import { GoogleDrivePanel } from './GoogleDrivePanel';
import { getGoogleAccessToken, googleSignIn, uploadMedicalFileToStorage } from '../firebase';
import { getOrCreateManaHealthFolder, uploadBlobToDrive } from '../services/googleDriveService';
import {
  FolderLock,
  Upload,
  FileText,
  Trash2,
  Download,
  Eye,
  Search,
  CheckCircle2,
  Calendar,
  User,
  Cloud,
  X,
  Stethoscope,
  ShieldAlert
} from 'lucide-react';

export const HealthRecords: React.FC = () => {
  const { language, t } = useLanguage();
  const [subTab, setSubTab] = useState<'records' | 'prescriptions' | 'appointments' | 'dpdp'>('records');
  const [records, setRecords] = useState<HealthRecord[]>(healthStore.healthRecords);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(healthStore.prescriptions);
  const [appointments, setAppointments] = useState<Appointment[]>(healthStore.appointments);
  const [familyMembers, setFamilyMembers] = useState(healthStore.familyMembers);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<HealthRecord | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [eraseConfirmOpen, setEraseConfirmOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HealthRecord['category']>('Lab Report');
  const [familyMemberName, setFamilyMemberName] = useState(healthStore.patientProfile.name || 'Self');
  const [doctorOrLab, setDoctorOrLab] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const [backingUpId, setBackingUpId] = useState<string | null>(null);
  const [driveBackupNotice, setDriveBackupNotice] = useState<string | null>(null);

  useEffect(() => {
    return healthStore.subscribe(() => {
      setRecords([...healthStore.healthRecords]);
      setPrescriptions([...healthStore.prescriptions]);
      setAppointments([...healthStore.appointments]);
      setFamilyMembers([...healthStore.familyMembers]);
    });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSaving(true);

    let storageUrl: string | undefined = undefined;
    if (selectedFile) {
      const uploadedUrl = await uploadMedicalFileToStorage(healthStore.currentUser.uid, selectedFile);
      if (uploadedUrl) storageUrl = uploadedUrl;
    }

    healthStore.addHealthRecord({
      patientId: healthStore.currentUser.uid,
      familyMemberName,
      title: title.trim(),
      category,
      date,
      doctorOrLab: doctorOrLab.trim() || 'Self-Uploaded Record',
      fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
      fileType: selectedFile?.type || 'application/pdf',
      fileData,
      storageUrl,
      notes: notes.trim()
    });

    setTitle('');
    setDoctorOrLab('');
    setNotes('');
    setFileName('');
    setSelectedFile(null);
    setFileData(undefined);
    setIsSaving(false);
    setShowUploadModal(false);
  };

  const handleDownload = (rec: HealthRecord) => {
    if (rec.fileData && rec.fileData.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = rec.fileData;
      link.download = rec.fileName || `${rec.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    const element = document.createElement('a');
    const fileContent = `MANA HEALTH CONNECT - MEDICAL RECORD\n=====================================\nTitle: ${rec.title}\nCategory: ${rec.category}\nDate: ${rec.date}\nDoctor/Lab: ${rec.doctorOrLab}\nPatient: ${rec.familyMemberName}\nNotes & Clinical Findings:\n${rec.notes}\n`;
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${rec.title.replace(/\s+/g, '_')}_details.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleBackupRecordToDrive = async (rec: HealthRecord) => {
    setBackingUpId(rec.id);
    setDriveBackupNotice(null);
    try {
      let token = await getGoogleAccessToken();
      if (!token) {
        const res = await googleSignIn();
        token = res.accessToken;
      }
      const folderId = await getOrCreateManaHealthFolder(token);
      const summaryText = `MANA HEALTH CONNECT - MEDICAL RECORD BACKUP\n============================================\nTitle: ${rec.title}\nCategory: ${rec.category}\nDate: ${rec.date}\nPatient: ${rec.familyMemberName}\nDoctor/Lab: ${rec.doctorOrLab}\nNotes:\n${rec.notes || 'None'}\n`;
      const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
      const uploadName = `${rec.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${rec.date}.txt`;
      await uploadBlobToDrive(
        token,
        blob,
        uploadName,
        'text/plain',
        folderId,
        `${rec.category} backed up from Mana Health Connect`
      );
      setDriveBackupNotice(
        language === 'te'
          ? `"${rec.title}" మీ Google Drive లో బ్యాకప్ చేయబడింది.`
          : `"${rec.title}" backed up to Google Drive successfully.`
      );
    } catch (err: unknown) {
      setDriveBackupNotice(err instanceof Error ? err.message : 'Google Drive backup cancelled or failed.');
    } finally {
      setBackingUpId(null);
    }
  };

  const handleExportAllData = () => {
    const json = healthStore.exportAllPersonalData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mana_health_records_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const categories = ['All', 'Lab Report', 'Prescription', 'Discharge Summary', 'Scan/X-Ray', 'Vaccination'];

  const filteredRecords = records.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.doctorOrLab.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.familyMemberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'All' || r.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
            <FolderLock className="w-4 h-4" />
            <span>DPDP 2023 COMPLIANT DIGITAL HEALTH LOCKER</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            {language === 'te' ? 'డిజిటల్ ఆరోగ్య రికార్డులు & లాకర్' : 'Digital Health Records & Locker'}
          </h1>
          <p className="text-xs text-gray-500">
            {language === 'te'
              ? 'మీ మరియు మీ కుటుంబ సభ్యుల ల్యాబ్ రిపోర్టులు, ప్రిస్క్రిప్షన్లు, అపాయింట్‌మెంట్ హిస్టరీ ఒకే చోట.'
              : 'Upload PDF/Image medical reports, review doctor prescriptions, view appointment history, and manage data access.'}
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-5 rounded-2xl flex items-center gap-2 text-xs shadow-md transition self-start md:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>{t('upload')}</span>
        </button>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'records', label: `Uploaded Reports (${records.length})`, icon: FileText },
          { id: 'prescriptions', label: `Prescriptions (${prescriptions.length})`, icon: Stethoscope },
          { id: 'appointments', label: `Appointment History (${appointments.length})`, icon: Calendar },
          { id: 'dpdp', label: 'Data Access & Deletion (DPDP)', icon: ShieldAlert }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setSubTab(item.id as typeof subTab)}
              className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 whitespace-nowrap transition ${
                subTab === item.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Google Drive Medical Cloud Vault */}
      {subTab === 'records' && <GoogleDrivePanel />}

      {driveBackupNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-3 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{driveBackupNotice}</span>
          </span>
          <button onClick={() => setDriveBackupNotice(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub-Tab 1: Uploaded Reports */}
      {subTab === 'records' && (
        <>
          <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search reports by title, patient, doctor, lab, or notes..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-600"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRecords.length === 0 ? (
              <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-gray-100 text-gray-500 text-xs space-y-2">
                <p className="font-bold text-gray-700">No health records stored yet.</p>
                <p>Click "Upload Report" above to store PDF or image reports, prescriptions, or lab results.</p>
              </div>
            ) : (
              filteredRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">
                        {rec.category}
                      </span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{rec.date}</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 text-sm leading-snug">{rec.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{rec.familyMemberName}</span>
                      </p>
                      <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">{rec.doctorOrLab}</p>
                    </div>

                    {rec.notes && (
                      <p className="text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 line-clamp-3">
                        {rec.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                    <button
                      onClick={() => setPreviewRecord(rec)}
                      className="text-emerald-700 hover:text-emerald-900 font-semibold text-xs flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleBackupRecordToDrive(rec)}
                        disabled={backingUpId === rec.id}
                        className="px-2.5 py-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition text-[11px] font-semibold flex items-center gap-1 disabled:opacity-50"
                      >
                        <Cloud className="w-3.5 h-3.5" />
                        <span>{backingUpId === rec.id ? 'Saving...' : 'Drive'}</span>
                      </button>
                      <button
                        onClick={() => handleDownload(rec)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        title="Download Report"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(rec.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Sub-Tab 2: Digital Prescriptions */}
      {subTab === 'prescriptions' && (
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Doctor Digital Prescriptions</h2>
          {prescriptions.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">
              No digital prescriptions issued yet. When a verified doctor issues a prescription from the Doctor Panel, it appears here automatically.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">{rx.doctorName}</span>
                    <span className="text-gray-500">{rx.date}</span>
                  </div>
                  <p className="font-semibold text-gray-800">Patient: {rx.patientName}</p>
                  <p className="text-gray-700">Summary: {rx.diagnosisSummary}</p>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-1">
                    {rx.medicines.map((m, idx) => (
                      <p key={idx} className="font-medium text-gray-800">
                        • {m.name} ({m.dosage}) — {m.timing} ({m.durationDays} days)
                      </p>
                    ))}
                  </div>
                  {rx.instructions && <p className="text-gray-600">Instructions: {rx.instructions}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 3: Appointment History */}
      {subTab === 'appointments' && (
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Consultation Appointment History</h2>
          {appointments.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">No consultation appointments recorded yet.</p>
          ) : (
            <div className="divide-y divide-gray-100 text-xs">
              {appointments.map((apt) => (
                <div key={apt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900">{apt.doctorName} ({apt.specialty})</p>
                    <p className="text-gray-500">
                      Patient: {apt.patientName} • {apt.date} at {apt.slot} • {apt.hospitalName}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase self-start">
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 4: DPDP Data Access & Deletion */}
      {subTab === 'dpdp' && (
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4 text-xs">
          <h2 className="text-lg font-bold text-gray-900">User-Controlled Data Access & Deletion (DPDP Act 2023)</h2>
          <p className="text-gray-600 leading-relaxed">
            You maintain full ownership of your personal health records. You can download a complete JSON archive of your profile, family members, prescriptions, medicine schedules, and uploaded metadata, or erase all stored personal data from this session.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportAllData}
              className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Personal Data Archive (JSON)</span>
            </button>
            <button
              onClick={() => setEraseConfirmOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Request Complete Data Erasure</span>
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">
                {language === 'te' ? 'వైద్య నివేదికను అప్‌లోడ్ చేయండి' : 'Upload Medical Report'}
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">ఎవరి రిపోర్ట్ (Patient / Family Member):</label>
                <select
                  value={familyMemberName}
                  onChange={(e) => setFamilyMemberName(e.target.value)}
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
                <label className="font-bold text-gray-700">రిపోర్ట్ పేరు (Report Title):</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thyroid Profile, Blood Sugar Report, X-Ray"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">విభాగం (Category):</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as HealthRecord['category'])}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Lab Report">Lab Report</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Scan/X-Ray">Scan/X-Ray</option>
                    <option value="Vaccination">Vaccination</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">తేదీ (Date):</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">డాక్టర్ లేదా ల్యాబ్ పేరు (Doctor / Laboratory):</label>
                <input
                  type="text"
                  placeholder="e.g. GGH Kakinada, Diagnostic Center"
                  value={doctorOrLab}
                  onChange={(e) => setDoctorOrLab(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">ఫైల్ సెలెక్ట్ చేయండి (PDF or Image):</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileUpload}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-2xl file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-emerald-700 file:text-white file:font-semibold"
                />
                {fileName && <p className="text-[11px] text-emerald-700 font-medium">Selected: {fileName}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">ముఖ్య వివరాలు / నోట్స్ (Clinical Notes):</label>
                <textarea
                  rows={2}
                  placeholder="Record key observations or test values..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-gray-300 text-gray-700 font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold shadow-md"
                >
                  {isSaving ? 'Uploading...' : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Preview Modal */}
      {previewRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-emerald-100 space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                  {previewRecord.category}
                </span>
                <h3 className="font-bold text-gray-900 text-base mt-1">{previewRecord.title}</h3>
              </div>
              <button onClick={() => setPreviewRecord(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs space-y-2">
              <p><strong>Patient:</strong> {previewRecord.familyMemberName}</p>
              <p><strong>Date:</strong> {previewRecord.date}</p>
              <p><strong>Doctor/Facility:</strong> {previewRecord.doctorOrLab}</p>
              <p><strong>Attached File:</strong> {previewRecord.fileName}</p>
              {previewRecord.storageUrl && (
                <p className="text-emerald-700 font-semibold">✓ Backed up to Firebase Cloud Storage</p>
              )}
              {previewRecord.fileData && previewRecord.fileType.startsWith('image/') && (
                <img
                  src={previewRecord.fileData}
                  alt={previewRecord.title}
                  className="max-h-48 rounded-xl border border-gray-200 object-contain mt-2"
                />
              )}
              <div className="pt-2 border-t border-gray-200">
                <strong className="block text-gray-700 mb-1">Clinical Notes & Findings:</strong>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                  {previewRecord.notes || 'No specific notes recorded.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => handleDownload(previewRecord)}
                className="py-2.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File / Summary</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-100 space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Delete Medical Record?</h3>
            <p className="text-xs text-gray-600">
              This will remove the selected report from your Health Locker.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2.5 rounded-2xl border border-gray-300 text-gray-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  healthStore.deleteHealthRecord(deleteTargetId);
                  setDeleteTargetId(null);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DPDP Full Erasure Confirmation Modal */}
      {eraseConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Confirm Complete Personal Data Erasure?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Under DPDP Act 2023, this permanently deletes your stored records, prescriptions, schedules, and profile details from this session.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setEraseConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-2xl border border-gray-300 text-gray-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  healthStore.eraseAllPersonalData();
                  setEraseConfirmOpen(false);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Confirm Erase All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
