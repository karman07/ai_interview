const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Setup schemas
const subjectSchema = new mongoose.Schema({
    title: String,
});
const Subject = mongoose.model('Subject', subjectSchema);

const lessonSchema = new mongoose.Schema({
    title: String,
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
});
const Lesson = mongoose.model('Lesson', lessonSchema);

const quizSchema = new mongoose.Schema({
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
}, { timestamps: true });
const Quiz = mongoose.model('Quiz', quizSchema);

// A simple dictionary to map subject keywords to realistic quiz questions
const questionBank = {
    javascript: [
        {
            q: "What is the primary difference between let and var in JavaScript?",
            o: ["let has block scope, var has function scope", "let is hoisted, var is not", "var cannot be reassigned", "They are exactly the same"],
            a: "let has block scope, var has function scope"
        },
        {
            q: "Which method is used to turn a JSON string into a JavaScript object?",
            o: ["JSON.parse()", "JSON.stringify()", "JSON.objectify()", "String.toJSON()"],
            a: "JSON.parse()"
        },
        {
            q: "What does the '===' operator do in JavaScript?",
            o: ["Checks strict equality without type coercion", "Assigns a value", "Checks only value, ignoring type", "Compares memory addresses"],
            a: "Checks strict equality without type coercion"
        }
    ],
    react: [
        {
            q: "What is the primary purpose of the Virtual DOM in React?",
            o: ["To improve performance by minimizing direct DOM manipulations", "To create 3D interfaces", "To bypass CSS styling", "To run React natively on mobile"],
            a: "To improve performance by minimizing direct DOM manipulations"
        },
        {
            q: "Which hook should you use for side effects like data fetching?",
            o: ["useEffect", "useState", "useContext", "useMemo"],
            a: "useEffect"
        },
        {
            q: "How does React handle state changes?",
            o: ["It schedules a re-render of the component", "It immediately modifies the HTML", "It refreshes the browser page", "It mutates the state object directly"],
            a: "It schedules a re-render of the component"
        }
    ],
    python: [
        {
            q: "What is a key difference between a list and a tuple in Python?",
            o: ["Tuples are immutable, lists are mutable", "Lists are faster", "Tuples cannot hold strings", "Lists use parentheses"],
            a: "Tuples are immutable, lists are mutable"
        },
        {
            q: "How do you start a function declaration in Python?",
            o: ["def functionName():", "function functionName()", "void functionName()", "create function()"],
            a: "def functionName():"
        },
        {
            q: "What does the '__init__' method do in a Python class?",
            o: ["Initializes the object's attributes when instantiated", "Deletes the object", "Imports libraries", "Returns a string representation"],
            a: "Initializes the object's attributes when instantiated"
        }
    ],
    design: [
        {
            q: "What is the primary goal of wireframing in UI/UX design?",
            o: ["To establish structure and layout before adding visual details", "To choose the final color palette", "To write production code", "To animate screen transitions"],
            a: "To establish structure and layout before adding visual details"
        },
        {
            q: "In typography, what does 'kerning' refer to?",
            o: ["The spacing between individual letters", "The height of the font", "The spacing between lines of text", "The boldness of the text"],
            a: "The spacing between individual letters"
        },
        {
            q: "Which color model is primarily used for digital screens?",
            o: ["RGB", "CMYK", "Pantone", "Grayscale"],
            a: "RGB"
        }
    ],
    architecture: [
        {
            q: "What is the fundamental characteristic of microservices architecture?",
            o: ["Organizing an application as a collection of loosely coupled services", "Building the entire app into a single executable", "Using only one database", "Restricting API access"],
            a: "Organizing an application as a collection of loosely coupled services"
        },
        {
            q: "What is the main purpose of a Load Balancer?",
            o: ["To distribute incoming network traffic across multiple servers", "To encrypt passwords", "To store static files", "To compile background code"],
            a: "To distribute incoming network traffic across multiple servers"
        },
        {
            q: "In the CAP theorem, what does the 'C' stand for?",
            o: ["Consistency", "Concurrency", "Compilation", "Caching"],
            a: "Consistency"
        }
    ],
    data: [
        {
            q: "In SQL, what command is used to retrieve data from a database?",
            o: ["SELECT", "GET", "FETCH", "EXTRACT"],
            a: "SELECT"
        },
        {
            q: "What is the purpose of an index in a database?",
            o: ["To speed up specific data retrieval operations", "To encrypt the data", "To delete old records", "To format output text"],
            a: "To speed up specific data retrieval operations"
        },
        {
            q: "Which of the following is considered a Non-Relational (NoSQL) database?",
            o: ["MongoDB", "PostgreSQL", "MySQL", "Oracle"],
            a: "MongoDB"
        }
    ],
    algorithms: [
        {
            q: "What is the time complexity of a standard Binary Search algorithm?",
            o: ["O(log n)", "O(n)", "O(n^2)", "O(1)"],
            a: "O(log n)"
        },
        {
            q: "Which data structure uses LIFO (Last-In, First-Out)?",
            o: ["Stack", "Queue", "Array", "Linked List"],
            a: "Stack"
        },
        {
            q: "What is 'Big O notation' used for?",
            o: ["Describing the performance or complexity of an algorithm", "Styling text elements", "Naming variables", "Connecting to servers"],
            a: "Describing the performance or complexity of an algorithm"
        }
    ],
    generic: [
        {
            q: "What is the main learning objective of this sequence?",
            o: ["To understand core concepts and apply them practically", "To memorize syntax without context", "To skip directly to advanced usage", "To bypass documentation"],
            a: "To understand core concepts and apply them practically"
        },
        {
            q: "Why is practicing hands-on critical for this topic?",
            o: ["It builds muscle memory and context for problem-solving", "It isn't; reading is sufficient", "It's a requirement of the compiler", "It guarantees you will never make a bug"],
            a: "It builds muscle memory and context for problem-solving"
        },
        {
            q: "When encountering a complex problem in this domain, what is a recommended first step?",
            o: ["Break it down into smaller, manageable pieces", "Start writing code immediately", "Copy an entire solution from the internet", "Give up and change topics"],
            a: "Break it down into smaller, manageable pieces"
        }
    ]
};

