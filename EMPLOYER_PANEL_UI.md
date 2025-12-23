# Employer Panel - Enhanced Job Management UI

## Overview
Complete UI specifications for the enhanced employer panel with flexible job management, AI integration, comprehensive application tracking, and candidate evaluation with interview scores.

---

## 🎯 **Key Features**

### **Enhanced Job Management**
- ✅ **Full CRUD Operations**: Create, edit, update, delete jobs
- ✅ **Flexible Editing**: Change any job detail at any time
- ✅ **Rich Text Editor**: Enhanced job description editing
- ✅ **PDF Auto-Generation**: Automatic job description PDF for AI matcher
- ✅ **Job Status Toggle**: Activate/deactivate jobs instantly

### **Smart Application Management**
- ✅ **AI Matching Scores**: Candidates ranked by AI compatibility (0-100%)
- ✅ **Interview Performance**: Best interview scores displayed for each applicant
- ✅ **Smart Sorting**: By AI match + interview performance
- ✅ **Bulk Operations**: Manage multiple applications simultaneously
- ✅ **Status Tracking**: Complete application lifecycle management

---

## 📱 **UI Components & Screens**

### 1. **Enhanced Dashboard**

#### **Main Dashboard**
```jsx
<EmployerDashboard>
  <DashboardHeader>
    <WelcomeSection>
      <Title>Welcome back, {employerName}!</Title>
      <Subtitle>Manage your jobs and find the best candidates</Subtitle>
    </WelcomeSection>
    
    <QuickActions>
      <PrimaryButton onClick={createNewJob}>
        <Icon name="plus" />
        Create New Job
      </PrimaryButton>
      <SecondaryButton onClick={viewAnalytics}>
        <Icon name="chart" />
        View Analytics
      </SecondaryButton>
    </QuickActions>
  </DashboardHeader>

  <StatsGrid>
    <StatCard 
      title="Total Jobs" 
      value={15} 
      change={+2}
      icon="briefcase"
      color="blue"
    />
    <StatCard 
      title="Active Jobs" 
      value={12} 
      change={+1}
      icon="check-circle"
      color="green"
    />
    <StatCard 
      title="Total Applications" 
      value={247} 
      change={+23}
      icon="users"
      color="purple"
    />
    <StatCard 
      title="Pending Reviews" 
      value={23} 
      change={-5}
      icon="clock"
      color="orange"
    />
  </StatsGrid>

  <ContentGrid>
    <RecentJobsCard>
      <CardHeader>
        <Title>Recent Jobs</Title>
        <ViewAllLink href="/jobs">View All</ViewAllLink>
      </CardHeader>
      <JobsList>
        <JobItem 
          job={job}
          onEdit={handleEdit}
          onToggle={handleToggle}
          onViewApplications={handleViewApps}
        />
      </JobsList>
    </RecentJobsCard>

    <TopCandidatesCard>
      <CardHeader>
        <Title>🎯 Top Candidates Today</Title>
        <FilterDropdown />
      </CardHeader>
      <CandidatesList>
        <CandidateItem 
          candidate={candidate}
          aiScore={92}
          interviewScore={8.5}
          onViewProfile={viewProfile}
        />
      </CandidatesList>
    </TopCandidatesCard>
  </ContentGrid>
</EmployerDashboard>
```

**API Endpoint**: `GET /jobs/enhanced/dashboard-stats`

---

### 2. **Enhanced Job Creation/Editing Form**

