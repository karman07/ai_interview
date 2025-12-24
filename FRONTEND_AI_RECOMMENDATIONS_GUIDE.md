# Frontend Implementation Guide - AI Recommended Employees

## Overview
This document outlines all frontend changes required to implement the AI-recommended employees feature, including new components, API integrations, and UI modifications.

## 📋 Table of Contents
- [Required API Endpoints](#required-api-endpoints)
- [New Components](#new-components)
- [UI Changes](#ui-changes)
- [State Management](#state-management)
- [API Service Functions](#api-service-functions)
- [Component Implementation](#component-implementation)
- [Routing Changes](#routing-changes)
- [Styling Requirements](#styling-requirements)

---

## 🌐 Required API Endpoints

### 1. Get AI Recommended Employees
```javascript
GET /api/jobs/enhanced/{jobId}/recommended-employees?limit=10
```

**Response Structure:**
```json
{
  "success": true,
  "recommendations": [
    {
      "userId": "string",
      "matchScore": 85.5,
      "skillsMatch": 90.0,
      "experienceMatch": 80.0,
      "matchingKeywords": ["JavaScript", "React", "Node.js"],
      "missingSkills": ["Docker", "Kubernetes"],
      "suggestions": ["Strong technical background"],
      "candidateProfile": {
        "name": "John Doe",
        "email": "john@example.com",
        "profile": {
          "experience": "5 years",
          "skills": ["JavaScript", "React"],
          "location": "New York"
        }
      },
      "interviewScores": {
        "overall": 8.5,
        "technical": 9.0,
        "behavioral": 8.0,
        "totalInterviews": 3
      },
      "hasApplied": false
    }
  ],
  "totalCandidates": 25
}
```

### 2. Invite Recommended Candidate
```javascript
POST /api/jobs/enhanced/{jobId}/invite-candidate
```

**Request Body:**
```json
{
  "candidateId": "string",
  "message": "string (optional)",
  "autoApply": false
}
```

### 3. Get Employer Requests (existing)
```javascript
GET /api/jobs/employer-requests/sent
GET /api/jobs/employer-requests/received
```

---

## 🎨 New Components

### 1. RecommendedEmployees Component
**File:** `src/components/jobs/RecommendedEmployees.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Spin, Empty, message } from 'antd';
import { UserOutlined, StarOutlined, SendOutlined } from '@ant-design/icons';
import { getRecommendedEmployees, inviteCandidate } from '../../services/jobService';
import CandidateCard from './CandidateCard';
import InviteCandidateModal from './InviteCandidateModal';

const RecommendedEmployees = ({ jobId, jobTitle }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    if (jobId) {
      fetchRecommendations();
    }
  }, [jobId, limit]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await getRecommendedEmployees(jobId, limit);
      setRecommendations(response.recommendations || []);
    } catch (error) {
      message.error('Failed to load recommendations');
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setInviteModalVisible(true);
  };

  const handleSendInvite = async (inviteData) => {
    try {
      await inviteCandidate(jobId, selectedCandidate.userId, inviteData.message);
      message.success('Invitation sent successfully');
      setInviteModalVisible(false);
      // Update candidate status
      setRecommendations(prev => 
        prev.map(rec => 
          rec.userId === selectedCandidate.userId 
            ? { ...rec, inviteSent: true }
            : rec
        )
      );
    } catch (error) {
      message.error('Failed to send invitation');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Spin size="large" />
        <p className="mt-4">Finding the best candidates for you...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Empty
        description="No recommended candidates found"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="recommended-employees">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">
          AI Recommended Candidates ({recommendations.length})
        </h3>
        <div className="flex gap-2">
          <Button onClick={() => setLimit(10)} type={limit === 10 ? 'primary' : 'default'}>
            Top 10
          </Button>
          <Button onClick={() => setLimit(25)} type={limit === 25 ? 'primary' : 'default'}>
            Top 25
          </Button>
          <Button onClick={fetchRecommendations} loading={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((candidate) => (
          <CandidateCard
            key={candidate.userId}
            candidate={candidate}
            onInvite={() => handleInviteCandidate(candidate)}
            jobTitle={jobTitle}
          />
        ))}
      </div>

      <InviteCandidateModal
        visible={inviteModalVisible}
        candidate={selectedCandidate}
        jobTitle={jobTitle}
        onSend={handleSendInvite}
        onCancel={() => setInviteModalVisible(false)}
      />
    </div>
  );
};

export default RecommendedEmployees;
```

### 2. CandidateCard Component
**File:** `src/components/jobs/CandidateCard.jsx`

```jsx
import React from 'react';
import { Card, Badge, Button, Progress, Tag, Avatar } from 'antd';
import { 
  UserOutlined, 
  StarOutlined, 
  SendOutlined, 
  CheckCircleOutlined,
  MailOutlined,
  TrophyOutlined 
} from '@ant-design/icons';

const CandidateCard = ({ candidate, onInvite, jobTitle }) => {
  const {
    candidateProfile,
    matchScore,
    skillsMatch,
    experienceMatch,
    matchingKeywords,
    missingSkills,
    interviewScores,
    hasApplied,
    inviteSent
  } = candidate;

  const getScoreColor = (score) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const getMatchLevel = (score) => {
    if (score >= 85) return { text: 'Excellent Match', color: 'success' };
    if (score >= 70) return { text: 'Good Match', color: 'processing' };
    if (score >= 50) return { text: 'Fair Match', color: 'warning' };
    return { text: 'Low Match', color: 'error' };
  };

  const matchLevel = getMatchLevel(matchScore);

  return (
    <Card
      className="candidate-card hover:shadow-lg transition-shadow"
      actions={[
        hasApplied ? (
          <Button type="text" disabled icon={<CheckCircleOutlined />}>
            Already Applied
          </Button>
        ) : inviteSent ? (
          <Button type="text" disabled icon={<MailOutlined />}>
            Invitation Sent
          </Button>
        ) : (
          <Button 
            type="primary" 
            icon={<SendOutlined />}
            onClick={onInvite}
          >
            Invite
          </Button>
        )
      ]}
    >
      <div className="candidate-header mb-4">
        <div className="flex items-center gap-3">
          <Avatar size={48} icon={<UserOutlined />} />
          <div className="flex-1">
            <h4 className="font-semibold text-lg mb-1">
              {candidateProfile.name}
            </h4>
            <p className="text-gray-500 text-sm">
              {candidateProfile.profile?.experience || 'Experience not specified'}
            </p>
          </div>
          <Badge 
            status={matchLevel.color} 
            text={matchLevel.text}
            className="text-xs"
          />
        </div>
      </div>

      <div className="match-scores mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Overall Match</span>
          <span className="text-lg font-bold" style={{ color: getScoreColor(matchScore) }}>
            {matchScore.toFixed(1)}%
          </span>
        </div>
        <Progress 
          percent={matchScore} 
          strokeColor={getScoreColor(matchScore)}
          showInfo={false}
          size="small"
        />

        <div className="grid grid-cols-2 gap-2 mt-3">
          <div>
            <span className="text-xs text-gray-500">Skills Match</span>
            <div className="font-medium">{skillsMatch.toFixed(1)}%</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Experience</span>
            <div className="font-medium">{experienceMatch.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {interviewScores && interviewScores.totalInterviews > 0 && (
        <div className="interview-scores mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrophyOutlined className="text-yellow-500" />
            <span className="text-sm font-medium">Interview Performance</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Overall: {interviewScores.overall.toFixed(1)}/10</div>
            <div>Technical: {interviewScores.technical.toFixed(1)}/10</div>
            <div className="col-span-2 text-gray-500">
              {interviewScores.totalInterviews} interviews completed
            </div>
          </div>
        </div>
      )}

      <div className="skills-section">
        <div className="mb-2">
          <span className="text-sm font-medium text-green-600">Matching Skills</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {matchingKeywords.slice(0, 4).map((skill, index) => (
              <Tag key={index} color="green" size="small">
                {skill}
              </Tag>
            ))}
            {matchingKeywords.length > 4 && (
              <Tag size="small">+{matchingKeywords.length - 4} more</Tag>
            )}
          </div>
        </div>

        {missingSkills.length > 0 && (
          <div>
            <span className="text-sm font-medium text-orange-600">Skills to Develop</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {missingSkills.slice(0, 3).map((skill, index) => (
                <Tag key={index} color="orange" size="small">
                  {skill}
                </Tag>
              ))}
              {missingSkills.length > 3 && (
                <Tag size="small">+{missingSkills.length - 3} more</Tag>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CandidateCard;
```

### 3. InviteCandidateModal Component
**File:** `src/components/jobs/InviteCandidateModal.jsx`

```jsx
import React, { useState } from 'react';
import { Modal, Form, Input, Button, Switch, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const InviteCandidateModal = ({ 
  visible, 
  candidate, 
  jobTitle, 
  onSend, 
  onCancel 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onSend(values);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultMessage = `Hi ${candidate?.candidateProfile?.name || 'there'},

I came across your profile and was impressed by your background. We have an exciting opportunity for a ${jobTitle} position that seems like a great match for your skills.

Based on our AI analysis, you have a ${candidate?.matchScore?.toFixed(1)}% match with this role, particularly in areas like ${candidate?.matchingKeywords?.slice(0, 3).join(', ')}.

Would you be interested in learning more about this opportunity?

Best regards`;

  return (
    <Modal
      title={`Invite ${candidate?.candidateProfile?.name || 'Candidate'}`}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="send" 
          type="primary" 
          icon={<SendOutlined />}
          loading={loading}
          onClick={handleSend}
        >
          Send Invitation
        </Button>
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          message: defaultMessage,
          autoApply: false
        }}
      >
        <div className="candidate-summary mb-4 p-4 bg-gray-50 rounded">
          <h4 className="font-semibold">{candidate?.candidateProfile?.name}</h4>
          <p className="text-sm text-gray-600 mb-2">
            Match Score: {candidate?.matchScore?.toFixed(1)}% | 
            Skills Match: {candidate?.skillsMatch?.toFixed(1)}%
          </p>
          <div className="flex flex-wrap gap-1">
            {candidate?.matchingKeywords?.slice(0, 5).map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <Form.Item
          name="message"
          label="Invitation Message"
          rules={[{ required: true, message: 'Please enter an invitation message' }]}
        >
          <TextArea 
            rows={8} 
            placeholder="Write a personalized message to the candidate..."
          />
        </Form.Item>

        <Form.Item
          name="autoApply"
          label="Auto-apply candidate if they accept"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InviteCandidateModal;
```

---

## 🔄 UI Changes Required

### 1. Job Details Page Updates
**File:** `src/pages/jobs/JobDetails.jsx`

Add new tab for AI recommendations:

```jsx
import { Tabs } from 'antd';
import RecommendedEmployees from '../../components/jobs/RecommendedEmployees';

const { TabPane } = Tabs;

// Add to existing JobDetails component
<Tabs defaultActiveKey="applications">
  <TabPane tab="Applications" key="applications">
    {/* Existing applications content */}
  </TabPane>
  
  <TabPane tab="AI Recommendations" key="recommendations">
    <RecommendedEmployees 
      jobId={jobId} 
      jobTitle={job?.title}
    />
  </TabPane>
  
  <TabPane tab="Analytics" key="analytics">
    {/* Existing analytics content */}
  </TabPane>
</Tabs>
```

### 2. Job List Page Updates
**File:** `src/pages/jobs/JobList.jsx`

Add recommendation count to job cards:

```jsx
// Add to job card component
<div className="job-stats">
  <span className="stat-item">
    <UserOutlined /> {job.applicationCount || 0} Applications
  </span>
  <span className="stat-item">
    <StarOutlined /> {job.recommendationCount || 0} AI Matches
  </span>
</div>
```

### 3. Dashboard Updates
**File:** `src/pages/dashboard/EmployerDashboard.jsx`

Add AI recommendations widget:

```jsx
// Add new widget
<Card title="AI Recommendations" className="dashboard-card">
  <div className="recommendation-summary">
    <div className="stat">
      <span className="number">{dashboardStats.totalRecommendations}</span>
      <span className="label">Total Matches</span>
    </div>
    <div className="stat">
      <span className="number">{dashboardStats.highQualityMatches}</span>
      <span className="label">High Quality (80%+)</span>
    </div>
  </div>
  <Button type="link" onClick={() => navigate('/jobs/recommendations')}>
    View All Recommendations
  </Button>
</Card>
```

---

## 🔧 API Service Functions

### 1. Job Service Updates
**File:** `src/services/jobService.js`

```javascript
// Add to existing jobService.js

export const getRecommendedEmployees = async (jobId, limit = 10) => {
  try {
    const response = await api.get(`/jobs/enhanced/${jobId}/recommended-employees`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recommended employees:', error);
    throw error;
  }
};

export const inviteCandidate = async (jobId, candidateId, message, autoApply = false) => {
  try {
    const response = await api.post(`/jobs/enhanced/${jobId}/invite-candidate`, {
      candidateId,
      message,
      autoApply
    });
    return response.data;
  } catch (error) {
    console.error('Error inviting candidate:', error);
    throw error;
  }
};

export const getEmployerRequests = async (type = 'sent') => {
  try {
    const response = await api.get(`/jobs/employer-requests/${type}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employer requests:', error);
    throw error;
  }
};

export const respondToEmployerRequest = async (requestId, status, response) => {
  try {
    const result = await api.patch(`/jobs/employer-requests/${requestId}/respond`, {
      status,
      employeeResponse: response
    });
    return result.data;
  } catch (error) {
    console.error('Error responding to employer request:', error);
    throw error;
  }
};
```

---

## 🗂️ State Management

### 1. Redux Store Updates (if using Redux)
**File:** `src/store/slices/jobSlice.js`

```javascript
// Add to existing job slice
const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    // existing state
    recommendations: [],
    recommendationsLoading: false,
    invitations: [],
    invitationsLoading: false,
  },
  reducers: {
    // existing reducers
    setRecommendations: (state, action) => {
      state.recommendations = action.payload;
      state.recommendationsLoading = false;
    },
    setRecommendationsLoading: (state, action) => {
      state.recommendationsLoading = action.payload;
    },
    addInvitation: (state, action) => {
      state.invitations.push(action.payload);
    },
    updateCandidateInviteStatus: (state, action) => {
      const { candidateId, status } = action.payload;
      const candidate = state.recommendations.find(r => r.userId === candidateId);
      if (candidate) {
        candidate.inviteSent = status;
      }
    }
  }
});

export const { 
  setRecommendations, 
  setRecommendationsLoading,
  addInvitation,
  updateCandidateInviteStatus
} = jobSlice.actions;
```

### 2. Context API (Alternative)
**File:** `src/contexts/JobContext.jsx`

```jsx
import React, { createContext, useContext, useReducer } from 'react';

const JobContext = createContext();

const initialState = {
  recommendations: [],
  recommendationsLoading: false,
  invitations: [],
  selectedJob: null,
};

const jobReducer = (state, action) => {
  switch (action.type) {
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload, recommendationsLoading: false };
    case 'SET_RECOMMENDATIONS_LOADING':
      return { ...state, recommendationsLoading: action.payload };
    case 'ADD_INVITATION':
      return { ...state, invitations: [...state.invitations, action.payload] };
    case 'UPDATE_CANDIDATE_STATUS':
      return {
        ...state,
        recommendations: state.recommendations.map(rec =>
          rec.userId === action.payload.candidateId
            ? { ...rec, inviteSent: action.payload.status }
            : rec
        )
      };
    default:
      return state;
  }
};

export const JobProvider = ({ children }) => {
  const [state, dispatch] = useReducer(jobReducer, initialState);

  return (
    <JobContext.Provider value={{ state, dispatch }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJob = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
};
```

---

## 🛣️ Routing Changes

### 1. Add New Routes
**File:** `src/App.jsx` or `src/routes/index.jsx`

```jsx
import RecommendedEmployees from '../components/jobs/RecommendedEmployees';

// Add to existing routes
<Route 
  path="/jobs/:jobId/recommendations" 
  element={<RecommendedEmployees />} 
/>
<Route 
  path="/jobs/recommendations" 
  element={<AllRecommendations />} 
/>
<Route 
  path="/employer/invitations" 
  element={<EmployerInvitations />} 
/>
```

### 2. Navigation Updates
**File:** `src/components/layout/Navigation.jsx`

```jsx
// Add to employer navigation menu
{
  key: 'recommendations',
  icon: <StarOutlined />,
  label: 'AI Recommendations',
  children: [
    {
      key: 'all-recommendations',
      label: 'All Recommendations',
      onClick: () => navigate('/jobs/recommendations')
    },
    {
      key: 'sent-invitations',
      label: 'Sent Invitations',
      onClick: () => navigate('/employer/invitations')
    }
  ]
}
```

---

## 🎨 Styling Requirements

### 1. CSS Classes
**File:** `src/styles/recommendations.css`

```css
.recommended-employees {
  padding: 24px;
}

.candidate-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.candidate-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.candidate-header {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.match-scores {
  background: #fafafa;
  padding: 12px;
  border-radius: 6px;
}

.skills-section {
  margin-top: 16px;
}

.recommendation-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stat {
  text-align: center;
}

.stat .number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
}

.stat .label {
  font-size: 12px;
  color: #666;
}

.job-stats {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.candidate-summary {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
}

@media (max-width: 768px) {
  .recommended-employees .grid {
    grid-template-columns: 1fr;
  }
  
  .recommendation-summary {
    flex-direction: column;
    gap: 12px;
  }
}
```

### 2. Tailwind Classes (if using Tailwind)
```css
/* Add to tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
        'match-excellent': '#52c41a',
        'match-good': '#1890ff',
        'match-fair': '#faad14',
        'match-poor': '#ff4d4f',
      }
    }
  }
}
```

---

## 📱 Mobile Responsiveness

### 1. Responsive Grid Updates
```jsx
// Update grid classes for mobile
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Candidate cards */}
</div>
```

### 2. Mobile-Specific Components
**File:** `src/components/jobs/MobileCandidateCard.jsx`

```jsx
import React from 'react';
import { Card, Progress, Tag, Button } from 'antd';

const MobileCandidateCard = ({ candidate, onInvite }) => {
  return (
    <Card size="small" className="mobile-candidate-card">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-base truncate">
          {candidate.candidateProfile.name}
        </h4>
        <span className="text-lg font-bold text-blue-600">
          {candidate.matchScore.toFixed(0)}%
        </span>
      </div>
      
      <Progress 
        percent={candidate.matchScore} 
        size="small" 
        showInfo={false}
        className="mb-3"
      />
      
      <div className="flex flex-wrap gap-1 mb-3">
        {candidate.matchingKeywords.slice(0, 3).map((skill, index) => (
          <Tag key={index} size="small" color="blue">
            {skill}
          </Tag>
        ))}
      </div>
      
      <Button 
        type="primary" 
        size="small" 
        block
        onClick={onInvite}
        disabled={candidate.hasApplied || candidate.inviteSent}
      >
        {candidate.hasApplied ? 'Applied' : candidate.inviteSent ? 'Invited' : 'Invite'}
      </Button>
    </Card>
  );
};

export default MobileCandidateCard;
```

---

## 🔍 Search and Filter Features

### 1. Recommendation Filters
**File:** `src/components/jobs/RecommendationFilters.jsx`

```jsx
import React from 'react';
import { Card, Slider, Select, Switch, Button } from 'antd';

const RecommendationFilters = ({ filters, onFiltersChange, onReset }) => {
  return (
    <Card title="Filter Recommendations" size="small">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Minimum Match Score
          </label>
          <Slider
            range
            min={0}
            max={100}
            value={[filters.minMatchScore, filters.maxMatchScore]}
            onChange={(value) => onFiltersChange({
              minMatchScore: value[0],
              maxMatchScore: value[1]
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Required Skills
          </label>
          <Select
            mode="multiple"
            placeholder="Select required skills"
            value={filters.requiredSkills}
            onChange={(value) => onFiltersChange({ requiredSkills: value })}
            style={{ width: '100%' }}
          >
            {/* Populate with available skills */}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Interview Experience
          </label>
          <Switch
            checked={filters.hasInterviewExperience}
            onChange={(checked) => onFiltersChange({ hasInterviewExperience: checked })}
          />
          <span className="ml-2 text-sm">Has completed interviews</span>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Application Status
          </label>
          <Select
            value={filters.applicationStatus}
            onChange={(value) => onFiltersChange({ applicationStatus: value })}
            style={{ width: '100%' }}
          >
            <Select.Option value="all">All Candidates</Select.Option>
            <Select.Option value="not-applied">Not Applied</Select.Option>
            <Select.Option value="applied">Already Applied</Select.Option>
          </Select>
        </div>

        <Button onClick={onReset} block>
          Reset Filters
        </Button>
      </div>
    </Card>
  );
};

export default RecommendationFilters;
```

---

## 📊 Analytics Integration

### 1. Recommendation Analytics
**File:** `src/components/jobs/RecommendationAnalytics.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Progress } from 'antd';
import { Line, Pie } from '@ant-design/charts';

const RecommendationAnalytics = ({ jobId }) => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    // Fetch analytics data
    fetchAnalytics();
  }, [jobId]);

  const fetchAnalytics = async () => {
    // Implementation to fetch analytics
  };

  return (
    <div className="recommendation-analytics">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Recommendations"
              value={analytics?.totalRecommendations || 0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="High Quality Matches"
              value={analytics?.highQualityMatches || 0}
              suffix={`/ ${analytics?.totalRecommendations || 0}`}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Invitations Sent"
              value={analytics?.invitationsSent || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Response Rate"
              value={analytics?.responseRate || 0}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={12}>
          <Card title="Match Score Distribution">
            <Pie
              data={analytics?.matchScoreDistribution || []}
              angleField="value"
              colorField="type"
              radius={0.8}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Skills Match Trends">
            <Line
              data={analytics?.skillsMatchTrends || []}
              xField="date"
              yField="averageMatch"
              smooth
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RecommendationAnalytics;
```

---

## ✅ Implementation Checklist

### Phase 1: Core Components
- [ ] Create `RecommendedEmployees` component
- [ ] Create `CandidateCard` component  
- [ ] Create `InviteCandidateModal` component
- [ ] Add API service functions
- [ ] Update job details page with recommendations tab

### Phase 2: Enhanced Features
- [ ] Add recommendation filters
- [ ] Implement mobile-responsive design
- [ ] Add analytics dashboard
- [ ] Create invitation management page
- [ ] Add notification system for invitations

### Phase 3: Integration & Testing
- [ ] Integrate with existing job management
- [ ] Add state management (Redux/Context)
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Test mobile responsiveness

### Phase 4: Polish & Optimization
- [ ] Add animations and transitions
- [ ] Optimize API calls with caching
- [ ] Add keyboard navigation
- [ ] Implement accessibility features
- [ ] Performance optimization

---

## 🚀 Deployment Notes

### Environment Variables
```bash
# Add to .env files
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_ENABLE_AI_RECOMMENDATIONS=true
REACT_APP_MAX_RECOMMENDATIONS_PER_JOB=50
```

### Build Configuration
```json
// package.json dependencies to add
{
  "@ant-design/charts": "^1.4.2",
  "react-intersection-observer": "^9.4.0",
  "react-virtualized": "^9.22.3"
}
```

---

*Last Updated: December 2024*
*Version: 1.0.0*