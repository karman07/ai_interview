import { Suspense, lazy } from 'react';

interface LazyComponentProps {
  importFunc: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
}

/**
 * Lazy load component with loading fallback
 * Improves performance by code splitting
 */
const LazyLoad: React.FC<LazyComponentProps & { [key: string]: any }> = ({
  importFunc,
  fallback = (
    <div className="flex items-center justify-center min-h-[200px]" role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      <span className="sr-only">Loading...</span>
    </div>
  ),
  ...props
}) => {
  const LazyComponent = lazy(importFunc);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default LazyLoad;
