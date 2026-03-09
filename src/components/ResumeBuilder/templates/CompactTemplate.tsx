import { ResumeBuilderData, ResumeBuilderSettings } from '../../../types/ResumeBuilder';

interface Props {
    data: {
        resume_content: ResumeBuilderData;
    };
    settings: ResumeBuilderSettings;
}

const CompactTemplate: React.FC<Props> = ({ data, settings }) => {
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
        'Serif': 'Times New Roman, serif'
    };

    const scaleMap: Record<string, number> = {
        'Small': 0.8,
        'Medium': 1,
        'Large': 1.2
    };

    const containerStyle: React.CSSProperties & Record<string, any> = {
        '--primary-color': settings.primaryColor || '#111827', // dark gray default
        '--secondary-color': settings.secondaryColor || '#374151',
        '--font-family': fontMap[settings.fontFamily] || 'Inter, sans-serif',
        '--heading-scale': scaleMap[settings.headingSize] || 1,
        fontFamily: 'var(--font-family)',
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: '1.5rem', // Reduced padding
        backgroundColor: 'white',
        boxSizing: 'border-box' as 'border-box',
        color: '#111',
        lineHeight: '1.3', // Tighter line height
        fontSize: '10pt' // Base font size smaller
    };

    const borderBottom = '1px solid #e5e7eb';
    const gray50 = '#f9fafb'; // Added gray50
    const gray100 = '#f3f4f6';
    const gray500 = '#6b7280';
    const gray600 = '#4b5563';
    const gray800 = '#1f2937'; // Added gray800

    // Skill keys mapping for consistency
    const skillGroups = [
        { label: 'Programming Languages', items: skills?.programming_languages || (skills as any)?.frontend },
        { label: 'Frameworks', items: skills?.frameworks || (skills as any)?.backend },
        { label: 'Tools', items: skills?.tools || (skills as any)?.tools_cloud },
        { label: 'Other', items: skills?.other }
    ].filter(group => {
        const items = Array.isArray(group.items) ? group.items.filter(i => i && String(i).trim()) : [];
        return items.length > 0;
    }).map(group => ({
        ...group,
        items: Array.isArray(group.items) ? group.items.filter(i => i && String(i).trim()) : []
    }));

    return (
        <div id="resume-preview" className="resume-container shadow-lg" style={containerStyle}>
            {/* Header with Background */}
            <header className="flex justify-between items-center mb-6 p-6 rounded" style={{ backgroundColor: gray50 }}>
                <div>
                    <h1 className="font-bold uppercase tracking-tight"
                        style={{ fontSize: `calc(2rem * var(--heading-scale))`, color: 'var(--primary-color)' }}>
                        {name}
                    </h1>
                    <p className="text-sm font-medium" style={{ color: 'var(--secondary-color)' }}>Professional Resume</p>
                </div>
                <div className="text-right text-[10px] space-y-1">
                    {personal_info.email && <div className="font-bold">{personal_info.email}</div>}
                    {personal_info.phone && <div>{personal_info.phone}</div>}
                    {personal_info.location && <div>{personal_info.location}</div>}
                </div>
            </header>

            {/* Top Grid: Summary, Skills, Education */}
            <div className="grid grid-cols-3 gap-6 mb-8 border-b pb-8" style={{ borderColor: gray100 }}>
                <div className="col-span-1">
                    <h2 className="text-xs font-bold uppercase mb-3 px-2 py-1 inline-block rounded" style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>Profile</h2>
                    <p className="text-[11px] leading-relaxed text-justify">{professional_summary}</p>
                </div>
                <div className="col-span-1">
                    <h2 className="text-xs font-bold uppercase mb-3 px-2 py-1 inline-block rounded" style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>Skills</h2>
                    <div className="space-y-3">
                        {skillGroups.map((group, index) => (
                            <div key={index}>
                                <div className="text-[10px] font-bold uppercase mb-1" style={{ color: gray600 }}>{group.label}</div>
                                <div className="text-[10px] flex flex-wrap gap-1">
                                    {group.items.map((skill, i) => (
                                        <span key={i} className="bg-white border px-1 rounded-sm">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col-span-1">
                    <h2 className="text-xs font-bold uppercase mb-3 px-2 py-1 inline-block rounded" style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>Education</h2>
                    <div className="space-y-3">
                        {education && education.map((edu, index) => (
                            <div key={index} className="text-[10px]">
                                <div className="font-bold">{edu.institution}</div>
                                <div>{edu.degree} {edu.field ? `- ${edu.field}` : ''}</div>
                                <div className="italic" style={{ color: gray600 }}>{edu.duration || edu.year}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Experience */}
            {experience && experience.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-sm font-bold uppercase mb-4 tracking-widest border-l-4 pl-3" style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>Experience</h2>
                    <div className="space-y-6">
                        {experience.map((job, index) => (
                            <div key={index} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-sm font-bold uppercase" style={{ color: gray800 }}>{job.title || job.role}</h3>
                                    <span className="text-[10px] font-bold" style={{ color: gray600 }}>{job.duration}</span>
                                </div>
                                <div className="text-[11px] font-bold italic mb-2" style={{ color: 'var(--secondary-color)' }}>{job.company} | {job.location}</div>
                                <ul className="list-disc list-outside ml-4 text-[11px] space-y-1">
                                    {Array.isArray(job.description || (job as any).responsibilities) ? (
                                        (job.description || (job as any).responsibilities).map((desc: string, i: number) => (
                                            <li key={i}>{desc}</li>
                                        ))
                                    ) : (job.description || (job as any).responsibilities) ? (
                                        <li>{String(job.description || (job as any).responsibilities)}</li>
                                    ) : null}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Projects - Grid Layout */}
            {projects && projects.length > 0 && (
                <section className="mb-4">
                    <h2 className="text-sm font-bold uppercase mb-2 p-1" style={{ color: 'var(--primary-color)', backgroundColor: gray100 }}>Key Projects</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {projects.map((proj, index) => (
                            <div key={index} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline border-b border-dotted pb-0.5 mb-1">
                                    <h3 className="font-bold text-xs">{proj.name || (proj as any).title}</h3>
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <span className="text-[10px] italic">{proj.technologies.slice(0, 3).join(', ')}</span>
                                    )}
                                </div>
                                <p className="text-xs mb-1 leading-tight">{proj.description}</p>
                                {proj.highlights && proj.highlights.length > 0 && (
                                    <ul className="list-none text-[10px] pl-0" style={{ color: gray600 }}>
                                        {proj.highlights.slice(0, 2).map((h, i) => <li key={i}>• {h}</li>)}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="flex gap-4">
                {/* Achievements */}
                {achievements && achievements.length > 0 && (
                    <div className="flex-1">
                        <h2 className="text-xs font-bold uppercase mb-1 border-b" style={{ color: 'var(--primary-color)' }}>Achievements</h2>
                        <ul className="text-xs list-disc ml-4 space-y-0.5">
                            {achievements.slice(0, 3).map((ach, i) => <li key={i}>{ach}</li>)}
                        </ul>
                    </div>
                )}
                {/* Languages/Certs */}
                <div className="flex-1">
                    <h2 className="text-xs font-bold uppercase mb-1 border-b" style={{ color: 'var(--primary-color)' }}>Certifications</h2>
                    <div className="text-xs space-y-0.5">
                        {certifications && certifications.length > 0 && certifications.map((cert, i) => (
                            <div key={i}>{cert.name} <span style={{ color: gray500 }}>({cert.issuer})</span></div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CompactTemplate;