#### **Multi-Step Job Form**
```jsx
<JobFormWizard>
  <FormProgress>
    <ProgressStep active={step === 1}>Basic Info</ProgressStep>
    <ProgressStep active={step === 2}>Requirements</ProgressStep>
    <ProgressStep active={step === 3}>Benefits & Company</ProgressStep>
    <ProgressStep active={step === 4}>Preview & Publish</ProgressStep>
  </FormProgress>

  {/* Step 1: Basic Information */}
  <FormStep active={step === 1}>
    <StepHeader>
      <Title>📝 Basic Job Information</Title>
      <Subtitle>Tell us about the role you're hiring for</Subtitle>
    </StepHeader>

    <FormGrid>
      <FormField span={2}>
        <Label required>Job Title</Label>
        <Input 
          value={title}
          onChange={setTitle}
          placeholder="e.g., Senior React Developer"
          error={errors.title}
        />
        <HelperText>Make it specific and attractive to candidates</HelperText>
      </FormField>

      <FormField span={2}>
        <Label required>Job Description</Label>
        <RichTextEditor 
          value={description}
          onChange={setDescription}
          placeholder="Describe the role, responsibilities, and what makes this position exciting..."
          toolbar={['bold', 'italic', 'list', 'link']}
          minHeight={200}
        />
        <CharacterCount current={description.length} max={5000} />
      </FormField>

      <FormField>
        <Label required>Location</Label>
        <LocationInput 
          value={location}
          onChange={setLocation}
          suggestions={locationSuggestions}
          allowRemote={true}
        />
      </FormField>

      <FormField>
        <Label required>Job Type</Label>
        <Select 
          value={jobType}
          onChange={setJobType}
          options={[
            { value: 'full-time', label: '💼 Full-time', description: '40+ hours/week' },
            { value: 'part-time', label: '⏰ Part-time', description: 'Less than 40 hours/week' },
            { value: 'contract', label: '📋 Contract', description: 'Fixed-term position' },
            { value: 'internship', label: '🎓 Internship', description: 'Learning opportunity' }
          ]}
        />
      </FormField>

      <FormField>
        <Label required>Experience Level</Label>
        <Select 
          value={experienceLevel}
          onChange={setExperienceLevel}
          options={[
            { value: 'entry', label: '🌱 Entry Level', description: '0-2 years' },
            { value: 'mid', label: '🚀 Mid Level', description: '3-5 years' },
            { value: 'senior', label: '⭐ Senior Level', description: '6+ years' },
            { value: 'executive', label: '👑 Executive', description: 'Leadership role' }
          ]}
        />
      </FormField>

      <FormField>
        <Label>Salary Range (Optional)</Label>
        <SalaryRangeInput 
          minValue={salaryRange.min}
          maxValue={salaryRange.max}
          onMinChange={setSalaryMin}
          onMaxChange={setSalaryMax}
          currency="USD"
          showPublicly={showSalary}
          onTogglePublic={setShowSalary}
        />
        <HelperText>Transparent salary ranges attract 30% more candidates</HelperText>
      </FormField>
    </FormGrid>
  </FormStep>

  {/* Step 2: Requirements & Skills */}
  <FormStep active={step === 2}>
    <StepHeader>
      <Title>🎯 Requirements & Skills</Title>
      <Subtitle>Define what you're looking for in candidates</Subtitle>
    </StepHeader>

    <FormGrid>
      <FormField span={2}>
        <Label required>Job Requirements</Label>
        <DynamicList 
          items={requirements}
          onAdd={addRequirement}
          onRemove={removeRequirement}
          onEdit={editRequirement}
          placeholder="e.g., Bachelor's degree in Computer Science"
          addButtonText="Add Requirement"
          maxItems={10}
        />
        <HelperText>List the must-have qualifications and experience</HelperText>
      </FormField>

      <FormField span={2}>
        <Label required>Required Skills</Label>
        <SkillsInput 
          skills={skills}
          onChange={setSkills}
          suggestions={skillSuggestions}
          placeholder="Type skills and press Enter"
          maxSkills={15}
          showPopularSkills={true}
        />
        <PopularSkills>
          <SkillTag onClick={addSkill}>React</SkillTag>
          <SkillTag onClick={addSkill}>Node.js</SkillTag>
          <SkillTag onClick={addSkill}>TypeScript</SkillTag>
          <SkillTag onClick={addSkill}>Python</SkillTag>
        </PopularSkills>
      </FormField>

      <FormField span={2}>
        <Label>Nice-to-Have Skills (Optional)</Label>
        <SkillsInput 
          skills={niceToHaveSkills}
          onChange={setNiceToHaveSkills}
          placeholder="Additional skills that would be a plus"
          variant="secondary"
        />
      </FormField>
    </FormGrid>
  </FormStep>

  {/* Step 3: Benefits & Company */}
  <FormStep active={step === 3}>
    <StepHeader>
      <Title>🎁 Benefits & Company Info</Title>
      <Subtitle>Showcase what makes your company great</Subtitle>
    </StepHeader>

    <FormGrid>
      <FormField span={2}>
        <Label>Benefits & Perks</Label>
        <BenefitsSelector 
          selectedBenefits={benefits}
          onChange={setBenefits}
          categories={[
            {
              name: 'Health & Wellness',
              benefits: ['Health Insurance', 'Dental Insurance', 'Vision Insurance', 'Mental Health Support']
            },
            {
              name: 'Time Off',
              benefits: ['Paid Time Off', 'Flexible Schedule', 'Remote Work', 'Sabbatical']
            },
            {
              name: 'Financial',
              benefits: ['401k Matching', 'Stock Options', 'Bonus', 'Commuter Benefits']
            },
            {
              name: 'Professional Development',
              benefits: ['Learning Budget', 'Conference Attendance', 'Mentorship', 'Career Growth']
            }
          ]}
        />
      </FormField>

      <FormField span={2}>
        <Label>About the Company</Label>
        <RichTextEditor 
          value={companyInfo}
          onChange={setCompanyInfo}
          placeholder="Tell candidates about your company culture, mission, values, and what makes it a great place to work..."
          minHeight={150}
        />
        <HelperText>Companies with detailed descriptions get 40% more applications</HelperText>
      </FormField>
    </FormGrid>
  </FormStep>

  {/* Step 4: Preview & Publish */}
  <FormStep active={step === 4}>
    <StepHeader>
      <Title>👀 Preview & Publish</Title>
      <Subtitle>Review your job posting before publishing</Subtitle>
    </StepHeader>

    <JobPreview>
      <PreviewCard>
        <JobHeader>
          <JobTitle>{title}</JobTitle>
          <JobMeta>
            <MetaItem><Icon name="location" />{location}</MetaItem>
            <MetaItem><Icon name="briefcase" />{jobType}</MetaItem>
            <MetaItem><Icon name="star" />{experienceLevel}</MetaItem>
            {salaryRange.min && (
              <MetaItem><Icon name="dollar" />${salaryRange.min.toLocaleString()} - ${salaryRange.max.toLocaleString()}</MetaItem>
            )}
          </JobMeta>
        </JobHeader>

        <JobContent>
          <Section>
            <SectionTitle>Job Description</SectionTitle>
            <Content dangerouslySetInnerHTML={{ __html: description }} />
          </Section>

          <Section>
            <SectionTitle>Requirements</SectionTitle>
            <RequirementsList>
              {requirements.map(req => (
                <RequirementItem key={req}>• {req}</RequirementItem>
              ))}
            </RequirementsList>
          </Section>

          <Section>
            <SectionTitle>Required Skills</SectionTitle>
            <SkillTags>
              {skills.map(skill => (
                <SkillTag key={skill}>{skill}</SkillTag>
              ))}
            </SkillTags>
          </Section>

          {benefits.length > 0 && (
            <Section>
              <SectionTitle>Benefits</SectionTitle>
              <BenefitsList>
                {benefits.map(benefit => (
                  <BenefitItem key={benefit}>✓ {benefit}</BenefitItem>
                ))}
              </BenefitsList>
            </Section>
          )}
        </JobContent>
      </PreviewCard>

      <PreviewActions>
        <Button secondary onClick={saveDraft}>
          <Icon name="save" />
          Save as Draft
        </Button>
        <Button primary onClick={publishJob}>
          <Icon name="rocket" />
          Publish Job
        </Button>
      </PreviewActions>
    </JobPreview>
  </FormStep>

  <FormNavigation>
    <Button 
      secondary 
      onClick={previousStep}
      disabled={step === 1}
    >
      Previous
    </Button>
    <Button 
      primary 
      onClick={nextStep}
      disabled={step === 4}
    >
      Next
    </Button>
  </FormNavigation>
</JobFormWizard>
```

