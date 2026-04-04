import React from 'react';
import { CoverLetterData, CoverLetterSettings } from '@/types/CoverLetter';

export interface TemplateProps {
  data: CoverLetterData;
  settings: CoverLetterSettings;
  /** id on root div — used for PDF generation. Omit for mini preview cards. */
  containerId?: string;
  editMode?: boolean;
  onFieldChange?: (field: string, value: string) => void;
  onParagraphChange?: (index: number, value: string, type: 'opening' | 'body' | 'closing') => void;
}

const EditableBlock: React.FC<{
  value: string;
  onChange?: (val: string) => void;
  className?: string;
  multiline?: boolean;
}> = ({ value, onChange, className = '', multiline = true }) => {
  if (!onChange) {
    // Single-line fields that are explicitly placed inside a sentence (e.g. "Dear <X>,")
    // always pass className="inline ...". All other single-line fields (address lines,
    // names, etc.) should render as block elements so they stack vertically.
    if (multiline) return <p className={className}>{value}</p>;
    if (className.includes('inline')) return <span className={className}>{value}</span>;
    return <p className={className}>{value}</p>;
  }
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${className} w-full resize-none bg-transparent border-b border-dashed border-blue-300 focus:outline-none focus:border-blue-500`}
        rows={Math.max(3, Math.ceil(value.length / 80))}
      />
    );
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${className} bg-transparent border-b border-dashed border-blue-300 focus:outline-none focus:border-blue-500 w-full`}
    />
  );
};

export const ProfessionalTemplate: React.FC<TemplateProps> = ({ data, settings, containerId, editMode, onFieldChange, onParagraphChange }) => {
  const edit = editMode ? onFieldChange : undefined;
  const paraEdit = editMode ? onParagraphChange : undefined;
  return (
    <div id={containerId} className="bg-white font-sans text-gray-800" style={{ fontFamily: settings.fontFamily, width: '794px', minHeight: '1123px', padding: '64px 72px' }}>
      <div className="border-b-2 pb-6 mb-6" style={{ borderColor: settings.primaryColor }}>
        <EditableBlock value={data.applicantName} onChange={edit ? (v) => edit('applicantName', v) : undefined} className="text-3xl font-bold tracking-tight" multiline={false} />
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
          <EditableBlock value={data.email} onChange={edit ? (v) => edit('email', v) : undefined} className="text-sm" multiline={false} />
          <span>·</span>
          <EditableBlock value={data.phone} onChange={edit ? (v) => edit('phone', v) : undefined} className="text-sm" multiline={false} />
          <span>·</span>
          <EditableBlock value={data.location} onChange={edit ? (v) => edit('location', v) : undefined} className="text-sm" multiline={false} />
          {data.linkedin && <><span>·</span><EditableBlock value={data.linkedin} onChange={edit ? (v) => edit('linkedin', v) : undefined} className="text-sm" multiline={false} /></>}
        </div>
      </div>
      <EditableBlock value={data.date} onChange={edit ? (v) => edit('date', v) : undefined} className="text-sm text-gray-500 mb-6" multiline={false} />
      <div className="mb-6 text-sm leading-6">
        <EditableBlock value={data.hiringManagerName} onChange={edit ? (v) => edit('hiringManagerName', v) : undefined} className="font-semibold" multiline={false} />
        <EditableBlock value={data.hiringManagerTitle} onChange={edit ? (v) => edit('hiringManagerTitle', v) : undefined} className="text-gray-600" multiline={false} />
        <EditableBlock value={data.companyName} onChange={edit ? (v) => edit('companyName', v) : undefined} className="text-gray-600" multiline={false} />
        <EditableBlock value={data.companyAddress} onChange={edit ? (v) => edit('companyAddress', v) : undefined} className="text-gray-600" multiline={false} />
      </div>
      <p className="font-semibold mb-5 text-sm" style={{ color: settings.primaryColor }}>
        Re: Application for <EditableBlock value={data.roleTitle} onChange={edit ? (v) => edit('roleTitle', v) : undefined} className="font-semibold inline" multiline={false} />
      </p>
      <p className="mb-4 text-sm">Dear <EditableBlock value={data.hiringManagerName} onChange={edit ? (v) => edit('hiringManagerName', v) : undefined} className="inline font-medium" multiline={false} />,</p>
      <div className="space-y-4 text-sm leading-7 text-gray-700">
        <EditableBlock value={data.openingParagraph} onChange={paraEdit ? (v) => paraEdit(0, v, 'opening') : undefined} />
        {data.bodyParagraphs.map((p, i) => <EditableBlock key={i} value={p} onChange={paraEdit ? (v) => paraEdit(i, v, 'body') : undefined} />)}
        <EditableBlock value={data.closingParagraph} onChange={paraEdit ? (v) => paraEdit(0, v, 'closing') : undefined} />
      </div>
      <div className="mt-10 text-sm">
        <EditableBlock value={data.salutation} onChange={edit ? (v) => edit('salutation', v) : undefined} className="block mb-8" multiline={false} />
        <div className="font-semibold" style={{ color: settings.primaryColor }}>
          <EditableBlock value={data.applicantName} onChange={edit ? (v) => edit('applicantName', v) : undefined} className="font-semibold" multiline={false} />
        </div>
      </div>
    </div>
  );
};

