import {
  Doctor,
  Hospital,
  AmbulanceContact,
  LabTest,
  BloodDonor,
  MedicationSchedule,
  HealthRecord,
  VaccinationReminder,
  HealthMetric,
  PharmacyEntry,
  PhysiotherapyCenter,
  PreventivePackage,
  HealthContentItem
} from '../types';

export const AP_DISTRICTS = [
  'Kakinada',
  'East Godavari',
  'Visakhapatnam',
  'Konaseema',
  'West Godavari',
  'Eluru',
  'Krishna',
  'NTR (Vijayawada)',
  'Guntur',
  'Prakasam',
  'Nellore',
  'Tirupati',
  'Kurnool',
  'Ananthapur',
  'Hyderabad (Telangana)',
  'Warangal (Telangana)',
];

export const SPECIALTIES = [
  { en: 'General Medicine', te: 'సాధారణ వైద్యం' },
  { en: 'Cardiology (Heart)', te: 'గుండె విభాగం (కార్డియాలజీ)' },
  { en: 'Orthopedics (Bone & Joint)', te: 'ఎముకల విభాగం (ఆర్థోపెడిక్స్)' },
  { en: 'Pediatrics (Child Health)', te: 'పిల్లల వైద్యం (పీడియాట్రిక్స్)' },
  { en: 'Gynecology & Obstetrics', te: 'స్త్రీల మరియు ప్రసూతి విభాగం' },
  { en: 'Neurology (Brain & Nerve)', te: 'మెదడు మరియు నరాల విభాగం' },
  { en: 'Pulmonology (Chest & Lungs)', te: 'శ్వాసకోశ మరియు ఊపిరితిత్తుల విభాగం' },
  { en: 'Dermatology (Skin)', te: 'చర్మ సంబంధిత వైద్యం' },
  { en: 'Ophthalmology (Eye)', te: 'కంటి వైద్య విభాగం' },
  { en: 'Gastroenterology', te: 'జీర్ణకోశ మరియు కాలేయ విభాగం' },
  { en: 'Dentistry', te: 'దంత వైద్యం' },
  { en: 'ENT (Ear, Nose, Throat)', te: 'చెవి, ముక్కు, గొంతు విభాగం' },
];

// No fake doctor profiles: Doctors are registered via the Doctor Panel and verified by Super Admin.
export const INITIAL_DOCTORS: Doctor[] = [];

// Public Government Teaching Hospitals Directory (verify live OPD schedule with hospital helpdesk)
export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-ggh-kakinada',
    name: 'Government General Hospital (GGH), Kakinada',
    nameTe: 'ప్రభుత్వ సర్వజన ఆసుపత్రి (GGH), కాకినాడ',
    type: 'government',
    district: 'Kakinada',
    mandal: 'Kakinada Urban',
    address: 'Cinema Road, Kakinada, Andhra Pradesh - 533001',
    phone: '104 / 108 (Verify Hospital Desk)',
    emergencyPhone: '108',
    specialties: ['General Medicine', 'Cardiology', 'General Surgery', 'Orthopedics', 'Pediatrics', 'Obstetrics & Gynecology', 'Emergency Trauma'],
    hasICU: true,
    hasBloodBank: true,
    hasEmergency24x7: true,
    hasAyushmanAarogyasri: true,
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Government+General+Hospital+Kakinada',
    verified: true,
    verificationNote: 'Public Govt Teaching Hospital — Confirm OPD hours directly at hospital desk'
  },
  {
    id: 'hosp-kgh-vizag',
    name: 'King George Hospital (KGH), Visakhapatnam',
    nameTe: 'కింగ్ జార్జ్ ఆసుపత్రి (KGH), విశాఖపట్నం',
    type: 'government',
    district: 'Visakhapatnam',
    mandal: 'Maharanipeta',
    address: 'Maharanipeta, Visakhapatnam, Andhra Pradesh - 530002',
    phone: '104 / 108 (Verify Hospital Desk)',
    emergencyPhone: '108',
    specialties: ['Cardiology', 'Neurology', 'Nephrology', 'Trauma & Emergency', 'Pediatrics', 'Oncology'],
    hasICU: true,
    hasBloodBank: true,
    hasEmergency24x7: true,
    hasAyushmanAarogyasri: true,
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=King+George+Hospital+Visakhapatnam',
    verified: true,
    verificationNote: 'Public Govt Teaching Hospital — Confirm OPD hours directly at hospital desk'
  },
  {
    id: 'hosp-ggh-guntur',
    name: 'Government General Hospital (GGH), Guntur',
    nameTe: 'ప్రభుత్వ సర్వజన ఆసుపత్రి (GGH), గుంటూరు',
    type: 'government',
    district: 'Guntur',
    mandal: 'Guntur Urban',
    address: 'Sambasiva Pet, Guntur, Andhra Pradesh - 522001',
    phone: '104 / 108 (Verify Hospital Desk)',
    emergencyPhone: '108',
    specialties: ['Cardiology', 'Neurology', 'Trauma ICU', 'Maternity', 'Pediatrics'],
    hasICU: true,
    hasBloodBank: true,
    hasEmergency24x7: true,
    hasAyushmanAarogyasri: true,
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Government+General+Hospital+Guntur',
    verified: true,
    verificationNote: 'Public Govt Teaching Hospital — Confirm OPD hours directly at hospital desk'
  },
  {
    id: 'hosp-gandhi-hyd',
    name: 'Gandhi Hospital, Secunderabad',
    nameTe: 'గాంధీ ఆసుపత్రి, సికింద్రాబాద్',
    type: 'government',
    district: 'Hyderabad (Telangana)',
    mandal: 'Secunderabad',
    address: 'Musheerabad, Padmarao Nagar, Secunderabad, Telangana - 500003',
    phone: '104 / 108 (Verify Hospital Desk)',
    emergencyPhone: '108',
    specialties: ['General Medicine', 'Critical Care', 'Neurosurgery', 'Pediatrics', 'Dialysis'],
    hasICU: true,
    hasBloodBank: true,
    hasEmergency24x7: true,
    hasAyushmanAarogyasri: true,
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Gandhi+Hospital+Secunderabad',
    verified: true,
    verificationNote: 'Public Govt Teaching Hospital — Confirm OPD hours directly at hospital desk'
  }
];

