# Lazy Loading System Documentation

This documentation explains the lazy loading system implemented in the app contexts, which provides smooth user experience with fallback static data while real data loads.

## Overview

The lazy loading system consists of:

1. **Custom hooks** (`useLazyLoading`, `useLazyFilteredData`) for managing loading states
2. **Static mock data** as fallbacks when real data is unavailable
3. **Enhanced contexts** that integrate lazy loading with existing functionality
4. **Loading indicators** that inform users about the current state

## Key Features

- ✅ **Static Fallback Data**: Shows relevant sample data immediately
- ✅ **Progressive Loading**: Displays static data after 1 second, then replaces with real data
- ✅ **Error Handling**: Automatic retries with exponential backoff
- ✅ **Loading States**: Clear indicators for loading, static data, success, and error states
- ✅ **Filtering**: Maintains filter functionality even with lazy loading
- ✅ **Type Safety**: Full TypeScript support

## Loading States

```typescript
enum LoadingState {
  IDLE = "idle",           // Initial state
  LOADING = "loading",     // Fetching real data
  SHOWING_STATIC = "showing_static",  // Displaying fallback data
  SUCCESS = "success",     // Real data loaded successfully
  ERROR = "error",         // Failed to load real data
}
```

## Enhanced Contexts

### SubjectsContext

```typescript
const {
  subjects,           // Filtered subjects (real or static)
  rawSubjects,        // Unfiltered raw data
  filters,            // Current filter values
  loadingState,       // Current loading state
  error,              // Error message if any
  isLoading,          // Boolean: is currently loading
  isShowingStatic,    // Boolean: showing static data
  hasRealData,        // Boolean: has real data loaded
  loadingIndicator,   // Pre-configured loading indicator props
  
  // Filter methods
  setSearch,
  setCategoryFilter,
  setLevelFilter,
  updateFilter,
  resetFilters,
  
  // Loading methods
  load,               // Manually trigger loading
  retry,              // Retry failed request
  reset,              // Reset to initial state
} = useSubjects();
```

### LessonsContext

```typescript
const {
  lessons,            // Array of lessons (real or static)
  quizzes,            // Record of lesson ID to quizzes
  loadingState,       // Current loading state
  quizzesLoadingState, // Loading states per quiz set
  error,              // Error message if any
  isLoading,          // Boolean: is currently loading
  hasRealData,        // Boolean: has real data loaded
  
  fetchLessons,       // Fetch lessons for subject
  fetchQuizzes,       // Fetch quizzes for lesson
  retry,              // Retry failed request
  reset,              // Reset to initial state
} = useLessons();
```

### InterviewContext

```typescript
const {
  draft,              // Current interview draft
  generatedQuestions, // Generated questions (real or static)
  loadingState,       // Current loading state
  error,              // Error message if any
  isLoading,          // Boolean: is currently loading
  isShowingStatic,    // Boolean: showing static data
  hasRealData,        // Boolean: has real data loaded
  
  setDraft,           // Set interview draft
  generateQuestions,  // Generate questions with lazy loading
  retry,              // Retry failed request
  reset,              // Reset to initial state
} = useInterview();
```

### ResultsContext

```typescript
const {
  results,            // Array of results (real or static)
  loadingState,       // Current loading state
  error,              // Error message if any
  isLoading,          // Boolean: is currently loading
  isShowingStatic,    // Boolean: showing static data
  hasRealData,        // Boolean: has real data loaded
  
  fetchMine,          // Fetch user's results
  submitRun,          // Submit interview run
  retry,              // Retry failed request
  reset,              // Reset to initial state
} = useResults();
```

## Usage Examples

### Basic Loading with Static Fallback

```typescript
import { useSubjects } from "@/contexts/SubjectsContext";

const MyComponent = () => {
  const { subjects, loadingIndicator, retry } = useSubjects();

  return (
    <div>
      {/* Show loading indicator */}
      {loadingIndicator.show && (
        <div className={`alert alert-${loadingIndicator.type}`}>
          {loadingIndicator.message}
          {loadingIndicator.type === "error" && (
            <button onClick={retry}>Retry</button>
          )}
        </div>
      )}

      {/* Display subjects (real or static) */}
      <div className="subjects-grid">
        {subjects.map(subject => (
          <SubjectCard key={subject._id} subject={subject} />
        ))}
      </div>
    </div>
  );
};
```

### Conditional Rendering Based on Data State

```typescript
const MyComponent = () => {
  const { 
    subjects, 
    isShowingStatic, 
    hasRealData, 
    isLoading 
  } = useSubjects();

  return (
    <div>
      {isShowingStatic && (
        <div className="alert alert-info">
          📋 Showing sample data while loading...
        </div>
      )}

      {hasRealData && (
        <div className="alert alert-success">
          ✅ Real data loaded successfully!
        </div>
      )}

      <div className="subjects-grid">
        {subjects.map(subject => (
          <SubjectCard 
            key={subject._id} 
            subject={subject}
            isStatic={isShowingStatic}
          />
        ))}
      </div>
    </div>
  );
};
```

