import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-svh w-full items-center justify-center bg-background text-white">
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <span className="text-4xl" role="img" aria-label="Italian flag">
                🇮🇹
              </span>
              <h1 className="text-lg font-bold">Something went wrong</h1>
              <p className="text-sm text-white/50 max-w-xs">
                {this.state.error?.message ?? "An unexpected error occurred."}
              </p>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="mt-2 rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                aria-label="Try again"
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