**API Endpoints**:
- **Create**: `POST /jobs/enhanced`
- **Update**: `PUT /jobs/enhanced/:jobId`
- **Save Draft**: `PUT /jobs/enhanced/:jobId` (with `isActive: false`)

---

### 3. **Job Management Interface**

#### **Enhanced Jobs Table**
```jsx
<JobsManagement>
  <JobsHeader>
    <Title>📋 My Job Postings</Title>
    <HeaderActions>
      <Button primary onClick={createNewJob}>
        <Icon name="plus" />
        Create New Job
      </Button>
      <Button secondary onClick={openBulkActions}>
        <Icon name="settings" />
        Bulk Actions
      </Button>
    </HeaderActions>
  </JobsHeader>

  <JobsFilters>
    <FilterGroup>
      <FilterLabel>Status</FilterLabel>
      <FilterTabs>
        <FilterTab active={filter === 'all'} onClick={() => setFilter('all')}>
          All Jobs ({totalJobs})
        </FilterTab>
        <FilterTab active={filter === 'active'} onClick={() => setFilter('active')}>
          Active ({activeJobs})
        </FilterTab>
        <FilterTab active={filter === 'inactive'} onClick={() => setFilter('inactive')}>
          Inactive ({inactiveJobs})
        </FilterTab>
        <FilterTab active={filter === 'draft'} onClick={() => setFilter('draft')}>
          Drafts ({draftJobs})
        </FilterTab>
      </FilterTabs>
    </FilterGroup>

    <FilterGroup>
      <Select 
        placeholder="Job Type"
        value={jobTypeFilter}
        onChange={setJobTypeFilter}
        options={jobTypeOptions}
      />
      <Select 
        placeholder="Experience Level"
        value={experienceFilter}
        onChange={setExperienceFilter}
        options={experienceOptions}
      />
      <SearchInput 
        placeholder="Search jobs..."
        value={searchQuery}
        onChange={setSearchQuery}
      />
    </FilterGroup>
  </JobsFilters>

  <JobsTable>
    <TableHeader>
      <HeaderCell sortable onClick={() => sortBy('title')}>
        Job Title
        <SortIcon direction={sortDirection} />
      </HeaderCell>
      <HeaderCell sortable onClick={() => sortBy('postedAt')}>
        Posted Date
      </HeaderCell>
      <HeaderCell sortable onClick={() => sortBy('applicationCount')}>
        Applications
      </HeaderCell>
      <HeaderCell>Status</HeaderCell>
      <HeaderCell>Actions</HeaderCell>
    </TableHeader>

    <TableBody>
      {jobs.map(job => (
        <JobRow key={job.id}>
          <JobInfoCell>
            <JobTitle>{job.title}</JobTitle>
            <JobMeta>
              <MetaItem>
                <Icon name="location" />
                {job.location}
              </MetaItem>
              <MetaItem>
                <Icon name="briefcase" />
                {job.jobType}
              </MetaItem>
              <MetaItem>
                <Icon name="star" />
                {job.experienceLevel}
              </MetaItem>
            </JobMeta>
            <JobStats>
              <StatItem>
                <StatValue>{job.viewCount}</StatValue>
                <StatLabel>Views</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{job.applicationCount}</StatValue>
                <StatLabel>Applications</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{job.avgAIMatch}%</StatValue>
                <StatLabel>Avg AI Match</StatLabel>
              </StatItem>
            </JobStats>
          </JobInfoCell>

          <DateCell>
            <DateValue>{formatDate(job.postedAt)}</DateValue>
            <DateLabel>{formatRelativeDate(job.postedAt)}</DateLabel>
          </DateCell>

          <ApplicationsCell>
            <ApplicationsCount 
              total={job.applicationCount}
              pending={job.pendingApplications}
              onClick={() => viewApplications(job.id)}
            >
              {job.applicationCount}
              {job.pendingApplications > 0 && (
                <PendingBadge>{job.pendingApplications}</PendingBadge>
              )}
            </ApplicationsCount>
          </ApplicationsCell>

          <StatusCell>
            <StatusToggle 
              active={job.isActive}
              onChange={() => toggleJobStatus(job.id)}
            />
            <StatusLabel active={job.isActive}>
              {job.isActive ? 'Active' : 'Inactive'}
            </StatusLabel>
          </StatusCell>

          <ActionsCell>
            <ActionButton 
              icon="edit" 
              tooltip="Edit Job"
              onClick={() => editJob(job.id)}
            />
            <ActionButton 
              icon="users" 
              tooltip="View Applications"
              onClick={() => viewApplications(job.id)}
              badge={job.pendingApplications}
            />
            <ActionButton 
              icon="chart" 
              tooltip="View Analytics"
              onClick={() => viewJobAnalytics(job.id)}
            />
            <ActionButton 
              icon="copy" 
              tooltip="Duplicate Job"
              onClick={() => duplicateJob(job.id)}
            />
            <ActionButton 
              icon="trash" 
              tooltip="Delete Job"
              onClick={() => deleteJob(job.id)}
              danger
            />
          </ActionsCell>
        </JobRow>
      ))}
    </TableBody>
  </JobsTable>

  <TablePagination 
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
    pageSize={pageSize}
    onPageSizeChange={setPageSize}
  />
</JobsManagement>
```

