import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import ErrorState from "./ErrorState";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] p-4">
          <ErrorState 
            message={this.state.error?.message || "Terjadi kesalahan pada aplikasi."} 
            onRetry={this.handleRetry} 
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
