import React from "react";

type Props = { children: React.ReactNode; fallback?: React.ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // You can log to an error reporting service here
    console.error("ErrorBoundary caught an error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-700 text-center">
          {this.props.fallback ?? (
            <>
              <h3 className="text-lg font-bold text-red-700 dark:text-red-300">Player failed to load</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">An error occurred while loading the video player.</p>
            </>
          )}
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
