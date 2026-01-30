# Quick Commands - Interview Analytics Testing

## 🚀 Server Management

```bash
# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

## 🧹 Database Cleanup

```bash
# Remove duplicate interview questions (run this first!)
node cleanup-duplicates.js

# MongoDB shell commands
mongosh ai_interview

# Count total interview questions
db.interviewquestions.countDocuments()

# Count questions for specific session
db.interviewquestions.countDocuments({ sessionId: ObjectId("YOUR_SESSION_ID") })

# Find all questions for a session
db.interviewquestions.find({ sessionId: ObjectId("YOUR_SESSION_ID") }).pretty()

# Check for duplicates
db.interviewquestions.aggregate([
  {
    $group: {
      _id: { sessionId: "$sessionId", questionNumber: "$questionNumber" },
      count: { $sum: 1 },
      docs: { $push: "$$ROOT" }
    }
  },
  { $match: { count: { $gt: 1 } } },
  { $sort: { count: -1 } }
])

# Check indexes
db.interviewquestions.getIndexes()

# Drop duplicate index (if needed)
db.interviewquestions.dropIndex("sessionId_1_questionNumber_1")

# Delete all interview questions (CAUTION!)
db.interviewquestions.deleteMany({})

# Delete questions for specific session
db.interviewquestions.deleteMany({ sessionId: ObjectId("YOUR_SESSION_ID") })
```

## 🧪 API Testing (Postman/cURL)

### Get Dashboard Overview
```bash
curl -X GET "http://localhost:3000/interview-results/dashboard" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Interview History
```bash
curl -X GET "http://localhost:3000/interview-results/history?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Session Details
```bash
curl -X GET "http://localhost:3000/interview-results/session/SESSION_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Session Questions
```bash
curl -X GET "http://localhost:3000/interview-results/session/SESSION_ID/questions" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Performance Stats (Last 30 days)
```bash
curl -X GET "http://localhost:3000/interview-results/stats/performance?days=30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Stats by Company
```bash
curl -X GET "http://localhost:3000/interview-results/stats/by-company" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Stats by Role
```bash
curl -X GET "http://localhost:3000/interview-results/stats/by-role" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Verify Data Quality

### Check if question has complete data
```javascript
// In MongoDB shell
const session = db.interviewquestions.findOne({ 
  sessionId: ObjectId("YOUR_SESSION_ID"),
  questionNumber: 1 
});

print("✅ Checks:");
print("Has answerText:", session.answerText ? "YES" : "NO");
print("Answer length:", session.answerText?.length || 0);
print("Has scores:", session.scores ? "YES" : "NO");
print("Overall score:", session.scores?.overall || 0);
print("Has feedback:", session.feedback ? "YES" : "NO");
print("Feedback length:", session.feedback?.length || 0);
print("Strengths count:", session.strengths?.length || 0);
print("Improvements count:", session.improvements?.length || 0);
```

### Verify no duplicates
```javascript
// Should return empty array (no duplicates)
db.interviewquestions.aggregate([
  {
    $group: {
      _id: { sessionId: "$sessionId", questionNumber: "$questionNumber" },
      count: { $sum: 1 }
    }
  },
  { $match: { count: { $gt: 1 } } }
])
```

## 🔍 Debugging Console Logs

### What to look for in successful save:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 ANSWER RECEIVED - TRIGGERING MONGODB SAVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 LATEST QUESTION DATA INSPECTION:
   Has answer field: true           ← Should be TRUE
   Has evaluation: true              ← Should be TRUE
   Total Score: 8                    ← Should be > 0

💾 SAVING QUESTION TO MONGODB DATABASE

✅ Gateway confirmed: Question X saved to MongoDB!
   Has Answer: true                  ← Should be TRUE
   Has Scores: true                  ← Should be TRUE
   Overall Score: 8                  ← Should match above
