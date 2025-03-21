"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Check, Info, Zap } from "lucide-react";

interface ApiStatusIndicatorProps {
  className?: string;
}

export default function ApiStatusIndicator({ className = "" }: ApiStatusIndicatorProps) {
  const [status, setStatus] = useState<"loading" | "connected" | "error" | "mock">("loading");
  const [message, setMessage] = useState<string>("Checking API connection...");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function checkApiStatus() {
      try {
        const response = await fetch("/api/scores?mock=false&round=1");
        const data = await response.json();

        if (data._apiAvailable === false) {
          setStatus("error");
          setMessage("Sportradar API unavailable - using mock data");
        } else if (data._mock === true) {
          setStatus("mock");
          setMessage(`Using mock data (${data._apiCallCount || 0} API calls made)`);
        } else {
          setStatus("connected");
          setMessage(`Connected to Sportradar API (${data._apiCallCount || 0} API calls made)`);
          
          // Hide after 5 seconds if successfully connected
          setTimeout(() => {
            setIsVisible(false);
          }, 5000);
        }
      } catch (error) {
        setStatus("error");
        setMessage("Error checking API status");
      }
    }

    checkApiStatus();

    // Check API status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // If not visible, return null
  if (!isVisible) return null;

  // Styles based on status
  const bgColor = {
    loading: "bg-gray-100 border-gray-300",
    connected: "bg-green-50 border-green-300",
    error: "bg-red-50 border-red-300",
    mock: "bg-yellow-50 border-yellow-300",
  }[status];

  const icon = {
    loading: <Zap className="h-4 w-4 text-gray-500" />,
    connected: <Check className="h-4 w-4 text-green-500" />,
    error: <AlertTriangle className="h-4 w-4 text-red-500" />,
    mock: <Info className="h-4 w-4 text-yellow-500" />,
  }[status];

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className={`flex items-center gap-2 px-4 py-2 rounded-md border shadow-sm ${bgColor}`}>
        {icon}
        <span className="text-sm font-medium">{message}</span>
        <button 
          onClick={() => setIsVisible(false)}
          className="ml-2 text-gray-500 hover:text-gray-700"
          aria-label="Close notification"
        >
          &times;
        </button>
      </div>
    </div>
  );
} 