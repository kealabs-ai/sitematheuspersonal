import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Scale, Ruler, Camera,
  Trophy, ChevronDown, Plus, X, Save, Upload, ImagePlus
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { progress as progressApi } from './services/alunoApi';
import { useBlockBack } from './hooks/useBlockBack';
import BottomNav from './BottomNav';
import AppFooter from './AppFooter';
import { ShimmerButton } from './components/magicui/shimmer-button';
import { AnimatedGradientText } from './components/magicui/animated-gradient-text';

// Formata qualquer string de data para pt-BR
const fmtDate = (raw) => {
  if (!raw) return '—';
  try {
    // dd-MM-YYYY ou dd/MM/YYYY
    const dmyMatch = raw.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
    if (dmyMatch) {
      const [, d, m, y] = dmyMatch;
      return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
    }
    // YYYY-MM (agrupado por mês)
    if (/^\d{4}-\d{2}$/.test(raw)) {
      const [y, m] = raw.split('-');
      return new Date(y, m - 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    }
    // YYYY-MM-DD ou ISO
    const d = new Date(raw);
    if (!isNaN(d)) return d.toLocaleDateString('pt-BR');
  } catch {}
  return raw;
};

const fmt2 = (v) => (typeof v === 'number' ? v.toFixed(2) : parseFloat(v || 0).toFixed(2));

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black border border-lime-green/40 px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-lime-green font-bold">{payload[0].value}{unit}</p>
    </div>
  );
};

const tabs = ['Peso', 'Força', 'Medidas', 'Fotos', 'Conquistas'];

