# MANA HEALTH CONNECT – మన ఆరోగ్య సేవలు

> **"మీ ఆరోగ్యం – మా ప్రాధాన్యత"**

A mobile-first bilingual (Telugu & English) healthcare coordination platform for Andhra Pradesh & Telangana citizens.

## Contact & Registered Office
- **Registered Office:** Turangi, Kakinada, Andhra Pradesh - 533016
- **WhatsApp & Helpline:** +91 8977776111
- **Support Email:** injarapusivaraghava@gmail.com
- **Proprietor:** Injarapu Siva Raghava

---

## Core Modules
1. **Role-Based Access Views**: Separate interfaces for `Patient`, `Doctor`, `Hospital Administrator`, and `Super Admin`.
2. **Patient Registration & DPDP Act 2023 Controls**: Mobile OTP login UI (Firebase Phone Auth), Google Sign-In, District/Mandal/Village demographics, emergency contacts, data export (JSON), and data erasure.
3. **Doctor Appointments & Digital Prescriptions**: Verified practitioner directory (zero fabricated profiles), pending-until-confirmed appointment requests, rescheduling/cancellation, and doctor prescription issuance.
4. **Hospital & Laboratory Directories**: Public Govt Teaching Hospitals + admin-verified facilities, Google Maps directions, lab test catalog, and booking status tracking.
5. **Emergency Ambulance Support**: Configurable `108`, `102`, and `112` one-touch dialing, family emergency contacts, optional GPS link sharing, and truthful operator-confirmed dispatch logging.
6. **Medicine Reminders**: Date/time schedules, Morning/Afternoon/Night slots, Taken/Missed/Pending tracking, browser notifications & Web Audio chime, refill alerts, and strict no-auto-dosage-change rule.
7. **AI Health Assistant**: Server-side Gemini integration (`/api/ai/health-assistant`) in Telugu & English with voice input/TTS, mandatory DPDP informed consent gate, non-diagnostic guardrails, and emergency 108/112 escalation.
8. **Digital Health Records & Google Drive Vault**: PDF/image uploads, Firebase Storage support, and direct Google Drive backup/sync (`Mana Health Connect` folder).
9. **Family Health & Child UIP Vaccines**: Multi-member profiles, senior citizen support mode, minor guardian consent controls, and UIP immunization tracking.
10. **Allied Services & Support**: Prescription-based pharmacy requests, physiotherapy & preventive packages directories, Telugu health education, and grievance portal.

---

## Environment Variables & Firebase Setup

### 1. Environment Variables
Set the following in your server environment / AI Studio Secrets:
- `GEMINI_API_KEY`: Google Gemini API key (used exclusively server-side in `server.ts`).
- `APP_URL`: Deployed application URL.

See `/.env.example`.

### 2. Firebase Configuration
Client Firebase configuration is loaded from `/firebase-applet-config.json` (project `charismatic-diorama-dq7jp`, Firestore database `ai-studio-manahealthconnec-6a4ac373-4e96-4ebd-82f3-9a5abee2643e`, region `asia-southeast1`).

#### 17 Firestore Collections & Security Rules
Defined in `/firebase-blueprint.json` and enforced by `/firestore.rules`:
`users`, `patient_profiles`, `family_members`, `doctors`, `hospitals`, `appointments`, `prescriptions`, `medication_schedules`, `health_records`, `lab_tests`, `ambulance_contacts`, `blood_donors`, `notifications`, `payments`, `complaints`, `consents`, `admin_users`.

#### Enabling Mobile OTP & Storage in Firebase Console
1. Open Firebase Console -> **Authentication -> Sign-in method**.
2. Enable **Phone** provider (and configure test numbers or Blaze billing for live SMS OTP) and **Google** provider.
3. Ensure **Firebase Storage** is initialized if uploading large PDFs directly to cloud storage buckets.

---

## External Integrations Status (Transparency Notice)
- **ABDM / ABHA**: Data models and consent structure are ready; **live NHA ABDM APIs are NOT connected yet**.
- **Payments**: Subscription tiers run in **Sandbox Mode only** until production merchant credentials and RBI gateway keys are configured.
- **Phone OTP**: Requires enabling the Phone Auth provider in Firebase Console for live SMS delivery.

---

## Local Development & Build
```bash
npm install
npm run dev       # Runs Express + Vite on port 3000
npm run build     # Builds production frontend bundle
npm start         # Starts production server
```

## Android APK Project Export
Click **Android APK** in the app header to download the ready-to-compile Android Studio WebView Gradle project (`com.manahealth.connect`) with `TEL`, `CALL_PHONE`, `ACCESS_FINE_LOCATION`, `RECORD_AUDIO`, and `POST_NOTIFICATIONS` support.