**API Endpoint**: `GET /jobs/enhanced/my-jobs`

---

### 4. **Application Management Dashboard**

#### **Applications Interface**
```jsx
<ApplicationsDashboard>
  <ApplicationsHeader>
    <JobContext>
      <JobTitle>{job.title}</JobTitle>
      <JobMeta>
        <MetaItem><Icon name="location" />{job.location}</MetaItem>
        <MetaItem><Icon name="briefcase" />{job.jobType}</MetaItem>
        <MetaItem><Icon name="calendar" />Posted {formatRelativeDate(job.postedAt)}</MetaItem>
      </JobMeta>
    </JobContext>

    <ApplicationsStats>
      <StatCard 
        title="Total Applications" 
        value={applications.length}
        icon="users"
        color="blue"
      />
      <StatCard 
        title="Pending Review" 
        value={pendingCount}
        icon="clock"
        color="orange"
        clickable
        onClick={() => filterByStatus('pending')}
      />
      <StatCard 
        title="Shortlisted" 
        value={shortlistedCount}
        icon="star"
        color="green"
        clickable
        onClick={() => filterByStatus('shortlisted')}
      />
      <StatCard 
        title="Average AI Match" 
        value={`${avgAIMatch}%`}
        icon="target"
        color="purple"
      />
    </ApplicationsStats>
  </ApplicationsHeader>

  <ApplicationsControls>
    <FilterSection>
      <StatusFilter 
        options={[
          { value: 'all', label: 'All Applications', count: applications.length },
          { value: 'pending', label: 'Pending', count: pendingCount },
          { value: 'reviewed', label: 'Reviewed', count: reviewedCount },
          { value: 'shortlisted', label: 'Shortlisted', count: shortlistedCount },
          { value: 'rejected', label: 'Rejected', count: rejectedCount }
        ]}
        value={statusFilter}
        onChange={setStatusFilter}
      />

      <SortOptions 
        options={[
          { value: 'ai_match_desc', label: '🎯 AI Match (High to Low)' },
          { value: 'interview_score_desc', label: '⭐ Interview Score (High to Low)' },
          { value: 'applied_date_desc', label: '📅 Application Date (Newest)' },
          { value: 'applied_date_asc', label: '📅 Application Date (Oldest)' }
        ]}
        value={sortBy}
        onChange={setSortBy}
      />

      <ViewToggle 
        options={[
          { value: 'cards', label: 'Cards', icon: 'grid' },
          { value: 'table', label: 'Table', icon: 'list' }
        ]}
        value={viewMode}
        onChange={setViewMode}
      />
    </FilterSection>

    <BulkActions>
      <Checkbox 
        checked={allSelected}
        indeterminate={someSelected}
        onChange={toggleSelectAll}
        label={`Select All (${selectedApplications.length})`}
      />
      <Button 
        disabled={selectedApplications.length === 0}
        onClick={openBulkActionsModal}
      >
        Bulk Actions ({selectedApplications.length})
      </Button>
    </BulkActions>
  </ApplicationsControls>

  <ApplicationsList viewMode={viewMode}>
    {applications.map(application => (
      <ApplicationCard 
        key={application.id}
        application={application}
        selected={selectedApplications.includes(application.id)}
        onSelect={toggleApplicationSelection}
        onViewProfile={viewCandidateProfile}
        onUpdateStatus={updateApplicationStatus}
        onAddNotes={addEmployerNotes}
      />
    ))}
  </ApplicationsList>
</ApplicationsDashboard>
```