export const ModernTemplate: React.FC<TemplateProps> = ({ data, settings, containerId, editMode, onFieldChange, onParagraphChange }) => {
  const edit = editMode ? onFieldChange : undefined;
  const paraEdit = editMode ? onParagraphChange : undefined;
  return (
    <div id={containerId} className="bg-white font-sans flex" style={{ fontFamily: settings.fontFamily, width: '794px', minHeight: '1123px' }}>
      <div className="w-4 flex-shrink-0" style={{ backgroundColor: settings.primaryColor }} />
      <div className="flex-1 px-14 py-12">
        <div className="mb-8">
          <EditableBlock value={data.applicantName} onChange={edit ? (v) => edit('applicantName', v) : undefined} className="text-4xl font-extrabold text-gray-900" multiline={false} />
          <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-gray-500">
            <EditableBlock value={data.email} onChange={edit ? (v) => edit('email', v) : undefined} className="text-xs" multiline={false} />
            <span>|</span>
            <EditableBlock value={data.phone} onChange={edit ? (v) => edit('phone', v) : undefined} className="text-xs" multiline={false} />
            <span>|</span>
            <EditableBlock value={data.location} onChange={edit ? (v) => edit('location', v) : undefined} className="text-xs" multiline={false} />
          </div>
        </div>
        <div className="flex justify-between mb-8 text-xs text-gray-500">
          <div className="leading-5">
            <EditableBlock value={data.hiringManagerName} onChange={edit ? (v) => edit('hiringManagerName', v) : undefined} className="font-semibold text-gray-800 text-sm" multiline={false} />
            <EditableBlock value={data.hiringManagerTitle} onChange={edit ? (v) => edit('hiringManagerTitle', v) : undefined} multiline={false} />
            <EditableBlock value={data.companyName} onChange={edit ? (v) => edit('companyName', v) : undefined} className="font-medium text-gray-700" multiline={false} />
            <EditableBlock value={data.companyAddress} onChange={edit ? (v) => edit('companyAddress', v) : undefined} multiline={false} />
          </div>
          <EditableBlock value={data.date} onChange={edit ? (v) => edit('date', v) : undefined} className="text-xs text-right" multiline={false} />
        </div>
        <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-6 text-white" style={{ backgroundColor: settings.primaryColor }}>
          Re: <EditableBlock value={data.roleTitle} onChange={edit ? (v) => edit('roleTitle', v) : undefined} className="inline text-white font-semibold text-xs" multiline={false} />
        </div>
        <p className="text-sm mb-4">Dear <EditableBlock value={data.hiringManagerName} onChange={edit ? (v) => edit('hiringManagerName', v) : undefined} className="inline font-semibold" multiline={false} />,</p>
        <div className="space-y-4 text-sm leading-7 text-gray-700">
          <EditableBlock value={data.openingParagraph} onChange={paraEdit ? (v) => paraEdit(0, v, 'opening') : undefined} />
          {data.bodyParagraphs.map((p, i) => <EditableBlock key={i} value={p} onChange={paraEdit ? (v) => paraEdit(i, v, 'body') : undefined} />)}
          <EditableBlock value={data.closingParagraph} onChange={paraEdit ? (v) => paraEdit(0, v, 'closing') : undefined} />
        </div>
        <div className="mt-10 text-sm">
          <EditableBlock value={data.salutation} onChange={edit ? (v) => edit('salutation', v) : undefined} className="block mb-6" multiline={false} />
          <div className="font-bold text-base" style={{ color: settings.primaryColor }}>
            <EditableBlock value={data.applicantName} onChange={edit ? (v) => edit('applicantName', v) : undefined} className="font-bold" multiline={false} />
          </div>
          <div className="text-xs text-gray-500 mt-1"><EditableBlock value={data.email} onChange={edit ? (v) => edit('email', v) : undefined} className="text-xs" multiline={false} /></div>
        </div>
      </div>
    </div>
  );
};

