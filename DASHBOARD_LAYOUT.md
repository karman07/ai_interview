# Dashboard Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INTERVIEW ANALYTICS DASHBOARD                        │
│  Track your progress, analyze performance, and master every interview       │
│                                                    [Start New Interview] →   │
└─────────────────────────────────────────────────────────────────────────────┘

┌───────────────────┬───────────────────┬───────────────────┬───────────────────┐
│  📅 Total         │  ✓ Completed      │  🏆 Average       │  🎯 Questions     │
│  Interviews       │  Interviews       │  Score            │  Answered         │
│  42               │  38               │  78/100           │  456              │
└───────────────────┴───────────────────┴───────────────────┴───────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  📊 Performance by Round Type                                               │
├───────────────────┬───────────────────┬───────────────────┬───────────────────┤
│  💻 Technical     │  👥 Behavioral    │  💡 Problem       │  💬 HR            │
│  12 interviews    │  10 interviews    │  8 interviews     │  8 interviews     │
│  Avg: 82          │  Avg: 75          │  Avg: 78          │  Avg: 80          │
│  Last: Oct 15     │  Last: Oct 14     │  Last: Oct 12     │  Last: Oct 10     │
└───────────────────┴───────────────────┴───────────────────┴───────────────────┘

┌─────────────────────────────────┬─────────────────────────────────────────────┐
│  ⚡ Overall Performance         │  ✨ Top Skills                              │
│  ─────────────────────────      │  ─────────────────────────────              │
│  Highest Score       95         │  #1 JavaScript         ████████████ 92%     │
│  Lowest Score        42         │  #2 React              ██████████   88%     │
│  Score Improvement   +15% ↗     │  #3 System Design      █████████    85%     │
│  Total Questions     456        │  #4 Problem Solving    ████████     80%     │
└─────────────────────────────────┴─────────────────────────────────────────────┘

┌─────────────────────────────────┬─────────────────────────────────────────────┐
│  🏢 Company Performance         │  💼 Role Performance                        │
│  ─────────────────────────      │  ─────────────────────────────              │
│  Google           12  avg:85 ↗  │  Senior SWE       15  avg:82                │
│  Amazon           8   avg:78 ↗  │  Frontend Dev     10  avg:80                │
│  Microsoft        6   avg:80    │  Full Stack       8   avg:75                │
│  Meta             5   avg:72 ↘  │  Backend Dev      5   avg:78                │
│  Apple            4   avg:82    │  Tech Lead        2   avg:85                │
│                                 │                                             │
│  Best: Google                   │  Best: Senior SWE                           │
└─────────────────────────────────┴─────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  📈 Performance Trends                                                      │
├───────────────────┬───────────────────┬───────────────────┬───────────────────┤
│  Technical ↗      │  Behavioral ↗     │  Problem Solv. ↗  │  HR               │
│  Latest: 85       │  Latest: 78       │  Latest: 82       │  Latest: 80       │
│  ▁▂▃▄▅▆▇█         │  ▂▃▄▅▆▇           │  ▃▄▅▆▇            │  ▄▅▆▇             │
│  12 interviews    │  10 interviews    │  8 interviews     │  8 interviews     │
└───────────────────┴───────────────────┴───────────────────┴───────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  🕐 Recent Interviews                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  💻 Technical Round     │  Oct 15, 2024 • 10 questions    │  85  │  👁       │
│  👥 Behavioral Round    │  Oct 14, 2024 • 8 questions     │  78  │  👁       │
│  💡 Problem Solving     │  Oct 12, 2024 • 6 questions     │  82  │  👁       │
│  💬 HR Round            │  Oct 10, 2024 • 5 questions     │  80  │  👁       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  ⚡ Personalized Recommendations                                            │
│  ✓ Focus on improving your technical depth scores in system design         │
│  ✓ Practice behavioral questions focusing on leadership scenarios          │
│  ✓ Your communication skills are strong - maintain this momentum!          │
│  ✓ Consider reviewing data structures for better problem-solving scores    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Color Scheme

### Primary Colors
- 🔵 **Blue** - Technical rounds, primary CTAs
- 🟢 **Green** - Behavioral rounds, success states  
- 🟡 **Amber** - Problem-solving rounds, warnings
- 🟣 **Purple** - HR rounds, secondary actions

### Analytics Colors
- 🔷 **Indigo** - Company analytics sections
- 🩷 **Pink** - Role analytics sections
- 🟩 **Emerald** - Performance trends

### Status Colors
- ✅ **Green** - High scores, improvements, upward trends
- 🔴 **Red** - Low scores, declines, downward trends
- 🔵 **Blue** - Average/neutral metrics

## Responsive Breakpoints

### Mobile (< 768px)
```
┌─────────────────┐
│  Card 1         │
├─────────────────┤
│  Card 2         │
├─────────────────┤
│  Card 3         │
└─────────────────┘
```

### Tablet (768px - 1024px)
```
┌─────────────────┬─────────────────┐
│  Card 1         │  Card 2         │
├─────────────────┼─────────────────┤
│  Card 3         │  Card 4         │
└─────────────────┴─────────────────┘
```

### Desktop (> 1024px)
```
┌─────────┬─────────┬─────────┬─────────┐
│  Card 1 │  Card 2 │  Card 3 │  Card 4 │
└─────────┴─────────┴─────────┴─────────┘
```

## Interactive Elements

### Hover States
- **Cards**: Elevated shadow, subtle scale
- **Buttons**: Darker gradient, scale up 5%
- **Recent Interviews**: Shadow increase, background change

### Click Actions
- **Start New Interview** → Interview selection modal
- **Recent Interview Eye Icon** → Navigate to session details (`/interview/results/:sessionId`)
- **Interview Type Cards** → Start specific interview (`/interview/start/:type`)

### Animations
- **Stat Cards**: Fade in with Y-axis slide (staggered)
- **Skill Bars**: Width animation from 0 to value (staggered by rank)
- **Loading**: Centered spinner with gradient background
- **Page Transitions**: Smooth opacity changes

## Data Loading Strategy

1. **Parallel Fetch** - All 4 endpoints fetched simultaneously
2. **Progressive Render** - Show loading spinner during fetch
3. **Graceful Fallback** - Hide sections with no data
4. **Error Resilience** - Console log errors, continue rendering available data

## Empty States

### No Interviews Yet
```
┌─────────────────────────────────────┐
│             🎬                      │
│                                     │
│      No Interviews Yet              │
│                                     │
│  Start your first interview to see  │
│  comprehensive analytics and track  │
│  your progress.                     │
│                                     │
│  [🎬 Start Your First Interview]   │
└─────────────────────────────────────┘
```

### Conditional Sections
- **Round Breakdown**: Only shown if `roundBreakdown.length > 0`
- **Top Skills**: Only shown if `topSkills` exists and has items
- **Company Analytics**: Only shown if `companies.length > 0`
- **Role Analytics**: Only shown if `roles.length > 0`
- **Performance Trends**: Only shown if `performanceTrend` has data
- **Recent Interviews**: Only shown if `recentInterviews.length > 0`
- **Recommendations**: Only shown if `recommendations.length > 0`
