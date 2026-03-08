const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/ai_interview'; // adjust if needed

async function checkLessons() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const Subject = mongoose.model('Subject', new mongoose.Schema({ title: String }));
    const Lesson = mongoose.model('Lesson', new mongoose.Schema({ subjectId: mongoose.Schema.Types.ObjectId, title: String }));

    const subjects = await Subject.find();
    console.log(`Found ${subjects.length} subjects`);

    for (const s of subjects) {
        const lessonCount = await Lesson.countDocuments({ subjectId: s._id });
        console.log(`Subject: ${s.title} (_id: ${s._id}) - Lessons: ${lessonCount}`);
    }

    await mongoose.disconnect();
}

checkLessons().catch(console.error);
