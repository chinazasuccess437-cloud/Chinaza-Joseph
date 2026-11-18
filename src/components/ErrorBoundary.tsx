import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    message: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application ErrorBoundary caught error:', error, info);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[260px] flex items-center justify-center p-6">
          <div className="living-glass-elevated rounded-3xl p-6 max-w-lg text-center space-y-3">
            <h2 className="font-display text-lg font-bold text-[#F1F5F9]">
              Unable to load interactive section
            </h2>
            <p className="text-sm text-[#D4DFEC]">
              Please refresh the page or try signing in again.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, message: '' })}
              className="px-4 py-2 rounded-xl bg-[#35D6E8] text-[#090D14] text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
