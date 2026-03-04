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
        frontend: string[];
        backend: string[];
        tools_cloud: string[];
    };
    experience: {
        title: string;
        company: string;
        location: string;
        duration: string;
        description: string[];
        technologies: string[];
    }[];
    projects: {
        name: string;
        description: string;
        technologies: string[];
        github: string;
        demo: string;
        highlights: string[];
    }[];
    education: {
        degree: string;
        field: string;
        institution: string;
        duration: string;
        gpa: string;
    }[];
    achievements: string[];
    certifications: {
        name: string;
        issuer: string;
        date: string;
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
