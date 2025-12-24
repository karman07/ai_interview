# Employer Frontend Implementation Guide

## Overview
Complete frontend implementation guide for employer features including job management, AI recommendations, chat system, and candidate management.

## 📋 Table of Contents
- [Dashboard Overview](#dashboard-overview)
- [Job Management](#job-management)
- [AI Recommendations](#ai-recommendations)
- [Chat System](#chat-system)
- [Application Management](#application-management)
- [API Integration](#api-integration)
- [Component Structure](#component-structure)
- [Routing & Navigation](#routing--navigation)
- [State Management](#state-management)
- [UI/UX Guidelines](#uiux-guidelines)

---

## 🏠 Dashboard Overview

### Main Dashboard Component
**File:** `src/pages/employer/Dashboard.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Button, List, Badge } from 'antd';
import { 
  BriefcaseOutlined, 
  UserOutlined, 
  StarOutlined, 
  MessageOutlined,
  PlusOutlined 
} from '@ant-design/icons';

const EmployerDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentJobs, setRecentJobs] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // API calls for dashboard data
    const [statsRes, jobsRes, chatRes] = await Promise.all([
      getDashboardStats(),
      getRecentJobs(),
      getUnreadCount()
    ]);
    
    setStats(statsRes);
    setRecentJobs(jobsRes);
    setUnreadMessages(chatRes.unreadCount);
  };

  return (
    <div className="employer-dashboard">
      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Jobs"
              value={stats.activeJobs}
              prefix={<BriefcaseOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Applications"
              value={stats.totalApplications}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="AI Matches"
              value={stats.aiMatches}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Messages"
              value={unreadMessages}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card 
            title="Quick Actions" 
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                Post New Job
              </Button>
            }
          >
            <div className="quick-actions">
              <Button block className="mb-2">View Applications</Button>
              <Button block className="mb-2">AI Recommendations</Button>
              <Button block>Manage Jobs</Button>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="Recent Jobs">
            <List
              dataSource={recentJobs}
              renderItem={job => (
                <List.Item>
                  <List.Item.Meta
                    title={job.title}
                    description={`${job.applicationCount} applications`}
                  />
                  <Badge 
                    status={job.isActive ? 'success' : 'default'} 
                    text={job.isActive ? 'Active' : 'Inactive'} 
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployerDashboard;
```

---

## 💼 Job Management

### Job List Component
**File:** `src/components/jobs/JobList.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: 'Job Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-sm text-gray-500">{record.location}</div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'jobType',
      key: 'jobType',
      render: type => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Applications',
      dataIndex: 'applicationCount',
      key: 'applicationCount',
      render: count => <span className="font-semibold">{count || 0}</span>,
    },
    {
      title: 'AI Matches',
      dataIndex: 'aiMatches',
      key: 'aiMatches',
      render: count => <span className="text-purple-600">{count || 0}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: isActive => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => viewJob(record.id)}
          />
          <Button 
            icon={<EditOutlined />} 
            onClick={() => editJob(record.id)}
          />
          <Button 
            icon={<DeleteOutlined />} 
            danger
            onClick={() => deleteJob(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="job-list">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Jobs</h2>
        <Button type="primary" onClick={() => navigate('/jobs/create')}>
          Post New Job
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={jobs}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};
```

### Job Creation Form
**File:** `src/components/jobs/CreateJobForm.jsx`

```jsx
import React from 'react';
import { Form, Input, Select, InputNumber, Button, Space, Tag } from 'antd';

const CreateJobForm = ({ onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [skills, setSkills] = useState([]);

  const handleSubmit = async (values) => {
    const jobData = {
      ...values,
      skills,
      salaryRange: {
        min: values.minSalary,
        max: values.maxSalary
      }
    };
    await onSubmit(jobData);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="create-job-form"
    >
      <Form.Item
        name="title"
        label="Job Title"
        rules={[{ required: true, message: 'Please enter job title' }]}
      >
        <Input placeholder="e.g. Senior Software Engineer" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Job Description"
        rules={[{ required: true, message: 'Please enter job description' }]}
      >
        <Input.TextArea rows={6} placeholder="Describe the role, responsibilities..." />
      </Form.Item>

      <Form.Item
        name="requirements"
        label="Requirements"
        rules={[{ required: true, message: 'Please enter requirements' }]}
      >
        <Select
          mode="tags"
          placeholder="Add requirements"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          name="location"
          label="Location"
          rules={[{ required: true, message: 'Please enter location' }]}
        >
          <Input placeholder="e.g. New York, NY" />
        </Form.Item>

        <Form.Item
          name="jobType"
          label="Job Type"
          rules={[{ required: true, message: 'Please select job type' }]}
        >
          <Select>
            <Select.Option value="full-time">Full-time</Select.Option>
            <Select.Option value="part-time">Part-time</Select.Option>
            <Select.Option value="contract">Contract</Select.Option>
            <Select.Option value="internship">Internship</Select.Option>
          </Select>
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item name="minSalary" label="Min Salary">
          <InputNumber
            style={{ width: '100%' }}
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item name="maxSalary" label="Max Salary">
          <InputNumber
            style={{ width: '100%' }}
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
      </div>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Post Job
          </Button>
          <Button onClick={() => form.resetFields()}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
```

---

## 🤖 AI Recommendations

### AI Recommendations Component
**File:** `src/components/jobs/AIRecommendations.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Progress, Tag, Avatar, Empty, Spin } from 'antd';
import { UserOutlined, StarOutlined, SendOutlined } from '@ant-design/icons';

const AIRecommendations = ({ jobId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    if (jobId) {
      fetchRecommendations();
    }
  }, [jobId]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await getRecommendedEmployees(jobId, 25);
      setRecommendations(response.recommendations || []);
    } catch (error) {
      message.error('Failed to load AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  const CandidateCard = ({ candidate }) => (
    <Card
      className="candidate-card mb-4"
      actions={[
        <Button 
          type="primary" 
          icon={<SendOutlined />}
          onClick={() => handleInvite(candidate)}
          disabled={candidate.hasApplied || candidate.inviteSent}
        >
          {candidate.hasApplied ? 'Applied' : candidate.inviteSent ? 'Invited' : 'Invite'}
        </Button>
      ]}
    >
      <div className="flex items-start gap-4">
        <Avatar size={64} icon={<UserOutlined />} />
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">
            {candidate.candidateProfile.name}
          </h3>
          
          <div className="mb-3">
            <span className="text-sm text-gray-500">Match Score: </span>
            <span className="text-lg font-bold text-blue-600">
              {candidate.matchScore.toFixed(1)}%
            </span>
          </div>

          <Progress 
            percent={candidate.matchScore} 
            strokeColor="#1890ff"
            showInfo={false}
            className="mb-3"
          />

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div className="text-xs text-gray-500">Skills Match</div>
              <div className="font-semibold">{candidate.skillsMatch.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Experience</div>
              <div className="font-semibold">{candidate.experienceMatch.toFixed(1)}%</div>
            </div>
          </div>

          {candidate.interviewScores?.totalInterviews > 0 && (
            <div className="mb-3">
              <div className="text-sm font-medium text-green-600 mb-1">
                Interview Performance
              </div>
              <div className="text-sm">
                Overall: {candidate.interviewScores.overall.toFixed(1)}/10 
                ({candidate.interviewScores.totalInterviews} interviews)
              </div>
            </div>
          )}

          <div className="mb-3">
            <div className="text-sm font-medium text-green-600 mb-1">
              Matching Skills
            </div>
            <div className="flex flex-wrap gap-1">
              {candidate.matchingKeywords.slice(0, 5).map((skill, index) => (
                <Tag key={index} color="green" size="small">
                  {skill}
                </Tag>
              ))}
              {candidate.matchingKeywords.length > 5 && (
                <Tag size="small">+{candidate.matchingKeywords.length - 5} more</Tag>
              )}
            </div>
          </div>

          {candidate.missingSkills.length > 0 && (
            <div>
              <div className="text-sm font-medium text-orange-600 mb-1">
                Skills to Develop
              </div>
              <div className="flex flex-wrap gap-1">
                {candidate.missingSkills.slice(0, 3).map((skill, index) => (
                  <Tag key={index} color="orange" size="small">
                    {skill}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

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
        description="No AI recommendations found"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="ai-recommendations">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">
          AI Recommended Candidates ({recommendations.length})
        </h3>
        <Button onClick={fetchRecommendations} loading={loading}>
          Refresh
        </Button>
      </div>

      <div className="recommendations-grid">
        {recommendations.map((candidate) => (
          <CandidateCard key={candidate.userId} candidate={candidate} />
        ))}
      </div>
    </div>
  );
};
```

---

## 💬 Chat System

### Chat Interface Component
**File:** `src/components/chat/ChatInterface.jsx`

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, Avatar, List, Badge } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';

const ChatInterface = ({ chatId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      fetchChatMessages();
      markAsRead();
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatMessages = async () => {
    try {
      const chat = await getChatById(chatId);
      setMessages(chat.messages || []);
    } catch (error) {
      message.error('Failed to load chat messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await sendChatMessage(chatId, {
        content: newMessage,
        type: 'text'
      });
      
      setNewMessage('');
      fetchChatMessages(); // Refresh messages
    } catch (error) {
      message.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await markChatAsRead(chatId);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const MessageItem = ({ message }) => {
    const isOwnMessage = message.senderId === currentUser.id;
    
    return (
      <div className={`message-item ${isOwnMessage ? 'own-message' : 'other-message'}`}>
        <div className="flex items-start gap-2 mb-2">
          {!isOwnMessage && <Avatar size="small" icon={<UserOutlined />} />}
          
          <div className={`message-bubble ${isOwnMessage ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-100'}`}>
            <div className="message-content">{message.content}</div>
            <div className="message-time text-xs opacity-70">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
          
          {isOwnMessage && <Avatar size="small" icon={<UserOutlined />} />}
        </div>
      </div>
    );
  };

  return (
    <Card className="chat-interface h-96 flex flex-col">
      <div className="messages-container flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <MessageItem key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onPressEnter={sendMessage}
            disabled={loading}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            loading={loading}
            disabled={!newMessage.trim()}
          />
        </div>
      </div>
    </Card>
  );
};
```

### Chat List Component
**File:** `src/components/chat/ChatList.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { List, Avatar, Badge, Card } from 'antd';
import { UserOutlined, MessageOutlined } from '@ant-design/icons';

const ChatList = ({ onChatSelect, selectedChatId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const response = await getUserChats();
      setChats(response);
    } catch (error) {
      message.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const getUnreadCount = (chat) => {
    return chat.messages.filter(msg => 
      !msg.isRead && msg.senderId !== currentUser.id
    ).length;
  };

  const getLastMessage = (chat) => {
    const lastMessage = chat.messages[chat.messages.length - 1];
    return lastMessage ? lastMessage.content : 'No messages yet';
  };

  return (
    <Card title="Messages" className="chat-list">
      <List
        loading={loading}
        dataSource={chats}
        renderItem={chat => (
          <List.Item
            className={`chat-item cursor-pointer ${selectedChatId === chat._id ? 'selected' : ''}`}
            onClick={() => onChatSelect(chat._id)}
          >
            <List.Item.Meta
              avatar={
                <Badge count={getUnreadCount(chat)} size="small">
                  <Avatar icon={<UserOutlined />} />
                </Badge>
              }
              title={
                <div className="flex justify-between items-center">
                  <span>{chat.employerId.name || chat.employeeId.name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(chat.lastMessageAt).toLocaleDateString()}
                  </span>
                </div>
              }
              description={
                <div className="text-sm text-gray-600 truncate">
                  {getLastMessage(chat)}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};
```

---

## 📋 Application Management

### Application List Component
**File:** `src/components/applications/ApplicationList.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Select, Space, Progress } from 'antd';
import { EyeOutlined, MessageOutlined } from '@ant-design/icons';

const ApplicationList = ({ jobId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const statusColors = {
    pending: 'orange',
    reviewed: 'blue',
    shortlisted: 'green',
    rejected: 'red',
    hired: 'purple'
  };

  const columns = [
    {
      title: 'Candidate',
      dataIndex: 'applicantId',
      key: 'candidate',
      render: (applicant) => (
        <div>
          <div className="font-semibold">{applicant.name}</div>
          <div className="text-sm text-gray-500">{applicant.email}</div>
        </div>
      ),
    },
    {
      title: 'AI Match',
      dataIndex: 'aiMatchingScore',
      key: 'aiMatch',
      render: (score) => (
        <div>
          <Progress 
            percent={score?.overallMatch || 0} 
            size="small" 
            format={percent => `${percent}%`}
          />
        </div>
      ),
      sorter: (a, b) => (a.aiMatchingScore?.overallMatch || 0) - (b.aiMatchingScore?.overallMatch || 0),
    },
    {
      title: 'Interview Score',
      dataIndex: 'interviewScores',
      key: 'interview',
      render: (scores) => (
        <div>
          <div className="font-semibold">{scores?.overall || 0}/10</div>
          <div className="text-xs text-gray-500">
            {scores?.totalInterviews || 0} interviews
          </div>
        </div>
      ),
      sorter: (a, b) => (a.interviewScores?.overall || 0) - (b.interviewScores?.overall || 0),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Reviewed', value: 'reviewed' },
        { text: 'Shortlisted', value: 'shortlisted' },
        { text: 'Rejected', value: 'rejected' },
        { text: 'Hired', value: 'hired' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Applied',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.appliedAt) - new Date(b.appliedAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => viewApplication(record._id)}
          />
          <Button 
            icon={<MessageOutlined />} 
            onClick={() => startChat(record.applicantId._id)}
          />
          <Select
            value={record.status}
            onChange={(value) => updateStatus(record._id, value)}
            style={{ width: 120 }}
          >
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="reviewed">Reviewed</Select.Option>
            <Select.Option value="shortlisted">Shortlisted</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
            <Select.Option value="hired">Hired</Select.Option>
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <div className="application-list">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Applications</h3>
        <Button onClick={fetchApplications}>Refresh</Button>
      </div>

      <Table
        columns={columns}
        dataSource={applications}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
      />
    </div>
  );
};
```

---

## 🔌 API Integration

### API Service Functions
**File:** `src/services/employerService.js`

```javascript
import api from './api';

// Job Management
export const createJob = async (jobData) => {
  const response = await api.post('/jobs/enhanced', jobData);
  return response.data;
};

export const getEmployerJobs = async (filters = {}) => {
  const response = await api.get('/jobs/enhanced/employer', { params: filters });
  return response.data;
};

export const updateJob = async (jobId, updateData) => {
  const response = await api.put(`/jobs/enhanced/${jobId}`, updateData);
  return response.data;
};

export const deleteJob = async (jobId) => {
  const response = await api.delete(`/jobs/enhanced/${jobId}`);
  return response.data;
};

// AI Recommendations
export const getRecommendedEmployees = async (jobId, limit = 10) => {
  const response = await api.get(`/jobs/enhanced/${jobId}/recommended-employees`, {
    params: { limit }
  });
  return response.data;
};

export const inviteCandidate = async (jobId, candidateId, message) => {
  const response = await api.post(`/jobs/enhanced/${jobId}/invite-candidate`, {
    candidateId,
    message
  });
  return response.data;
};

// Applications
export const getJobApplications = async (jobId) => {
  const response = await api.get(`/jobs/enhanced/${jobId}/applications`);
  return response.data;
};

export const updateApplicationStatus = async (applicationId, status, notes) => {
  const response = await api.patch(`/jobs/enhanced/applications/${applicationId}/status`, {
    status,
    notes
  });
  return response.data;
};

// Chat
export const getUserChats = async () => {
  const response = await api.get('/chat/my-chats');
  return response.data;
};

export const getChatById = async (chatId) => {
  const response = await api.get(`/chat/${chatId}`);
  return response.data;
};

export const sendChatMessage = async (chatId, messageData) => {
  const response = await api.post(`/chat/${chatId}/message`, messageData);
  return response.data;
};

export const markChatAsRead = async (chatId) => {
  const response = await api.patch(`/chat/${chatId}/read`);
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/chat/unread/count');
  return response.data;
};

// Dashboard
export const getDashboardStats = async () => {
  const response = await api.get('/jobs/enhanced/dashboard-stats');
  return response.data;
};
```

---

## 🗂️ Component Structure

```
src/
├── pages/
│   └── employer/
│       ├── Dashboard.jsx
│       ├── JobList.jsx
│       ├── CreateJob.jsx
│       ├── JobDetails.jsx
│       └── Messages.jsx
├── components/
│   ├── jobs/
│   │   ├── JobCard.jsx
│   │   ├── CreateJobForm.jsx
│   │   ├── AIRecommendations.jsx
│   │   └── ApplicationList.jsx
│   ├── chat/
│   │   ├── ChatInterface.jsx
│   │   ├── ChatList.jsx
│   │   └── MessageBubble.jsx
│   └── common/
│       ├── Layout.jsx
│       ├── Navigation.jsx
│       └── LoadingSpinner.jsx
├── services/
│   ├── employerService.js
│   ├── chatService.js
│   └── api.js
├── hooks/
│   ├── useJobs.js
│   ├── useChat.js
│   └── useApplications.js
└── styles/
    ├── employer.css
    ├── chat.css
    └── components.css
```

---

## 🛣️ Routing & Navigation

### Router Configuration
**File:** `src/routes/EmployerRoutes.jsx`

```jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EmployerLayout from '../components/layout/EmployerLayout';
import Dashboard from '../pages/employer/Dashboard';
import JobList from '../pages/employer/JobList';
import CreateJob from '../pages/employer/CreateJob';
import JobDetails from '../pages/employer/JobDetails';
import Messages from '../pages/employer/Messages';

const EmployerRoutes = () => {
  return (
    <EmployerLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/create" element={<CreateJob />} />
        <Route path="/jobs/:jobId" element={<JobDetails />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </EmployerLayout>
  );
};

export default EmployerRoutes;
```

### Navigation Menu
**File:** `src/components/layout/EmployerNavigation.jsx`

```jsx
import React from 'react';
import { Menu, Badge } from 'antd';
import { 
  DashboardOutlined, 
  BriefcaseOutlined, 
  UserOutlined, 
  MessageOutlined,
  StarOutlined 
} from '@ant-design/icons';

const EmployerNavigation = ({ unreadCount }) => {
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/employer'
    },
    {
      key: 'jobs',
      icon: <BriefcaseOutlined />,
      label: 'Jobs',
      children: [
        { key: 'job-list', label: 'My Jobs', path: '/employer/jobs' },
        { key: 'create-job', label: 'Post New Job', path: '/employer/jobs/create' },
        { key: 'ai-recommendations', label: 'AI Recommendations', path: '/employer/recommendations' }
      ]
    },
    {
      key: 'applications',
      icon: <UserOutlined />,
      label: 'Applications',
      path: '/employer/applications'
    },
    {
      key: 'messages',
      icon: (
        <Badge count={unreadCount} size="small">
          <MessageOutlined />
        </Badge>
      ),
      label: 'Messages',
      path: '/employer/messages'
    }
  ];

  return (
    <Menu
      mode="inline"
      items={menuItems}
      className="employer-navigation"
    />
  );
};
```

---

## 🎨 UI/UX Guidelines

### Design System
```css
/* Color Palette */
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #ff4d4f;
  --text-primary: #262626;
  --text-secondary: #8c8c8c;
  --border-color: #d9d9d9;
  --background-light: #fafafa;
}

/* Component Styles */
.employer-dashboard {
  padding: 24px;
  background: var(--background-light);
  min-height: 100vh;
}

.job-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.candidate-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.chat-interface {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.message-bubble {
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 70%;
  word-wrap: break-word;
}

.own-message .message-bubble {
  background: var(--primary-color);
  color: white;
  margin-left: auto;
}

.other-message .message-bubble {
  background: #f0f0f0;
  color: var(--text-primary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .employer-dashboard {
    padding: 16px;
  }
  
  .job-card {
    margin-bottom: 16px;
  }
  
  .candidate-card {
    padding: 12px;
  }
}
```

### Mobile Responsiveness
- **Breakpoints**: 576px, 768px, 992px, 1200px
- **Grid System**: Use Ant Design's responsive grid
- **Touch Targets**: Minimum 44px for buttons
- **Typography**: Scalable font sizes
- **Navigation**: Collapsible sidebar on mobile

---

## 📱 Mobile Optimization

### Mobile Components
**File:** `src/components/mobile/MobileJobCard.jsx`

```jsx
import React from 'react';
import { Card, Tag, Button, Progress } from 'antd';

const MobileJobCard = ({ job }) => {
  return (
    <Card size="small" className="mobile-job-card mb-3">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-base">{job.title}</h4>
        <Tag color={job.isActive ? 'green' : 'red'} size="small">
          {job.isActive ? 'Active' : 'Inactive'}
        </Tag>
      </div>
      
      <div className="text-sm text-gray-600 mb-2">{job.location}</div>
      
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm">Applications: {job.applicationCount}</span>
        <span className="text-sm text-purple-600">AI Matches: {job.aiMatches}</span>
      </div>
      
      <div className="flex gap-2">
        <Button size="small" block>View</Button>
        <Button size="small" type="primary" block>Manage</Button>
      </div>
    </Card>
  );
};
```

---

## ✅ Implementation Checklist

### Phase 1: Core Setup
- [ ] Set up employer routing
- [ ] Create basic layout components
- [ ] Implement authentication guards
- [ ] Set up API service layer

### Phase 2: Job Management
- [ ] Dashboard with statistics
- [ ] Job creation form
- [ ] Job list with filters
- [ ] Job editing functionality
- [ ] Job deletion with validation

### Phase 3: AI Integration
- [ ] AI recommendations component
- [ ] Candidate invitation system
- [ ] Match score visualization
- [ ] Skills comparison display

### Phase 4: Chat System
- [ ] Chat interface component
- [ ] Message sending/receiving
- [ ] Real-time updates
- [ ] Unread message indicators

### Phase 5: Application Management
- [ ] Application list with sorting
- [ ] Status update functionality
- [ ] Candidate profile viewing
- [ ] Bulk operations

### Phase 6: Polish & Testing
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Loading states
- [ ] Performance optimization
- [ ] User testing

---

## 🚀 Deployment Notes

### Environment Variables
```bash
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_WEBSOCKET_URL=ws://localhost:3001
REACT_APP_ENABLE_AI_FEATURES=true
```

### Build Configuration
```json
{
  "scripts": {
    "build:employer": "REACT_APP_USER_TYPE=employer npm run build",
    "deploy:employer": "npm run build:employer && aws s3 sync build/ s3://employer-app-bucket"
  }
}
```

---

*Last Updated: December 2024*
*Version: 2.0.0*