#### **Enhanced Application Card**
```jsx
<ApplicationCard>
  <CardHeader>
    <SelectionCheckbox 
      checked={selected}
      onChange={onSelect}
    />
    <CandidateAvatar 
      src={candidate.avatar}
      name={candidate.name}
      size="large"
    />
    <CandidateInfo>
      <CandidateName>{candidate.name}</CandidateName>
      <CandidateEmail>{candidate.email}</CandidateEmail>
      <CandidateLocation>
        <Icon name="location" />
        {candidate.location}
      </CandidateLocation>
    </CandidateInfo>
    <ApplicationDate>
      Applied {formatRelativeDate(application.appliedAt)}
    </ApplicationDate>
  </CardHeader>

  <ScoresSection>
    <ScoreCard 
      title="🎯 AI Match"
      score={application.aiMatchingScore.overallMatch}
      maxScore={100}
      color="blue"
      tooltip="Overall compatibility with job requirements"
    >
      <ScoreBreakdown>
        <BreakdownItem>
          Skills: {application.aiMatchingScore.skillsMatch}%
        </BreakdownItem>
        <BreakdownItem>
          Experience: {application.aiMatchingScore.experienceMatch}%
        </BreakdownItem>
      </ScoreBreakdown>
    </ScoreCard>

    <ScoreCard 
      title="⭐ Interview Score"
      score={application.interviewScores.overall}
      maxScore={10}
      color="green"
      tooltip="Best performance across all interview rounds"
    >
      <InterviewBreakdown>
        <BreakdownBar 
          label="Technical" 
          score={application.interviewScores.technical}
          maxScore={10}
        />
        <BreakdownBar 
          label="Behavioral" 
          score={application.interviewScores.behavioral}
          maxScore={10}
        />
        <BreakdownBar 
          label="Problem Solving" 
          score={application.interviewScores.problemSolving}
          maxScore={10}
        />
        <BreakdownBar 
          label="HR" 
          score={application.interviewScores.hr}
          maxScore={10}
        />
      </InterviewBreakdown>
    </ScoreCard>
  </ScoresSection>

  <SkillsSection>
    <SkillsMatch>
      <SectionTitle>✅ Matching Skills</SectionTitle>
      <SkillTags variant="matching">
        {application.aiMatchingScore.matchingKeywords.map(skill => (
          <SkillTag key={skill}>{skill}</SkillTag>
        ))}
      </SkillTags>
    </SkillsMatch>

    <SkillsGap>
      <SectionTitle>❌ Missing Skills</SectionTitle>
      <SkillTags variant="missing">
        {application.aiMatchingScore.missingSkills.map(skill => (
          <SkillTag key={skill}>{skill}</SkillTag>
        ))}
      </SkillTags>
    </SkillsGap>
  </SkillsSection>

  <InterviewInsights>
    <InsightItem>
      <Icon name="calendar" />
      Last Interview: {formatDate(application.interviewScores.lastInterviewDate)}
    </InsightItem>
    <InsightItem>
      <Icon name="repeat" />
      Total Interviews: {application.interviewScores.totalInterviews}
    </InsightItem>
    <InsightItem>
      <Icon name="trophy" />
      Best Session: {application.interviewScores.bestSessionId}
    </InsightItem>
  </InterviewInsights>

  <AIRecommendation>
    <RecommendationHeader>
      <Icon name="robot" />
      AI Recommendation
    </RecommendationHeader>
    <RecommendationText>
      {application.aiMatchingScore.aiRecommendation}
    </RecommendationText>
  </AIRecommendation>

  <CardActions>
    <StatusDropdown 
      currentStatus={application.status}
      onChange={(status) => onUpdateStatus(application.id, status)}
      options={[
        { 
          value: 'pending', 
          label: '⏳ Pending Review', 
          color: 'orange',
          description: 'Waiting for initial review'
        },
        { 
          value: 'reviewed', 
          label: '👁️ Reviewed', 
          color: 'blue',
          description: 'Application has been reviewed'
        },
        { 
          value: 'shortlisted', 
          label: '⭐ Shortlisted', 
          color: 'green',
          description: 'Candidate selected for next round'
        },
        { 
          value: 'interview_scheduled', 
          label: '📅 Interview Scheduled', 
          color: 'purple',
          description: 'Interview has been scheduled'
        },
        { 
          value: 'rejected', 
          label: '❌ Rejected', 
          color: 'red',
          description: 'Application rejected'
        },
        { 
          value: 'hired', 
          label: '🎉 Hired', 
          color: 'green',
          description: 'Candidate has been hired'
        }
      ]}
    />
    
    <ActionButtons>
      <ActionButton 
        icon="user" 
        tooltip="View Full Profile"
        onClick={() => onViewProfile(candidate.id)}
      />
      <ActionButton 
        icon="download" 
        tooltip="Download Resume"
        onClick={() => downloadResume(application.resumeUrl)}
      />
      <ActionButton 
        icon="message" 
        tooltip="Add Notes"
        onClick={() => onAddNotes(application.id)}
      />
      <ActionButton 
        icon="mail" 
        tooltip="Send Email"
        onClick={() => sendEmail(candidate.email)}
      />
    </ActionButtons>
  </CardActions>

  {application.employerNotes && (
    <EmployerNotes>
      <NotesHeader>
        <Icon name="sticky-note" />
        Your Notes
        <EditButton onClick={() => editNotes(application.id)}>
          <Icon name="edit" />
        </EditButton>
      </NotesHeader>
      <NotesContent>{application.employerNotes}</NotesContent>
      <NotesTimestamp>
        Updated {formatRelativeDate(application.statusUpdatedAt)}
      </NotesTimestamp>
    </EmployerNotes>
  )}
</ApplicationCard>
```

