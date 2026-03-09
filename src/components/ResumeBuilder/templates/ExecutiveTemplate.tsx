import { ResumeBuilderData, ResumeBuilderSettings } from '../../../types/ResumeBuilder';
import React from 'react';

interface Props {
    data: {
        resume_content: ResumeBuilderData;
    };
    settings: ResumeBuilderSettings;
}

const ExecutiveTemplate: React.FC<Props> = ({ data, settings }) => {
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
        '--primary-color': settings.primaryColor || '#1e3a8a', // blue-900 default
        '--secondary-color': settings.secondaryColor || '#1e40af',
        '--font-family': fontMap[settings.fontFamily] || 'Serif, Georgia, serif',
        '--heading-scale': scaleMap[settings.headingSize] || 1,
        fontFamily: 'var(--font-family)',
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: '3rem',
        backgroundColor: 'white',
        boxSizing: 'border-box' as 'border-box',
        color: '#111',
        lineHeight: '1.4'
    };

    const gray100 = '#f3f4f6';
    const gray600 = '#4b5563';
    const gray800 = '#1f2937';

    // Skill keys mapping for consistency
    const skillGroups = [
        { label: 'Technical Domains', items: skills?.programming_languages || (skills as any)?.frontend },
        { label: 'Technology Stack', items: skills?.frameworks || (skills as any)?.backend },
        { label: 'Strategic Tools', items: skills?.tools || (skills as any)?.tools_cloud },
        { label: 'Additional Skills', items: skills?.other }
    ].filter(group => {
        const items = Array.isArray(group.items) ? group.items.filter(i => i && String(i).trim()) : [];
        return items.length > 0;
    }).map(group => ({
        ...group,
        items: Array.isArray(group.items) ? group.items.filter(i => i && String(i).trim()) : []
    }));

    return (
        <div id="resume-preview" className="resume-container shadow-lg" style={containerStyle}>
            {/* Elegant Header */}
            <header className="text-center mb-10 border-b-2 pb-6" style={{ borderColor: 'var(--primary-color)' }}>
                <h1 className="text-4xl font-bold uppercase tracking-tight mb-2"
                    style={{ fontSize: `calc(2.5rem * var(--heading-scale))`, color: 'var(--primary-color)' }}>
                    {name}
                </h1>
                <div className="flex justify-center flex-wrap gap-x-6 gap-y-1 text-sm font-medium uppercase tracking-wider" style={{ color: gray600 }}>
                    {personal_info?.location && <span>{personal_info.location}</span>}
                    {personal_info?.phone && <span>{personal_info.phone}</span>}
                    {personal_info?.email && <span>{personal_info.email}</span>}
                </div>
                <div className="mt-2 text-xs opacity-75">
                    {personal_info?.linkedin && <a href={`https://${personal_info.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{personal_info.linkedin}</a>}
                    {personal_info?.website && <span> | <a href={`https://${personal_info.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{personal_info.website}</a></span>}
                </div>
            </header>

            {/* Powerful Summary */}
            {professional_summary && (
                <section className="mb-10">
                    <h2 className="text-lg font-bold uppercase tracking-widest mb-4 border-l-4 pl-4" style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
                        Executive Profile
                    </h2>
                    <p className="text-sm leading-relaxed text-justify indent-8" style={{ color: gray800 }}>
                        {professional_summary}
                    </p>
                </section>
            )}

            {/* Core Competencies (Skills) */}
            {skillGroups.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-lg font-bold uppercase tracking-widest mb-4 border-l-4 pl-4" style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
                        Core Competencies
                    </h2>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                        {skillGroups.map((group, index) => (
                            <div key={index}>
                                <h3 className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--secondary-color)' }}>{group.label}</h3>
                                <p className="text-sm border-t pt-2" style={{ color: gray800, borderColor: gray100 }}>{group.items.join(' • ')}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Professional Experience */}
            {experience && experience.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-lg font-bold uppercase tracking-widest mb-6 border-l-4 pl-4" style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
                        Professional Experience
                    </h2>
                    <div className="space-y-8">
                        {experience.map((job, index) => (
                            <div key={index} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-lg font-bold" style={{ color: gray800 }}>{job.company}</h3>
                                    <span className="text-sm font-bold uppercase" style={{ color: 'var(--primary-color)' }}>{job.duration}</span>
                                </div>
                                <div className="flex justify-between items-baseline mb-3 italic text-sm" style={{ color: gray600 }}>
                                    <span>{job.title || job.role}</span>
                                    <span>{job.location}</span>
                                </div>
                                <ul className="list-disc list-outside ml-5 space-y-2 text-sm leading-snug">
                                    {Array.isArray(job.description || (job as any).responsibilities) ? (
                                        (job.description || (job as any).responsibilities).map((desc: string, i: number) => (
                                            <li key={i} style={{ color: gray800 }}>{desc}</li>
                                        ))
                                    ) : (job.description || (job as any).responsibilities) ? (
                                        <li style={{ color: gray800 }}>{String(job.description || (job as any).responsibilities)}</li>
                                    ) : null}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Projects & Education Bottom Grid */}
            <div className="grid grid-cols-2 gap-12 border-t pt-8" style={{ borderColor: gray100 }}>
                {projects && projects.length > 0 && (
                    <section>
                        <h2 className="text-md font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--primary-color)' }}>Selected Engagements</h2>
                        <div className="space-y-4">
                            {projects.map((proj, index) => (
                                <div key={index}>
                                    <div className="font-bold text-sm" style={{ color: gray800 }}>{proj.name || (proj as any).title}</div>
                                    <p className="text-xs mt-1" style={{ color: gray600 }}>{proj.description}</p>
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <div className="text-[10px] italic mt-1" style={{ color: 'var(--primary-color)' }}>{proj.technologies.join(', ')}</div>
                                    )}
                                    {proj.highlights && proj.highlights.length > 0 && (
                                        <ul className="list-none text-[10px] mt-1 space-y-0.5">
                                            {proj.highlights.slice(0, 2).map((h, i) => <li key={i} style={{ color: gray800 }}>• {h}</li>)}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {education && education.length > 0 && (
                    <section>
                        <h2 className="text-md font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--primary-color)' }}>Educational Credentials</h2>
                        <div className="space-y-4">
                            {education.map((edu, index) => (
                                <div key={index}>
                                    <div className="font-bold text-sm" style={{ color: gray800 }}>{edu.institution}</div>
                                    <div className="text-xs">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
                                    <div className="text-xs italic" style={{ color: gray600 }}>{edu.duration || edu.year}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ExecutiveTemplate;
