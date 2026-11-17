import {
  UserProfile,
  UserRole,
  PatientProfile,
  FamilyMember,
  Doctor,
  Hospital,
  Appointment,
  Prescription,
  MedicationSchedule,
  HealthRecord,
  LabTest,
  LabBooking,
  AmbulanceContact,
  BloodDonor,
  VaccinationReminder,
  HealthMetric,
  NotificationItem,
  PharmacyEntry,
  PharmacyRequest,
  PhysiotherapyCenter,
  PreventivePackage,
  ComplaintItem,
  ConsentRecord,
  PaymentRecord,
  HealthContentItem,
  AdminActivityLog
} from '../types';
import {
  INITIAL_DOCTORS,
  INITIAL_HOSPITALS,
  INITIAL_AMBULANCES,
  INITIAL_LAB_TESTS,
  INITIAL_BLOOD_DONORS,
  INITIAL_MEDICATIONS,
  INITIAL_HEALTH_RECORDS,
  CHILD_VACCINATIONS,
  INITIAL_METRICS,
  INITIAL_PHARMACIES,
  INITIAL_PHYSIOTHERAPY,
  INITIAL_HEALTH_PACKAGES,
  INITIAL_HEALTH_CONTENT
} from '../data/mockData';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

class HealthStore {
  // Network & UI Preferences
  lowBandwidthMode: boolean = false;
  emergencyConfig = {
    primary108: '108',
    motherChild102: '102',
    national112: '112'
  };

  // Current user state
  currentUser: UserProfile = {
    uid: 'guest-patient',
    email: '',
    displayName: 'Citizen User',
    phoneNumber: '',
    role: 'patient',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  usersList: UserProfile[] = [];

  patientProfile: PatientProfile = {
    id: 'pat-1',
    userId: 'guest-patient',
    name: 'Citizen User',
    age: 30,
    gender: 'male',
    phone: '',
    district: 'Kakinada',
    mandal: 'Turangi',
    village: 'Turangi',
    emergencyContact: '',
    emergencyContactName: '',
    bloodGroup: 'O+',
    abhaId: '',
    seniorCitizenMode: false,
    consentAccepted: false,
    aiConsentAccepted: false,
    createdAt: new Date().toISOString().split('T')[0]
  };

  familyMembers: FamilyMember[] = [];
  doctors: Doctor[] = [...INITIAL_DOCTORS];
  hospitals: Hospital[] = [...INITIAL_HOSPITALS];
  ambulances: AmbulanceContact[] = [...INITIAL_AMBULANCES];
  labTests: LabTest[] = [...INITIAL_LAB_TESTS];
  labBookings: LabBooking[] = [];
  bloodDonors: BloodDonor[] = [...INITIAL_BLOOD_DONORS];
  medications: MedicationSchedule[] = [...INITIAL_MEDICATIONS];
  prescriptions: Prescription[] = [];
  healthRecords: HealthRecord[] = [...INITIAL_HEALTH_RECORDS];
  vaccinations: VaccinationReminder[] = [...CHILD_VACCINATIONS];
  metrics: HealthMetric[] = [...INITIAL_METRICS];
  appointments: Appointment[] = [];
  notifications: NotificationItem[] = [];
  pharmacies: PharmacyEntry[] = [...INITIAL_PHARMACIES];
  pharmacyRequests: PharmacyRequest[] = [];
  physiotherapyCenters: PhysiotherapyCenter[] = [...INITIAL_PHYSIOTHERAPY];
  healthPackages: PreventivePackage[] = [...INITIAL_HEALTH_PACKAGES];
  complaints: ComplaintItem[] = [];
  consents: ConsentRecord[] = [];
  payments: PaymentRecord[] = [];
  healthContent: HealthContentItem[] = [...INITIAL_HEALTH_CONTENT];
  adminLogs: AdminActivityLog[] = [];
  activePlan: 'free' | 'basic' | 'premium' | 'family' = 'free';

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromLocalStorage();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.saveToLocalStorage();
    this.listeners.forEach((fn) => fn());
  }

