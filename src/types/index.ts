export type UserRole = 'patient' | 'doctor' | 'hospital' | 'superadmin';

export type Language = 'te' | 'en';

export interface UserProfile {
  uid: string;
  email?: string;
  displayName: string;
  phoneNumber?: string;
  role: UserRole;
  status?: 'active' | 'suspended';
  createdAt: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  district: string;
  mandal: string;
  village: string;
  emergencyContact: string;
  emergencyContactName?: string;
  bloodGroup: string;
  abhaId?: string;
  seniorCitizenMode?: boolean;
  consentAccepted: boolean;
  aiConsentAccepted?: boolean;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  patientId: string;
  name: string;
  relationship: 'Spouse' | 'Father' | 'Mother' | 'Son' | 'Daughter' | 'Grandfather' | 'Grandmother' | 'Other';
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  isMinor: boolean;
  isSenior?: boolean;
  chronicConditions?: string[];
  guardianConsent: boolean;
}

export interface Doctor {
  id: string;
  userId?: string;
  name: string;
  nameTe: string;
  specialty: string;
  specialtyTe: string;
  qualifications: string;
  registrationNumber: string;
  council: string;
  hospitalName: string;
  experienceYears: number;
  consultationFee: number;
  availableDays: string[];
  slots: string[];
  district: string;
  city: string;
  phone: string;
  verified: boolean;
  verificationStatus: 'verified' | 'pending_verification';
  teleconsultSupported?: boolean;
  rating?: number;
  about?: string;
  aboutTe?: string;
}

export interface Hospital {
  id: string;
  name: string;
  nameTe: string;
  type: 'government' | 'private';
  district: string;
  mandal: string;
  address: string;
  phone: string;
  emergencyPhone: string;
  specialties: string[];
  hasICU: boolean;
  hasBloodBank: boolean;
  hasEmergency24x7: boolean;
  hasAyushmanAarogyasri: boolean;
  mapUrl: string;
  verified: boolean;
  verificationNote?: string;
  bedCount?: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  familyMemberName?: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  hospitalName: string;
  date: string;
  slot: string;
  fee: number;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';
  type: 'in-person' | 'video';
  symptoms?: string;
  prescriptionGiven?: boolean;
  createdAt: string;
}

export interface Prescription {
  id: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosisSummary: string;
  medicines: {
    name: string;
    dosage: string;
    timing: string;
    durationDays: number;
  }[];
  instructions: string;
  createdAt: string;
}

export interface MedicationSchedule {
  id: string;
  patientId: string;
  patientName: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  reminderDate?: string;
  reminderTime?: string;
  timing: 'before_food' | 'after_food';
  startDate: string;
  daysRemaining: number;
  takenToday: boolean;
  statusToday?: 'pending' | 'taken' | 'missed';
  instructions: string;
  prescribedByDoctor?: string;
}

export interface HealthRecord {
  id: string;
  patientId: string;
  familyMemberName: string;
  title: string;
  category: 'Prescription' | 'Lab Report' | 'Discharge Summary' | 'Scan/X-Ray' | 'Vaccination';
  date: string;
  doctorOrLab: string;
  fileData?: string;
  storageUrl?: string;
  fileName: string;
  fileType: string;
  notes: string;
  uploadedAt: string;
}

export interface LabTest {
  id: string;
  name: string;
  nameTe: string;
  category: string;
  price: number;
  originalPrice?: number;
  labName: string;
  labVerified: boolean;
  homeCollection: boolean;
  reportTime: string;
  fastingRequired: boolean;
  district: string;
  description: string;
}

export interface LabBooking {
  id: string;
  patientId: string;
  patientName: string;
  testId: string;
  testName: string;
  labName: string;
  price: number;
  homeCollection: boolean;
  address: string;
  preferredDate: string;
  status: 'requested' | 'verified_by_lab' | 'sample_collected' | 'report_ready';
  reportNotes?: string;
  createdAt: string;
}

export interface AmbulanceContact {
  id: string;
  serviceName: string;
  serviceNameTe: string;
  type: 'government_108' | 'government_102' | 'emergency_112' | 'private_icu' | 'private_basic';
  phone: string;
  district: string;
  mandal: string;
  is24x7: boolean;
  hasVentilator: boolean;
  hasOxygen: boolean;
  verified: boolean;
  notes?: string;
}

export interface BloodDonor {
  id: string;
  userId?: string;
  name: string;
  bloodGroup: string;
  district: string;
  mandal: string;
  phone: string;
  lastDonated: string;
  available: boolean;
  consentGiven: boolean;
}

export interface VaccinationReminder {
  id: string;
  childName: string;
  vaccineName: string;
  recommendedAge: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'upcoming';
  administeredDate?: string;
}

export interface HealthMetric {
  id: string;
  patientId: string;
  date: string;
  systolicBp?: number;
  diastolicBp?: number;
  bloodSugar?: number;
  sugarType?: 'fasting' | 'post-prandial' | 'random';
  heartRate?: number;
  weightKg?: number;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'medicine' | 'emergency' | 'general';
  read: boolean;
  createdAt: string;
}

export interface PharmacyEntry {
  id: string;
  name: string;
  nameTe: string;
  district: string;
  address: string;
  phone: string;
  is24x7: boolean;
  homeDelivery: boolean;
  verified: boolean;
}

export interface PharmacyRequest {
  id: string;
  patientId: string;
  patientName: string;
  pharmacyName: string;
  prescriptionTitle: string;
  notes: string;
  status: 'pending_verification' | 'ready' | 'dispensed';
  createdAt: string;
}

export interface PhysiotherapyCenter {
  id: string;
  name: string;
  specialty: string;
  district: string;
  address: string;
  phone: string;
  homeVisitAvailable: boolean;
  verified: boolean;
}

export interface PreventivePackage {
  id: string;
  name: string;
  nameTe: string;
  targetGroup: string;
  testsIncluded: string[];
  price: number;
  provider: string;
  verified: boolean;
}

export interface ComplaintItem {
  id: string;
  userId: string;
  userName: string;
  category: string;
  subject: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  createdAt: string;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'patient_privacy' | 'ai_health_assistant' | 'blood_donor_public' | 'abdm_future_readiness';
  agreed: boolean;
  timestamp: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userName: string;
  plan: 'free' | 'basic' | 'premium' | 'family';
  amount: number;
  status: 'sandbox_demo' | 'pending_gateway' | 'completed';
  createdAt: string;
}

export interface HealthContentItem {
  id: string;
  titleTe: string;
  titleEn: string;
  category: string;
  summaryTe: string;
  summaryEn: string;
  videoUrl?: string;
  published: boolean;
}

export interface AdminActivityLog {
  id: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  timestamp: string;
}
