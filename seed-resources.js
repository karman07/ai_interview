const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from nest backend
dotenv.config({ path: path.join(__dirname, '.env') });

const resourceSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    type: String,
    duration: String,
    studyTime: String,
    difficulty: { type: String, default: 'Beginner' },
    tags: [String],
    featured: { type: Boolean, default: false },
    status: { type: String, default: 'draft' },
    thumbnailUrl: String,
    downloadUrl: String,
    externalUrl: String,
    rating: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    students: { type: Number, default: 0 },
}, { timestamps: true });

const Resource = mongoose.model('Resource', resourceSchema);

const initialResources = [
    {
        title: "Complete Data Structures & Algorithms Mastery",
        description: "Industry-standard comprehensive guide covering advanced DSA concepts, optimization techniques, and real-world problem-solving patterns used by top tech companies.",
        category: "Programming",
        type: "Interactive Course",
        duration: "24 weeks",
        studyTime: "6-8 hrs/week",
        downloads: 47520,
        students: 12400,
        rating: 4.9,
        difficulty: "Advanced",
        featured: true,
        status: "published",
        tags: ["DSA", "Algorithms", "Interview Prep", "FAANG", "System Design"],
        thumbnailUrl: "/uploads/resources/dsa_mastery.png",
        downloadUrl: "",
        externalUrl: "https://github.com/trekhleb/javascript-algorithms"
    },
    {
        title: "System Design Architecture Masterclass",
        description: "Professional-grade system design course covering microservices, distributed systems, scalability patterns, and architectural decision-making frameworks.",
        category: "Programming",
        type: "Video Series",
        duration: "16 weeks",
        studyTime: "4-6 hrs/week",
        downloads: 32950,
        students: 8950,
        rating: 4.8,
        difficulty: "Expert",
        featured: true,
        status: "published",
        tags: ["System Design", "Architecture", "Microservices", "Scalability", "DevOps"],
        thumbnailUrl: "/uploads/resources/system_design.png",
        downloadUrl: "",
        externalUrl: "https://github.com/donnemartin/system-design-primer"
    },
    {
        title: "Advanced Mathematics for Engineering Excellence",
        description: "Comprehensive mathematical foundation covering calculus, linear algebra, differential equations, and discrete mathematics with engineering applications.",
        category: "Mathematics",
        type: "Study Guide",
        duration: "Self-paced",
        studyTime: "10-15 hrs",
        downloads: 68100,
        students: 23100,
        rating: 4.9,
        difficulty: "Intermediate",
        featured: false,
        status: "published",
        tags: ["Mathematics", "Engineering", "Calculus", "Linear Algebra", "JEE Advanced"],
        thumbnailUrl: "/uploads/resources/math_engineering.png",
        downloadUrl: "",
        externalUrl: "https://www.khanacademy.org/math"
    },
    {
        title: "Modern Frontend Development Ecosystem",
        description: "Contemporary frontend development covering React ecosystem, TypeScript, performance optimization, testing strategies, and deployment best practices.",
        category: "Web Development",
        type: "Practical Workshop",
        duration: "12 weeks",
        studyTime: "5-7 hrs/week",
        downloads: 41300,
        students: 15200,
        rating: 4.7,
        difficulty: "Intermediate",
        featured: false,
        status: "published",
        tags: ["React", "TypeScript", "Frontend", "Performance", "Testing"],
        thumbnailUrl: "/uploads/resources/frontend_dev.png",
        downloadUrl: "",
        externalUrl: "https://frontendmasters.com/guides/learning-roadmap/"
    },
    {
        title: "Professional English Communication Mastery",
        description: "Executive-level English communication program focusing on business presentations, negotiation skills, and international professional standards.",
        category: "Language",
        type: "Interactive Course",
        duration: "8 weeks",
        studyTime: "3-4 hrs/week",
        downloads: 29800,
        students: 11400,
        rating: 4.8,
        difficulty: "Intermediate",
        featured: true,
        status: "published",
        tags: ["Business English", "IELTS", "Professional Communication", "Presentations"],
        thumbnailUrl: "/uploads/resources/language_comm.png",
        downloadUrl: "",
        externalUrl: "https://www.britishcouncil.org/"
    },
    {
        title: "Machine Learning Production Systems",
        description: "Enterprise-grade ML engineering covering model deployment, MLOps pipelines, monitoring systems, and production-ready machine learning workflows.",
        category: "Data Science",
        type: "Technical Guide",
        duration: "20 weeks",
        studyTime: "8-10 hrs/week",
        downloads: 55750,
        students: 18750,
        rating: 4.9,
        difficulty: "Expert",
        featured: true,
        status: "published",
        tags: ["Machine Learning", "MLOps", "Python", "Production Systems", "AI Engineering"],
        thumbnailUrl: "/uploads/resources/ml_production.png",
        downloadUrl: "",
        externalUrl: "https://ml-ops.org/"
    },
    {
        title: "Quantitative Finance & Trading Strategies",
        description: "Professional finance program covering algorithmic trading, risk management, portfolio optimization, and quantitative analysis methodologies.",
        category: "Finance",
        type: "Professional Course",
        duration: "14 weeks",
        studyTime: "6-8 hrs/week",
        downloads: 19200,
        students: 7200,
        rating: 4.6,
        difficulty: "Advanced",
        featured: false,
        status: "published",
        tags: ["Quantitative Finance", "Trading", "Risk Management", "Algorithms"],
        thumbnailUrl: "/uploads/resources/finance.png",
        downloadUrl: "",
        externalUrl: "https://www.investopedia.com/quantitative-analysis-4773315"
    },
    {
        title: "Advanced UX Design & Research Methods",
        description: "Professional UX design methodology covering user research, design systems, accessibility standards, and data-driven design decision frameworks.",
        category: "Design",
        type: "Design Workshop",
        duration: "10 weeks",
        studyTime: "4-6 hrs/week",
        downloads: 34400,
        students: 11400,
        rating: 4.8,
        difficulty: "Advanced",
        featured: false,
        status: "published",
        tags: ["UX Design", "User Research", "Design Systems", "Accessibility", "Prototyping"],
        thumbnailUrl: "/uploads/resources/ux_design.png",
        downloadUrl: "",
        externalUrl: "https://www.nngroup.com/articles/"
    },
    {
        title: "Professional Resume Structure - Akash",
        description: "A comprehensive example of a high-impact technical resume. Learn how to structure your experience, skills, and projects to catch the eye of top recruiters.",
        category: "Career",
        type: "Reference PDF",
        duration: "Reference",
        studyTime: "5-10 mins",
        downloads: 1240,
        students: 3100,
        rating: 4.8,
        difficulty: "Beginner",
        featured: false,
        status: "published",
        tags: ["Resume", "Career", "Technical", "Blueprint"],
        thumbnailUrl: "/uploads/resources/resume_blueprint.png",
        downloadUrl: "/uploads/resources/akash_resume.pdf"
    },
    {
        title: "Executive Resume Blueprint - Isha",
        description: "Analyze the layout and content strategy used in this executive-level resume. Perfect for understanding how to highlight leadership and strategic impact.",
        category: "Career",
        type: "Reference PDF",
        duration: "Reference",
        studyTime: "5-10 mins",
        downloads: 980,
        students: 2450,
        rating: 4.9,
        difficulty: "Intermediate",
        featured: true,
        status: "published",
        tags: ["Resume", "Executive", "Strategy", "Impact"],
        thumbnailUrl: "/uploads/resources/resume_blueprint.png",
        downloadUrl: "/uploads/resources/isha_resume.pdf"
    },
    {
        title: "Tech Role Job Description Analysis",
        description: "A deep dive into common technical job descriptions. Learn to identify key requirements, hidden expectations, and how to tailor your profile accordingly.",
        category: "Career",
        type: "Case Study",
        duration: "Case Study",
        studyTime: "15-20 mins",
        downloads: 2100,
        students: 5200,
        rating: 4.7,
        difficulty: "Intermediate",
        featured: false,
        status: "published",
        tags: ["Job Description", "Analysis", "Recruitment", "Interviews"],
        thumbnailUrl: "/uploads/resources/jd_analysis.png",
        downloadUrl: "/uploads/resources/dine3d_jd.pdf"
    }
];

async function seed() {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI is not defined in the environment.");
        }

        console.log("Connecting to MongoDB...");
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB.");

        console.log(`Checking for existing resources...`);
        const count = await Resource.countDocuments();
        if (count > 0) {
            console.log(`Found ${count} resources. Deleting all to prevent duplicates...`);
            await Resource.deleteMany({});
        }

        console.log(`Inserting ${initialResources.length} initial resources...`);
        await Resource.insertMany(initialResources);

        console.log("Successfully seeded initial resources!");
    } catch (error) {
        console.error("Error seeding data:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

seed();