**API Endpoints**:
- **Get Applications**: `GET /jobs/enhanced/:jobId/applications`
- **Update Status**: `PUT /jobs/enhanced/applications/:applicationId/status`
- **Bulk Update**: `POST /jobs/enhanced/bulk-update-status`

---

### 5. **Analytics Dashboard**

#### **Job Performance Analytics**
```jsx
<JobAnalytics>
  <AnalyticsHeader>
    <JobInfo>
      <JobTitle>{job.title}</JobTitle>
      <JobMeta>{job.location} • {job.jobType}</JobMeta>
    </JobInfo>
    <DateRangePicker 
      startDate={startDate}
      endDate={endDate}
      onChange={setDateRange}
      presets={['Last 7 days', 'Last 30 days', 'Last 3 months']}
    />
  </AnalyticsHeader>

  <MetricsOverview>
    <MetricCard 
      title="Total Applications"
      value={analytics.totalApplications}
      change={+12}
      changeType="increase"
      icon="users"
      color="blue"
    />
    <MetricCard 
      title="Average AI Match"
      value={`${analytics.averageAIMatch}%`}
      change={+5}
      changeType="increase"
      icon="target"
      color="purple"
    />
    <MetricCard 
      title="Average Interview Score"
      value={analytics.averageInterviewScore.toFixed(1)}
      change={+0.3}
      changeType="increase"
      icon="star"
      color="green"
    />
    <MetricCard 
      title="Conversion Rate"
      value={`${analytics.conversionRate}%`}
      change={-2}
      changeType="decrease"
      icon="funnel"
      color="orange"
    />
  </MetricsOverview>

  <ChartsGrid>
    <ChartCard title="📈 Application Trend" span={2}>
      <LineChart 
        data={analytics.applicationTrend}
        xAxis="date"
        yAxis="count"
        color="#3B82F6"
      />
    </ChartCard>

    <ChartCard title="📊 Status Breakdown">
      <PieChart 
        data={analytics.statusBreakdown}
        colors={statusColors}
      />
    </ChartCard>

    <ChartCard title="🎯 AI Match Distribution">
      <HistogramChart 
        data={analytics.aiMatchDistribution}
        bins={10}
        color="#8B5CF6"
      />
    </ChartCard>

    <ChartCard title="⭐ Interview Score Distribution">
      <HistogramChart 
        data={analytics.interviewScoreDistribution}
        bins={10}
        color="#10B981"
      />
    </ChartCard>

    <ChartCard title="🔥 Top Skills in Applications" span={2}>
      <BarChart 
        data={analytics.topSkills}
        xAxis="skill"
        yAxis="count"
        color="#F59E0B"
      />
    </ChartCard>
  </ChartsGrid>

  <InsightsPanel>
    <PanelHeader>
      <Title>🧠 AI Insights</Title>
      <RefreshButton onClick={refreshInsights}>
        <Icon name="refresh" />
      </RefreshButton>
    </PanelHeader>

    <InsightsList>
      <InsightCard type="success">
        <InsightIcon>🎯</InsightIcon>
        <InsightContent>
          <InsightTitle>High-Quality Candidates</InsightTitle>
          <InsightDescription>
            You're attracting candidates with strong interview performance (avg 7.8/10)
          </InsightDescription>
        </InsightContent>
      </InsightCard>

      <InsightCard type="warning">
        <InsightIcon>⚠️</InsightIcon>
        <InsightContent>
          <InsightTitle>Skill Gap Alert</InsightTitle>
          <InsightDescription>
            65% of candidates are missing React Native experience. Consider making it optional or providing training.
          </InsightDescription>
        </InsightContent>
      </InsightCard>

      <InsightCard type="info">
        <InsightIcon>💡</InsightIcon>
        <InsightContent>
          <InsightTitle>Optimization Tip</InsightTitle>
          <InsightDescription>
            Consider adjusting salary range to $130k-$190k to attract more senior candidates.
          </InsightDescription>
        </InsightContent>
      </InsightCard>
    </InsightsList>
  </InsightsPanel>
</JobAnalytics>
```