export default function Evolucao() {
  useBlockBack();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Peso');
  const [weightData, setWeightData] = useState([]);
  const [weightPeriod, setWeightPeriod] = useState('6m');
  const [weightSummary, setWeightSummary] = useState(null);
  const [strengthData, setStrengthData] = useState({});
  const [records, setRecords] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showExSelect, setShowExSelect] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [badges, setBadges]           = useState({ earned: [], locked: [] });
  const [loading, setLoading]         = useState(false);
  const [modalPeso, setModalPeso]     = useState(false);
  const [modalMedida, setModalMedida] = useState(false);
  const [novoPeso, setNovoPeso]       = useState('');
  const [novaData, setNovaData]       = useState(new Date().toISOString().split('T')[0]);
  const [novaMedida, setNovaMedida]   = useState({ tipo: 'Cintura', valor: '', unidade: 'cm' });
  const [saving, setSaving]           = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]); // [{ name, status: 'pending'|'ok'|'error' }]
  const [photoPreview, setPhotoPreview]     = useState(null); // { src, file } para preview
  const [deletingPhoto, setDeletingPhoto]   = useState(null);

  useEffect(() => { loadTab(tab); }, [tab, weightPeriod]);

  const loadTab = async (t) => {
    setLoading(true);
    try {
      if (t === 'Peso') {
        const d = await progressApi.weight(weightPeriod);
        // Normaliza campos: API pode retornar weight_kg/recorded_at ou weight/date
        const raw = d.data ?? d.history ?? d.weights ?? [];
        const normalized = raw.map(w => ({
          date:   w.date ?? w.recorded_at ?? w.created_at ?? '—',
          weight: parseFloat(w.weight ?? w.weight_kg ?? 0),
        })).filter(w => w.weight > 0);
        setWeightData(normalized);
        setWeightSummary(d.summary ?? null);
      } else if (t === 'Força') {
        const d = await progressApi.strength();
        // API pode retornar { records: [...] } ou array direto
        const list = d.records ?? d.personal_records ?? (Array.isArray(d) ? d : []);
        setRecords(list);
        if (list.length && !selectedExercise) {
          setSelectedExercise(list[0].exercise_name);
        }
      } else if (t === 'Medidas') {
        const d = await progressApi.measurements();
        // API retorna array de body_metrics ou { measurements: [...] }
        const raw = d.measurements ?? d.metrics ?? d.history ?? (Array.isArray(d) ? d : []);
        // Normaliza para { label, value, unit, recorded_at, prev, diff }
        const LABELS = { weight: 'Peso', height: 'Altura', body_fat: '% Gordura', waist: 'Cintura', arm: 'Braço', leg: 'Perna', chest: 'Peito' };
        const UNITS  = { weight: 'kg', height: 'cm', body_fat: '%', waist: 'cm', arm: 'cm', leg: 'cm', chest: 'cm' };
        if (raw.length > 0 && ('weight' in raw[0] || 'waist' in raw[0])) {
          // Formato body_metrics: cada item é uma medição completa
          const latest = raw[raw.length - 1];
          const first  = raw[0];
          const normalized = Object.keys(LABELS)
            .filter(k => latest[k] != null)
            .map(k => ({
              label: LABELS[k],
              unit:  UNITS[k],
              value: latest[k],
              prev:  first[k] ?? null,
              diff:  first[k] != null ? `${(latest[k] - first[k]) >= 0 ? '+' : ''}${(latest[k] - first[k]).toFixed(1)} ${UNITS[k]}` : null,
              recorded_at: latest.recorded_at,
            }));
          setMeasurements(normalized);
        } else {
          setMeasurements(raw);
        }
      } else if (t === 'Fotos') {
        const d = await progressApi.photos();
        setPhotos(d.photos ?? []);
      } else if (t === 'Conquistas') {
        const d = await progressApi.badges();
        setBadges({ earned: d.earned ?? [], locked: d.locked ?? [] });
      }
    } catch {}
    setLoading(false);
  };

  const loadStrengthByEx = async (ex) => {
    if (strengthData[ex]) return;
    const d = await progressApi.strengthByEx(ex).catch(() => ({ data: [] }));
    // Normaliza: data pode ser array de { date, weight } ou { date, weight_kg }
    const raw = d.data ?? d.history ?? (Array.isArray(d) ? d : []);
    const normalized = raw.map(r => ({
      date:   r.date ?? r.recorded_at ?? '',
      weight: parseFloat(r.weight ?? r.weight_kg ?? 0),
    }));
    setStrengthData(prev => ({ ...prev, [ex]: { ...d, data: normalized } }));
  };

  const savePeso = async () => {
    if (!novoPeso) return;
    setSaving(true);
    await progressApi.addWeight(parseFloat(novoPeso), novaData).catch(() => {});
    setSaving(false);
    setModalPeso(false);
    setNovoPeso('');
    loadTab('Peso');
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Valida tipo e tamanho (max 5MB por foto)
    const valid = files.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    if (!valid.length) return;

    setUploadingPhoto(true);
    setUploadProgress(valid.map(f => ({ name: f.name, status: 'pending' })));

    const toBase64 = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    await Promise.all(valid.map(async (file, idx) => {
      try {
        const photo_base64 = await toBase64(file);
        await progressApi.addPhoto({
          photo_url: photo_base64,
          label: file.name,
          recorded_at: new Date().toISOString().split('T')[0],
        });
        setUploadProgress(prev => prev.map((p, i) => i === idx ? { ...p, status: 'ok' } : p));
      } catch {
        setUploadProgress(prev => prev.map((p, i) => i === idx ? { ...p, status: 'error' } : p));
      }
    }));

    e.target.value = '';
    setUploadingPhoto(false);
    setTimeout(() => setUploadProgress([]), 2000);
    loadTab('Fotos');
  };

  const handleDeletePhoto = async (photo) => {
    if (!photo.id) return;
    setDeletingPhoto(photo.id);
    await progressApi.deletePhoto(photo.id).catch(() => {});
    setPhotos(prev => prev.filter(p => p.id !== photo.id));
    setDeletingPhoto(null);
  };

  const saveMedida = async () => {
    if (!novaMedida.valor) return;
    setSaving(true);
    await progressApi.addMetric?.({ type: novaMedida.tipo, value: parseFloat(novaMedida.valor), unit: novaMedida.unidade, recorded_at: novaData }).catch(() => {});
    setSaving(false);
    setModalMedida(false);
    setNovaMedida({ tipo: 'Cintura', valor: '', unidade: 'cm' });
    loadTab('Medidas');
  };

  const handleSelectExercise = (ex) => {
    setSelectedExercise(ex);
    setShowExSelect(false);
    loadStrengthByEx(ex);
  };

  useEffect(() => {
    if (tab === 'Força' && selectedExercise) loadStrengthByEx(selectedExercise);
  }, [selectedExercise]);

  const exData = selectedExercise ? (strengthData[selectedExercise]?.data ?? []) : [];
  const exRecord = selectedExercise ? (strengthData[selectedExercise]?.record ?? '—') : '—';
  const exGain = selectedExercise ? (strengthData[selectedExercise]?.gain ?? 0) : 0;

  return (
    <div className="min-h-screen sport-bg text-white font-inter pt-[60px] md:pt-[68px] pb-[60px] md:pb-10">

      <main className="max-w-2xl md:max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-5">

        {/* Resumo rápido */}
        {weightSummary && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-blue-400/10 border border-blue-400/30 p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Sua jornada</p>
              <p className="text-white font-bebas text-2xl mt-0.5">Evolução de peso</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bebas text-lime-green">{weightSummary.diff > 0 ? '+' : ''}{weightSummary.diff} kg</p>
              <p className="text-gray-400 text-xs">de progresso</p>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all border
                ${tab === t
                  ? 'bg-lime-green text-black border-lime-green'
                  : 'bg-dark-card border-dark-border text-gray-400 hover:border-lime-green/50 hover:text-white'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab: Peso */}
        {tab === 'Peso' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <ShimmerButton onClick={() => setModalPeso(true)} className="w-full justify-center" shimmerColor="#ffffff" background="rgba(0,180,216,1)">
              <Scale size={16} /> Registrar Peso
            </ShimmerButton>
            <div className="relative bg-dark-card border border-dark-border p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-white">Evolução do Peso (kg)</p>
                <div className="flex gap-1">
                  {['1m','3m','6m','1y'].map(p => (
                    <button key={p} onClick={() => setWeightPeriod(p)}
                      className={`text-[10px] px-2 py-1 border font-bold uppercase transition-all
                        ${weightPeriod === p ? 'bg-lime-green text-black border-lime-green' : 'border-dark-border text-gray-500 hover:border-lime-green/50'}`}
                    >{p}</button>
                  ))}
                </div>
              </div>
              {weightData.length > 0 && (() => {
                const atual  = weightData[weightData.length - 1].weight;
                const inicio = weightData[0].weight;
                const diff   = atual - inicio;
                return (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-black border border-dark-border p-2 text-center">
                      <p className="text-gray-500 text-[10px] uppercase tracking-wide">Início</p>
                      <p className="text-white font-bebas text-lg">{fmt2(inicio)} kg</p>
                    </div>
                    <div className="bg-black border border-dark-border p-2 text-center">
                      <p className="text-gray-500 text-[10px] uppercase tracking-wide">Atual</p>
                      <p className="text-lime-green font-bebas text-lg">{fmt2(atual)} kg</p>
                    </div>
                    <div className="bg-black border border-dark-border p-2 text-center">
                      <p className="text-gray-500 text-[10px] uppercase tracking-wide">Variação</p>
                      <p className={`font-bebas text-lg ${diff < 0 ? 'text-lime-green' : diff > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {diff > 0 ? '+' : ''}{fmt2(diff)} kg
                      </p>
                    </div>
                  </div>
                );
              })()}
              {loading ? <p className="text-center text-gray-600 text-xs py-8">Carregando...</p> : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={weightData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00B4D8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                    <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} tickFormatter={v => fmt2(v)} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={45} />
                    <Tooltip content={<CustomTooltip unit=" kg" />} />
                    <Area type="monotone" dataKey="weight" stroke="#00B4D8" strokeWidth={2} fill="url(#weightGrad)" dot={{ fill: '#00B4D8', r: 3 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="relative bg-dark-card border border-dark-border p-4 overflow-hidden">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Histórico de Pesagem</p>
              {loading ? (
                <p className="text-center text-gray-600 text-xs py-6">Carregando...</p>
              ) : weightData.length === 0 ? (
                <div className="text-center py-6">
                  <Scale size={32} className="text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Nenhum registro ainda</p>
                  <p className="text-gray-600 text-xs mt-1">Registre seu peso para acompanhar a evolução</p>
                </div>
              ) : (
                <div className="divide-y divide-dark-border">
                  {[...weightData].reverse().map((w, i, arr) => {
                    const prev = arr[i + 1];
                    const diff = prev ? (w.weight - prev.weight) : null;
                    const diffColor = diff === null ? '' : diff < 0 ? 'text-lime-green' : diff > 0 ? 'text-red-400' : 'text-gray-500';
                    const diffLabel = diff === null ? null : diff === 0 ? '=' : `${diff > 0 ? '+' : ''}${fmt2(diff)} kg`;
                    const dateLabel = fmtDate(w.date);
                    return (
                      <div key={i} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-white text-sm font-semibold">{fmt2(w.weight)} kg</p>
                          <p className="text-gray-500 text-xs mt-0.5">{dateLabel}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {diffLabel && <span className={`text-xs font-bold ${diffColor}`}>{diffLabel}</span>}
                          {i === 0 && <span className="text-lime-green text-[10px] uppercase tracking-wide border border-lime-green/30 px-1.5 py-0.5">Atual</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab: Força */}
        {tab === 'Força' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {loading ? (
              <p className="text-center text-gray-600 text-xs py-8">Carregando...</p>
            ) : records.length === 0 ? (
              <div className="text-center py-10">
                <TrendingUp size={40} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Nenhum recorde registrado</p>
                <p className="text-gray-600 text-xs mt-1">Complete treinos para registrar sua evolução de carga</p>
              </div>
            ) : (
              <>
                <div className="relative">
                  <button onClick={() => setShowExSelect(!showExSelect)}
                    className="w-full bg-dark-card border border-dark-border p-3 flex items-center justify-between text-sm text-white hover:border-lime-green/50 transition-colors"
                  >
                    <span>{selectedExercise ?? 'Selecione um exercício'}</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${showExSelect ? 'rotate-180' : ''}`} />
                  </button>
                  {showExSelect && (
                    <div className="absolute top-full left-0 right-0 bg-black border border-dark-border z-10 max-h-48 overflow-y-auto">
                      {records.map(r => (
                        <button key={r.exercise_name} onClick={() => handleSelectExercise(r.exercise_name)}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-lime-green/10 hover:text-lime-green transition-colors border-b border-dark-border last:border-0"
                        >{r.exercise_name}</button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedExercise && (
                  <div className="relative bg-dark-card border border-dark-border p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-white">{selectedExercise}</p>
                      <span className="text-lime-green font-bebas text-xl">+{exGain} kg</span>
                    </div>
                    <p className="text-gray-500 text-xs mb-4">Recorde: <span className="text-white font-bold">{exRecord} kg</span></p>
                    {exData.length === 0 ? (
                      <p className="text-center text-gray-600 text-xs py-6">Sem histórico de carga para este exercício</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={exData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                          <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                          <Tooltip content={<CustomTooltip unit=" kg" />} />
                          <Line type="monotone" dataKey="weight" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
                <div className="relative bg-dark-card border border-dark-border p-4 overflow-hidden">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Recordes Pessoais</p>
                  <div className="divide-y divide-dark-border">
                    {records.map((r, i) => (
                      <button key={i} onClick={() => handleSelectExercise(r.exercise_name)}
                        className={`w-full flex items-center justify-between py-3 hover:bg-white/5 transition-colors ${
                          selectedExercise === r.exercise_name ? 'text-lime-green' : ''
                        }`}>
                        <span className="text-sm">{r.exercise_name}</span>
                        <span className="text-blue-400 font-bold text-sm">{r.weight_kg ?? r.record ?? '—'} kg</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Tab: Medidas */}
        {tab === 'Medidas' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <ShimmerButton onClick={() => setModalMedida(true)} className="w-full justify-center" shimmerColor="#ffffff" background="rgba(0,180,216,1)">
              <Ruler size={16} /> Registrar Medida
            </ShimmerButton>
            {loading ? (
              <p className="text-center text-gray-600 text-xs py-8">Carregando...</p>
            ) : measurements.length === 0 ? (
              <div className="text-center py-10">
                <Ruler size={40} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Nenhuma medida registrada</p>
                <p className="text-gray-600 text-xs mt-1">Registre suas medidas para acompanhar a evolução</p>
              </div>
            ) : (
              <div className="bg-dark-card border border-dark-border divide-y divide-dark-border">
                {measurements.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between px-4 py-3.5"
                  >
                    <div>
                      <p className="text-white text-sm font-semibold">{m.label ?? m.type ?? '—'}</p>
                      {m.recorded_at && <p className="text-gray-600 text-xs mt-0.5">{fmtDate(m.recorded_at)}</p>}
                      {m.prev != null && <p className="text-gray-500 text-xs">Inicial: {m.prev} {m.unit ?? ''}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bebas text-2xl">{m.value} <span className="text-gray-500 text-sm font-inter">{m.unit ?? ''}</span></p>
                      {m.diff && (
                        <p className={`text-xs font-bold ${
                          m.diff.startsWith('-') ? 'text-lime-green' : m.diff.startsWith('+') && m.diff !== '+0.0' ? 'text-red-400' : 'text-gray-500'
                        }`}>{m.diff}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Tab: Fotos */}
        {tab === 'Fotos' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

            {/* Área de upload */}
            <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed p-6 cursor-pointer transition-all
              ${uploadingPhoto ? 'border-lime-green/50 bg-lime-green/5 cursor-not-allowed' : 'border-dark-border hover:border-lime-green/40 hover:bg-white/3'}`}>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
              />
              {uploadingPhoto ? (
                <>
                  <Upload size={28} className="text-lime-green animate-bounce" />
                  <p className="text-lime-green text-sm font-semibold">Enviando fotos...</p>
                  {uploadProgress.length > 0 && (
                    <div className="w-full max-w-xs space-y-1 mt-1">
                      {uploadProgress.map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px]">
                          <span className="text-gray-400 truncate max-w-[180px]">{p.name}</span>
                          <span className={p.status === 'ok' ? 'text-lime-green' : p.status === 'error' ? 'text-red-400' : 'text-gray-500'}>
                            {p.status === 'ok' ? '✓' : p.status === 'error' ? '✗' : '...'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <ImagePlus size={28} className="text-gray-500" />
                  <div className="text-center">
                    <p className="text-white text-sm font-semibold">Adicionar fotos ao álbum</p>
                    <p className="text-gray-500 text-xs mt-1">Toque para selecionar · múltiplas fotos · máx. 5MB cada</p>
                  </div>
                </>
              )}
            </label>

            {/* Grid de fotos */}
            {loading ? (
              <p className="text-center text-gray-600 text-xs py-6">Carregando...</p>
            ) : photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p, i) => (
                  <motion.div
                    key={p.id ?? i}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                    className="aspect-[3/4] bg-dark-card border border-dark-border overflow-hidden relative group"
                  >
                    {/* Imagem */}
                    {(p.photo_url || p.photo_base64) ? (
                      <img
                        src={p.photo_url ?? p.photo_base64}
                        alt={p.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => setPhotoPreview({ src: p.photo_url ?? p.photo_base64, label: p.label, date: p.recorded_at })}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <Camera size={24} className="text-gray-600" />
                        <p className="text-gray-500 text-[10px] text-center px-2">{p.label}</p>
                      </div>
                    )}

                    {/* Data */}
                    {p.recorded_at && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                        <p className="text-gray-300 text-[9px]">{fmtDate(p.recorded_at)}</p>
                      </div>
                    )}

                    {/* Botão deletar */}
                    {p.id && (
                      <button
                        onClick={() => handleDeletePhoto(p)}
                        disabled={deletingPhoto === p.id}
                        className="absolute top-1 right-1 bg-black/70 text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                      >
                        {deletingPhoto === p.id
                          ? <span className="text-[9px] px-0.5">...</span>
                          : <X size={12} />}
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera size={40} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Nenhuma foto ainda</p>
                <p className="text-gray-600 text-xs mt-1">Adicione fotos para acompanhar sua evolução visual</p>
              </div>
            )}

            <p className="text-gray-600 text-xs text-center">🔒 Fotos privadas · visíveis apenas para você e seu personal</p>
          </motion.div>
        )}

        {/* Preview fullscreen */}
        <AnimatePresence>
          {photoPreview && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4"
              onClick={() => setPhotoPreview(null)}
            >
              <button className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
              <img
                src={photoPreview.src}
                alt={photoPreview.label}
                className="max-w-full max-h-[80vh] object-contain"
                onClick={e => e.stopPropagation()}
              />
              {photoPreview.date && (
                <p className="text-gray-500 text-xs mt-3">{fmtDate(photoPreview.date)}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab: Conquistas */}
        {tab === 'Conquistas' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-gray-400 text-xs uppercase tracking-widest">
              {badges.earned.length} de {badges.earned.length + badges.locked.length} conquistas desbloqueadas
            </p>
            <div className="w-full bg-dark-border h-2 mb-2">
              <div className="bg-lime-green h-2 transition-all"
                style={{ width: (badges.earned.length + badges.locked.length) > 0
                  ? `${(badges.earned.length / (badges.earned.length + badges.locked.length)) * 100}%` : '0%' }}
              />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[...badges.earned.map(b => ({ ...b, earned: true })), ...badges.locked.map(b => ({ ...b, earned: false }))].map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className={`flex items-center gap-4 p-4 border transition-all
                    ${b.earned ? 'border-lime-green/30 bg-lime-green/5' : 'border-dark-border opacity-40 grayscale'}`}
                >
                  <span className="text-3xl">{b.icon}</span>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${b.earned ? 'text-white' : 'text-gray-500'}`}>{b.name}</p>
                    <p className="text-gray-600 text-xs mt-0.5">{b.earned ? `Conquistado em ${b.earned_at ?? ''}` : 'Bloqueado'}</p>
                  </div>
                  {b.earned && <Trophy size={18} className="text-lime-green flex-shrink-0" />}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <p className="text-center text-gray-700 text-xs pb-4">
          <button onClick={() => navigate('/dashboard')} className="hover:text-lime-green transition-colors">
            ← Voltar ao Dashboard
          </button>
        </p>
      </main>

      {/* Modal: Adicionar Peso */}
      <AnimatePresence>
        {modalPeso && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4"
            style={{ paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px))' }}
            onClick={() => setModalPeso(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-card border border-lime-green/40 p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bebas uppercase text-lime-green flex items-center gap-2">
                  <Scale size={18} /> Registrar Peso
                </h3>
                <button onClick={() => setModalPeso(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1.5">Peso (kg)</label>
                  <input type="number" step="0.1" placeholder="Ex: 72.5"
                    value={novoPeso} onChange={e => setNovoPeso(e.target.value)}
                    className="w-full bg-black border border-dark-border text-white text-lg p-3 focus:outline-none focus:border-lime-green transition-colors text-center font-bebas"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1.5">Data</label>
                  <input type="date" value={novaData} onChange={e => setNovaData(e.target.value)}
                    className="w-full bg-black border border-dark-border text-white p-3 focus:outline-none focus:border-lime-green transition-colors"
                  />
                </div>
                <button onClick={savePeso} disabled={!novoPeso || saving}
                  className="w-full bg-lime-green text-black font-bold py-3 uppercase text-sm hover:bg-neon-green transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                  <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Peso'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Adicionar Medida */}
      <AnimatePresence>
        {modalMedida && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4"
            style={{ paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px))' }}
            onClick={() => setModalMedida(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-card border border-blue-400/40 p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bebas uppercase text-blue-400 flex items-center gap-2">
                  <Ruler size={18} /> Registrar Medida
                </h3>
                <button onClick={() => setModalMedida(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1.5">Tipo de medida</label>
                  <select value={novaMedida.tipo} onChange={e => setNovaMedida({ ...novaMedida, tipo: e.target.value })}
                    className="w-full bg-black border border-dark-border text-white p-3 focus:outline-none focus:border-blue-400 transition-colors">
                    {['Cintura','Quadril','Peito','Coxa','Braço','Panturrilha','Ombro','Abdome'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1.5">Valor (cm)</label>
                  <input type="number" step="0.1" placeholder="Ex: 85.0"
                    value={novaMedida.valor} onChange={e => setNovaMedida({ ...novaMedida, valor: e.target.value })}
                    className="w-full bg-black border border-dark-border text-white text-lg p-3 focus:outline-none focus:border-blue-400 transition-colors text-center font-bebas"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1.5">Data</label>
                  <input type="date" value={novaData} onChange={e => setNovaData(e.target.value)}
                    className="w-full bg-black border border-dark-border text-white p-3 focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                <button onClick={saveMedida} disabled={!novaMedida.valor || saving}
                  className="w-full bg-blue-400 text-black font-bold py-3 uppercase text-sm hover:bg-blue-300 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                  <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Medida'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AppFooter />
      <BottomNav />
    </div>
  );
}
