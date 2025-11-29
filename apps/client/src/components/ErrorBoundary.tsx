import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <div className="bg-gray-100 p-4 rounded text-left text-sm mb-4 overflow-auto max-w-2xl w-full border border-gray-200">
            <p className="font-mono text-red-500 whitespace-pre-wrap">{this.state.error?.message}</p>
            {this.state.error?.stack && (
              <details className="mt-2">
                <summary className="cursor-pointer text-gray-500">Stack Trace</summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto">{this.state.error.stack}</pre>
              </details>
            )}
          </div>
          <Button onClick={() => window.location.href = '/'}>Go to Home</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
