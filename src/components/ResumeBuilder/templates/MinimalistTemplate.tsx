import { ResumeBuilderData, ResumeBuilderSettings } from '../../../types/ResumeBuilder';

interface Props {
    data: {
        resume_content: ResumeBuilderData;
    };
    settings: ResumeBuilderSettings;
}

const MinimalistTemplate: React.FC<Props> = ({ data, settings }) => {
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
        '--primary-color': settings.primaryColor || '#000000',
        '--secondary-color': settings.secondaryColor || '#555555',
        '--font-family': fontMap[settings.fontFamily] || 'Inter, sans-serif',
        '--heading-scale': scaleMap[settings.headingSize] || 1,
        fontFamily: 'var(--font-family)',
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: '3rem',
        backgroundColor: 'white',
        boxSizing: 'border-box' as 'border-box',
        color: '#1f2937',
        lineHeight: '1.6'
    };

    const gray500 = '#6b7280';
    const gray800 = '#1f2937';

    // Skill keys mapping for consistency
    const skillGroups = [
        { label: 'Frontend', items: skills?.programming_languages || (skills as any)?.frontend },
        { label: 'Backend', items: skills?.frameworks || (skills as any)?.backend },
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
            {/* Centered Header */}
            <header className="text-center mb-10">
                <h1 className="text-4xl font-light uppercase tracking-widest mb-3"
                    style={{ fontSize: `calc(2.5rem * var(--heading-scale))` }}>
                    {name}
                </h1>
                <div className="flex justify-center flex-wrap gap-4 text-sm" style={{ color: gray500 }}>
                    {personal_info.email && <span>{personal_info.email}</span>}
                    {personal_info.phone && <span>{personal_info.phone}</span>}
                    {personal_info.location && <span>{personal_info.location}</span>}
                    {personal_info.linkedin && <a href={`https://${personal_info.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{personal_info.linkedin}</a>}
                    {personal_info.website && <a href={`https://${personal_info.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{personal_info.website}</a>}
                </div>
            </header>

            {/* Summary */}
            {professional_summary && (
                <section className="mb-8 text-center px-10">
                    <p className="text-base italic leading-relaxed" style={{ color: gray500 }}>
                        {professional_summary}
                    </p>
                </section>
            )}

            {/* Experience */}
            {experience && experience.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-center mb-6" style={{ color: 'var(--primary-color)' }}>Experience</h2>
                    <div className="space-y-8">
                        {experience.map((job, index) => (
                            <div key={index} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-2">
                                    <h3 className="font-semibold text-lg" style={{ color: gray800 }}>{job.title || job.role}</h3>
                                    <span className="text-sm italic" style={{ color: gray500 }}>{job.duration}</span>
                                </div>
                                <div className="mb-2 text-sm uppercase tracking-wide" style={{ color: 'var(--secondary-color)' }}>
                                    {job.company}{job.location ? `, ${job.location}` : ''}
                                </div>
                                <ul className="list-none space-y-2 text-sm">
                                    {Array.isArray(job.description || (job as any).responsibilities) ? (
                                        (job.description || (job as any).responsibilities).map((desc: string, i: number) => (
                                            <li key={i} className="pl-4 border-l-2" style={{ borderColor: '#f3f4f6' }}>{desc}</li>
                                        ))
                                    ) : (job.description || (job as any).responsibilities) ? (
                                        <li className="pl-4 border-l-2" style={{ borderColor: '#f3f4f6' }}>{String(job.description || (job as any).responsibilities)}</li>
                                    ) : null}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-center mb-6" style={{ color: 'var(--primary-color)' }}>Selected Projects</h2>
                    <div className="grid grid-cols-1 gap-6">
                        {projects.map((proj, index) => (
                            <div key={index} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-semibold" style={{ color: gray800 }}>{proj.name || (proj as any).title}</h3>
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <span className="text-xs italic" style={{ color: gray500 }}>{proj.technologies.join(', ')}</span>
                                    )}
                                </div>
                                <p className="text-sm mt-1 mb-2" style={{ color: gray500 }}>{proj.description}</p>
                                {proj.highlights && proj.highlights.length > 0 && (
                                    <ul className="list-disc list-inside text-xs" style={{ color: '#4b5563' }}>
                                        {proj.highlights.slice(0, 2).map((h, i) => <li key={i}>{h}</li>)}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills & Education Grid */}
            <div className="grid grid-cols-2 gap-10 mt-10 border-t pt-8" style={{ borderColor: '#f3f4f6' }}>
                {/* Skills */}
                {skillGroups.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--primary-color)' }}>Expertise</h2>
                        <div className="text-sm space-y-3">
                            {skillGroups.map((group, index) => (
                                <div key={index}>
                                    <span className="block font-semibold mb-1" style={{ color: gray800 }}>{group.label}</span>
                                    <span style={{ color: gray500 }}>{group.items.join(', ')}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {education && education.length > 0 && (
                    <section className="text-right">
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--primary-color)' }}>Education</h2>
                        <div className="space-y-3 text-sm">
                            {education.map((edu, index) => (
                                <div key={index}>
                                    <div className="font-semibold" style={{ color: gray800 }}>{edu.institution}</div>
                                    <div style={{ color: gray500 }}>{edu.degree} {edu.field ? `- ${edu.field}` : ''}</div>
                                    <div className="text-xs italic mt-1" style={{ color: gray500 }}>{edu.duration || edu.year}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default MinimalistTemplate;
