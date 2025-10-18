# DSA Platform - Testing Checklist

## 🧪 Complete Testing Guide

Use this checklist to verify all features are working correctly.

## ✅ Pre-Testing Setup

- [ ] Backend API is running on `http://localhost:3000`
- [ ] Frontend is running (pnpm dev)
- [ ] You have a valid user account
- [ ] JWT token is being sent in requests

## 📋 Test Scenarios

### 1. Authentication & Access

- [ ] Login with valid credentials
- [ ] Navigate to `/dsa` via sidebar
- [ ] Verify "DSA Practice" link is visible
- [ ] Dashboard loads without errors
- [ ] Can access `/dsa/questions` route
- [ ] Protected routes redirect if not logged in

### 2. DSA Dashboard (`/dsa`)

#### Statistics Cards
- [ ] Total Questions count displays
- [ ] Solved Questions count displays
- [ ] Attempted Questions count displays
- [ ] Success Rate percentage displays

#### Difficulty Breakdown
- [ ] Easy questions progress shows
- [ ] Medium questions progress shows
- [ ] Hard questions progress shows
- [ ] Percentages calculated correctly

#### Quick Actions
- [ ] "Browse Questions" button works
- [ ] "Random Question" button works
- [ ] "Bookmarked" button works
- [ ] Buttons navigate to correct pages

#### Recent Submissions
- [ ] Submission history displays (if any)
- [ ] Clicking submission navigates to question
- [ ] Status badges show correct colors
- [ ] Timestamps display correctly

### 3. Questions List (`/dsa/questions`)

#### Display & Layout
- [ ] Questions load and display
- [ ] Question cards show all information
- [ ] Layout is responsive
- [ ] No console errors

#### Search
- [ ] Search input is visible
- [ ] Can type in search box
- [ ] Search filters questions in real-time
- [ ] Search results are accurate
- [ ] "Clear Filters" resets search

#### Filters
- [ ] Difficulty filter dropdown works
  - [ ] All Difficulties
  - [ ] Easy
  - [ ] Medium
  - [ ] Hard
- [ ] Category filter dropdown works
  - [ ] Shows all categories
  - [ ] Filters correctly
- [ ] Filters can be combined
- [ ] "Clear Filters" resets all filters

#### Sorting
- [ ] Sort by Difficulty works
- [ ] Sort by Likes works
- [ ] Sort by Acceptance Rate works
- [ ] Sort order toggle (↑/↓) works
- [ ] Results update correctly

#### Pagination
- [ ] Pagination controls display
- [ ] "Previous" button works
- [ ] "Next" button works
- [ ] Page numbers work
- [ ] Current page is highlighted
- [ ] Pagination info is accurate

#### Question Cards
- [ ] Title displays correctly
- [ ] Description displays correctly
- [ ] Difficulty badge shows correct color
- [ ] Status indicator appears (if solved/attempted)
- [ ] Category tags display
- [ ] Like/Dislike counts show
- [ ] Acceptance rate displays
- [ ] Bookmark star shows if bookmarked
- [ ] Clicking card navigates to solve page

### 4. Question Solve Page (`/dsa/questions/:id`)

#### Navigation
- [ ] "Back to Questions" button works
- [ ] Page loads without errors
- [ ] URL parameter is correct

#### Problem Description Tab
- [ ] Problem statement displays
- [ ] Examples show correctly
- [ ] Constraints are visible
- [ ] Categories/tags display
- [ ] Hints section available

#### Hints System
- [ ] "Show Hints" button works
- [ ] Hints are hidden initially
- [ ] "Reveal Hint X" buttons work
- [ ] Hints display after reveal
- [ ] Hint usage is recorded

#### Code Editor
- [ ] Code editor loads
- [ ] Can type in editor
- [ ] Language selector works
- [ ] Default code template loads
- [ ] Syntax appears correct
- [ ] Copy button works

#### Submissions
- [ ] "Submit (Solved)" button works
- [ ] "Save Attempt" button works
- [ ] Submission shows success/failure message
- [ ] Test case results display
- [ ] Execution time shows

#### My Submissions Tab
- [ ] Tab switches correctly
- [ ] Submission history displays
- [ ] Each submission shows:
  - [ ] Status (Solved/Failed)
  - [ ] Test cases passed
  - [ ] Execution time
  - [ ] Language
  - [ ] Timestamp
  - [ ] Error message (if failed)

#### Notes Section
- [ ] Notes textarea is editable
- [ ] Can type notes
- [ ] "Save Notes" button works
- [ ] Notes persist after save
- [ ] Notes reload on page refresh

#### Rating System
- [ ] Star rating displays
- [ ] Can click stars to rate
- [ ] Rating updates visually
- [ ] Rating is saved

#### Actions
- [ ] Like button works
- [ ] Dislike button works
- [ ] Bookmark button works
- [ ] Bookmark status changes
- [ ] Counts update after actions

### 5. API Integration Tests

#### Questions API

