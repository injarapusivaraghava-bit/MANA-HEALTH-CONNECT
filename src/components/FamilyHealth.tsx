import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { healthStore } from '../services/healthStore';
import { FamilyMember, VaccinationReminder } from '../types';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Baby,
  CheckCircle2,
  Clock,
  X,
  FolderLock,
  Pill,
  Calendar,
  HeartHandshake
} from 'lucide-react';

interface FamilyHealthProps {
  onNavigate?: (tab: string) => void;
}

export const FamilyHealth: React.FC<FamilyHealthProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(healthStore.familyMembers);
  const [vaccinations, setVaccinations] = useState<VaccinationReminder[]>(healthStore.vaccinations);
  const [records, setRecords] = useState(healthStore.healthRecords);
  const [medications, setMedications] = useState(healthStore.medications);
  const [appointments, setAppointments] = useState(healthStore.appointments);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Add Member Form
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<FamilyMember['relationship']>('Spouse');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [guardianConsent, setGuardianConsent] = useState(true);
  const [chronicConditionInput, setChronicConditionInput] = useState('');

  useEffect(() => {
    return healthStore.subscribe(() => {
      setFamilyMembers([...healthStore.familyMembers]);
      setVaccinations([...healthStore.vaccinations]);
      setRecords([...healthStore.healthRecords]);
      setMedications([...healthStore.medications]);
      setAppointments([...healthStore.appointments]);
    });
  }, []);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numericAge = Number(age);
    healthStore.addFamilyMember({
      patientId: healthStore.currentUser.uid,
      name: name.trim(),
      relationship,
      age: numericAge,
      gender,
      bloodGroup,
      isMinor: numericAge < 18,
      isSenior: numericAge >= 60,
      guardianConsent: numericAge < 18 ? guardianConsent : true,
      chronicConditions: chronicConditionInput
        ? chronicConditionInput.split(',').map((c) => c.trim()).filter(Boolean)
        : []
    });

    setName('');
    setChronicConditionInput('');
    setShowAddMemberModal(false);
  };

  const handleToggleVaccine = (vacId: string) => {
    setVaccinations((prev) =>
      prev.map((v) => {
        if (v.id === vacId) {
          const nextStatus = v.status === 'completed' ? 'pending' : 'completed';
          return {
            ...v,
            status: nextStatus,
            administeredDate: nextStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined
          };
        }
        return v;
      })
    );
  };

  const getMemberCounts = (memberName: string) => ({
    records: records.filter((r) => r.familyMemberName === memberName).length,
    meds: medications.filter((m) => m.patientName === memberName).length,
    apts: appointments.filter((a) => a.patientName === memberName).length
  });

  const minorChildren = familyMembers.filter((m) => m.isMinor);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
            <Users className="w-4 h-4" />
            <span>FAMILY HEALTH, SENIOR CARE & CHILD IMMUNIZATION</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            {language === 'te' ? 'కుటుంబ ఆరోగ్యం & పిల్లల టీకాలు' : 'Family Health & Child Immunization'}
          </h1>
          <p className="text-xs text-gray-500">
            {language === 'te'
              ? 'కుటుంబ సభ్యులకు వేర్వేరు ప్రొఫైల్స్, మందుల రిమైండర్లు, వృద్ధుల సంరక్షణ, మైనర్లకు గార్డియన్ అనుమతి మరియు పిల్లల UIP టీకాల షెడ్యూల్.'
              : 'Individual family profiles, separate records & medicine schedules, senior support, guardian controls for minors, and UIP vaccine milestones.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddMemberModal(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-5 rounded-2xl flex items-center gap-2 text-xs shadow-md transition self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>{language === 'te' ? 'సభ్యుడిని చేర్చండి' : 'Add Family Member'}</span>
        </button>
      </div>

      {/* Family Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Self card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-5 border border-emerald-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                Primary Account
              </span>
              <span className="text-xs font-black text-emerald-900">{healthStore.patientProfile.bloodGroup}</span>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-base">{healthStore.patientProfile.name}</h3>
              <p className="text-xs text-gray-500">
                Age {healthStore.patientProfile.age} • {healthStore.patientProfile.gender}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                📍 {healthStore.patientProfile.village}, {healthStore.patientProfile.district}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-200/60 flex items-center justify-between text-[11px] font-semibold text-emerald-900">
            <span>{getMemberCounts(healthStore.patientProfile.name).records} Records</span>
            <span>{getMemberCounts(healthStore.patientProfile.name).meds} Meds</span>
            <span>{getMemberCounts(healthStore.patientProfile.name).apts} Visits</span>
          </div>
        </div>

        {/* Linked Family Members */}
        {familyMembers.map((member) => {
          const counts = getMemberCounts(member.name);
          const isSenior = member.isSenior || member.age >= 60;
          return (
            <div
              key={member.id}
              className="bg-white rounded-3xl p-5 border border-gray-200 hover:border-emerald-300 shadow-xs transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {member.relationship}
                    </span>
                    {isSenior && (
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <HeartHandshake className="w-3 h-3" />
                        <span>Senior Support</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                    {member.bloodGroup}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                    {member.isMinor && <Baby className="w-4 h-4 text-emerald-600" />}
                    <span>{member.name}</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Age: {member.age} • {member.gender}
                  </p>
                </div>

                {member.chronicConditions && member.chronicConditions.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Chronic Care:</p>
                    <div className="flex flex-wrap gap-1">
                      {member.chronicConditions.map((cond, i) => (
                        <span
                          key={i}
                          className="bg-amber-50 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-amber-200"
                        >
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {member.isMinor && (
                  <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-900 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Guardian Permission:</span>
                    </span>
                    <button
                      onClick={() => healthStore.toggleMinorGuardianConsent(member.id)}
                      className={`px-2.5 py-0.5 rounded-full font-bold ${
                        member.guardianConsent
                          ? 'bg-emerald-700 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {member.guardianConsent ? 'Granted' : 'Revoked'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-[11px] text-gray-600 font-medium">
                  <span>{counts.records} Records</span>
                  <span>{counts.meds} Reminders</span>
                  <span>{counts.apts} Appointments</span>
                </div>
                {onNavigate && (
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                    <button
                      onClick={() => onNavigate('records')}
                      className="py-1.5 rounded-xl bg-gray-50 hover:bg-emerald-50 text-emerald-800 flex items-center justify-center gap-1 border border-gray-200"
                    >
                      <FolderLock className="w-3 h-3" />
                      <span>Records</span>
                    </button>
                    <button
                      onClick={() => onNavigate('reminders')}
                      className="py-1.5 rounded-xl bg-gray-50 hover:bg-emerald-50 text-emerald-800 flex items-center justify-center gap-1 border border-gray-200"
                    >
                      <Pill className="w-3 h-3" />
                      <span>Meds</span>
                    </button>
                    <button
                      onClick={() => onNavigate('doctors')}
                      className="py-1.5 rounded-xl bg-gray-50 hover:bg-emerald-50 text-emerald-800 flex items-center justify-center gap-1 border border-gray-200"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Visit</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Child Immunization Schedule (UIP Reference + Tracker) */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Baby className="w-5 h-5 text-emerald-600" />
              <span>
                {language === 'te' ? 'పిల్లల టీకాల షెడ్యూల్ (UIP Child Vaccination)' : 'National Child Vaccination Schedule (UIP)'}
              </span>
            </h2>
            <p className="text-xs text-gray-500">
              {language === 'te'
                ? 'భారత ప్రభుత్వ జాతీయ ఇమ్యునైజేషన్ షెడ్యూల్ (UIP) ప్రకారం పిల్లల టీకాల మైలురాళ్ళు'
                : 'Track standard Government of India UIP immunization milestones for registered children.'}
            </p>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            {minorChildren.length > 0 ? `Tracking: ${minorChildren.map((c) => c.name).join(', ')}` : 'Reference UIP Schedule'}
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {vaccinations.map((vac) => {
            const isDone = vac.status === 'completed';
            return (
              <div
                key={vac.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isDone ? 'bg-emerald-600' : 'bg-amber-500'}`}></span>
                    <p className="font-bold text-gray-900 text-sm">{vac.vaccineName}</p>
                  </div>
                  <p className="text-gray-500 pl-4.5">
                    వయస్సు: <strong className="text-gray-700">{vac.recommendedAge}</strong>
                    {vac.administeredDate && (
                      <span className="text-emerald-700 ml-2 font-medium">
                        (Recorded: {vac.administeredDate})
                      </span>
                    )}
                  </p>
                </div>

                <button
                  onClick={() => handleToggleVaccine(vac.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition self-start sm:self-auto ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>వేసుకున్నారు (Completed)</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      <span>మార్క్ చేయండి (Mark Done)</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">
                {language === 'te' ? 'కుటుంబ సభ్యుడి వివరాలు' : 'Add Family Member'}
              </h3>
              <button onClick={() => setShowAddMemberModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">సభ్యుడి పేరు (Full Name):</label>
                <input
                  type="text"
                  required
                  placeholder="Enter family member's name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">సంబంధం (Relation):</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as FamilyMember['relationship'])}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Spouse">Spouse (భార్య/భర్త)</option>
                    <option value="Father">Father (తండ్రి)</option>
                    <option value="Mother">Mother (తల్లి)</option>
                    <option value="Son">Son (కుమారుడు)</option>
                    <option value="Daughter">Daughter (కుమార్తె)</option>
                    <option value="Grandfather">Grandfather (తాతయ్య)</option>
                    <option value="Grandmother">Grandmother (నానమ్మ/అమ్మమ్మ)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">వయస్సు (Age):</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">లింగం (Gender):</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="female">Female (స్త్రీ)</option>
                    <option value="male">Male (పురుషుడు)</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">రక్త వర్గం (Blood Group):</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {age < 18 && (
                <label className="flex items-start gap-2 bg-emerald-50 p-3 rounded-2xl border border-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guardianConsent}
                    onChange={(e) => setGuardianConsent(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded mt-0.5"
                  />
                  <span className="text-emerald-900">
                    I am the parent/legal guardian and authorize health & immunization record management for this minor.
                  </span>
                </label>
              )}

              <div className="space-y-1">
                <label className="font-bold text-gray-700">ఆరోగ్య సమస్యలు (Conditions, optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Diabetes, Asthma"
                  value={chronicConditionInput}
                  onChange={(e) => setChronicConditionInput(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
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
    </div>
  );
};
