// src/context/AnalyticsContext.js
"use client";
import { createContext, useContext, Suspense } from "react";
import { useAnalytics } from "@/hooks/useAnalytics.client";

const AnalyticsContext = createContext(null);

function AnalyticsProviderContent({ children }) {
  const analytics = useAnalytics();
  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function AnalyticsProvider({ children, fallback = null }) {
  return (
    <Suspense fallback={fallback}>
      <AnalyticsProviderContent>
        {children}
      </AnalyticsProviderContent>
    </Suspense>
  );
}

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalyticsContext must be used within AnalyticsProvider");
  }
  return context;
};