export const CreativeTemplate: React.FC<TemplateProps> = ({ data, settings, containerId, editMode, onFieldChange, onParagraphChange }) => {
  const edit = editMode ? onFieldChange : undefined;
  const paraEdit = editMode ? onParagraphChange : undefined;
  return (
    <div id={containerId} className="bg-white font-sans" style={{ fontFamily: settings.fontFamily, width: '794px', minHeight: '1123px' }}>
      <div className="px-14 py-10 text-white" style={{ background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.accentColor} 100%)` }}>
        <EditableBlock value={data.applicantName} onChange={edit ? (v) => edit('applicantName', v) : undefined} className="text-4xl font-black tracking-wide text-white" multiline={false} />
        <div className="flex flex-wrap gap-x-4 mt-2 text-sm opacity-90 text-white">
          <EditableBlock value={data.email} onChange={edit ? (v) => edit('email', v) : undefined} className="text-sm text-white" multiline={false} />
          <span className="opacity-60">·</span>
          <EditableBlock value={data.phone} onChange={edit ? (v) => edit('phone', v) : undefined} className="text-sm text-white" multiline={false} />
          <span className="opacity-60">·</span>
          <EditableBlock value={data.location} onChange={edit ? (v) => edit('location', v) : undefined} className="text-sm text-white" multiline={false} />
        </div>
      </div>
      <div className="px-14 py-10">
        <div className="flex justify-between mb-8 text-sm">
          <div className="text-gray-600 leading-6">
            <EditableBlock value={data.hiringManagerName} onChange={edit ? (v) => edit('hiringManagerName', v) : undefined} className="font-semibold text-gray-900" multiline={false} />
            <EditableBlock value={data.hiringManagerTitle} onChange={edit ? (v) => edit('hiringManagerTitle', v) : undefined} multiline={false} />
            <EditableBlock value={data.companyName} onChange={edit ? (v) => edit('companyName', v) : undefined} className="font-medium" multiline={false} />
            <EditableBlock value={data.companyAddress} onChange={edit ? (v) => edit('companyAddress', v) : undefined} multiline={false} />
          </div>
          <EditableBlock value={data.date} onChange={edit ? (v) => edit('date', v) : undefined} className="text-xs text-gray-400 pt-1" multiline={false} />
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-0.5 flex-1" style={{ backgroundColor: settings.primaryColor }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: settings.primaryColor }}>
            <EditableBlock value={data.roleTitle} onChange={edit ? (v) => edit('roleTitle', v) : undefined} className="text-xs font-bold uppercase tracking-widest" multiline={false} />
          </span>
          <div className="h-0.5 flex-1" style={{ backgroundColor: settings.primaryColor }} />
        </div>
        <p className="text-sm mb-4 text-gray-700">Dear <EditableBlock value={data.hiringManagerName} onChange={edit ? (v) => edit('hiringManagerName', v) : undefined} className="inline font-semibold" multiline={false} />,</p>
        <div className="space-y-4 text-sm leading-7 text-gray-700">
          <EditableBlock value={data.openingParagraph} onChange={paraEdit ? (v) => paraEdit(0, v, 'opening') : undefined} />
          {data.bodyParagraphs.map((p, i) => <EditableBlock key={i} value={p} onChange={paraEdit ? (v) => paraEdit(i, v, 'body') : undefined} />)}
          <EditableBlock value={data.closingParagraph} onChange={paraEdit ? (v) => paraEdit(0, v, 'closing') : undefined} />
        </div>
        <div className="mt-10 text-sm">
          <EditableBlock value={data.salutation} onChange={edit ? (v) => edit('salutation', v) : undefined} className="block mb-6" multiline={false} />
          <p className="font-extrabold text-lg" style={{ color: settings.primaryColor }}>
            <EditableBlock value={data.applicantName} onChange={edit ? (v) => edit('applicantName', v) : undefined} className="font-extrabold" multiline={false} />
          </p>
        </div>
      </div>
    </div>
  );
};

export const MinimalTemplate: React.FC<TemplateProps> = ({ data, settings, containerId, editMode, onFieldChange, onParagraphChange }) => {
  const edit = editMode ? onFieldChange : undefined;
  const paraEdit = editMode ? onParagraphChange : undefined;
  return (
    <div id={containerId} className="bg-white font-sans" style={{ fontFamily: settings.fontFamily, width: '794px', minHeight: '1123px', padding: '80px 88px' }}>
      <div className="h-0.5 mb-10" style={{ backgroundColor: settings.primaryColor }} />
      <EditableBlock value={data.applicantName} onChange={edit ? (v) => edit('applicantName', v) : undefined} className="text-2xl font-light tracking-[0.2em] uppercase text-gray-900 mb-1" multiline={false} />
      <div className="text-xs text-gray-400 tracking-widest mb-8">
        <EditableBlock value={data.email} onChange={edit ? (v) => edit('email', v) : undefined} className="text-xs inline" multiline={false} />
        {' · '}
        <EditableBlock value={data.phone} onChange={edit ? (v) => edit('phone', v) : undefined} className="text-xs inline" multiline={false} />
        {' · '}
        <EditableBlock value={data.location} onChange={edit ? (v) => edit('location', v) : undefined} className="text-xs inline" multiline={false} />
      </div>
      <div className="flex justify-between mb-10 text-xs text-gray-500">
        <div className="leading-5">
          <EditableBlock value={data.hiringManagerName} onChange={edit ? (v) => edit('hiringManagerName', v) : undefined} className="text-gray-700 font-medium" multiline={false} />
          <EditableBlock value={data.hiringManagerTitle} onChange={edit ? (v) => edit('hiringManagerTitle', v) : undefined} multiline={false} />
          <EditableBlock value={data.companyName} onChange={edit ? (v) => edit('companyName', v) : undefined} multiline={false} />
          <EditableBlock value={data.companyAddress} onChange={edit ? (v) => edit('companyAddress', v) : undefined} multiline={false} />
        </div>
        <EditableBlock value={data.date} onChange={edit ? (v) => edit('date', v) : undefined} className="text-xs" multiline={false} />
      </div>
      <p className="text-xs font-medium tracking-widest uppercase mb-6" style={{ color: settings.primaryColor }}>
        Re: <EditableBlock value={data.roleTitle} onChange={edit ? (v) => edit('roleTitle', v) : undefined} className="inline text-xs font-medium tracking-widest uppercase" multiline={false} />
      </p>
      <p className="text-sm mb-5 text-gray-600">Dear <EditableBlock value={data.hiringManagerName} onChange={edit ? (v) => edit('hiringManagerName', v) : undefined} className="inline" multiline={false} />,</p>
      <div className="space-y-5 text-sm leading-8 text-gray-600 font-light">
        <EditableBlock value={data.openingParagraph} onChange={paraEdit ? (v) => paraEdit(0, v, 'opening') : undefined} />
        {data.bodyParagraphs.map((p, i) => <EditableBlock key={i} value={p} onChange={paraEdit ? (v) => paraEdit(i, v, 'body') : undefined} />)}
        <EditableBlock value={data.closingParagraph} onChange={paraEdit ? (v) => paraEdit(0, v, 'closing') : undefined} />
      </div>
      <div className="mt-12 text-sm text-gray-500">
        <EditableBlock value={data.salutation} onChange={edit ? (v) => edit('salutation', v) : undefined} className="block mb-8 text-xs tracking-widest uppercase" multiline={false} />
        <EditableBlock value={data.applicantName} onChange={edit ? (v) => edit('applicantName', v) : undefined} className="font-medium text-gray-800 tracking-widest uppercase text-xs" multiline={false} />
      </div>
      <div className="h-0.5 mt-10" style={{ backgroundColor: settings.primaryColor }} />
    </div>
  );
};

export const ExecutiveTemplate: React.FC<TemplateProps> = ({ data, settings, containerId, editMode, onFieldChange, onParagraphChange }) => {
  const edit = editMode ? onFieldChange : undefined;
  const paraEdit = editMode ? onParagraphChange : undefined;
  return (
    <div id={containerId} className="bg-white font-sans" style={{ fontFamily: settings.fontFamily, width: '794px', minHeight: '1123px' }}>
      <div className="px-14 py-10 text-white" style={{ backgroundColor: '#1a1a2e' }}>
        <div className="flex justify-between items-start">
          <div>
            <EditableBlock value={data.applicantName} onChange={edit ? (v) => edit('applicantName', v) : undefined} className="text-3xl font-bold tracking-tight text-white" multiline={false} />
            <div className="mt-2 text-xs opacity-70 tracking-wider text-white flex flex-wrap gap-x-3">
              <EditableBlock value={data.email} onChange={edit ? (v) => edit('email', v) : undefined} className="text-xs text-white" multiline={false} />
              <span className="opacity-40">|</span>
              <EditableBlock value={data.phone} onChange={edit ? (v) => edit('phone', v) : undefined} className="text-xs text-white" multiline={false} />
              <span className="opacity-40">|</span>
              <EditableBlock value={data.location} onChange={edit ? (v) => edit('location', v) : undefined} className="text-xs text-white" multiline={false} />
            </div>
          </div>
          <div className="h-8 w-1 rounded-full ml-4 mt-1" style={{ backgroundColor: settings.primaryColor }} />
        </div>
      </div>
      <div className="h-1" style={{ backgroundColor: settings.primaryColor }} />
      <div className="px-14 py-10">
        <EditableBlock value={data.date} onChange={edit ? (v) => edit('date', v) : undefined} className="text-xs text-gray-400 text-right mb-6" multiline={false} />
        <div className="mb-8 text-sm text-gray-600 leading-6">
          <EditableBlock value={data.hiringManagerName} onChange={edit ? (v) => edit('hiringManagerName', v) : undefined} className="font-bold text-gray-900" multiline={false} />
          <EditableBlock value={data.hiringManagerTitle} onChange={edit ? (v) => edit('hiringManagerTitle', v) : undefined} multiline={false} />
          <EditableBlock value={data.companyName} onChange={edit ? (v) => edit('companyName', v) : undefined} className="font-semibold" multiline={false} />
          <EditableBlock value={data.companyAddress} onChange={edit ? (v) => edit('companyAddress', v) : undefined} multiline={false} />
        </div>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Subject</span>
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs font-semibold" style={{ color: settings.primaryColor }}>
            <EditableBlock value={data.roleTitle} onChange={edit ? (v) => edit('roleTitle', v) : undefined} className="text-xs font-semibold" multiline={false} />
          </span>
        </div>
        <p className="text-sm mb-5 text-gray-700">Dear <EditableBlock value={data.hiringManagerName} onChange={edit ? (v) => edit('hiringManagerName', v) : undefined} className="inline font-semibold" multiline={false} />,</p>
        <div className="space-y-4 text-sm leading-7 text-gray-700">
          <EditableBlock value={data.openingParagraph} onChange={paraEdit ? (v) => paraEdit(0, v, 'opening') : undefined} />
          {data.bodyParagraphs.map((p, i) => <EditableBlock key={i} value={p} onChange={paraEdit ? (v) => paraEdit(i, v, 'body') : undefined} />)}
          <EditableBlock value={data.closingParagraph} onChange={paraEdit ? (v) => paraEdit(0, v, 'closing') : undefined} />
        </div>
        <div className="mt-10 text-sm">
          <EditableBlock value={data.salutation} onChange={edit ? (v) => edit('salutation', v) : undefined} className="block mb-8 text-gray-700" multiline={false} />
          <div className="font-bold text-base" style={{ color: settings.primaryColor }}>
            <EditableBlock value={data.applicantName} onChange={edit ? (v) => edit('applicantName', v) : undefined} className="font-bold" multiline={false} />
          </div>
          <div className="text-xs text-gray-400 mt-1"><EditableBlock value={data.email} onChange={edit ? (v) => edit('email', v) : undefined} className="text-xs" multiline={false} /></div>
        </div>
      </div>
    </div>
  );
};

export const TEMPLATE_LIST = ['Professional', 'Modern', 'Creative', 'Minimal', 'Executive'] as const;

export function renderTemplate(name: string, props: TemplateProps): React.ReactElement {
  switch (name) {
    case 'Modern':    return <ModernTemplate    {...props} />;
    case 'Creative':  return <CreativeTemplate  {...props} />;
    case 'Minimal':   return <MinimalTemplate    {...props} />;
    case 'Executive': return <ExecutiveTemplate  {...props} />;
    default:          return <ProfessionalTemplate {...props} />;
  }
}
