import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

/**
 * Global error boundary — renders a user-friendly fallback UI on crashes
 * instead of a blank screen (Technical Architecture Plan §13).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Kickoff: replace console fallback once the client confirms the UI logging endpoint.
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error', error, info);
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div role="alert" className="p-6 text-fg-primary">
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p>Please reload the application. If the problem persists, contact support.</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