async function seedQuizzes() {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) throw new Error("MONGO_URI not defined.");

        console.log("Connecting to MongoDB...");
        await mongoose.connect(mongoUri);

        console.log("Clearing old dummy quizzes...");
        await Quiz.deleteMany({});

        // Fetch subjects and populate lessons
        const subjects = await Subject.find({});
        const lessons = await Lesson.find({}).populate('subjectId');

        console.log(`Found ${subjects.length} Subjects and ${lessons.length} Lessons.`);

        const newQuizzes = [];

        for (const lesson of lessons) {
            if (!lesson.subjectId) continue;

            const subjectTitle = lesson.subjectId.title.toLowerCase();
            const lessonTitle = lesson.title.toLowerCase();

            const searchStr = `${subjectTitle} ${lessonTitle}`;

            let category = 'generic'; // fallback

            // Determine category based on keywords
            if (searchStr.includes('javascript') || searchStr.includes('js') || searchStr.includes('node') || searchStr.includes('frontend')) {
                category = 'javascript';
            } else if (searchStr.includes('react') || searchStr.includes('ui') || searchStr.includes('component')) {
                category = 'react';
            } else if (searchStr.includes('python') || searchStr.includes('django') || searchStr.includes('flask')) {
                category = 'python';
            } else if (searchStr.includes('design') || searchStr.includes('architecture') || searchStr.includes('system')) {
                if (searchStr.includes('ui') || searchStr.includes('ux') || searchStr.includes('wireframe')) {
                    category = 'design';
                } else {
                    category = 'architecture';
                }
            } else if (searchStr.includes('data') || searchStr.includes('sql') || searchStr.includes('database') || searchStr.includes('mongo')) {
                category = 'data';
            } else if (searchStr.includes('algorithm') || searchStr.includes('structure') || searchStr.includes('sort')) {
                category = 'algorithms';
            }

            const selectedQuestions = questionBank[category] || questionBank.generic;

            // Customize Generic questions slightly if that's the fallback
            const customize = (qStr) => {
                if (category === 'generic' && qStr.includes("this sequence")) {
                    return qStr.replace("this sequence", `the lesson: "${lesson.title}"`);
                }
                if (category === 'generic' && qStr.includes("this topic")) {
                    return qStr.replace("this topic", `"${lesson.subjectId.title}" concepts`);
                }
                return qStr;
            };

            for (let i = 0; i < selectedQuestions.length; i++) {
                const qData = selectedQuestions[i];
                newQuizzes.push({
                    lessonId: lesson._id,
                    question: customize(qData.q),
                    options: qData.o,
                    correctAnswer: qData.a
                });
            }
        }

        console.log(`Prepared ${newQuizzes.length} rich quizzes. Inserting...`);
        const inserted = await Quiz.insertMany(newQuizzes);
        console.log(`Successfully seeded ${inserted.length} realistic quizzes mapped to your courses and lessons!`);

    } catch (error) {
        console.error("Error seeding:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

seedQuizzes();
