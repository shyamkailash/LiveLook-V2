import { useEffect, useState } from "react";
import { cn } from "@/utils/helpers";

const loadingMessages = [
  "Initializing Control Center...",
  "Connecting to Monitoring Server...",
  "Loading Device Manager...",
  "Preparing Live Monitoring...",
  "Synchronizing Policies...",
  "Starting AI Monitoring Engine...",
];

export function AppLoadingScreen({ exiting }: { exiting: boolean }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % loadingMessages.length);
    }, 600);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] grid place-items-center bg-background transition-opacity duration-300",
        exiting ? "opacity-0" : "opacity-100",
      )}
    >
      <div className="flex flex-col items-center text-center">
        <img src="/logo.svg" alt="AI SYSTEM MONITOR" className="h-16 w-16 rounded-2xl shadow-pro" />
        <h1 className="mt-5 text-[30px] font-bold text-text">AI SYSTEM MONITOR</h1>
        <p className="mt-2 min-h-6 text-[15px] font-medium text-muted">{loadingMessages[messageIndex]}</p>
        <div className="mt-7 loader" aria-label="Loading" />
      </div>
    </div>
  );
}