// Official Statewide Toll-Free Emergency Numbers (Private ambulances added only when verified by Admin)
export const INITIAL_AMBULANCES: AmbulanceContact[] = [
  {
    id: 'amb-108',
    serviceName: '108 Emergency Ambulance (Govt. of AP & Telangana)',
    serviceNameTe: '108 ఉచిత అత్యవసర అంబులెన్స్ సర్వీస్ (ఆంధ్రప్రదేశ్ & తెలంగాణ)',
    type: 'government_108',
    phone: '108',
    district: 'All Districts (అన్ని జిల్లాలు)',
    mandal: 'Statewide 24x7 Network',
    is24x7: true,
    hasVentilator: true,
    hasOxygen: true,
    verified: true,
    notes: 'Official toll-free emergency dispatch. Dispatch confirmation is provided directly by the 108 operator on call.'
  },
  {
    id: 'amb-102',
    serviceName: '102 Janani Shishu Mother & Child Ambulance',
    serviceNameTe: '102 తల్లి & బిడ్డ ఉచిత అంబులెన్స్ వాహనం',
    type: 'government_102',
    phone: '102',
    district: 'All Districts (అన్ని జిల్లాలు)',
    mandal: 'Statewide Network',
    is24x7: true,
    hasVentilator: false,
    hasOxygen: true,
    verified: true,
    notes: 'Dedicated government service for pregnant women transport, deliveries, and infant care.'
  },
  {
    id: 'amb-112',
    serviceName: '112 Unified National Emergency Response',
    serviceNameTe: '112 జాతీయ అత్యవసర సహాయం (పోలీస్, ఫైర్, అంబులెన్స్)',
    type: 'emergency_112',
    phone: '112',
    district: 'Pan India',
    mandal: 'All Mandals',
    is24x7: true,
    hasVentilator: true,
    hasOxygen: true,
    verified: true,
    notes: 'Single national emergency helpline connecting medical, disaster, and rescue units.'
  }
];

// Lab tests are added and priced by verified partner laboratories via Hospital / Admin Portal
export const INITIAL_LAB_TESTS: LabTest[] = [];

// Consenting Blood Donors appear only when registered with explicit informed consent
export const INITIAL_BLOOD_DONORS: BloodDonor[] = [];

// User-managed records start empty until patient adds their real prescriptions/schedules/metrics
export const INITIAL_MEDICATIONS: MedicationSchedule[] = [];
export const INITIAL_HEALTH_RECORDS: HealthRecord[] = [];
export const INITIAL_METRICS: HealthMetric[] = [];
export const INITIAL_PHARMACIES: PharmacyEntry[] = [];
export const INITIAL_PHYSIOTHERAPY: PhysiotherapyCenter[] = [];
export const INITIAL_HEALTH_PACKAGES: PreventivePackage[] = [];

