import { ResumeBuilderData, ResumeBuilderSettings } from '../../../types/ResumeBuilder';

interface Props {
    data: {
        resume_content: ResumeBuilderData;
    };
    settings: ResumeBuilderSettings;
}

const ClassicTemplate: React.FC<Props> = ({ data, settings }) => {
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
        '--font-family': fontMap[settings.fontFamily] || 'Georgia, serif',
        '--heading-scale': scaleMap[settings.headingSize] || 1,
        fontFamily: 'var(--font-family)',
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: '2.5rem',
        backgroundColor: 'white',
        boxSizing: 'border-box' as 'border-box',
        color: '#000',
        lineHeight: '1.4'
    };

    const black = '#000000';
    const gray200 = '#e5e7eb';
    const gray600 = '#4b5563';
    // Skill keys mapping for consistency
    const skillGroups = [
        { label: 'Programming Languages', items: skills?.programming_languages || (skills as any)?.frontend },
        { label: 'Frameworks', items: skills?.frameworks || (skills as any)?.backend },
        { label: 'Tools & Technologies', items: skills?.tools || (skills as any)?.tools_cloud },
        { label: 'Other Skills', items: skills?.other }
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
            <header className="border-b-4 mb-6 pb-4" style={{ borderColor: 'var(--primary-color)' }}>
                <h1 className="text-3xl font-bold uppercase tracking-wide mb-2"
                    style={{ fontSize: `calc(2.25rem * var(--heading-scale))`, color: 'var(--primary-color)' }}>
                    {name}
                </h1>
                <div className="flex flex-wrap gap-x-4 text-sm font-medium" style={{ color: black }}>
                    {personal_info.email && <span>{personal_info.email}</span>}
                    {personal_info.phone && <span>{personal_info.phone}</span>}
                    {personal_info.location && <span>{personal_info.location}</span>}
                    {personal_info.linkedin && <span><a href={`https://${personal_info.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{personal_info.linkedin}</a></span>}
                    {personal_info.github && <span><a href={`https://${personal_info.github}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{personal_info.github}</a></span>}
                    {personal_info.website && <span><a href={`https://${personal_info.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{personal_info.website}</a></span>}
                </div>
            </header>

            {/* Content Body */}
            <div>
                {/* Summary */}
                {professional_summary && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--primary-color)' }}>Professional Summary</h2>
                        <p className="text-sm border-l-2 pl-4 py-1 italic" style={{ borderColor: gray200 }}>{professional_summary}</p>
                    </section>
                )}

                {/* Skills */}
                {skillGroups.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--primary-color)' }}>Expertise</h2>
                        <div className="grid grid-cols-1 gap-1 text-sm">
                            {skillGroups.map((group, index) => (
                                <div key={index} className="mb-1">
                                    <span className="font-bold">{group.label}:</span> {group.items.join(', ')}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Experience */}
                {experience && experience.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-4 border-b" style={{ color: 'var(--primary-color)', borderColor: gray200 }}>Professional Experience</h2>
                        <div className="space-y-4">
                            {experience.map((job, index) => (
                                <div key={index} className="break-inside-avoid">
                                    <div className="flex justify-between items-baseline font-bold text-sm">
                                        <h3 style={{ color: black }}>{job.company}</h3>
                                        <span>{job.duration}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline italic text-xs mb-2">
                                        <span>{job.title || job.role}</span>
                                        <span>{job.location}</span>
                                    </div>
                                    <ul className="list-square list-outside ml-4 text-sm space-y-1">
                                        {Array.isArray(job.description || (job as any).responsibilities) ? (
                                            (job.description || (job as any).responsibilities)?.map((desc: string, i: number) => (
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

                {/* Projects */}
                {projects && projects.length > 0 && (
                    <section className="mb-5">
                        <h2 className="text-lg font-bold uppercase border-b-2 mb-3"
                            style={{ borderColor: 'var(--secondary-color)', color: 'var(--secondary-color)' }}>
                            Projects
                        </h2>
                        <div className="space-y-3">
                            {projects.map((proj, index) => (
                                <div key={index} className="break-inside-avoid">
                                    <div className="flex justify-between font-bold text-sm">
                                        <span>{proj.name || (proj as any).title}</span>
                                        {proj.technologies && proj.technologies.length > 0 && (
                                            <span className="font-normal italic text-xs">{proj.technologies.join(', ')}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-justify">{proj.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {education && education.length > 0 && (
                    <section className="mb-5 break-inside-avoid">
                        <h2 className="text-lg font-bold uppercase border-b-2 mb-3"
                            style={{ borderColor: 'var(--secondary-color)', color: 'var(--secondary-color)' }}>
                            Education
                        </h2>
                        <div className="space-y-2">
                            {education.map((edu, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <div>
                                        <div className="font-bold">{edu.institution}</div>
                                        <div>{edu.degree} {edu.field ? `- ${edu.field}` : ''}</div>
                                    </div>
                                    <div className="text-right">
                                        <div>{edu.duration || edu.year}</div>
                                        {edu.gpa && <div>GPA: {edu.gpa}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Certifications & Achievements */}
                <div className="grid grid-cols-2 gap-6">
                    {achievements && achievements.length > 0 && (
                        <section>
                            <h2 className="text-md font-bold uppercase border-b mb-2" style={{ color: 'var(--secondary-color)' }}>Achievements</h2>
                            <ul className="text-sm list-disc ml-4">
                                {achievements.slice(0, 3).map((ach, i) => <li key={i}>{ach}</li>)}
                            </ul>
                        </section>
                    )}
                    {languages && languages.length > 0 && (
                        <section>
                            <h2 className="text-md font-bold uppercase border-b mb-2" style={{ color: 'var(--secondary-color)' }}>Languages</h2>
                            <ul className="text-sm list-disc ml-4">
                                {languages.map((lang, i) => <li key={i}>{lang.language} ({lang.proficiency})</li>)}
                            </ul>
                        </section>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ClassicTemplate;
