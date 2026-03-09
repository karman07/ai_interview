import React from 'react';
import { ResumeBuilderData, ResumeBuilderSettings } from '../../../types/ResumeBuilder';

interface Props {
    data: {
        resume_content: ResumeBuilderData;
    };
    settings: ResumeBuilderSettings;
}

const TimelineTemplate: React.FC<Props> = ({ data, settings }) => {
    // Standardize data access: handle both wrapped {resume_content: data} and raw data
    const resume_content = data?.resume_content || (data as any)?.personal_info ? data : null;

    if (!resume_content) return null;

    const {
        personal_info,
        professional_summary,
        skills,
        experience,
        projects,
        education,
        achievements,
        certifications,
        languages
    } = (resume_content as any).resume_content ? (resume_content as any).resume_content : resume_content;

    // Handle name fallbacks
    const name = personal_info?.name || (personal_info as any)?.fullName || (personal_info as any)?.full_name || 'Your Name';

    const fontMap: Record<string, string> = {
        'Inter': 'Inter, sans-serif',
        'Roboto': 'Roboto, sans-serif',
        'Serif': 'Georgia, serif'
    };

    const scaleMap: Record<string, number> = {
        'Small': 0.8,
        'Medium': 1,
        'Large': 1.2
    };

    const containerStyle: React.CSSProperties & Record<string, any> = {
        '--primary-color': settings.primaryColor || '#6366f1', // indigo-500 default
        '--secondary-color': settings.secondaryColor || '#4338ca',
        '--font-family': fontMap[settings.fontFamily] || 'Inter, sans-serif',
        '--heading-scale': scaleMap[settings.headingSize] || 1,
        fontFamily: 'var(--font-family)',
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: '2.5rem',
        backgroundColor: 'white',
        boxSizing: 'border-box' as 'border-box',
        color: '#1f2937',
        lineHeight: '1.5'
    };

    const gray100 = '#f3f4f6';
    const gray200 = '#e5e7eb';
    const gray600 = '#4b5563';
    const gray800 = '#1f2937';

    // Skill keys mapping for consistency
    const skillGroups = [
        { label: 'Technical Skills', items: skills?.programming_languages || (skills as any)?.frontend },
        { label: 'Frameworks/Tools', items: skills?.frameworks || (skills as any)?.backend },
        { label: 'Other Expertise', items: skills?.tools || (skills as any)?.tools_cloud },
    ].filter(group => {
        const items = Array.isArray(group.items) ? group.items.filter(i => i && String(i).trim()) : [];
        return items.length > 0;
    }).map(group => ({
        ...group,
        items: Array.isArray(group.items) ? group.items.filter(i => i && String(i).trim()) : []
    }));

    return (
        <div id="resume-preview" className="resume-container shadow-lg" style={containerStyle}>
            {/* Header */}
            <header className="mb-10">
                <h1 className="text-5xl font-black uppercase tracking-tighter mb-2"
                    style={{ fontSize: `calc(3rem * var(--heading-scale))`, color: 'var(--primary-color)' }}>
                    {name}
                </h1>
                <div className="flex flex-wrap gap-x-4 text-xs font-bold uppercase tracking-widest" style={{ color: gray600 }}>
                    {[personal_info.email, personal_info.phone, personal_info.location, personal_info.linkedin].filter(Boolean).map((info, i) => (
                        <span key={i}>{info}</span>
                    ))}
                </div>
            </header>

            <div className="flex gap-10">
                {/* Left: Timeline Part */}
                <main className="flex-1 border-r pr-10" style={{ borderColor: gray200 }}>
                    {/* Summary */}
                    {professional_summary && (
                        <section className="mb-10 text-justify">
                            <p className="text-sm opacity-80">{professional_summary}</p>
                        </section>
                    )}

                    {/* Work Timeline */}
                    {experience && experience.length > 0 && (
                        <section className="mb-10">
                            <h2 className="text-sm font-black uppercase tracking-widest mb-6" style={{ color: 'var(--primary-color)' }}>Experience</h2>
                            <div className="space-y-10 relative">
                                {experience.map((job, index) => (
                                    <div key={index} className="break-inside-avoid relative pl-8">
                                        {/* Timeline Line */}
                                        <div style={{ position: 'absolute', left: '0', top: '0', bottom: '-40px', width: '2px', backgroundColor: gray100 }}></div>
                                        {/* Marker */}
                                        <div style={{ position: 'absolute', left: '-4px', top: '8px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }}></div>

                                        <div className="mb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-gray-100 mb-2 inline-block">
                                                {job.duration}
                                            </span>
                                            <h3 className="text-lg font-bold leading-tight" style={{ color: gray800 }}>{job.title || job.role}</h3>
                                            <div className="text-sm font-medium" style={{ color: 'var(--secondary-color)' }}>{job.company}</div>
                                        </div>
                                        <ul className="list-none text-xs space-y-2 opacity-80">
                                            {Array.isArray(job.description || (job as any).responsibilities) ? (
                                                (job.description || (job as any).responsibilities).map((desc: string, i: number) => (
                                                    <li key={i} className="mb-1">
                                                        <span className="mr-2">•</span>{desc}
                                                    </li>
                                                ))
                                            ) : (job.description || (job as any).responsibilities) ? (
                                                <li className="mb-1">
                                                    <span className="mr-2">•</span>{String(job.description || (job as any).responsibilities)}
                                                </li>
                                            ) : null}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {projects && projects.length > 0 && (
                        <section className="mb-10">
                            <h2 className="text-sm font-black uppercase tracking-widest mb-6" style={{ color: 'var(--primary-color)' }}>Projects</h2>
                            <div className="space-y-6">
                                {projects.map((proj, index) => (
                                    <div key={index} className="break-inside-avoid">
                                        <h3 className="font-bold text-sm mb-1 uppercase" style={{ color: gray800 }}>{proj.name || (proj as any).title}</h3>
                                        <p className="text-xs mb-2 opacity-80">{proj.description}</p>
                                        {proj.technologies && proj.technologies.length > 0 && (
                                            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase opacity-60">
                                                {proj.technologies.join(' / ')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                {/* Right: Info Panels */}
                <aside className="w-1/3">
                    {/* Skills */}
                    {skillGroups.length > 0 && (
                        <section className="mb-10">
                            <h2 className="text-xs font-black uppercase tracking-widest mb-4 pb-2 border-b-2" style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>Expertise</h2>
                            <div className="space-y-6">
                                {skillGroups.map((group, index) => (
                                    <div key={index}>
                                        <h3 className="text-[10px] font-bold uppercase mb-2 opacity-60">{group.label}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {group.items.map((skill, i) => (
                                                <span key={i} className="text-xs font-medium px-2 py-1 bg-gray-50 rounded" style={{ color: gray800 }}>{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Education */}
                    {education && education.length > 0 && (
                        <section className="mb-10">
                            <h2 className="text-xs font-black uppercase tracking-widest mb-4 pb-2 border-b-2" style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>Education</h2>
                            <div className="space-y-6">
                                {education.map((edu, index) => (
                                    <div key={index}>
                                        <div className="text-[10px] font-bold uppercase opacity-60 mb-1">{edu.duration || edu.year}</div>
                                        <div className="font-bold text-sm" style={{ color: gray800 }}>{edu.institution}</div>
                                        <div className="text-xs font-medium opacity-80">{edu.degree} {edu.field ? `- ${edu.field}` : ''}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Languages */}
                    {languages && languages.length > 0 && (
                        <section className="mb-10">
                            <h2 className="text-xs font-black uppercase tracking-widest mb-4 pb-2 border-b-2" style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>Languages</h2>
                            <div className="space-y-2">
                                {languages.map((lang, index) => (
                                    <div key={index} className="flex justify-between items-center text-xs">
                                        <span className="font-bold uppercase tracking-tight">{lang.language}</span>
                                        <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold">{lang.proficiency}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default TimelineTemplate;
