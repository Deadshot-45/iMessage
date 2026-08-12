import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    window.location.reload();
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="imessage-container flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground transition-all duration-300 px-6">
          <div className="relative max-w-md w-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border border-black/8 dark:border-white/12 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center">
            {/* Pulsating error icon background */}
            <div className="relative mb-5 flex items-center justify-center">
              <div className="absolute size-16 rounded-full bg-destructive/15 blur-xl animate-pulse" />
              <div className="relative z-10 size-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                <AlertOctagon className="size-6" />
              </div>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed mb-6">
              An unexpected error occurred while rendering this view. You can try refreshing the page or reloading the application.
            </p>

            <div className="flex w-full flex-col gap-3">
              <Button
                variant="default"
                className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                onClick={this.handleReset}
              >
                <RotateCcw className="size-4" />
                Reload Application
              </Button>

              {this.state.error && (
                <div className="w-full mt-2 border-t border-black/6 dark:border-white/6 pt-3">
                  <button
                    onClick={this.toggleDetails}
                    className="flex items-center justify-center gap-1 mx-auto text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-0 bg-transparent outline-none"
                  >
                    <span>{this.state.showDetails ? "Hide Details" : "Show Details"}</span>
                    {this.state.showDetails ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                  </button>

                  {this.state.showDetails && (
                    <div className="mt-2.5 text-left bg-black/5 dark:bg-black/25 border border-black/5 dark:border-white/5 p-3.5 rounded-xl max-h-40 overflow-y-auto w-full font-mono text-[10px] leading-normal text-red-500/85 dark:text-red-400/85 select-text">
                      <div className="font-semibold mb-1 truncate">
                        {this.state.error.toString()}
                      </div>
                      {this.state.errorInfo?.componentStack && (
                        <pre className="whitespace-pre-wrap font-mono mt-1 opacity-75">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