```powershell
# Test these with curl or application UI

# Get all questions
- [ ] GET /dsa-questions

# Get by difficulty
- [ ] GET /dsa-questions?difficulty=Easy
- [ ] GET /dsa-questions?difficulty=Medium
- [ ] GET /dsa-questions?difficulty=Hard

# Get by category
- [ ] GET /dsa-questions?category=Array
- [ ] GET /dsa-questions?category=Tree

# Search
- [ ] GET /dsa-questions?search=two

# Pagination
- [ ] GET /dsa-questions?page=1&limit=10
- [ ] GET /dsa-questions?page=2&limit=10

# Statistics
- [ ] GET /dsa-questions/statistics

# Random question
- [ ] GET /dsa-questions/random
- [ ] GET /dsa-questions/random?difficulty=Easy

# Single question
- [ ] GET /dsa-questions/two-sum
- [ ] GET /dsa-questions/two-sum?includeSolutions=true

# Like/Dislike
- [ ] POST /dsa-questions/two-sum/like
- [ ] POST /dsa-questions/two-sum/dislike

# Submit (global stats)
- [ ] POST /dsa-questions/two-sum/submit
```

#### Progress API

```powershell
# Test these with curl or application UI

# Submit code
- [ ] POST /dsa-progress/two-sum/submit (Solved)
- [ ] POST /dsa-progress/two-sum/submit (Failed)

# Get progress
- [ ] GET /dsa-progress/my-progress
- [ ] GET /dsa-progress/my-progress?status=Solved
- [ ] GET /dsa-progress/my-progress?isBookmarked=true

# Statistics
- [ ] GET /dsa-progress/statistics

# Recent submissions
- [ ] GET /dsa-progress/recent-submissions
- [ ] GET /dsa-progress/recent-submissions?limit=5

# Question progress
- [ ] GET /dsa-progress/two-sum
- [ ] GET /dsa-progress/two-sum/submissions

# Update progress
- [ ] PATCH /dsa-progress/two-sum (bookmark)
- [ ] PATCH /dsa-progress/two-sum (notes)
- [ ] PATCH /dsa-progress/two-sum (rating)

# Like/Dislike
- [ ] POST /dsa-progress/two-sum/like
- [ ] POST /dsa-progress/two-sum/dislike

# Hint
- [ ] POST /dsa-progress/two-sum/hint

# Reset
- [ ] DELETE /dsa-progress/two-sum
```

### 6. User Experience Tests

#### Loading States
- [ ] Loading spinner shows during API calls
- [ ] Loading states are not stuck
- [ ] UI updates after loading

#### Error Handling
- [ ] Error messages display correctly
- [ ] Can recover from errors
- [ ] No unhandled errors in console

#### Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)
- [ ] Sidebar collapses on mobile
- [ ] All elements are accessible

#### Performance
- [ ] Pages load quickly (< 2 seconds)
- [ ] No lag when typing in code editor
- [ ] Filter/search is responsive
- [ ] No memory leaks (check DevTools)

### 7. Data Persistence

#### Session Persistence
- [ ] Progress persists after page refresh
- [ ] Bookmarks persist
- [ ] Notes persist
- [ ] Ratings persist
- [ ] Submission history persists

#### Navigation
- [ ] Can navigate between pages
- [ ] Browser back button works
- [ ] Browser forward button works
- [ ] Deep links work (share URL)

### 8. Edge Cases

#### Empty States
- [ ] No questions available message
- [ ] No submissions message
- [ ] No bookmarked questions message
- [ ] No search results message

#### Long Content
- [ ] Long question descriptions display correctly
- [ ] Long code in editor displays correctly
- [ ] Many submissions display correctly
- [ ] Many categories display correctly

#### Special Characters
- [ ] Code with special characters works
- [ ] Search with special characters works
- [ ] Notes with special characters work

### 9. Integration Tests

#### Complete User Flow
1. [ ] Login
2. [ ] Navigate to DSA Dashboard
3. [ ] View statistics
4. [ ] Click "Browse Questions"
5. [ ] Apply filters (Easy difficulty)
6. [ ] Select a question
7. [ ] Read problem description
8. [ ] Reveal a hint
9. [ ] Write code in editor
10. [ ] Submit solution (Solved)
11. [ ] Add notes
12. [ ] Rate question
13. [ ] Bookmark question
14. [ ] Like question
15. [ ] View submission history
16. [ ] Navigate back to dashboard
17. [ ] Verify statistics updated

### 10. Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## 🐛 Bug Reporting Template

If you find a bug, document it as follows:

```
**Bug Title:** [Short description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- Browser: 
- OS: 
- Screen Size: 

**Screenshots:**
[If applicable]

**Console Errors:**
[If any]
```

## ✅ Sign-Off

Once all tests pass:

- [ ] All major features tested
- [ ] No critical bugs found
- [ ] Documentation is accurate
- [ ] Ready for production

**Tester Name:** _______________
**Date:** _______________
**Status:** ☐ Pass  ☐ Fail  ☐ Needs Review

---

## 📊 Testing Coverage

| Feature | Tests | Status |
|---------|-------|--------|
| Authentication | 6 | ☐ |
| Dashboard | 12 | ☐ |
| Questions List | 25 | ☐ |
| Solve Page | 30 | ☐ |
| API Integration | 36 | ☐ |
| UX | 15 | ☐ |
| Data Persistence | 8 | ☐ |
| Edge Cases | 10 | ☐ |
| Complete Flow | 17 | ☐ |

**Total Tests:** 159
**Passed:** ___
**Failed:** ___
**Coverage:** ___%

---

**Happy Testing! 🧪**