  private stripUndefined<T extends Record<string, any>>(obj: T): Record<string, any> {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        clean[k] = v;
      }
    }
    return clean;
  }

  private syncFirestoreDoc(collectionName: string, docId: string, payload: Record<string, any>) {
    if (!auth.currentUser) return;
    const sanitized = this.stripUndefined(payload);
    if (collectionName === 'health_records') {
      delete sanitized.fileData;
    }
    setDoc(doc(db, collectionName, docId), sanitized).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${docId}`);
    });
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('mana_health_state_v2', JSON.stringify({
        lowBandwidthMode: this.lowBandwidthMode,
        emergencyConfig: this.emergencyConfig,
        currentUser: this.currentUser,
        patientProfile: this.patientProfile,
        familyMembers: this.familyMembers,
        doctors: this.doctors,
        hospitals: this.hospitals,
        ambulances: this.ambulances,
        labTests: this.labTests,
        labBookings: this.labBookings,
        bloodDonors: this.bloodDonors,
        medications: this.medications,
        prescriptions: this.prescriptions,
        healthRecords: this.healthRecords,
        vaccinations: this.vaccinations,
        metrics: this.metrics,
        appointments: this.appointments,
        notifications: this.notifications,
        pharmacies: this.pharmacies,
        pharmacyRequests: this.pharmacyRequests,
        physiotherapyCenters: this.physiotherapyCenters,
        healthPackages: this.healthPackages,
        complaints: this.complaints,
        consents: this.consents,
        payments: this.payments,
        healthContent: this.healthContent,
        adminLogs: this.adminLogs,
        activePlan: this.activePlan
      }));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }

  private loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem('mana_health_state_v2');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.lowBandwidthMode === 'boolean') this.lowBandwidthMode = data.lowBandwidthMode;
      if (data.emergencyConfig) this.emergencyConfig = data.emergencyConfig;
      if (data.currentUser) this.currentUser = data.currentUser;
      if (data.patientProfile) this.patientProfile = data.patientProfile;
      if (Array.isArray(data.familyMembers)) this.familyMembers = data.familyMembers;
      if (Array.isArray(data.doctors)) this.doctors = data.doctors;
      if (Array.isArray(data.hospitals)) this.hospitals = data.hospitals;
      if (Array.isArray(data.ambulances)) this.ambulances = data.ambulances;
      if (Array.isArray(data.labTests)) this.labTests = data.labTests;
      if (Array.isArray(data.labBookings)) this.labBookings = data.labBookings;
      if (Array.isArray(data.bloodDonors)) this.bloodDonors = data.bloodDonors;
      if (Array.isArray(data.medications)) this.medications = data.medications;
      if (Array.isArray(data.prescriptions)) this.prescriptions = data.prescriptions;
      if (Array.isArray(data.healthRecords)) this.healthRecords = data.healthRecords;
      if (Array.isArray(data.vaccinations)) this.vaccinations = data.vaccinations;
      if (Array.isArray(data.metrics)) this.metrics = data.metrics;
      if (Array.isArray(data.appointments)) this.appointments = data.appointments;
      if (Array.isArray(data.notifications)) this.notifications = data.notifications;
      if (Array.isArray(data.pharmacies)) this.pharmacies = data.pharmacies;
      if (Array.isArray(data.pharmacyRequests)) this.pharmacyRequests = data.pharmacyRequests;
      if (Array.isArray(data.physiotherapyCenters)) this.physiotherapyCenters = data.physiotherapyCenters;
      if (Array.isArray(data.healthPackages)) this.healthPackages = data.healthPackages;
      if (Array.isArray(data.complaints)) this.complaints = data.complaints;
      if (Array.isArray(data.consents)) this.consents = data.consents;
      if (Array.isArray(data.payments)) this.payments = data.payments;
      if (Array.isArray(data.healthContent)) this.healthContent = data.healthContent;
      if (Array.isArray(data.adminLogs)) this.adminLogs = data.adminLogs;
      if (data.activePlan) this.activePlan = data.activePlan;
    } catch (e) {
      console.warn('Storage load error:', e);
    }
  }

  toggleLowBandwidthMode() {
    this.lowBandwidthMode = !this.lowBandwidthMode;
    this.notify();
  }

  updateEmergencyConfig(config: Partial<typeof this.emergencyConfig>) {
    this.emergencyConfig = { ...this.emergencyConfig, ...config };
    this.notify();
  }

  // Sync Firebase Auth user info when logged in
  syncAuthenticatedUser(uid: string, email: string | null, displayName: string | null, phoneNumber: string | null) {
    this.currentUser.uid = uid;
    if (email) this.currentUser.email = email;
    if (displayName) this.currentUser.displayName = displayName;
    if (phoneNumber) this.currentUser.phoneNumber = phoneNumber;
    this.patientProfile.userId = uid;
    if (this.patientProfile.id === 'pat-1') {
      this.patientProfile.id = `pat-${uid}`;
    }
    if (displayName && this.patientProfile.name === 'Citizen User') {
      this.patientProfile.name = displayName;
    }

    if (auth.currentUser) {
      const userRef = doc(db, 'users', uid);
      const isBootstrapAdmin =
        auth.currentUser.emailVerified && auth.currentUser.email === 'injarapusivaraghava@gmail.com';
      getDoc(userRef)
        .then((snap) => {
          if (!snap.exists()) {
            return setDoc(
              userRef,
              this.stripUndefined({
                uid,
                email: this.currentUser.email || '',
                displayName: this.currentUser.displayName || 'Citizen User',
                phoneNumber: this.currentUser.phoneNumber || '',
                role: isBootstrapAdmin ? 'superadmin' : 'patient',
                status: 'active',
                createdAt: this.currentUser.createdAt
              })
            );
          }
          return updateDoc(
            userRef,
            this.stripUndefined({
              email: this.currentUser.email || '',
              displayName: this.currentUser.displayName || 'Citizen User',
              phoneNumber: this.currentUser.phoneNumber || ''
            })
          );
        })
        .catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
        });
    }
    this.notify();
  }

  // Role switching
  setRole(role: UserRole) {
    this.currentUser.role = role;
    if (role === 'patient') {
      this.currentUser.displayName = this.patientProfile.name || 'Patient';
    }
    this.logAdminAction(`Switched active interface role to ${role}`);
    this.notify();
  }

  // Admin Logs
  logAdminAction(action: string) {
    this.adminLogs.unshift({
      id: `log-${Date.now()}`,
      actorEmail: auth.currentUser?.email || this.currentUser.email || 'local-session',
      actorRole: this.currentUser.role,
      action,
      timestamp: new Date().toISOString()
    });
    if (this.adminLogs.length > 50) this.adminLogs = this.adminLogs.slice(0, 50);
  }

  // Doctor registration & verification
  registerDoctor(data: Omit<Doctor, 'id' | 'verified' | 'verificationStatus'>): Doctor {
    const docEntry: Doctor = {
      ...data,
      id: `doc-${Date.now()}`,
      userId: this.currentUser.uid,
      verified: false,
      verificationStatus: 'pending_verification'
    };
    this.doctors.unshift(docEntry);
    this.syncFirestoreDoc('doctors', docEntry.id, docEntry);
    this.logAdminAction(`Doctor profile submitted for verification: ${docEntry.name} (${docEntry.registrationNumber})`);
    this.notify();
    return docEntry;
  }

  toggleDoctorVerify(id: string) {
    const docEntry = this.doctors.find((d) => d.id === id);
    if (docEntry) {
      docEntry.verified = !docEntry.verified;
      docEntry.verificationStatus = docEntry.verified ? 'verified' : 'pending_verification';
      this.logAdminAction(`${docEntry.verified ? 'Verified' : 'Revoked'} doctor ${docEntry.name}`);
      this.notify();
      if (auth.currentUser) {
        updateDoc(doc(db, 'doctors', id), {
          verified: docEntry.verified,
          verificationStatus: docEntry.verificationStatus
        }).catch((err) => {
          handleFirestoreError(err, OperationType.UPDATE, `doctors/${id}`);
        });
      }
    }
  }

  // Hospital management
  addHospital(data: Omit<Hospital, 'id'>): Hospital {
    const hosp: Hospital = {
      ...data,
      id: `hosp-${Date.now()}`
    };
    this.hospitals.unshift(hosp);
    this.syncFirestoreDoc('hospitals', hosp.id, hosp);
    this.logAdminAction(`Added hospital: ${hosp.name}`);
    this.notify();
    return hosp;
  }

  toggleHospitalVerify(id: string) {
    const hosp = this.hospitals.find((h) => h.id === id);
    if (hosp) {
      hosp.verified = !hosp.verified;
      this.logAdminAction(`${hosp.verified ? 'Verified' : 'Unverified'} hospital ${hosp.name}`);
      this.notify();
    }
  }

  // Appointment operations (NO fake confirmation — starts as 'pending')
  bookAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Appointment {
    const newAppointment: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.appointments.unshift(newAppointment);

    this.addNotification({
      title: 'Appointment Request Submitted – అపాయింట్‌మెంట్ అభ్యర్థన పంపబడింది',
      message: `Request for ${newAppointment.doctorName} on ${newAppointment.date} at ${newAppointment.slot} is PENDING confirmation from the doctor/hospital.`,
      type: 'appointment',
      userId: this.currentUser.uid
    });

    this.syncFirestoreDoc('appointments', newAppointment.id, newAppointment);
    this.notify();
    return newAppointment;
  }

  updateAppointmentStatus(id: string, status: Appointment['status']) {
    const item = this.appointments.find((a) => a.id === id);
    if (item) {
      item.status = status;
      this.addNotification({
        title: `Appointment ${status.toUpperCase()}`,
        message: `Appointment with ${item.doctorName} (${item.date} ${item.slot}) is now ${status}.`,
        type: 'appointment',
        userId: item.patientId
      });
      this.logAdminAction(`Updated appointment ${id} status to ${status}`);
      this.notify();
      if (auth.currentUser) {
        updateDoc(doc(db, 'appointments', id), { status }).catch((err) => {
          handleFirestoreError(err, OperationType.UPDATE, `appointments/${id}`);
        });
      }
    }
  }

  rescheduleAppointment(id: string, newDate: string, newSlot: string) {
    const item = this.appointments.find((a) => a.id === id);
    if (item) {
      item.date = newDate;
      item.slot = newSlot;
      item.status = 'rescheduled';
      this.addNotification({
        title: 'Appointment Rescheduled – అపాయింట్‌మెంట్ రీషెడ్యూల్ చేయబడింది',
        message: `Your appointment with ${item.doctorName} has been rescheduled to ${newDate} at ${newSlot}. Awaiting confirmation.`,
        type: 'appointment',
        userId: item.patientId
      });
      this.notify();
      if (auth.currentUser) {
        updateDoc(doc(db, 'appointments', id), { date: newDate, slot: newSlot, status: 'rescheduled' }).catch((err) => {
          handleFirestoreError(err, OperationType.UPDATE, `appointments/${id}`);
        });
      }
    }
  }

  cancelAppointment(id: string) {
    this.updateAppointmentStatus(id, 'cancelled');
  }

  // Prescriptions (Doctor issues digital prescription -> also saves to Health Records)
  issuePrescription(data: Omit<Prescription, 'id' | 'createdAt'>): Prescription {
    const rx: Prescription = {
      ...data,
      id: `rx-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.prescriptions.unshift(rx);

    if (rx.appointmentId) {
      const apt = this.appointments.find((a) => a.id === rx.appointmentId);
      if (apt) {
        apt.prescriptionGiven = true;
        apt.status = 'completed';
      }
    }

    const medsText = rx.medicines
      .map((m) => `${m.name} (${m.dosage}) - ${m.timing} for ${m.durationDays} days`)
      .join('\n');

    this.addHealthRecord({
      patientId: rx.patientId,
      familyMemberName: rx.patientName,
      title: `Prescription: ${rx.diagnosisSummary}`,
      category: 'Prescription',
      date: rx.date,
      doctorOrLab: rx.doctorName,
      fileName: `Prescription_${rx.date}.txt`,
      fileType: 'text/plain',
      notes: `Diagnosis Summary: ${rx.diagnosisSummary}\nMedicines:\n${medsText}\nInstructions: ${rx.instructions}`
    });

    this.syncFirestoreDoc('prescriptions', rx.id, rx);
    this.logAdminAction(`Doctor ${rx.doctorName} issued prescription ${rx.id}`);
    this.notify();
    return rx;
  }

  // Medication operations
  addMedication(data: Omit<MedicationSchedule, 'id'>) {
    const newMed: MedicationSchedule = {
      ...data,
      statusToday: 'pending',
      id: `med-${Date.now()}`
    };
    this.medications.unshift(newMed);
    this.syncFirestoreDoc('medication_schedules', newMed.id, newMed);
    this.notify();
  }

  setMedicationStatus(id: string, status: 'taken' | 'missed' | 'pending') {
    const med = this.medications.find((m) => m.id === id);
    if (med) {
      const prevTaken = med.takenToday;
      med.statusToday = status;
      med.takenToday = status === 'taken';
      if (!prevTaken && status === 'taken' && med.daysRemaining > 0) {
        med.daysRemaining = Math.max(0, med.daysRemaining - 1);
      }
      this.notify();
      if (auth.currentUser) {
        updateDoc(doc(db, 'medication_schedules', id), {
          takenToday: med.takenToday,
          statusToday: status,
          daysRemaining: med.daysRemaining
        }).catch((err) => {
          handleFirestoreError(err, OperationType.UPDATE, `medication_schedules/${id}`);
        });
      }
    }
  }

  toggleMedicationTaken(id: string) {
    const med = this.medications.find((m) => m.id === id);
    if (med) {
      this.setMedicationStatus(id, med.takenToday ? 'pending' : 'taken');
    }
  }

  deleteMedication(id: string) {
    this.medications = this.medications.filter((m) => m.id !== id);
    this.notify();
    if (auth.currentUser) {
      deleteDoc(doc(db, 'medication_schedules', id)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, `medication_schedules/${id}`);
      });
    }
  }

  // Health records operations
  addHealthRecord(data: Omit<HealthRecord, 'id' | 'uploadedAt'>) {
    const newRecord: HealthRecord = {
      ...data,
      id: `rec-${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };
    this.healthRecords.unshift(newRecord);
    this.syncFirestoreDoc('health_records', newRecord.id, newRecord);
    this.notify();
  }

  deleteHealthRecord(id: string) {
    this.healthRecords = this.healthRecords.filter((r) => r.id !== id);
    this.notify();
    if (auth.currentUser) {
      deleteDoc(doc(db, 'health_records', id)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, `health_records/${id}`);
      });
    }
  }

  // Family member operations
  addFamilyMember(data: Omit<FamilyMember, 'id'>) {
    const newMember: FamilyMember = {
      ...data,
      isSenior: data.age >= 60,
      id: `fam-${Date.now()}`
    };
    this.familyMembers.push(newMember);
    this.syncFirestoreDoc('family_members', newMember.id, newMember);
    this.notify();
  }

  toggleMinorGuardianConsent(memberId: string) {
    const m = this.familyMembers.find((f) => f.id === memberId);
    if (m) {
      m.guardianConsent = !m.guardianConsent;
      this.notify();
    }
  }

  // Health metrics operations
  addMetric(data: Omit<HealthMetric, 'id'>) {
    const newMetric: HealthMetric = {
      ...data,
      id: `met-${Date.now()}`
    };
    this.metrics.unshift(newMetric);
    this.notify();
  }

  // Blood donor registration
  registerBloodDonor(donor: Omit<BloodDonor, 'id'>) {
    const newDonor: BloodDonor = {
      ...donor,
      userId: this.currentUser.uid,
      id: `donor-${Date.now()}`
    };
    this.bloodDonors.unshift(newDonor);
    this.syncFirestoreDoc('blood_donors', newDonor.id, newDonor);
    this.notify();
  }

  // Lab Tests & Bookings
  addLabTest(test: Omit<LabTest, 'id'>) {
    const newTest: LabTest = { ...test, id: `test-${Date.now()}` };
    this.labTests.unshift(newTest);
    this.syncFirestoreDoc('lab_tests', newTest.id, newTest);
    this.logAdminAction(`Added verified lab test: ${newTest.name} (${newTest.labName})`);
    this.notify();
  }

  bookLabTest(test: LabTest, homeCollection: boolean, address: string, preferredDate: string): LabBooking {
    const booking: LabBooking = {
      id: `lab-bk-${Date.now()}`,
      patientId: this.currentUser.uid,
      patientName: this.patientProfile.name,
      testId: test.id,
      testName: test.name,
      labName: test.labName,
      price: test.price,
      homeCollection,
      address,
      preferredDate,
      status: 'requested',
      createdAt: new Date().toISOString()
    };
    this.labBookings.unshift(booking);
    this.addNotification({
      title: 'Lab Test Request Sent – ల్యాబ్ టెస్ట్ అభ్యర్థన పంపబడింది',
      message: `Booking request for ${test.name} (${homeCollection ? 'Home Collection' : 'Walk-in'}) is awaiting verification by ${test.labName}.`,
      type: 'general',
      userId: this.currentUser.uid
    });
    this.notify();
    return booking;
  }

  updateLabBookingStatus(id: string, status: LabBooking['status'], reportNotes?: string) {
    const b = this.labBookings.find((x) => x.id === id);
    if (b) {
      b.status = status;
      if (reportNotes) b.reportNotes = reportNotes;
      this.logAdminAction(`Updated lab booking ${id} to ${status}`);
      this.notify();
    }
  }

  // Ambulance directory management
  addAmbulanceContact(data: Omit<AmbulanceContact, 'id'>) {
    const amb: AmbulanceContact = { ...data, id: `amb-${Date.now()}` };
    this.ambulances.push(amb);
    this.syncFirestoreDoc('ambulance_contacts', amb.id, amb);
    this.logAdminAction(`Added verified ambulance service: ${amb.serviceName}`);
    this.notify();
  }

  // Pharmacies & Requests
  addPharmacy(data: Omit<PharmacyEntry, 'id'>) {
    const p: PharmacyEntry = { ...data, id: `pharm-${Date.now()}` };
    this.pharmacies.unshift(p);
    this.notify();
  }

  submitPharmacyRequest(pharmacyName: string, prescriptionTitle: string, notes: string) {
    const req: PharmacyRequest = {
      id: `phreq-${Date.now()}`,
      patientId: this.currentUser.uid,
      patientName: this.patientProfile.name,
      pharmacyName,
      prescriptionTitle,
      notes,
      status: 'pending_verification',
      createdAt: new Date().toISOString()
    };
    this.pharmacyRequests.unshift(req);
    this.notify();
    return req;
  }

  // Physiotherapy & Preventive Packages
  addPhysiotherapyCenter(data: Omit<PhysiotherapyCenter, 'id'>) {
    this.physiotherapyCenters.unshift({ ...data, id: `phys-${Date.now()}` });
    this.notify();
  }

  addPreventivePackage(data: Omit<PreventivePackage, 'id'>) {
    this.healthPackages.unshift({ ...data, id: `pkg-${Date.now()}` });
    this.notify();
  }

  // Complaints
  submitComplaint(category: string, subject: string, description: string): ComplaintItem {
    const item: ComplaintItem = {
      id: `cmp-${Date.now()}`,
      userId: this.currentUser.uid,
      userName: this.patientProfile.name || this.currentUser.displayName,
      category,
      subject,
      description,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.complaints.unshift(item);
    this.syncFirestoreDoc('complaints', item.id, item);
    this.notify();
    return item;
  }

  resolveComplaint(id: string) {
    const c = this.complaints.find((x) => x.id === id);
    if (c) {
      c.status = 'resolved';
      this.logAdminAction(`Resolved complaint ${id}`);
      this.notify();
    }
  }

  // Consents
  recordConsent(consentType: ConsentRecord['consentType'], agreed: boolean) {
    const rec: ConsentRecord = {
      id: `cons-${Date.now()}`,
      userId: this.currentUser.uid,
      consentType,
      agreed,
      timestamp: new Date().toISOString()
    };
    this.consents.unshift(rec);
    if (consentType === 'patient_privacy') this.patientProfile.consentAccepted = agreed;
    if (consentType === 'ai_health_assistant') this.patientProfile.aiConsentAccepted = agreed;
    this.syncFirestoreDoc('consents', rec.id, rec);
    this.notify();
  }

  // Subscription Sandbox Recording
  recordSandboxPlan(plan: 'free' | 'basic' | 'premium' | 'family', amount: number) {
    this.activePlan = plan;
    const pay: PaymentRecord = {
      id: `pay-${Date.now()}`,
      userId: this.currentUser.uid,
      userName: this.patientProfile.name,
      plan,
      amount,
      status: amount === 0 ? 'completed' : 'sandbox_demo',
      createdAt: new Date().toISOString()
    };
    this.payments.unshift(pay);
    this.syncFirestoreDoc('payments', pay.id, pay);
    this.notify();
  }

  // Health Content Management
  addHealthContent(item: Omit<HealthContentItem, 'id'>) {
    this.healthContent.unshift({ ...item, id: `edu-${Date.now()}` });
    this.logAdminAction(`Published health education content: ${item.titleEn}`);
    this.notify();
  }

  // Notifications
  addNotification(item: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>) {
    const notif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    this.notify();
  }

  markAllNotificationsRead() {
    this.notifications.forEach((n) => (n.read = true));
    this.notify();
  }

  // Profile & DPDP Account Data Deletion
  updatePatientProfile(profile: Partial<PatientProfile>) {
    this.patientProfile = { ...this.patientProfile, ...profile };
    this.currentUser.displayName = this.patientProfile.name;
    if (this.patientProfile.phone) this.currentUser.phoneNumber = this.patientProfile.phone;
    this.syncFirestoreDoc('patient_profiles', this.patientProfile.id, this.patientProfile);
    this.notify();
  }

  exportAllPersonalData(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        platform: 'MANA HEALTH CONNECT (DPDP Act 2023 Export)',
        patientProfile: this.patientProfile,
        familyMembers: this.familyMembers,
        appointments: this.appointments,
        prescriptions: this.prescriptions,
        medications: this.medications,
        healthRecords: this.healthRecords,
        metrics: this.metrics,
        consents: this.consents
      },
      null,
      2
    );
  }

  eraseAllPersonalData() {
    this.familyMembers = [];
    this.appointments = [];
    this.prescriptions = [];
    this.medications = [];
    this.healthRecords = [];
    this.metrics = [];
    this.labBookings = [];
    this.pharmacyRequests = [];
    this.consents = [];
    this.patientProfile = {
      ...this.patientProfile,
      name: 'Citizen User',
      phone: '',
      emergencyContact: '',
      emergencyContactName: '',
      abhaId: '',
      consentAccepted: false,
      aiConsentAccepted: false
    };
    localStorage.removeItem('mana_health_state_v2');
    this.notify();
  }
}

export const healthStore = new HealthStore();
