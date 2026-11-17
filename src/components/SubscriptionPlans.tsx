import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { healthStore } from '../services/healthStore';
import { Check, AlertCircle, Sparkles, CheckCircle2, X } from 'lucide-react';

interface PlanOption {
  id: 'free' | 'basic' | 'premium' | 'family';
  name: string;
  nameTe: string;
  price: number;
  period: string;
  badge?: string;
  popular?: boolean;
  features: string[];
}

export const SubscriptionPlans: React.FC = () => {
  const { language } = useLanguage();
  const [activePlan, setActivePlan] = useState<'free' | 'basic' | 'premium' | 'family'>(healthStore.activePlan);
  const [pendingPlan, setPendingPlan] = useState<PlanOption | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    return healthStore.subscribe(() => {
      setActivePlan(healthStore.activePlan);
    });
  }, []);

  const plans: PlanOption[] = [
    {
      id: 'free',
      name: 'Free (ఉచితం)',
      nameTe: 'పౌర సంక్షేమం (ఉచితం)',
      price: 0,
      period: 'Lifetime Free',
      badge: 'Civic Healthcare',
      features: [
        '108, 102 & 112 Emergency Ambulance Call Desk',
        'Statewide Government Hospitals Directory',
        'Local Health Records Locker & Google Drive Vault',
        'Bilingual Gemini AI Health Education (with consent)',
        'Blood Donor Directory Access'
      ]
    },
    {
      id: 'basic',
      name: 'Basic Health',
      nameTe: 'బేసిక్ కేర్',
      price: 99,
      period: 'per month',
      features: [
        'All Free Tier features included',
        'Extended Medicine Dose Reminders & Alarms',
        'Manage up to 2 Family Member Profiles',
        'Priority Clinic OPD Request Routing',
        'Prescription Request Tracking'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Health',
      nameTe: 'ప్రీమియం కేర్',
      price: 249,
      period: 'per month',
      badge: 'Most Popular',
      popular: true,
      features: [
        'All Basic Tier features included',
        'Full Bilingual Voice AI Health Education',
        'Unlimited Digital Health Locker Organization',
        'Teleconsultation Support (where offered by doctors)',
        'Preventive Care Tracking'
      ]
    },
    {
      id: 'family',
      name: 'Family Wellness',
      nameTe: 'సంపూర్ణ కుటుంబ రక్ష',
      price: 499,
      period: 'per month',
      features: [
        'All Premium Tier features for up to 6 members',
        'Senior Citizen Dedicated Chronic Care Mode',
        'Child UIP Vaccination Schedule Tracking',
        'Guardian Consent Controls for Minors',
        'Dedicated Helpdesk Priority (+91 8977776111)'
      ]
    }
  ];

  const handleSelectPlan = (plan: PlanOption) => {
    if (plan.price === 0) {
      healthStore.recordSandboxPlan('free', 0);
      setNotice(
        language === 'te'
          ? 'ఉచిత పౌర ప్రణాళిక (Free Tier) యాక్టివ్‌లో ఉంది.'
          : 'Free Citizen Tier is active for all essential healthcare services.'
      );
      return;
    }
    setPendingPlan(plan);
  };

  const handleConfirmSandboxPlan = () => {
    if (!pendingPlan) return;
    healthStore.recordSandboxPlan(pendingPlan.id, pendingPlan.price);
    healthStore.addNotification({
      title: 'Sandbox Plan Enabled',
      message: `${pendingPlan.name} (₹${pendingPlan.price}/mo) recorded in sandbox test mode. No real charge processed.`,
      type: 'general',
      userId: healthStore.currentUser.uid
    });
    setNotice(
      language === 'te'
        ? `"${pendingPlan.name}" శాండ్‌బాక్స్/టెస్ట్ మోడ్‌లో నమోదు చేయబడింది (ఎటువంటి అసలు చెల్లింపు జరగలేదు).`
        : `"${pendingPlan.name}" activated in Sandbox Test Mode (no real payment processed).`
    );
    setPendingPlan(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>OPTIONAL CITIZEN & FAMILY SUBSCRIPTION TIERS</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-gray-900">
          {language === 'te' ? 'మన ఆరోగ్య సేవలు – సభ్యత్వ ప్రణాళికలు' : 'Optional Healthcare Subscription Plans'}
        </h1>
        <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
          {language === 'te'
            ? 'అత్యవసర 108 అంబులెన్స్, ప్రభుత్వ ఆసుపత్రులు మరియు ప్రాథమిక ఆరోగ్య సేవలు అందరికీ ఎల్లప్పుడూ ఉచితం.'
            : 'Essential emergency ambulance and government hospital directories remain 100% free forever.'}
        </p>
      </div>

      {/* Strict Payment Gateway Honesty Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">
            {language === 'te' ? 'పేమెంట్ గేట్‌వే స్థితి (Sandbox Mode Only):' : 'PAYMENT GATEWAY STATUS: SANDBOX MODE ONLY'}
          </p>
          <p className="text-[11px] leading-relaxed">
            {language === 'te'
              ? 'అధికారిక మర్చంట్ పేమెంట్ గేట్‌వే (Razorpay/UPI) మరియు నిబంధనలు కాన్ఫిగర్ అయ్యే వరకు ఎటువంటి నిజమైన ఆన్‌లైన్ చెల్లింపులు తీసుకోబడవు. ప్రస్తుతం ఇది శాండ్‌బాక్స్ టెస్ట్ మోడ్‌లో మాత్రమే పనిచేస్తుంది.'
              : 'Live payment gateway credentials and merchant terms are NOT configured yet. All paid plan activations run strictly in non-billing sandbox mode.'}
          </p>
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

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => {
          const isCurrent = activePlan === p.id;
          return (
            <div
              key={p.id}
              className={`rounded-3xl p-6 flex flex-col justify-between space-y-6 transition relative ${
                p.popular
                  ? 'bg-gradient-to-b from-emerald-900 to-teal-950 text-white shadow-xl ring-2 ring-emerald-500'
                  : 'bg-white border border-gray-200 hover:border-emerald-300 text-gray-900 shadow-sm'
              }`}
            >
              {p.badge && (
                <span
                  className={`absolute -top-3 left-1/2 transform -translate-x-1/2 text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-xs ${
                    p.popular ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {p.badge}
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-lg">{language === 'te' ? p.nameTe : p.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-black">{p.price === 0 ? 'FREE' : `₹${p.price}`}</span>
                    <span className={`text-xs ${p.popular ? 'text-emerald-300' : 'text-gray-400'}`}>
                      /{p.period}
                    </span>
                  </div>
                </div>

                <div className={`border-t pt-4 space-y-2.5 text-xs ${p.popular ? 'border-emerald-800' : 'border-gray-100'}`}>
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${p.popular ? 'text-amber-400' : 'text-emerald-600'}`} />
                      <span className={p.popular ? 'text-emerald-100' : 'text-gray-600'}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan(p)}
                className={`w-full py-3 rounded-2xl font-bold text-xs transition shadow-md ${
                  isCurrent
                    ? 'bg-emerald-600 text-white cursor-default'
                    : p.popular
                    ? 'bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                {isCurrent ? 'Active Plan' : p.price === 0 ? 'Select Free Tier' : `Try ${p.name} (Sandbox)`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Sandbox Confirmation Modal */}
      {pendingPlan && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Confirm Sandbox Plan Selection</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              You selected <strong>{pendingPlan.name} (₹{pendingPlan.price}/mo)</strong>. Because live merchant payment credentials are not configured, this activates purely in <strong>Sandbox Mode</strong> with zero real charge.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingPlan(null)}
                className="flex-1 py-2.5 rounded-2xl border border-gray-300 text-gray-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSandboxPlan}
                className="flex-1 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
              >
                Activate Sandbox Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
