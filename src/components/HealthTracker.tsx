import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { healthStore } from '../services/healthStore';
import { HealthMetric } from '../types';
import {
  Activity,
  Heart,
  Droplet,
  Scale,
  Plus,
  TrendingUp,
  Apple,
  Info,
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';

export const HealthTracker: React.FC = () => {
  const { language, t } = useLanguage();
  const [metrics, setMetrics] = useState<HealthMetric[]>(healthStore.metrics);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [sugar, setSugar] = useState<number>(100);
  const [sugarType, setSugarType] = useState<HealthMetric['sugarType']>('fasting');
  const [heartRate, setHeartRate] = useState<number>(72);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    return healthStore.subscribe(() => {
      setMetrics([...healthStore.metrics]);
    });
  }, []);

  const handleAddMetric = (e: React.FormEvent) => {
    e.preventDefault();

    healthStore.addMetric({
      patientId: healthStore.currentUser.uid,
      date: new Date().toISOString().split('T')[0],
      systolicBp: Number(systolic),
      diastolicBp: Number(diastolic),
      bloodSugar: Number(sugar),
      sugarType,
      heartRate: Number(heartRate),
      weightKg: Number(weightKg),
      notes: notes.trim()
    });

    setNotes('');
    setShowAddModal(false);
  };

  const latest = metrics[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
            <Activity className="w-4 h-4" />
            <span>VITAL HEALTH PARAMETERS & NUTRITION MONITOR</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            {language === 'te' ? 'ఆరోగ్య ట్రాకర్ & ఆహార నియమాలు' : 'Vitals Health Tracker & Nutrition Guide'}
          </h1>
          <p className="text-xs text-gray-500">
            {language === 'te'
              ? 'రక్తపోటు (BP), షుగర్ స్థాయిలు, బరువు రికార్డులను పర్యవేక్షించండి.'
              : 'Monitor cardiovascular vitals, glycaemic levels, weight trends, and regional dietary guidance.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-5 rounded-2xl flex items-center gap-2 text-xs shadow-md transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'te' ? 'కొత్త రీడింగ్ నమోదు చేయండి' : 'Log Daily Vitals'}</span>
        </button>
      </div>

      {/* 4 Cards: BP, Sugar, Heart Rate, Weight */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* BP */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-xs font-bold text-gray-500">రక్తపోటు (Blood Pressure)</span>
            <Heart className="w-4 h-4 fill-rose-50" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {latest ? `${latest.systolicBp}/${latest.diastolicBp}` : '--/--'}{' '}
            <span className="text-xs font-normal text-gray-400">mmHg</span>
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{latest ? `Logged ${latest.date}` : 'No reading logged'}</span>
          </p>
        </div>

        {/* Blood Sugar */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold text-gray-500">రక్తంలో చక్కెర (Sugar)</span>
            <Droplet className="w-4 h-4 fill-blue-50" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {latest ? latest.bloodSugar : '--'}{' '}
            <span className="text-xs font-normal text-gray-400">mg/dL</span>
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold capitalize">
            {latest ? `${latest.sugarType} reading` : 'No reading logged'}
          </p>
        </div>

        {/* Heart Rate */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold text-gray-500">గుండె వేగం (Pulse)</span>
            <Activity className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {latest ? latest.heartRate : '--'}{' '}
            <span className="text-xs font-normal text-gray-400">BPM</span>
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold">
            {latest ? 'Recorded Pulse' : 'No reading logged'}
          </p>
        </div>

        {/* Weight */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold text-gray-500">శరీర బరువు (Weight)</span>
            <Scale className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {latest ? latest.weightKg : '--'}{' '}
            <span className="text-xs font-normal text-gray-400">kg</span>
          </p>
          <p className="text-[11px] text-gray-500 font-semibold">
            {latest ? `Recorded ${latest.date}` : 'No reading logged'}
          </p>
        </div>
      </div>

      {/* Nutrition Guidelines for Andhra Pradesh & Telangana Diets */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center">
            <Apple className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {language === 'te' ? 'ఆరోగ్యకరమైన ఆహార నియమాలు (Telugu Healthy Diet)' : 'Nutrition & Healthy Diet Plan'}
            </h2>
            <p className="text-xs text-gray-500">
              {language === 'te'
                ? 'షుగర్, బీపీ మరియు గుండె సంరక్షణ కోసం మన సంప్రదాయ పోషకాహార చిట్కాలు'
                : 'Culturally adapted diet guidance for diabetes, hypertension, and cardiac health'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-emerald-100 space-y-2">
            <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
              <span>🌾 షుగర్ రోగుల ఆహారం (Diabetic Diet)</span>
            </h4>
            <ul className="space-y-1 text-gray-600 list-disc list-inside">
              <li>తెల్ల బియ్యం బదులు కొర్రలు, రాగులు, జొన్నలు వాడండి.</li>
              <li>చేదు పొట్లకాయ, కాకరకాయ, బీరకాయ మరియు ఆకుకూరలు.</li>
              <li>స్వీట్లు, బేకరీ వస్తువులు, ప్యాక్డ్ పానీయాలు నివారించండి.</li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-100 space-y-2">
            <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
              <span>❤️ గుండె & బీపీ రక్షణ (Heart & BP Diet)</span>
            </h4>
            <ul className="space-y-1 text-gray-600 list-disc list-inside">
              <li>రోజువారీ వంటల్లో ఉప్పు (Sodium) తగ్గించండి.</li>
              <li>ఊరగాయలు, అప్పడాలు, పచ్చళ్లు పూర్తిగా తగ్గించండి.</li>
              <li>ప్రతిరోజూ 30 నిమిషాలు వేగంగా నడక (Brisk Walk).</li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-100 space-y-2">
            <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
              <span>🤰 గర్భిణీ స్త్రీల పోషకాహారం (Maternal Diet)</span>
            </h4>
            <ul className="space-y-1 text-gray-600 list-disc list-inside">
              <li>ఐరన్ మరియు ఫోలిక్ యాసిడ్ కోసం పాలకూర, తోటకూర.</li>
              <li>రోజూ ఒక ఉడికించిన గుడ్డు, మొలకెత్తిన గింజలు.</li>
              <li>తాజా పండ్లు (ఆపిల్, దానిమ్మ, జామ) మరియు స్వచ్ఛమైన పాలు.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Log History */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 text-base">రీడింగ్స్ రికార్డు హిస్టరీ (Vitals History Log)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
              <tr>
                <th className="p-3">తేదీ (Date)</th>
                <th className="p-3">BP (mmHg)</th>
                <th className="p-3">షుగర్ (Sugar)</th>
                <th className="p-3">పల్స్ (Pulse)</th>
                <th className="p-3">బరువు (Weight)</th>
                <th className="p-3">గమనికలు (Notes)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {metrics.map((m) => (
                <tr key={m.id} className="hover:bg-emerald-50/30">
                  <td className="p-3 font-semibold text-gray-900">{m.date}</td>
                  <td className="p-3 text-gray-700">{m.systolicBp}/{m.diastolicBp}</td>
                  <td className="p-3 text-gray-700">{m.bloodSugar} mg/dL ({m.sugarType})</td>
                  <td className="p-3 text-gray-700">{m.heartRate} bpm</td>
                  <td className="p-3 text-gray-700">{m.weightKg} kg</td>
                  <td className="p-3 text-gray-500">{m.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">
                {language === 'te' ? 'ఆరోగ్య కొలతలు నమోదు చేయండి' : 'Log Vitals'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMetric} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">సిస్టోలిక్ BP (Systolic):</label>
                  <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">డయాస్టోలిక్ BP (Diastolic):</label>
                  <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">బ్లడ్ షుగర్ (Sugar mg/dL):</label>
                  <input
                    type="number"
                    value={sugar}
                    onChange={(e) => setSugar(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">రకం (Type):</label>
                  <select
                    value={sugarType}
                    onChange={(e) => setSugarType(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="fasting">Fasting (పరగడుపున)</option>
                    <option value="post-prandial">Post-Prandial (భోజనం తర్వాత)</option>
                    <option value="random">Random</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">పల్స్ (Heart Rate bpm):</label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">బరువు (Weight kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">గమనికలు (Notes):</label>
                <input
                  type="text"
                  placeholder="e.g. ఉదయం నడక తర్వాత రీడింగ్..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
    </div>
  );
};