### Manual Loading Control

```typescript
const MyComponent = () => {
  const { lessons, loadingState, fetchLessons, retry } = useLessons();

  const handleLoadLessons = async (subjectId: string) => {
    await fetchLessons(subjectId);
  };

  return (
    <div>
      <button 
        onClick={() => handleLoadLessons("subject-123")}
        disabled={loadingState === LoadingState.LOADING}
      >
        Load Lessons
      </button>

      {loadingState === LoadingState.ERROR && (
        <button onClick={retry}>Retry</button>
      )}
    </div>
  );
};
```

### Working with Filters

```typescript
const MyComponent = () => {
  const { 
    subjects, 
    filters, 
    setSearch, 
    setCategoryFilter,
    resetFilters 
  } = useSubjects();

  return (
    <div>
      <input
        type="text"
        placeholder="Search subjects..."
        value={filters.search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      <select
        value={filters.categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="Programming">Programming</option>
        <option value="Frontend">Frontend</option>
      </select>

      <button onClick={resetFilters}>Clear Filters</button>

      <div className="subjects-grid">
        {subjects.map(subject => (
          <SubjectCard key={subject._id} subject={subject} />
        ))}
      </div>
    </div>
  );
};
```

## Configuration

### Loading Behavior

You can configure loading behavior through the options object:

```typescript
const options = {
  showStaticDelay: 1000,    // Show static data after 1 second
  retryDelay: 3000,         // Wait 3 seconds between retries
  maxRetries: 3,            // Maximum retry attempts
  autoLoad: true,           // Automatically load on mount
};
```

### Static Data

Static mock data is defined in `/src/constants/mockData.ts` and includes:

- **mockSubjects**: Sample subjects with lessons
- **mockLessonsDetail**: Detailed lesson content
- **mockQuizzes**: Quiz questions for lessons
- **mockInterviewQuestions**: Sample interview questions
- **mockResults**: Sample interview results

## Best Practices

### 1. Always Handle Loading States

```typescript
// ✅ Good
const { subjects, loadingIndicator, retry } = useSubjects();

if (loadingIndicator.show) {
  return <LoadingComponent indicator={loadingIndicator} onRetry={retry} />;
}

// ❌ Avoid
const { subjects } = useSubjects();
// No loading state handling
```

### 2. Provide Visual Feedback

```typescript
// ✅ Good - Clear visual distinction
const SubjectCard = ({ subject, isStatic }) => (
  <div className={`card ${isStatic ? 'border-yellow-300 bg-yellow-50' : ''}`}>
    {isStatic && <span className="badge">📋 Sample</span>}
    <h3>{subject.title}</h3>
  </div>
);
```

### 3. Handle Errors Gracefully

```typescript
// ✅ Good - User-friendly error handling
const { loadingIndicator, retry, reset } = useSubjects();

if (loadingIndicator.type === "error") {
  return (
    <div className="error-container">
      <p>Failed to load subjects</p>
      <button onClick={retry}>Try Again</button>
      <button onClick={reset}>Start Over</button>
    </div>
  );
}
```

### 4. Use Debounced Search

```typescript
import { useDebounce } from "@/hooks/useLazyLoading";

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { setSearch } = useSubjects();

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
};
```

## Migration Guide

### From Old Context

```typescript
// Old way
const { subjects, loading, error } = useSubjects();

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;

// New way
const { subjects, loadingIndicator, retry } = useSubjects();

return (
  <>
    <LoadingIndicator {...loadingIndicator} onRetry={retry} />
    <SubjectsGrid subjects={subjects} />
  </>
);
```

### Updating Components

1. Replace `loading` with `loadingIndicator`
2. Add retry functionality for errors
3. Handle static data state if needed
4. Use new filter methods if applicable

## Performance Benefits

- **Immediate Content**: Users see relevant content instantly
- **Reduced Perceived Loading Time**: Static data creates perception of faster loading
- **Progressive Enhancement**: Real data replaces static data seamlessly
- **Efficient Filtering**: Client-side filtering on static data while real data loads
- **Smart Retries**: Automatic retry with backoff prevents unnecessary requests

## Troubleshooting

### Static Data Not Showing

Check if `showStaticDelay` is set correctly and the component is mounted long enough.

### Infinite Loading

Verify that the fetch function doesn't have circular dependencies and that error boundaries are in place.

### Filters Not Working

Ensure the filter function is pure and doesn't depend on external state that might be undefined during static data phase.

## Demo Component

See `/src/components/examples/LazyLoadingDemo.tsx` for a complete working example of all contexts with lazy loading.