const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Define Lesson Schema (just enough to query them)
const lessonSchema = new mongoose.Schema({
    title: String,
    subjectId: mongoose.Schema.Types.ObjectId,
});
const Lesson = mongoose.model('Lesson', lessonSchema);

// Define Quiz Schema
const quizSchema = new mongoose.Schema({
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
}, { timestamps: true });
const Quiz = mongoose.model('Quiz', quizSchema);

async function seedQuizzes() {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI is not defined in the environment.");
        }

        console.log("Connecting to MongoDB...");
        await mongoose.connect(mongoUri);
        console.log("Connected successfully.");

        // Delete existing quizzes to start fresh
        console.log("Clearing old quizzes...");
        await Quiz.deleteMany({});

        // Fetch all lessons
        const lessons = await Lesson.find({});
        console.log(`Found ${lessons.length} lessons to seed quizzes for.`);

        if (lessons.length === 0) {
            console.log("No lessons found! Cannot seed quizzes.");
            return;
        }

        const newQuizzes = [];

        // Create 3 generic but relevant questions for each lesson based on its title
        for (const lesson of lessons) {
            const isDesign = lesson.title.toLowerCase().includes('design') || lesson.title.toLowerCase().includes('layout');
            const isReact = lesson.title.toLowerCase().includes('react') || lesson.title.toLowerCase().includes('state');
            const isArchitecture = lesson.title.toLowerCase().includes('architecture') || lesson.title.toLowerCase().includes('system');
            const isJS = lesson.title.toLowerCase().includes('javascript') || lesson.title.toLowerCase().includes('js');

            // We dynamically create questions based on the lesson focus
            if (isDesign) {
                newQuizzes.push({
                    lessonId: lesson._id,
                    question: `What is the primary benefit of responsive design as discussed in "${lesson.title}"?`,
                    options: ["It loads faster", "It adapts to different screen sizes", "It requires less CSS", "It only works on mobile"],
                    correctAnswer: "It adapts to different screen sizes"
                });
                newQuizzes.push({
                    lessonId: lesson._id,
                    question: "Which CSS property is most commonly used for flexible layouts?",
                    options: ["float: left", "display: flex", "position: absolute", "display: block"],
                    correctAnswer: "display: flex"
                });
                newQuizzes.push({
                    lessonId: lesson._id,
                    question: "In Modern UI design, what is 'whitespace' used for?",
                    options: ["To save bandwidth", "To improve legibility and grouping", "Only for error states", "To force users to scroll"],
                    correctAnswer: "To improve legibility and grouping"
                });
            } else if (isReact) {
                newQuizzes.push({
                    lessonId: lesson._id,
                    question: `Regarding "${lesson.title}", what hook is used to manage local state?`,
                    options: ["useEffect", "useReducer", "useState", "useContext"],
                    correctAnswer: "useState"
                });
                newQuizzes.push({
                    lessonId: lesson._id,
                    question: "What does the Virtual DOM do in React?",
                    options: ["Directly manipulates the browser DOM", "Optimizes rendering by computing differences", "Replaces HTML completely", "Manages database connections"],
                    correctAnswer: "Optimizes rendering by computing differences"
                });
                newQuizzes.push({
                    lessonId: lesson._id,
                    question: "When should you use the useEffect hook?",
                    options: ["To declare state", "For side effects like data fetching", "To return JSX elements", "To style components"],
                    correctAnswer: "For side effects like data fetching"
                });
            } else if (isArchitecture) {
                newQuizzes.push({
                    lessonId: lesson._id,
                    question: `What is a core principle taught in "${lesson.title}"?`,
                    options: ["Monoliths are always better", "Separation of concerns", "Tight coupling", "Avoid using interfaces"],
                    correctAnswer: "Separation of concerns"
                });
                newQuizzes.push({
                    lessonId: lesson._id,
                    question: "What is horizontal scaling?",
                    options: ["Adding more RAM to a server", "Adding more machines to a pool", "Scaling the width of the UI", "Optimizing database indexes"],
                    correctAnswer: "Adding more machines to a pool"
                });
                newQuizzes.push({
                    lessonId: lesson._id,
                    question: "What does the 'S' in SOLID principles stand for?",
                    options: ["Single Responsibility", "System Reliability", "Scalable Solution", "Static Typing"],
                    correctAnswer: "Single Responsibility"
                });
            } else {
                // Generic questions for unmatched titles
                newQuizzes.push({
                    lessonId: lesson._id,
                    question: `Which of the following is the main objective of "${lesson.title}"?`,
                    options: ["Understanding fundamentals", "Mastering advanced deployments", "Learning obsolete syntax", "Setting up local environments"],
                    correctAnswer: "Understanding fundamentals"
                });
                newQuizzes.push({
                    lessonId: lesson._id,
                    question: "What is the recommended approach to mastering this material?",
                    options: ["Reading only", "Copy-pasting code", "Hands-on practice", "Skipping the exercises"],
                    correctAnswer: "Hands-on practice"
                });
                newQuizzes.push({
                    lessonId: lesson._id,
                    question: "What should you do if you encounter a bug while following this lesson?",
                    options: ["Give up immediately", "Read the error message and trace it", "Delete the project", "Ignore the error"],
                    correctAnswer: "Read the error message and trace it"
                });
            }
        }

        console.log(`Prepared ${newQuizzes.length} quizzes. Inserting...`);
        const inserted = await Quiz.insertMany(newQuizzes);
        console.log(`Successfully inserted ${inserted.length} quizzes across ${lessons.length} lessons!`);

    } catch (error) {
        console.error("Error seeding quizzes:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

seedQuizzes();
