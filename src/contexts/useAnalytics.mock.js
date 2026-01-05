// src/hooks/useAnalytics.mock.js
export const useAnalytics = () => {
    return {
      recordEvent: (event, data) => console.log(`[Mock Analytics] ${event}:`, data),
      recordPageView: (data) => console.log(`[Mock Analytics] Page view:`, data),
      recordVoiceNoteEvent: (event, noteId, data) => console.log(`[Mock Analytics] ${event} for note ${noteId}:`, data),
      recordContactEvent: (event, data) => console.log(`[Mock Analytics] ${event}:`, data)
    };
  };