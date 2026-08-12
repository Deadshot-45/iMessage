import React, { Suspense } from "react";

export function IOSSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`relative size-8 ${className}`} aria-label="Loading spinner">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute left-[44.5%] top-[12.5%] h-[25%] w-[11%] rounded-[50px] bg-foreground/30 dark:bg-foreground/45 origin-[50%_150%] animate-ios-spinner"
          style={{
            transform: `rotate(${i * 45}deg)`,
            animationDelay: `${-0.875 + i * 0.125}s`,
          }}
        />
      ))}
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="imessage-container flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground transition-all duration-300">
      <div className="flex flex-col items-center gap-4">
        {/* Pulsating logo/icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute size-16 rounded-2xl bg-linear-to-br from-accent/20 to-transparent blur-xl" />
          <img src="/logo.png" alt="logo" className="relative z-10 size-12 animate-pulse" />
        </div>
        <IOSSpinner className="mt-2" />
        <span className="font-sans text-[13px] font-medium tracking-wide text-muted-foreground uppercase">
          Loading iMessage...
        </span>
      </div>
    </div>
  );
}

export function SuspenseLoader({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}
