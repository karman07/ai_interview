import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Download, Edit3, FileText, Briefcase, Loader2,
  Plus, Trash2, X, Wand2, UploadCloud, Palette,
  CheckCircle, Calendar, History,
  PlusCircle, LayoutTemplate, AlertCircle, Search,
  FolderOpen, Zap, Clock, Type, Star, TrendingUp, Award,
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import { CoverLetterApi } from '@/api/coverLetter';
import { renderTemplate, TEMPLATE_LIST } from '@/components/CoverLetter/templates/CoverLetterTemplates';
import { CoverLetterData, CoverLetterSettings } from '@/types/CoverLetter';
import { useResume } from '@/contexts/ResumeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Resume } from '@/types/Resume';
import { User } from '@/types/user';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, PieChart, Pie, Legend,
  AreaChart, Area,
} from 'recharts';

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface SavedCoverLetter {
  id: string;
  createdAt: string;
  companyName: string;
  roleTitle: string;
  resumeFilename?: string;
  resumeId?: string;
  coverLetter: CoverLetterData;
  settings: CoverLetterSettings;
}

/* ═══════════════════════════════════════════════════════════
   HISTORY HELPERS
═══════════════════════════════════════════════════════════ */
const histKey = (uid: string) => `cl_hist_${uid}`;
const loadHist = (uid: string): SavedCoverLetter[] => {
  try { return JSON.parse(localStorage.getItem(histKey(uid)) || '[]'); }
  catch { return []; }
};
const persistHist = (uid: string, list: SavedCoverLetter[]) =>
  localStorage.setItem(histKey(uid), JSON.stringify(list.slice(0, 50)));

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const DEFAULT_SETTINGS: CoverLetterSettings = {
  selectedTemplate: 'Professional',
  primaryColor: '#1d4ed8',
  accentColor: '#3b82f6',
  fontFamily: 'Inter',
};

const TEMPLATE_META: Record<string, { tagline: string; badge: string }> = {
  Professional: { tagline: 'Classic corporate',  badge: 'bg-slate-100 text-slate-600'    },
  Modern:       { tagline: 'Left-bar accent',    badge: 'bg-indigo-50 text-indigo-600'   },
  Creative:     { tagline: 'Gradient header',    badge: 'bg-violet-50 text-violet-600'   },
  Minimal:      { tagline: 'Ultra-clean',        badge: 'bg-gray-100 text-gray-500'      },
  Executive:    { tagline: 'Dark premium',       badge: 'bg-amber-50 text-amber-700'     },
};

const FONTS = ['Inter', 'Georgia', 'Times New Roman', 'Helvetica', 'Garamond'];
const PRESET_COLORS = ['#1d4ed8','#2563eb','#0ea5e9','#7c3aed','#db2777','#059669','#d97706','#1a1a2e'];

/* ═══════════════════════════════════════════════════════════
   PDF HELPER
═══════════════════════════════════════════════════════════ */
function downloadPDF(id: string, filename: string) {
  const el = document.getElementById(id);
  if (!el) return;
  html2pdf().set({
    margin: 0, filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' },
  }).from(el).save();
}

