import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, FileText, AlertTriangle, X } from 'lucide-react';

interface LegalModalsProps {
  modalType: 'privacy' | 'terms' | 'disclaimer' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ modalType, onClose }) => {
  const { language, t } = useLanguage();

  if (!modalType) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {modalType === 'disclaimer' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
            {modalType === 'privacy' && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
            {modalType === 'terms' && <FileText className="w-5 h-5 text-teal-600" />}
            <h3 className="font-bold text-gray-900 text-base">
              {modalType === 'disclaimer' && (language === 'te' ? 'వైద్య హెచ్చరిక & నిరాకరణ' : 'Clinical Medical Disclaimer')}
              {modalType === 'privacy' && (language === 'te' ? 'గోప్యతా విధానం (DPDP Act 2023)' : 'Privacy Policy & Data Protection')}
              {modalType === 'terms' && (language === 'te' ? 'వినియోగ నిబంధనలు (Terms of Use)' : 'Terms of Use')}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-xs text-gray-700 leading-relaxed space-y-4">
          {modalType === 'disclaimer' && (
            <div className="space-y-3">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-950 font-bold">
                ⚠️ MANA HEALTH CONNECT (మన ఆరోగ్య సేవలు) IS AN EDUCATIONAL AND CARE COORDINATION PLATFORM. IT DOES NOT PROVIDE INDEPENDENT MEDICAL DIAGNOSES OR PRESCRIBE SCHEDULED DRUGS.
              </div>
              <p>
                1. <strong>No Doctor-Patient Privilege Established via AI:</strong> The artificial intelligence assistant and health glossary tools are intended solely for health awareness and terminology explanation. They cannot and do not replace physical clinical examination by a registered medical practitioner.
              </p>
              <p>
                2. <strong>Emergency Protocol:</strong> In case of chest tightness, acute shortness of breath, loss of speech, trauma, or severe hemorrhage, users must NOT rely on the app. Immediately dial <strong>108</strong> (Toll-Free Ambulance) or <strong>112</strong> or proceed to the nearest emergency medical center.
              </p>
              <p>
                3. <strong>Dosage Adherence:</strong> Users are strictly prohibited from modifying their medicine doses, skipping prescriptions, or self-administering medicines based on platform reminders without the explicit counsel of their physician.
              </p>
            </div>
          )}

          {modalType === 'privacy' && (
            <div className="space-y-3">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-emerald-950 font-bold">
                🔒 COMPLIANT WITH DIGITAL PERSONAL DATA PROTECTION (DPDP) ACT 2023 & NHA DIGITAL HEALTH GUIDELINES
              </div>
              <p>
                1. <strong>Data Collection and Purpose:</strong> We collect patient demographic identifiers, district/mandal coordinates, emergency contact phone numbers, and uploaded health records solely to enable medical appointment booking, emergency ambulance dispatch, and medicine reminder notifications.
              </p>
              <p>
                2. <strong>Storage & Encryption:</strong> All medical documents, diagnostic scan summaries, and prescriptions are stored using encrypted cloud buckets and secured with ABAC zero-trust Firebase Security Rules.
              </p>
              <p>
                3. <strong>Right to Correction & Deletion:</strong> Under Section 12 of the DPDP Act 2023, citizens possess the absolute right to review, rectify, or demand permanent erasure of their health data records from our servers at any time.
              </p>
              <p>
                4. <strong>Blood Donor Consent:</strong> Donor telephone numbers are displayed to citizens strictly upon informed consent voluntarily granted during registration.
              </p>
            </div>
          )}

          {modalType === 'terms' && (
            <div className="space-y-3">
              <p>
                1. <strong>Platform Acceptance:</strong> By accessing or using Mana Health Connect (మన ఆరోగ్య సేవలు), you agree to be bound by these Terms of Service and applicable laws of India.
              </p>
              <p>
                2. <strong>Verified Directory Integrity:</strong> All medical registrations, doctor credentials, and hospital infrastructure data are subject to periodic audit by our healthcare administration team. Impersonation of licensed practitioners is strictly penalized.
              </p>
              <p>
                3. <strong>Commercial Subscription Gateway:</strong> Subscription tiers provide digital workflow conveniences (e.g. enhanced health storage, priority home phlebotomy visits). Vital emergency ambulance connections (108/102) remain permanently free to all citizens.
              </p>
              <p>
                4. <strong>Grievance Officer:</strong> Injarapu Siva Raghava, Registered Office: Turangi, Kakinada, Andhra Pradesh - 533016. Email: injarapusivaraghava@gmail.com.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition"
          >
            అంగీకరిస్తున్నాను (I Understand & Accept)
          </button>
        </div>
      </div>
    </div>
  );
};
