export interface ResumeBuilderData {
    personal_info: {
        name: string;
        email: string;
        phone: string;
        location: string;
        linkedin: string;
        github: string;
        website: string;
    };
    professional_summary: string;
    skills: {
        programming_languages?: string[];
        frameworks?: string[];
        tools?: string[];
        other?: string[];
    };
    experience: {
        role?: string;
        title?: string;
        company: string;
        location?: string;
        duration: string;
        description?: string[];
        responsibilities?: string[];
        technologies?: string[];
    }[];
    projects: {
        name?: string;
        title?: string;
        description: string;
        technologies?: string[];
        github?: string;
        demo?: string;
        link?: string;
        highlights?: string[];
    }[];
    education: {
        degree: string;
        field?: string;
        institution: string;
        duration?: string;
        year?: string;
        gpa?: string;
        details?: string;
    }[];
    achievements: string[];
    certifications: {
        name: string;
        issuer: string;
        date?: string;
        year?: string;
    }[];
    languages: {
        language: string;
        proficiency: string;
    }[];
}

export interface ResumeBuilderSettings {
    selectedTemplate: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    headingSize: string;
}