// Standard National Universal Immunization Schedule (UIP) Reference Milestones (India)
export const CHILD_VACCINATIONS: VaccinationReminder[] = [
  {
    id: 'vac-uip-birth',
    childName: 'Child Immunization Schedule (UIP)',
    vaccineName: 'BCG + Oral Polio (OPV 0) + Hepatitis B (Birth Dose)',
    recommendedAge: 'At Birth (పుట్టిన వెంటనే)',
    dueDate: 'At Birth',
    status: 'upcoming'
  },
  {
    id: 'vac-uip-6w',
    childName: 'Child Immunization Schedule (UIP)',
    vaccineName: 'Pentavalent 1 + Rotavirus 1 + IPV 1 + PCV 1',
    recommendedAge: '6 Weeks (6 వారాలు)',
    dueDate: '6 Weeks',
    status: 'upcoming'
  },
  {
    id: 'vac-uip-10w',
    childName: 'Child Immunization Schedule (UIP)',
    vaccineName: 'Pentavalent 2 + Rotavirus 2',
    recommendedAge: '10 Weeks (10 వారాలు)',
    dueDate: '10 Weeks',
    status: 'upcoming'
  },
  {
    id: 'vac-uip-14w',
    childName: 'Child Immunization Schedule (UIP)',
    vaccineName: 'Pentavalent 3 + Rotavirus 3 + IPV 2 + PCV 2',
    recommendedAge: '14 Weeks (14 వారాలు)',
    dueDate: '14 Weeks',
    status: 'upcoming'
  },
  {
    id: 'vac-uip-9m',
    childName: 'Child Immunization Schedule (UIP)',
    vaccineName: 'MR Vaccine 1 (Measles & Rubella) + Vitamin A + PCV Booster',
    recommendedAge: '9 - 12 Months (9-12 నెలలు)',
    dueDate: '9-12 Months',
    status: 'upcoming'
  },
  {
    id: 'vac-uip-16m',
    childName: 'Child Immunization Schedule (UIP)',
    vaccineName: 'DPT Booster 1 + Oral Polio Booster + MR 2',
    recommendedAge: '16 - 24 Months (16-24 నెలలు)',
    dueDate: '16-24 Months',
    status: 'upcoming'
  }
];

export const INITIAL_HEALTH_CONTENT: HealthContentItem[] = [
  {
    id: 'edu-1',
    titleTe: 'గుండెపోటు ముందస్తు హెచ్చరికలు & గోల్డెన్ అవర్',
    titleEn: 'Heart Attack Warning Signs & Golden Hour Action',
    category: 'Emergency Awareness',
    summaryTe: 'ఛాతీలో బిగుతు లేదా నొప్పి, ఎడమ చేయి లేదా దవడలోకి నొప్పి, తీవ్రమైన చెమటలు, శ్వాస ఆడకపోవడం కనిపిస్తే ఆలస్యం చేయకుండా 108 కి కాల్ చేయాలి.',
    summaryEn: 'Chest tightness, pain radiating to left arm or jaw, cold sweats, or sudden shortness of breath require immediate 108 ambulance care.',
    published: true
  },
  {
    id: 'edu-2',
    titleTe: 'వర్షాకాలంలో డెంగ్యూ & మలేరియా నివారణ',
    titleEn: 'Preventing Dengue & Monsoon Vector-Borne Fevers',
    category: 'Preventive Care',
    summaryTe: 'ఇంటి చుట్టూ నీరు నిల్వ లేకుండా చూడాలి. దోమతెరలు వాడాలి. జ్వరం 2 రోజులకు మించి ఉంటే సమీప PHC లేదా GGH లో రక్త పరీక్ష చేయించుకోవాలి.',
    summaryEn: 'Eliminate stagnant water around homes, use mosquito nets, and visit your nearest PHC or Govt Hospital if fever persists beyond 48 hours.',
    published: true
  },
  {
    id: 'edu-3',
    titleTe: 'ఆరోగ్యశ్రీ & ఆయుష్మాన్ భారత్ పథకం మార్గదర్శి',
    titleEn: 'Using Aarogyasri & Ayushman Bharat Health Coverage',
    category: 'Public Schemes',
    summaryTe: 'ప్రభుత్వ మరియు ఎంపానెల్ చేయబడిన ఆసుపత్రులలో ఆరోగ్య మిత్ర హెల్ప్‌డెస్క్ ద్వారా అర్హత కలిగిన చికిత్సల వివరాలు తెలుసుకోవచ్చు.',
    summaryEn: 'Check eligibility and empanelled procedure coverage at the Aarogya Mitra helpdesk inside Government and network hospitals.',
    published: true
  }
];
