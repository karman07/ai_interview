import React from 'react';
import { CoverLetterTemplate, CoverLetterSettings } from '@/types/CoverLetter';
import { Check } from 'lucide-react';

const TEMPLATES: {
  id: CoverLetterTemplate;
  label: string;
  description: string;
  preview: React.ReactNode;
}[] = [
  {
    id: 'Professional',
    label: 'Professional',
    description: 'Classic structured layout, perfect for corporate roles',
    preview: (
      <div className="w-full h-full bg-white p-3 font-sans text-[6px] text-gray-700 leading-tight">
        <div className="border-b-2 border-blue-600 pb-1.5 mb-1.5">
          <div className="font-bold text-[8px] text-gray-900">John Smith</div>
          <div className="text-gray-500">john@email.com · +1 555-0000 · New York</div>
        </div>
        <div className="text-gray-400 mb-1.5">April 4, 2026</div>
        <div className="mb-1.5">
          <div className="font-semibold">Hiring Manager</div>
          <div className="text-gray-500">Acme Corp</div>
        </div>
        <div className="text-blue-600 font-semibold mb-1">Re: Software Engineer</div>
        <div className="text-gray-600 space-y-0.5">
          <div>Dear Hiring Manager,</div>
          <div>I am writing to express my strong interest in the...</div>
          <div>Throughout my career, I have developed expertise...</div>
        </div>
        <div className="mt-3 text-gray-500">Sincerely,</div>
        <div className="font-bold text-blue-600 mt-1">John Smith</div>
      </div>
    ),
  },
  {
    id: 'Modern',
    label: 'Modern',
    description: 'Left accent bar with contemporary typography',
    preview: (
      <div className="w-full h-full bg-white flex font-sans text-[6px] text-gray-700">
        <div className="w-2 bg-indigo-600 flex-shrink-0" />
        <div className="flex-1 p-3 leading-tight">
          <div className="font-black text-[9px] text-gray-900 mb-0.5">John Smith</div>
          <div className="text-gray-400 mb-2">john@email.com · +1 555-0000</div>
          <div className="inline-block bg-indigo-600 text-white px-1.5 py-0.5 rounded-full text-[5px] mb-2">
            Re: Software Engineer
          </div>
          <div className="text-gray-600 space-y-0.5">
            <div>Dear Hiring Manager,</div>
            <div>I am writing to express my strong...</div>
            <div>Throughout my career...</div>
          </div>
          <div className="mt-3 font-bold text-indigo-600">John Smith</div>
        </div>
      </div>
    ),
  },
  {
    id: 'Creative',
    label: 'Creative',
    description: 'Bold gradient header for design & creative roles',
    preview: (
      <div className="w-full h-full bg-white font-sans text-[6px] text-gray-700">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-3 py-2">
          <div className="font-black text-[9px] text-white">John Smith</div>
          <div className="text-white opacity-80">john@email.com · New York</div>
        </div>
        <div className="p-3 leading-tight">
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex-1 h-px bg-purple-600" />
            <span className="text-purple-600 font-bold uppercase text-[5px]">Software Engineer</span>
            <div className="flex-1 h-px bg-purple-600" />
          </div>
          <div className="text-gray-600 space-y-0.5">
            <div>Dear Hiring Manager,</div>
            <div>I am writing to express my strong...</div>
          </div>
          <div className="mt-2 font-extrabold text-purple-600">John Smith</div>
        </div>
      </div>
    ),
  },
  {
    id: 'Minimal',
    label: 'Minimal',
    description: 'Ultra-clean whitespace-first design',
    preview: (
      <div className="w-full h-full bg-white font-sans text-[6px] text-gray-700 p-3">
        <div className="h-px bg-blue-500 mb-2" />
        <div className="font-light tracking-[0.15em] uppercase text-[7px] text-gray-900 mb-0.5">John Smith</div>
        <div className="text-gray-400 tracking-widest mb-2">john@email.com · +1 555-0000</div>
        <div className="mb-1.5">
          <div className="text-gray-700">Hiring Manager</div>
          <div className="text-gray-400">Acme Corp</div>
        </div>
        <div className="text-blue-500 uppercase tracking-widest font-medium text-[5px] mb-1.5">Re: Software Engineer</div>
        <div className="text-gray-600 space-y-1 font-light">
          <div>Dear Hiring Manager,</div>
          <div>I am writing to express my...</div>
        </div>
        <div className="mt-2 uppercase tracking-widest text-[5px] font-medium text-gray-800">John Smith</div>
        <div className="h-px bg-blue-500 mt-2" />
      </div>
    ),
  },
  {
    id: 'Executive',
    label: 'Executive',
    description: 'Dark premium header for senior & C-suite positions',
    preview: (
      <div className="w-full h-full bg-white font-sans text-[6px] text-gray-700">
        <div className="bg-[#1a1a2e] px-3 py-2">
          <div className="font-bold text-[9px] text-white">John Smith</div>
          <div className="text-white opacity-60">john@email.com · New York</div>
        </div>
        <div className="h-0.5 bg-amber-500" />
        <div className="p-3 leading-tight">
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-gray-400 uppercase text-[5px]">Subject</span>
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-amber-500 font-semibold text-[5px]">Software Engineer</span>
          </div>
          <div className="text-gray-600 space-y-0.5">
            <div>Dear Hiring Manager,</div>
            <div>I am writing to express my strong...</div>
          </div>
          <div className="mt-2 font-bold text-amber-500">John Smith</div>
        </div>
      </div>
    ),
  },
];

interface TemplateSelectorProps {
  selected: CoverLetterTemplate;
  settings: CoverLetterSettings;
  onSelect: (t: CoverLetterTemplate) => void;
  onColorChange: (key: 'primaryColor' | 'accentColor', value: string) => void;
  onFontChange: (font: string) => void;
}

const FONTS = ['Inter', 'Georgia', 'Times New Roman', 'Helvetica', 'Garamond'];

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selected,
  settings,
  onSelect,
  onColorChange,
  onFontChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Template cards */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Choose Template</h3>
        <div className="grid grid-cols-1 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`relative flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                selected === t.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-gray-200 hover:border-indigo-300 bg-white'
              }`}
            >
              {/* Mini preview */}
              <div className="w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                {t.preview}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900">{t.label}</span>
                  {selected === t.id && (
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-indigo-600">
                      <Check size={10} className="text-white" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Color customization */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Colour Scheme</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-600">Primary colour</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => onColorChange('primaryColor', e.target.value)}
                className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
              />
              <span className="text-xs text-gray-500 font-mono">{settings.primaryColor}</span>
            </div>
          </div>
          {selected === 'Creative' && (
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-600">Accent colour</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => onColorChange('accentColor', e.target.value)}
                  className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
                />
                <span className="text-xs text-gray-500 font-mono">{settings.accentColor}</span>
              </div>
            </div>
          )}
          {/* Quick colour presets */}
          <div className="flex gap-2 flex-wrap">
            {['#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#1a1a2e'].map((c) => (
              <button
                key={c}
                onClick={() => onColorChange('primaryColor', c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  settings.primaryColor === c ? 'border-gray-800 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Font */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Font Family</h3>
        <select
          value={settings.fontFamily}
          onChange={(e) => onFontChange(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          {FONTS.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>
              {f}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TemplateSelector;