**API Endpoint**: `GET /jobs/enhanced/:jobId/analytics`

---

### 6. **Bulk Operations Modal**

#### **Bulk Actions Interface**
```jsx
<BulkActionsModal>
  <ModalHeader>
    <Title>⚡ Bulk Actions</Title>
    <Subtitle>{selectedApplications.length} applications selected</Subtitle>
    <CloseButton onClick={closeBulkModal}>
      <Icon name="x" />
    </CloseButton>
  </ModalHeader>

  <SelectedApplications>
    <ApplicationsList>
      {selectedApplications.map(app => (
        <SelectedApplicationItem key={app.id}>
          <CandidateAvatar src={app.candidate.avatar} size="small" />
          <CandidateName>{app.candidate.name}</CandidateName>
          <CurrentStatus status={app.status} />
          <RemoveButton onClick={() => removeFromSelection(app.id)}>
            <Icon name="x" />
          </RemoveButton>
        </SelectedApplicationItem>
      ))}
    </ApplicationsList>
  </SelectedApplications>

  <BulkActionOptions>
    <ActionGrid>
      <ActionOption 
        icon="check"
        title="Update Status"
        description="Change status for all selected applications"
        onClick={() => setBulkAction('status')}
        color="blue"
      />
      <ActionOption 
        icon="message"
        title="Add Notes"
        description="Add employer notes to selected applications"
        onClick={() => setBulkAction('notes')}
        color="green"
      />
      <ActionOption 
        icon="mail"
        title="Send Email"
        description="Send bulk email to selected candidates"
        onClick={() => setBulkAction('email')}
        color="purple"
      />
      <ActionOption 
        icon="calendar"
        title="Schedule Interviews"
        description="Schedule interviews for selected candidates"
        onClick={() => setBulkAction('schedule')}
        color="orange"
      />
      <ActionOption 
        icon="trash"
        title="Reject Applications"
        description="Reject all selected applications"
        onClick={() => setBulkAction('reject')}
        color="red"
        danger
      />
    </ActionGrid>
  </BulkActionOptions>

  {bulkAction === 'status' && (
    <StatusUpdateForm>
      <FormField>
        <Label>New Status</Label>
        <StatusSelect 
          value={newStatus}
          onChange={setNewStatus}
          options={statusOptions}
        />
      </FormField>
      <FormField>
        <Label>Notes (Optional)</Label>
        <TextArea 
          value={bulkNotes}
          onChange={setBulkNotes}
          placeholder="Add notes for this status change..."
          rows={3}
        />
      </FormField>
    </StatusUpdateForm>
  )}

  {bulkAction === 'email' && (
    <EmailForm>
      <FormField>
        <Label>Email Template</Label>
        <Select 
          value={emailTemplate}
          onChange={setEmailTemplate}
          options={[
            { value: 'interview_invitation', label: 'Interview Invitation' },
            { value: 'status_update', label: 'Status Update' },
            { value: 'rejection', label: 'Rejection Notice' },
            { value: 'custom', label: 'Custom Email' }
          ]}
        />
      </FormField>
      <FormField>
        <Label>Subject</Label>
        <Input 
          value={emailSubject}
          onChange={setEmailSubject}
          placeholder="Email subject..."
        />
      </FormField>
      <FormField>
        <Label>Message</Label>
        <RichTextEditor 
          value={emailMessage}
          onChange={setEmailMessage}
          placeholder="Email message..."
          minHeight={150}
        />
      </FormField>
    </EmailForm>
  )}

  <ModalActions>
    <Button secondary onClick={closeBulkModal}>
      Cancel
    </Button>
    <Button 
      primary 
      onClick={executeBulkAction}
      loading={isExecuting}
    >
      Apply to {selectedApplications.length} Applications
    </Button>
  </ModalActions>

  {bulkActionResult && (
    <ResultSummary>
      <ResultHeader>
        <Icon name="check-circle" color="green" />
        Bulk Action Completed
      </ResultHeader>
      <ResultStats>
        <StatItem>
          <StatValue>{bulkActionResult.successful}</StatValue>
          <StatLabel>Successful</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{bulkActionResult.failed}</StatValue>
          <StatLabel>Failed</StatLabel>
        </StatItem>
      </ResultStats>
    </ResultSummary>
  )}
</BulkActionsModal>
```