```

### Warning signs (BAD):
```
⚠️ SKIPPING SAVE - No answer provided          ← Answer missing from questionData
⚠️ DUPLICATE DETECTED                           ← Same question saved twice
⚠️ DUPLICATE KEY ERROR                          ← MongoDB rejected duplicate
Has answer field: false                         ← Answer not in AI response
Total Score: MISSING                            ← Evaluation data missing
```

## 📝 Quick Test Checklist

After completing a test interview, run these checks:

```bash
# 1. Count documents (should equal questions asked)
mongosh ai_interview --eval "db.interviewquestions.countDocuments({ sessionId: ObjectId('SESSION_ID') })"

# 2. Check for duplicates (should return 0)
mongosh ai_interview --eval "db.interviewquestions.aggregate([{$group:{_id:{s:'$sessionId',q:'$questionNumber'},c:{$sum:1}}},{$match:{c:{$gt:1}}}]).toArray().length"

# 3. Verify data quality (check first question)
mongosh ai_interview --eval "const q = db.interviewquestions.findOne({sessionId:ObjectId('SESSION_ID'),questionNumber:1}); print('Answer:', !!q.answerText, 'Score:', q.scores?.overall||0, 'Feedback:', !!q.feedback)"

# 4. Test API
curl -X GET "http://localhost:3000/interview-results/session/SESSION_ID/questions" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.data | length'
```

## 🎯 Common Tasks

### Start fresh test:
```bash
# 1. Clean database
mongosh ai_interview --eval "db.interviewquestions.deleteMany({})"

# 2. Restart server
# Kill server (Ctrl+C), then:
npm run start:dev

# 3. Complete test interview in UI
# 4. Check logs and database
```

### Check recent saves:
```javascript
// In MongoDB shell
db.interviewquestions.find()
  .sort({ createdAt: -1 })
  .limit(10)
  .forEach(doc => {
    print(`Q${doc.questionNumber}: ${doc.answerText ? '✅' : '❌'} answer, Score: ${doc.scores?.overall || 0}`);
  });
```

### Find sessions with issues:
```javascript
// Sessions with missing answers
db.interviewquestions.aggregate([
  { $match: { $or: [{ answerText: null }, { answerText: "" }] } },
  { $group: { _id: "$sessionId", count: { $sum: 1 } } }
])

// Sessions with zero scores
db.interviewquestions.aggregate([
  { $match: { "scores.overall": { $lte: 0 } } },
  { $group: { _id: "$sessionId", count: { $sum: 1 } } }
])
```

## 🚨 Emergency Commands

### Server won't start:
```bash
# Kill all node processes
pkill -f node

# Check what's using port 3000
lsof -i :3000

# Kill process on port 3000
lsof -ti :3000 | xargs kill -9
```

### MongoDB connection issues:
```bash
# Check MongoDB status
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community

# Restart MongoDB
brew services restart mongodb-community

# Check MongoDB logs
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

### Clear everything and start fresh:
```bash
# Drop entire interview questions collection
mongosh ai_interview --eval "db.interviewquestions.drop()"

# Rebuild indexes
mongosh ai_interview --eval "db.interviewquestions.createIndex({ sessionId: 1, questionNumber: 1 }, { unique: true })"

# Restart server
npm run start:dev
```

## 📊 Data Analysis Queries

### Average scores by round type:
```javascript
db.interviewquestions.aggregate([
  { $match: { "scores.overall": { $gt: 0 } } },
  {
    $group: {
      _id: "$questionType",
      avgScore: { $avg: "$scores.overall" },
      count: { $sum: 1 }
    }
  }
])
```

### Find best/worst performing questions:
```javascript
// Worst questions (lowest average scores)
db.interviewquestions.aggregate([
  { $match: { "scores.overall": { $gt: 0 } } },
  {
    $group: {
      _id: "$questionText",
      avgScore: { $avg: "$scores.overall" },
      count: { $sum: 1 }
    }
  },
  { $sort: { avgScore: 1 } },
  { $limit: 5 }
])
```

### Session completion rate:
```javascript
db.interviewquestions.aggregate([
  {
    $group: {
      _id: "$sessionId",
      totalQuestions: { $sum: 1 },
      answeredQuestions: {
        $sum: { $cond: [{ $gt: ["$answerText", null] }, 1, 0] }
      }
    }
  }
])
```