/* ═══════════════════════════════════════════════════════════
   TEMPLATE THUMBNAIL (CSS-only, for history cards + editor)
═══════════════════════════════════════════════════════════ */
const TemplateThumbnail: React.FC<{ name: string }> = ({ name }) => {
  const thumbs: Record<string, React.ReactNode> = {
    Professional: (
      <div className="w-full h-full bg-white rounded flex flex-col p-1.5 gap-1">
        <div className="h-3 bg-slate-700 rounded-sm" />
        <div className="space-y-0.5 mt-1">
          <div className="h-1 bg-gray-300 rounded w-3/4" />
          <div className="h-1 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="mt-1 space-y-0.5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-0.5 bg-gray-200 rounded" />)}
        </div>
      </div>
    ),
    Modern: (
      <div className="w-full h-full bg-white rounded flex overflow-hidden">
        <div className="w-2 bg-indigo-600 flex-shrink-0 rounded-l" />
        <div className="flex-1 p-1.5 space-y-1">
          <div className="h-2 bg-indigo-100 rounded w-3/4" />
          <div className="h-1 bg-gray-200 rounded w-1/2" />
          {[...Array(3)].map((_, i) => <div key={i} className="h-0.5 bg-gray-200 rounded" />)}
        </div>
      </div>
    ),
    Creative: (
      <div className="w-full h-full rounded overflow-hidden flex flex-col">
        <div className="h-5 bg-gradient-to-r from-purple-600 to-pink-500 flex items-center px-1.5">
          <div className="h-1 bg-white/70 rounded w-2/3" />
        </div>
        <div className="flex-1 bg-white p-1.5 space-y-0.5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-0.5 bg-gray-200 rounded" />)}
        </div>
      </div>
    ),
    Minimal: (
      <div className="w-full h-full bg-white rounded border border-gray-200 flex flex-col p-1.5 gap-1">
        <div className="h-0.5 bg-gray-400 rounded" />
        <div className="space-y-0.5 mt-1">
          <div className="h-1.5 bg-gray-700 rounded w-2/3" />
          <div className="h-1 bg-gray-300 rounded w-1/2" />
        </div>
        <div className="mt-1 space-y-0.5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-0.5 bg-gray-200 rounded" />)}
        </div>
      </div>
    ),
    Executive: (
      <div className="w-full h-full rounded overflow-hidden flex flex-col">
        <div className="h-6 bg-gray-900 flex items-center px-1.5">
          <div className="h-1 bg-white/60 rounded w-2/3" />
        </div>
        <div className="flex-1 bg-white p-1.5 space-y-0.5">
          <div className="h-0.5 bg-amber-500 rounded w-full" />
          {[...Array(3)].map((_, i) => <div key={i} className="h-0.5 bg-gray-200 rounded mt-0.5" />)}
        </div>
      </div>
    ),
  };
  return (
    <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden shadow-sm border border-gray-200">
      {thumbs[name] ?? <div className="w-full h-full bg-gray-100" />}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   EDITOR MODAL
═══════════════════════════════════════════════════════════ */
const EditorModal: React.FC<{
  item: SavedCoverLetter;
  onClose: () => void;
  onSave: (updated: SavedCoverLetter) => void;
}> = ({ item, onClose, onSave }) => {
  const [cl, setCl] = useState<CoverLetterData>({ ...item.coverLetter });
  const [settings, setSettings] = useState<CoverLetterSettings>({ ...item.settings });
  const [tab, setTab] = useState<'content' | 'design'>('content');
  const [editMode, setEditMode] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string>(item.settings.selectedTemplate);
  const containerId = `cl-editor-${item.id}`;

  const setField = (key: keyof CoverLetterData, val: string) =>
    setCl(prev => ({ ...prev, [key]: val }));
  const setPara = (i: number, val: string) => {
    const arr = [...cl.bodyParagraphs]; arr[i] = val;
    setCl(prev => ({ ...prev, bodyParagraphs: arr }));
  };
  const addPara = () => setCl(prev => ({ ...prev, bodyParagraphs: [...prev.bodyParagraphs, ''] }));
  const removePara = (i: number) => {
    const arr = cl.bodyParagraphs.filter((_, idx) => idx !== i);
    setCl(prev => ({ ...prev, bodyParagraphs: arr }));
  };

  const handleDownload = () => downloadPDF(containerId, `cover-letter-${cl.companyName || 'download'}.pdf`);
  const handleSave = () => {
    onSave({ ...item, coverLetter: cl, settings: { ...settings, selectedTemplate: activeTemplate as any } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-gray-950/80 backdrop-blur-sm">
      {/* Left Panel */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <LayoutTemplate size={14} className="text-slate-600" />
            </div>
            <span className="font-bold text-sm text-gray-800">Editor</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(['content', 'design'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${tab === t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm bg-gray-50">
          {tab === 'content' && (
            <>
              {/* Edit Mode Toggle */}
              <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-3 py-2">
                <span className="text-gray-500 text-xs font-medium">Click-to-Edit</span>
                <button onClick={() => setEditMode(e => !e)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${editMode ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${editMode ? 'left-4' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Fields */}
              {([
                ['applicantName','Name'], ['email','Email'], ['phone','Phone'], ['location','Location'],
                ['linkedin','LinkedIn'], ['website','Website'], ['date','Date'],
                ['hiringManagerName','Hiring Manager'], ['hiringManagerTitle','Manager Title'],
                ['companyName','Company'], ['companyAddress','Address'],
                ['roleTitle','Role Title'], ['salutation','Salutation'],
              ] as [keyof CoverLetterData, string][]).map(([k, label]) => (
                <div key={k}>
                  <label className="block text-gray-400 text-xs mb-1 font-medium">{label}</label>
                  <input value={(cl[k] as string) || ''}
                    onChange={e => setField(k, e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 text-xs focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
                </div>
              ))}

              {/* Opening */}
              <div>
                <label className="block text-gray-400 text-xs mb-1 font-medium">Opening</label>
                <textarea rows={3} value={cl.openingParagraph}
                  onChange={e => setField('openingParagraph', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 text-xs focus:outline-none focus:border-blue-400 resize-none" />
              </div>

              {/* Body paragraphs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-400 text-xs font-medium">Body Paragraphs</label>
                  <button onClick={addPara} className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1 font-medium">
                    <PlusCircle size={11} />Add
                  </button>
                </div>
                {cl.bodyParagraphs.map((p, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <textarea rows={3} value={p} onChange={e => setPara(i, e.target.value)}
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 text-xs focus:outline-none focus:border-blue-400 resize-none" />
                    {cl.bodyParagraphs.length > 1 && (
                      <button onClick={() => removePara(i)} className="text-red-400 hover:text-red-500 flex-shrink-0 mt-1"><Trash2 size={11} /></button>
                    )}
                  </div>
                ))}
              </div>

              {/* Closing */}
              <div>
                <label className="block text-gray-400 text-xs mb-1 font-medium">Closing</label>
                <textarea rows={3} value={cl.closingParagraph}
                  onChange={e => setField('closingParagraph', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 text-xs focus:outline-none focus:border-blue-400 resize-none" />
              </div>
            </>
          )}

          {tab === 'design' && (
            <>
              {/* Template selector */}
              <div>
                <label className="block text-gray-400 text-xs mb-2 font-medium">Template</label>
                <div className="grid grid-cols-1 gap-2">
                  {TEMPLATE_LIST.map(t => (
                    <button key={t} onClick={() => setActiveTemplate(t)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left ${activeTemplate === t ? 'border-blue-500 bg-white shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                      <TemplateThumbnail name={t} />
                      <div className="flex-1">
                        <div className={`text-xs font-semibold ${activeTemplate === t ? 'text-blue-600' : 'text-gray-700'}`}>{t}</div>
                        <div className="text-gray-400 text-xs">{TEMPLATE_META[t]?.tagline}</div>
                      </div>
                      {activeTemplate === t && <CheckCircle size={14} className="text-blue-500 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary color */}
              <div>
                <label className="block text-gray-400 text-xs mb-2 font-medium">Primary Color</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setSettings(s => ({ ...s, primaryColor: c }))}
                      style={{ background: c }}
                      className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${settings.primaryColor === c ? 'border-white shadow-md scale-110' : 'border-transparent'}`} />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Palette size={13} className="text-gray-400" />
                  <input type="color" value={settings.primaryColor}
                    onChange={e => setSettings(s => ({ ...s, primaryColor: e.target.value }))}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
                  <span className="text-xs text-gray-400">{settings.primaryColor}</span>
                </div>
              </div>

              {/* Font */}
              <div>
                <label className="block text-gray-400 text-xs mb-2 font-medium">Font Family</label>
                <div className="space-y-1">
                  {FONTS.map(f => (
                    <button key={f} onClick={() => setSettings(s => ({ ...s, fontFamily: f }))}
                      style={{ fontFamily: f }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${settings.fontFamily === f ? 'text-blue-600 border border-blue-400 bg-white font-semibold' : 'text-gray-600 hover:bg-white border border-transparent'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 space-y-2 bg-white">
          <button onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors">
            <Download size={14} />Download PDF
          </button>
          <button onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl py-2 text-sm transition-colors">
            <CheckCircle size={14} />Save Changes
          </button>
        </div>
      </div>

      {/* A4 Preview */}
      <div className="flex-1 overflow-auto bg-gray-100 flex items-start justify-center p-10">
        <div id={containerId} style={{ width: 794, minHeight: 1123, flexShrink: 0 }}>
          {renderTemplate(activeTemplate as any, {
            data: cl,
            settings: { ...settings, selectedTemplate: activeTemplate as any },
            containerId,
            editMode,
            onFieldChange: editMode ? (key, val) => setField(key as keyof CoverLetterData, val) : undefined,
            onParagraphChange: editMode ? setPara : undefined,
          })}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   CREATOR DIALOG
═══════════════════════════════════════════════════════════ */
type CreatorView = 'input' | 'generating' | 'gallery';
type JdInputMode = 'type' | 'upload';

/* Best resume = highest overall_score */
function getBestResume(resumes: Resume[]): Resume | null {
  if (!resumes.length) return null;
  return resumes.reduce((best, r) => {
    const s = r.analytics?.overall_score ?? 0;
    const b = best.analytics?.overall_score ?? 0;
    return s > b ? r : best;
  }, resumes[0]);
}

const CreatorOverlay: React.FC<{
  onClose: () => void;
  onSaved: (item: SavedCoverLetter) => void;
  authUser: User | null;
  clUsage: { used: number; limit: number; remaining: number } | null;
  setClUsage: React.Dispatch<React.SetStateAction<{ used: number; limit: number; remaining: number } | null>>;
}> = ({ onClose, onSaved, authUser, clUsage, setClUsage }) => {
  const { resumes, fetchResumes, uploadResume, isLoading: resumesLoading } = useResume();
  const [view, setView] = useState<CreatorView>('input');
  const [jdMode, setJdMode] = useState<JdInputMode>('type');
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [search, setSearch] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdExtracting, setJdExtracting] = useState(false);
  const [jdFileName, setJdFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCl, setGeneratedCl] = useState<CoverLetterData | null>(null);
  const [savedItem, setSavedItem] = useState<SavedCoverLetter | null>(null);
  const [openEditorTemplate, setOpenEditorTemplate] = useState<string | null>(null);
  const cvUploadRef = useRef<HTMLInputElement>(null);
  const jdUploadRef = useRef<HTMLInputElement>(null);

  // ── Single source of truth for resume usage (mirrors ResumeDashboard) ──────
  const isPayg = (authUser?.subscriptionPlan as any)?.type === 'pay_as_you_go';
  // Monthly-resettable counter (resumeCount resets to 0 by cron every month)
  const currentResumeUsage = isPayg
    ? (authUser?.paygResumesUsed ?? 0)
    : (authUser?.resumeCount ?? 0);
  // Max allowed per month (stamped from plan; default 5 free)
  const resumeLimit = isPayg
    ? (authUser?.paygResumesLimit ?? 0)
    : (authUser?.resumeLimit ?? 5);
  const atLimit = currentResumeUsage >= resumeLimit;

  useEffect(() => { fetchResumes(); }, []); // eslint-disable-line

  /* Auto-select best resume on load */
  useEffect(() => {
    if (resumes.length && !selectedResume) {
      const best = getBestResume(resumes);
      if (best) setSelectedResume(best);
    }
  }, [resumes.length]); // eslint-disable-line

  const filteredResumes = resumes.filter(r =>
    r.filename.toLowerCase().includes(search.toLowerCase())
  );
  const bestResume = getBestResume(resumes);

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || atLimit) return;
    setUploading(true);
    const files = Array.from(e.target.files);
    const uploaded = await uploadResume(files, undefined);
    if (uploaded) setSelectedResume(uploaded);
    setUploading(false);
  };

  const handleJdFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setJdFile(file);
    setJdFileName(file.name);
    setJdExtracting(true);
    setError('');
    try {
      const text = await CoverLetterApi.extractJdText(file);
      setJdText(text);
    } catch {
      setError('Could not extract text from the file. Please paste the JD manually.');
      setJdMode('type');
    } finally {
      setJdExtracting(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedResume) { setError('Please select a CV.'); return; }
    if (!jdText.trim()) { setError('Please provide the job description.'); return; }
    if (clUsage && clUsage.remaining <= 0) {
      setError(`You've reached your monthly cover letter limit (${clUsage.used}/${clUsage.limit}). Upgrade your plan or wait for your limit to reset.`);
      return;
    }
    setError('');
    setView('generating');
    try {
      const result = await CoverLetterApi.generate({
        jd: jdText,
        resumeText: selectedResume.text || '',
        applicantName: authUser?.name,
        email: authUser?.email,
        phone: authUser?.phoneNumber,
        location: authUser?.location,
        companyName: companyName || undefined,
        roleTitle: roleTitle || undefined,
      });
      setGeneratedCl(result);
      const item: SavedCoverLetter = {
        id: `cl_${Date.now()}`,
        createdAt: new Date().toISOString(),
        companyName: result.companyName || companyName || 'Unknown Company',
        roleTitle: result.roleTitle || roleTitle || 'Unknown Role',
        resumeId: selectedResume._id,
        resumeFilename: selectedResume.filename,
        coverLetter: result,
        settings: { ...DEFAULT_SETTINGS },
      };
      setSavedItem(item);
      onSaved(item);
      setView('gallery');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || '';
      if (err?.response?.status === 429 || msg.toLowerCase().includes('limit')) {
        setError(msg || 'You\'ve reached your monthly cover letter limit. Upgrade your plan to generate more.');
        // Refresh usage
        CoverLetterApi.getUsage().then(setClUsage).catch(() => {});
      } else {
        setError('Generation failed. Please try again.');
      }
      setView('input');
    }
  };

  /* Gallery preview dims */
  const GPW = 174;
  const GPH = Math.round(GPW * (1123 / 794));
  const GPS = GPW / 794;

  /* Usage bar — based on monthly counter, not all-time resumes.length */
  const usagePct = resumeLimit > 0 ? Math.min((currentResumeUsage / resumeLimit) * 100, 100) : 0;
  const usageColor = atLimit ? 'bg-red-500' : usagePct >= 80 ? 'bg-amber-500' : 'bg-blue-500';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={view !== 'generating' ? onClose : undefined}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className={`relative z-10 bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden flex flex-col w-full transition-all duration-300
            ${view === 'gallery' ? 'max-w-5xl max-h-[92vh]' : 'max-w-4xl max-h-[88vh]'}`}
        >
          {/* ── Dialog Header ── */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Wand2 size={17} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-base text-white leading-none">New Cover Letter</h2>
                <p className="text-blue-100 text-xs mt-0.5">
                  {view === 'input' ? 'Select your CV and provide the job description'
                    : view === 'generating' ? 'AI is crafting your letter…'
                    : 'Choose a template, edit, and download'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Step pills */}
              <div className="flex items-center gap-1.5">
                {[
                  { i: 1, done: view !== 'input', active: view === 'input' || view === 'generating' },
                  { i: 2, done: view === 'gallery', active: view === 'generating' },
                  { i: 3, done: false, active: view === 'gallery' },
                ].map((s, idx) => (
                  <React.Fragment key={s.i}>
                    <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all
                      ${s.done ? 'bg-green-400 text-white' : s.active ? 'bg-white text-blue-600' : 'bg-white/20 text-white/60'}`}>
                      {s.done ? <CheckCircle size={12} /> : s.i}
                    </div>
                    {idx < 2 && <div className={`w-4 h-px ${(view === 'gallery') ? 'bg-green-400' : view === 'generating' && idx === 0 ? 'bg-green-400' : 'bg-white/30'}`} />}
                  </React.Fragment>
                ))}
              </div>

              <button onClick={onClose} className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/20 transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── Dialog Body ── */}
          <div className="flex-1 overflow-y-auto min-h-0">

            {/* ── Step 1: Input ─────────────────────── */}
            {view === 'input' && (
              <div className="grid grid-cols-2 divide-x divide-blue-50 min-h-[520px]">

                {/* Left: CV Picker */}
                <div className="flex flex-col p-5 gap-3.5 bg-blue-50/30">

                  {/* Section title */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileText size={14} className="text-blue-600" />
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm">Your CVs</h3>
                    </div>
                    {/* Usage chip — monthly used / monthly limit */}
                    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border
                      ${atLimit ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                      <FileText size={10} />
                      {currentResumeUsage} / {resumeLimit} this month
                    </div>
                  </div>

                  {/* Usage bar — monthly usage */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Monthly analyses used</span>
                      {atLimit
                        ? <span className="text-xs font-bold text-red-500">Monthly limit reached</span>
                        : <span className="text-xs text-blue-500 font-medium">{resumeLimit - currentResumeUsage} remaining</span>
                      }
                    </div>
                    <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${usageColor}`} style={{ width: `${usagePct}%` }} />
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search CVs…"
                      className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors" />
                  </div>

                  {/* CV list */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 max-h-52">
                    {resumesLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 size={20} className="animate-spin text-blue-400" />
                      </div>
                    ) : filteredResumes.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 text-sm">
                        <FolderOpen size={26} className="mx-auto mb-2 text-gray-300" />
                        No CVs found.
                      </div>
                    ) : filteredResumes.map(r => {
                      // Use object reference equality — avoids undefined === undefined bug
                      const isBest = bestResume !== null && bestResume === r;
                      const isSelected = selectedResume !== null && selectedResume === r;
                      return (
                        <button key={r._id || r.id || r.filename}
                          onClick={() => setSelectedResume(prev => prev === r ? null : r)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all
                            ${isSelected
                              ? 'border-blue-500 bg-white shadow-sm ring-1 ring-blue-100'
                              : 'border-transparent bg-white hover:border-blue-200 hover:shadow-sm'}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                            ${isSelected ? 'bg-blue-600 text-white' : isBest ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                            <FileText size={13} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>{r.filename}</span>
                              {isBest && (
                                <span className="flex-shrink-0 flex items-center gap-0.5 text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                  <Star size={7} className="fill-amber-500 text-amber-500" />Best
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {r.analytics?.overall_score != null && (
                                <span className={`text-xs font-bold ${isSelected ? 'text-blue-500' : 'text-slate-500'}`}>{r.analytics.overall_score}%</span>
                              )}
                              <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                            ${isSelected ? 'bg-blue-600' : 'border-2 border-gray-200'}`}>
                            {isSelected && <CheckCircle size={13} className="text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Upload new CV */}
                  <button
                    onClick={() => !atLimit && cvUploadRef.current?.click()}
                    disabled={atLimit || uploading}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed text-sm font-semibold transition-all
                      ${atLimit ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-blue-200 text-blue-500 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'}`}
                  >
                    {uploading ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}
                    {atLimit
                      ? `Monthly limit reached (${currentResumeUsage}/${resumeLimit})`
                      : uploading ? 'Uploading…' : `Upload New CV (${currentResumeUsage}/${resumeLimit} used this month)`}
                  </button>
                  <input ref={cvUploadRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvUpload} />
                </div>

                {/* Right: Job Details */}
                <div className="flex flex-col p-5 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Briefcase size={14} className="text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm">Job Details</h3>
                  </div>

                  {/* Company + Role */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Company</label>
                      <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                        placeholder="e.g. Google"
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Role Title</label>
                      <input value={roleTitle} onChange={e => setRoleTitle(e.target.value)}
                        placeholder="e.g. Software Engineer"
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors" />
                    </div>
                  </div>

                  {/* JD mode tabs */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-gray-600">Job Description <span className="text-red-500">*</span></label>
                      <div className="flex bg-blue-50 border border-blue-100 rounded-lg p-0.5">
                        <button onClick={() => setJdMode('type')}
                          className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-all
                            ${jdMode === 'type' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-400 hover:text-blue-600'}`}>
                          <Type size={11} />Type
                        </button>
                        <button onClick={() => setJdMode('upload')}
                          className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-all
                            ${jdMode === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-400 hover:text-blue-600'}`}>
                          <UploadCloud size={11} />Upload
                        </button>
                      </div>
                    </div>

                    {jdMode === 'type' && (
                      <textarea
                        value={jdText} onChange={e => setJdText(e.target.value)}
                        placeholder="Paste the full job description here…&#10;&#10;Our AI tailors your letter from this + your CV."
                        className="flex-1 min-h-0 h-52 px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none leading-relaxed transition-colors"
                      />
                    )}

                    {jdMode === 'upload' && (
                      <div className="flex-1">
                        <div
                          onClick={() => jdUploadRef.current?.click()}
                          className={`cursor-pointer h-52 flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all
                            ${jdFileName && jdText ? 'border-green-300 bg-green-50/40' : 'border-blue-100 bg-blue-50/40 hover:border-blue-300 hover:bg-blue-50'}`}
                        >
                          {jdExtracting ? (
                            <>
                              <Loader2 size={26} className="animate-spin text-gray-400 mb-3" />
                              <p className="text-sm font-semibold text-gray-600">Extracting text…</p>
                              <p className="text-xs text-gray-400 mt-1">{jdFileName}</p>
                            </>
                          ) : jdFileName && jdText ? (
                            <>
                              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
                                <CheckCircle size={20} className="text-green-600" />
                              </div>
                              <p className="text-sm font-semibold text-gray-700 px-4 text-center truncate max-w-full">{jdFileName}</p>
                              <p className="text-xs text-green-600 font-medium mt-1">Extracted — {jdText.length.toLocaleString()} chars</p>
                              <button onClick={e => { e.stopPropagation(); setJdFile(null); setJdFileName(''); setJdText(''); }}
                                className="mt-2 text-xs text-red-400 hover:text-red-600 underline">Remove</button>
                            </>
                          ) : (
                            <>
                              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                                <UploadCloud size={20} className="text-gray-400" />
                              </div>
                              <p className="text-sm font-semibold text-gray-600">Upload JD File</p>
                              <p className="text-xs text-gray-400 mt-1">PDF, DOCX, or TXT · Auto-extracted</p>
                            </>
                          )}
                        </div>
                        <input ref={jdUploadRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleJdFileChange} />
                      </div>
                    )}
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                      <AlertCircle size={13} className="flex-shrink-0" />{error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 2: Generating ─────────────────── */}
            {view === 'generating' && (
              <div className="flex flex-col items-center justify-center py-20 gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                    <Sparkles size={34} className="text-blue-500 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Crafting Your Cover Letter</h3>
                  <p className="text-gray-400 text-sm max-w-xs">Analysing your CV + JD to write a tailored professional letter…</p>
                </div>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.18}s` }} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 3: Gallery ─────────────────────── */}
            {view === 'gallery' && generatedCl && savedItem && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-gray-900">Cover Letter Ready!</h3>
                    <p className="text-gray-400 text-sm mt-0.5">Pick a template, edit inline, and download as PDF.</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-xl text-xs font-semibold">
                    <CheckCircle size={13} />Saved to history
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  {TEMPLATE_LIST.map(t => {
                    const previewSettings = { ...savedItem.settings, selectedTemplate: t as any };
                    return (
                      <div key={t} className="flex flex-col group cursor-pointer" onClick={() => setOpenEditorTemplate(t)}>
                        <div
                          className="relative rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-blue-400 transition-all group-hover:shadow-md"
                          style={{ height: `${GPH}px` }}
                        >
                          <div style={{ width: GPW, overflow: 'hidden', pointerEvents: 'none' }}>
                            <div style={{ width: 794, transform: `scale(${GPS})`, transformOrigin: 'top left' }}>
                              {renderTemplate(t as any, { data: generatedCl, settings: previewSettings })}
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 border border-gray-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md transition-opacity">
                              <Edit3 size={11} />Edit
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="text-xs font-semibold text-gray-700">{t}</div>
                          <div className="text-xs text-gray-400">{TEMPLATE_META[t]?.tagline}</div>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); setOpenEditorTemplate(t); }}
                          className="mt-2 py-1.5 rounded-lg border border-gray-200 hover:border-blue-400 text-gray-600 hover:text-blue-700 text-xs font-semibold transition-colors">
                          Edit & Download
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Dialog Footer (input step only) ── */}
          {view === 'input' && (
            <div className="flex-shrink-0 px-6 py-4 bg-blue-50 border-t border-blue-100 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                {selectedResume
                  ? <span className="text-blue-700 font-semibold text-xs flex items-center gap-1.5">
                      <CheckCircle size={12} className="text-blue-500" />{selectedResume.filename}
                    </span>
                  : <span className="text-gray-400 text-xs">Select a CV to continue</span>}
                {clUsage && (
                  <span className={`text-[11px] font-semibold flex items-center gap-1 ${clUsage.remaining <= 0 ? 'text-red-500' : clUsage.remaining <= 2 ? 'text-amber-500' : 'text-gray-400'}`}>
                    <Wand2 size={10} />
                    {clUsage.remaining <= 0
                      ? `Cover letter limit reached (${clUsage.used}/${clUsage.limit})`
                      : `${clUsage.remaining} cover letter${clUsage.remaining !== 1 ? 's' : ''} remaining this month`}
                  </span>
                )}
              </div>
              <button onClick={handleGenerate}
                disabled={!selectedResume || !jdText.trim() || (clUsage !== null && clUsage.remaining <= 0)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl px-6 py-2.5 text-sm font-bold transition-all shadow-md disabled:shadow-none">
                <Sparkles size={14} />Generate Cover Letter
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Editor from gallery */}
      {openEditorTemplate && savedItem && generatedCl && (
        <EditorModal
          item={{ ...savedItem, settings: { ...savedItem.settings, selectedTemplate: openEditorTemplate as any } }}
          onClose={() => setOpenEditorTemplate(null)}
          onSave={(updated) => { onSaved(updated); setOpenEditorTemplate(null); }}
        />
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════
   ANALYTICS SECTION
═══════════════════════════════════════════════════════════ */
// Vivid multi-color palette — distinct hues, no single-color dominance
const CHART_COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316','#ec4899'];

function normalizeRole(role: string): string {
  const r = role.toLowerCase().trim();
  if (r.includes('software engineer') || r.includes(' swe') || r.includes('software dev')) return 'Software Engineer';
  if (r.includes('data analyst') || r.includes('data analysis')) return 'Data Analyst';
  if (r.includes('data scientist') || r.includes('machine learning') || r.includes('ml engineer')) return 'Data Scientist';
  if (r.includes('frontend') || r.includes('front-end') || r.includes('react dev')) return 'Frontend Dev';
  if (r.includes('backend') || r.includes('back-end') || r.includes('node dev')) return 'Backend Dev';
  if (r.includes('product manager') || r.includes('product owner')) return 'Product Manager';
  if (r.includes('designer') || r.includes('ui/ux') || r.includes('ux designer')) return 'Designer';
  if (r.includes('devops') || r.includes('cloud engineer') || r.includes(' sre')) return 'DevOps/Cloud';
  if (r.includes('full stack') || r.includes('fullstack')) return 'Full Stack Dev';
  return role.trim().split(' ').slice(0, 3).join(' ') || 'Other';
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    const val = payload[0].value;
    const name = payload[0]?.payload?.fullName ?? label;
    return (
      <div className="bg-white border border-blue-100 rounded-xl shadow-xl px-3.5 py-2.5 text-xs min-w-[90px]">
        <p className="font-bold text-gray-800 mb-0.5">{name}</p>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: payload[0].fill ?? payload[0].stroke ?? '#3b82f6' }} />
          <span className="text-gray-500">{val} application{val !== 1 ? 's' : ''}</span>
        </div>
      </div>
    );
  }
  return null;
};

const TrendTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-blue-100 rounded-xl shadow-xl px-3.5 py-2.5 text-xs">
        <p className="font-bold text-gray-700 mb-0.5">{label}</p>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          <span className="text-gray-500">{payload[0].value} sent</span>
        </div>
      </div>
    );
  }
  return null;
};

const AnalyticsSection: React.FC<{ history: SavedCoverLetter[]; clUsage: { used: number; limit: number; remaining: number } | null }> = ({ history, clUsage }) => {
  if (history.length === 0) return null;

  // Role distribution
  const roleMap = new Map<string, number>();
  history.forEach(h => {
    const norm = normalizeRole(h.roleTitle || 'Other');
    roleMap.set(norm, (roleMap.get(norm) ?? 0) + 1);
  });
  const roleData = [...roleMap.entries()]
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  // Top companies
  const companyMap = new Map<string, number>();
  history.forEach(h => {
    const c = (h.companyName || 'Unknown').trim();
    companyMap.set(c, (companyMap.get(c) ?? 0) + 1);
  });
  const companyData = [...companyMap.entries()]
    .sort((a, b) => b[1] - a[1]).slice(0, 7)
    .map(([name, count]) => ({
      name: name.length > 12 ? name.slice(0, 11) + '…' : name,
      fullName: name, count,
    }));

  // Monthly trend (last 6 months)
  const monthMap = new Map<string, number>();
  history.forEach(h => {
    const d = new Date(h.createdAt);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
  });
  const trendData = [...monthMap.entries()]
    .sort((a, b) => new Date('1 ' + a[0]).getTime() - new Date('1 ' + b[0]).getTime())
    .slice(-6).map(([name, count]) => ({ name, count }));

  // Template usage
  const templateMap = new Map<string, number>();
  history.forEach(h => {
    const t = h.settings.selectedTemplate || 'Professional';
    templateMap.set(t, (templateMap.get(t) ?? 0) + 1);
  });
  const templateData = [...templateMap.entries()].sort((a, b) => b[1] - a[1]);
  const totalTpl = templateData.reduce((s, d) => s + d[1], 0);

  const topRole = roleData[0]?.name ?? '—';
  const topCompany = companyData[0]?.fullName ?? '—';

  // Pie data for template usage
  const pieTplData = templateData.map(([name, count], i) => ({
    name, count, fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const RADIAN = Math.PI / 180;
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.08) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    return (
      <text x={cx + r * Math.cos(-midAngle * RADIAN)} y={cy + r * Math.sin(-midAngle * RADIAN)}
        fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  return (
    <div className="mb-4 space-y-3">

      {/* ── Monthly usage bar ──────────────────────────────────── */}
      {clUsage && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                clUsage.remaining <= 0 ? 'bg-red-50' : clUsage.remaining <= 2 ? 'bg-amber-50' : 'bg-blue-50/80'
              }`}>
                <Wand2 size={13} className={
                  clUsage.remaining <= 0 ? 'text-red-500' : clUsage.remaining <= 2 ? 'text-amber-500' : 'text-blue-500'
                } />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-none">Monthly Cover Letter Usage</span>
            </div>
            <span className={`text-sm font-extrabold tabular-nums ${
              clUsage.remaining <= 0 ? 'text-red-500' : clUsage.remaining <= 2 ? 'text-amber-500' : 'text-blue-600'
            }`}>
              {clUsage.used} <span className="text-gray-300 font-normal">/</span> {clUsage.limit}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                clUsage.remaining <= 0 ? 'bg-red-500' :
                clUsage.used / clUsage.limit >= 0.8 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, clUsage.limit > 0 ? (clUsage.used / clUsage.limit) * 100 : 0)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className={`text-[10px] font-semibold ${
              clUsage.remaining <= 0 ? 'text-red-500' : clUsage.remaining <= 2 ? 'text-amber-500' : 'text-gray-400'
            }`}>
              {clUsage.remaining <= 0
                ? 'Monthly limit reached — resets next month'
                : `${clUsage.remaining} cover letter${clUsage.remaining !== 1 ? 's' : ''} remaining this month`}
            </span>
            <span className="text-[10px] text-gray-300 font-medium">Resets monthly</span>
          </div>
        </div>
      )}

      {/* ── Stat cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            topLabel: 'COVER LETTERS',      value: history.length,   subLabel: 'Total Generated',
            icon: FileText,  iconColor: 'text-blue-500',    iconBg: 'bg-blue-50/80',   watermark: 'text-blue-100',
            numClass: 'text-gray-900', isText: false,
          },
          {
            topLabel: 'COMPANIES TARGETED', value: companyMap.size,  subLabel: 'Unique Employers',
            icon: Award,     iconColor: 'text-violet-500',  iconBg: 'bg-violet-50/80', watermark: 'text-violet-100',
            numClass: 'text-gray-900', isText: false,
          },
          {
            topLabel: 'ROLES APPLIED',      value: roleMap.size,     subLabel: 'Unique Job Titles',
            icon: Briefcase, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50/80',watermark: 'text-emerald-100',
            numClass: 'text-gray-900', isText: false,
          },
          {
            topLabel: 'TOP COMPANY',        value: topCompany,       subLabel: 'Most Applications Sent',
            icon: TrendingUp,iconColor: 'text-amber-500',   iconBg: 'bg-amber-50/80',  watermark: 'text-amber-100',
            numClass: 'text-gray-900', isText: true,
          },
        ].map(s => {
          const Icon = s.icon;
          const WatermarkIcon = s.icon;
          return (
            <div key={s.topLabel} className="relative bg-white rounded-2xl border border-gray-100 shadow-sm px-4 pt-3.5 pb-4 overflow-hidden">
              {/* Watermark */}
              <WatermarkIcon size={64} className={`absolute -right-2 -bottom-2 opacity-[0.07] ${s.iconColor}`} />
              {/* Top row: icon + label */}
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
                  <Icon size={13} className={s.iconColor} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-none">{s.topLabel}</span>
              </div>
              {/* Big value */}
              <div className={`font-black leading-none truncate ${s.isText ? 'text-xl' : 'text-[2rem]'} ${s.numClass}`}>
                {s.value}
              </div>
              {/* Sub label */}
              <div className="text-[11px] text-gray-400 mt-1 font-medium">{s.subLabel}</div>
            </div>
          );
        })}
      </div>

      {/* ── Charts row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Role distribution — horizontal bars, distinct colors per bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-bold text-gray-800">Role Distribution</h4>
              <p className="text-[11px] text-gray-400">Applications by job title</p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Briefcase size={13} className="text-blue-500" />
            </div>
          </div>
          {roleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={roleData.length * 44}>
              <BarChart data={roleData} layout="vertical" margin={{ left: 4, right: 28, top: 0, bottom: 0 }} barCategoryGap="20%">
                <CartesianGrid horizontal={false} stroke="#f3f4f6" strokeDasharray="4 2" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} width={86} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" radius={[0, 5, 5, 0]} maxBarSize={20} label={{ position: 'right', fontSize: 10, fill: '#9ca3af', formatter: (v: number) => v }}>
                  {roleData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-24 text-gray-300 text-xs">No data yet</div>
          )}
          <div className="mt-2 pt-2 border-t border-gray-50 text-[10px] text-gray-400">
            Top role: <span className="font-semibold" style={{ color: CHART_COLORS[0] }}>{topRole}</span>
          </div>
        </div>

        {/* Top companies — vertical bars */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-bold text-gray-800">Top Companies</h4>
              <p className="text-[11px] text-gray-400">Most applied-to employers</p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Award size={13} className="text-emerald-500" />
            </div>
          </div>
          {companyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={companyData.length * 52 + 32}>
              <BarChart data={companyData} margin={{ left: 0, right: 0, top: 4, bottom: 26 }} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="4 2" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9ca3af' }} angle={-30} textAnchor="end" interval={0} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={18} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={30}>
                  {companyData.map((_, i) => <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-300 text-xs">No data yet</div>
          )}
          <div className="mt-2 pt-2 border-t border-gray-50 text-[10px] text-gray-400">
            Most applied: <span className="font-semibold" style={{ color: CHART_COLORS[2] }}>{topCompany}</span>
          </div>
        </div>

        {/* Monthly activity + template donut */}
        <div className="flex flex-col gap-3">

          {/* Area trend */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-sm font-bold text-gray-800">Monthly Activity</h4>
                <p className="text-[11px] text-gray-400">Letters sent over time</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <TrendingUp size={13} className="text-amber-500" />
              </div>
            </div>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={88}>
                <AreaChart data={trendData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f3f4f6" strokeDasharray="4 2" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis hide allowDecimals={false} />
                  <Tooltip content={<TrendTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5}
                    fill="url(#blueAreaGrad)" dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#2563eb', stroke: 'white', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[88px] text-gray-300 text-xs">No data yet</div>
            )}
          </div>

          {/* Template usage — donut */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-sm font-bold text-gray-800">Templates</h4>
                <p className="text-[11px] text-gray-400">Usage breakdown</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <LayoutTemplate size={13} className="text-violet-500" />
              </div>
            </div>
            {pieTplData.length > 0 ? (
              <div className="flex items-center gap-3">
                <PieChart width={80} height={80}>
                  <Pie data={pieTplData} dataKey="count" nameKey="name"
                    cx="50%" cy="50%" innerRadius={24} outerRadius={38}
                    paddingAngle={pieTplData.length > 1 ? 3 : 0}
                    labelLine={false} label={renderPieLabel}>
                    {pieTplData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload?.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-blue-100 rounded-xl shadow-xl px-3 py-2 text-xs">
                          <p className="font-bold text-gray-800">{d.name}</p>
                          <p className="text-gray-400">{d.count} use{d.count !== 1 ? 's' : ''}</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                </PieChart>
                <div className="flex-1 space-y-1.5">
                  {pieTplData.map(({ name, count, fill }) => (
                    <div key={name} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: fill }} />
                      <span className="text-[10px] text-gray-600 flex-1 truncate">{name}</span>
                      <span className="text-[10px] font-bold text-gray-500">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-16 text-gray-300 text-xs">No data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   HISTORY CARD
═══════════════════════════════════════════════════════════ */
const HistoryCard: React.FC<{
  item: SavedCoverLetter;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ item, onEdit, onDelete }) => {
  const template = item.settings.selectedTemplate;
  const meta = TEMPLATE_META[template];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group flex flex-col">
      <div className="p-4 flex gap-3 flex-1">
        <TemplateThumbnail name={template} />
        <div className="flex-1 min-w-0">
          {/* Company + badge */}
          <div className="flex items-start justify-between gap-1.5 mb-0.5">
            <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">{item.companyName}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 whitespace-nowrap ${meta?.badge}`}>{template}</span>
          </div>
          {/* Role */}
          <p className="text-xs text-gray-500 truncate mb-2.5">{item.roleTitle}</p>
          {/* Date — own row so it never wraps into the filename */}
          <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-1">
            <Calendar size={10} className="flex-shrink-0" />
            <span className="whitespace-nowrap">
              {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          {/* Resume filename — own row */}
          {item.resumeFilename && (
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <FileText size={10} className="flex-shrink-0" />
              <span className="truncate">{item.resumeFilename}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 px-3 py-2.5 flex items-center gap-2">
        <button onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-700 text-xs font-semibold transition-all">
          <Edit3 size={12} />Edit &amp; Download
        </button>
        <button onClick={onDelete}
          className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════ */
const EmptyHistory: React.FC<{ onNew: () => void }> = ({ onNew }) => (
  <div className="flex flex-col items-center justify-center py-24 px-4">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
      <FileText size={30} className="text-slate-400" />
    </div>
    <h3 className="text-lg font-bold text-gray-800 mb-2">No cover letters yet</h3>
    <p className="text-gray-400 text-sm text-center max-w-xs mb-6 leading-relaxed">
      Generate your first AI-powered cover letter — pick a CV and paste the job description, we'll handle the rest.
    </p>
    <button onClick={onNew}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-lg">
      <Plus size={16} />Create First Cover Letter
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function CoverLetterGenerator() {
  const { user } = useAuth();
  const uid = user?._id || 'guest';

  const [history, setHistory] = useState<SavedCoverLetter[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [editingItem, setEditingItem] = useState<SavedCoverLetter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [clUsage, setClUsage] = useState<{ used: number; limit: number; remaining: number } | null>(null);

  useEffect(() => { setHistory(loadHist(uid)); }, [uid]);

  useEffect(() => {
    CoverLetterApi.getUsage()
      .then(setClUsage)
      .catch(() => setClUsage({ used: 0, limit: 5, remaining: 5 }));
  }, []); // eslint-disable-line

  const addToHistory = (item: SavedCoverLetter) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.id !== item.id);
      const updated = [item, ...filtered];
      persistHist(uid, updated);
      return updated;
    });
  };

  const deleteFromHistory = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(h => h.id !== id);
      persistHist(uid, updated);
      return updated;
    });
  };

  const filteredHistory = history.filter(h =>
    h.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.roleTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const thisMonth = history.filter(h => {
    const d = new Date(h.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Page header ── */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-gray-900 leading-none tracking-tight">Cover Letter Studio</h1>
                <p className="text-gray-400 text-xs mt-0.5">AI-powered letters tailored to every job</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Inline stats */}
              <div className="hidden md:flex items-center gap-6 mr-2">
                {[
                  { icon: <History size={13} />, label: 'Total', value: history.length },
                  { icon: <Clock size={13} />,   label: 'This month', value: thisMonth },
                  { icon: <LayoutTemplate size={13} />, label: 'Templates', value: 5 },
                ].map(s => (
                  <div key={s.label} className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-gray-400 mb-0.5">{s.icon}<span className="text-xs">{s.label}</span></div>
                    <span className="text-base font-bold text-gray-800">{s.value}</span>
                  </div>
                ))}
                {/* Monthly limit badge */}
                {clUsage && (
                  <div className="flex flex-col items-center border-l border-gray-100 pl-6">
                    <div className="flex items-center gap-1 text-gray-400 mb-0.5">
                      <Wand2 size={13} />
                      <span className="text-xs">Monthly limit</span>
                    </div>
                    <span className={`text-base font-bold tabular-nums ${
                      clUsage.remaining <= 0 ? 'text-red-500' : clUsage.remaining <= 2 ? 'text-amber-500' : 'text-gray-800'
                    }`}>
                      {clUsage.used}/{clUsage.limit}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowCreator(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all hover:shadow-md">
                <Plus size={16} />New Cover Letter
              </button>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto px-8 py-5">
          {history.length === 0 ? (
            <EmptyHistory onNew={() => setShowCreator(true)} />
          ) : (
            <>
              {/* ── Limit warning banner ── */}
              {clUsage && clUsage.remaining <= 0 && (
                <div className="mb-3 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-700">Monthly cover letter limit reached</p>
                    <p className="text-xs text-red-500 mt-0.5">You've used {clUsage.used}/{clUsage.limit} cover letters this month. Your limit resets at the start of next month.</p>
                  </div>
                </div>
              )}
              {clUsage && clUsage.remaining > 0 && clUsage.remaining <= 2 && (
                <div className="mb-3 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
                  <p className="text-sm text-amber-700">
                    Only <span className="font-bold">{clUsage.remaining}</span> cover letter{clUsage.remaining !== 1 ? 's' : ''} remaining this month ({clUsage.used}/{clUsage.limit} used).
                  </p>
                </div>
              )}

              {/* ── Analytics ── */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Overview</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <AnalyticsSection history={history} clUsage={clUsage} />

              {/* ── Letters ── */}
              <div className="flex items-center gap-3 mb-3 mt-1">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Letters</span>
                  <div className="h-px w-6 bg-gray-100" />
                </div>
                <div className="relative flex-1 max-w-xs">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by company or role…"
                    className="w-full pl-8 pr-4 py-1.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 shadow-sm transition-colors" />
                </div>
                <span className="text-xs text-gray-400 ml-auto">
                  {filteredHistory.length} letter{filteredHistory.length !== 1 ? 's' : ''}
                </span>
              </div>

              {filteredHistory.length === 0 ? (
                <div className="text-center py-14 text-gray-400">
                  <Search size={28} className="mx-auto mb-3 text-gray-300" />
                  No cover letters match your search.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredHistory.map(item => (
                    <HistoryCard
                      key={item.id}
                      item={item}
                      onEdit={() => setEditingItem(item)}
                      onDelete={() => deleteFromHistory(item.id)}
                    />
                  ))}

                  {/* Add new card */}
                  <button
                    onClick={() => setShowCreator(true)}
                    className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-400 text-gray-300 hover:text-gray-500 transition-all min-h-[160px]">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Plus size={20} className="text-gray-400" />
                    </div>
                    <span className="text-sm font-semibold">New Letter</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Creator dialog */}
      {showCreator && (
        <CreatorOverlay
          onClose={() => setShowCreator(false)}
          onSaved={(item) => { addToHistory(item); CoverLetterApi.getUsage().then(setClUsage).catch(() => {}); }}
          authUser={user}
          clUsage={clUsage}
          setClUsage={setClUsage}
        />
      )}

      {/* Editor modal (history card) */}
      {editingItem && (
        <EditorModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(updated) => { addToHistory(updated); setEditingItem(null); }}
        />
      )}
    </div>
  );
}