---

## 🎨 **Design System**

### **Color Palette**
```css
:root {
  /* Primary Colors */
  --primary-blue: #3B82F6;
  --primary-blue-light: #DBEAFE;
  --primary-blue-dark: #1E40AF;

  /* Status Colors */
  --status-pending: #F59E0B;
  --status-reviewed: #3B82F6;
  --status-shortlisted: #10B981;
  --status-rejected: #EF4444;
  --status-hired: #8B5CF6;

  /* Score Colors */
  --score-excellent: #10B981; /* 9-10 */
  --score-good: #3B82F6;      /* 7-8.9 */
  --score-average: #F59E0B;    /* 5-6.9 */
  --score-poor: #EF4444;       /* 0-4.9 */

  /* Neutral Colors */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;
}
```

### **Typography**
```css
/* Headings */
.heading-xl { font-size: 2.25rem; font-weight: 700; }
.heading-lg { font-size: 1.875rem; font-weight: 600; }
.heading-md { font-size: 1.5rem; font-weight: 600; }
.heading-sm { font-size: 1.25rem; font-weight: 500; }

/* Body Text */
.text-lg { font-size: 1.125rem; line-height: 1.75; }
.text-base { font-size: 1rem; line-height: 1.5; }
.text-sm { font-size: 0.875rem; line-height: 1.25; }
.text-xs { font-size: 0.75rem; line-height: 1; }
```

### **Component Styles**
```css
/* Cards */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-200);
  padding: 24px;
}

/* Buttons */
.btn-primary {
  background: var(--primary-blue);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--primary-blue-dark);
  transform: translateY(-1px);
}

/* Status Badges */
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-pending { background: #FEF3C7; color: #92400E; }
.status-reviewed { background: #DBEAFE; color: #1E40AF; }
.status-shortlisted { background: #D1FAE5; color: #065F46; }
.status-rejected { background: #FEE2E2; color: #991B1B; }
.status-hired { background: #EDE9FE; color: #5B21B6; }
```

---

## 📱 **Mobile Responsiveness**

### **Mobile Adaptations**
- **Collapsible Navigation**: Hamburger menu for mobile
- **Card-based Layout**: Replace tables with cards on mobile
- **Swipe Actions**: Swipe to reveal quick actions
- **Touch-friendly**: Larger touch targets (44px minimum)
- **Simplified Filters**: Drawer-style filters on mobile

### **Responsive Breakpoints**
```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

---

## 🔐 **Security & Permissions**

### **Role-based Access Control**
- All endpoints require `UserRole.EMPLOYER`
- Data isolation: Employers see only their jobs/applications
- Audit trail: Track all status changes and updates

### **Data Protection**
- Secure file storage for resumes and job descriptions
- PII handling compliance
- GDPR-compliant data deletion and export

This comprehensive employer panel provides powerful, flexible job management with AI integration and detailed candidate evaluation capabilities.