"use client";
import { useEffect, useCallback, useContext } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { api } from '@/utils/api';
//import { UserContext } from '@/context/UserContext'; // You'll need to create this

export const useAnalytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // If you have a UserContext, you can get user from there
  // const { user } = useContext(UserContext);

  // Record page view
  const recordPageView = useCallback(async () => {
    try {
      await api.recordAnalyticsEvent({
        eventType: 'page_view',
        eventData: {
          path: pathname,
          query: Object.fromEntries(searchParams.entries())
        }
      });
    } catch (error) {
      console.warn('Failed to record page view:', error);
    }
  }, [pathname, searchParams]);

  // Record specific events
  const recordEvent = useCallback(async (eventType, eventData = {}) => {
    try {
      // Validate event type
      const validEvents = [
        'page_view',
        'voice_note_created',
        'voice_note_played',
        'voice_note_shared',
        'voice_note_downloaded',
        'voice_note_favorited',
        'voice_note_deleted',
        'contact_added',
        'contact_updated',
        'contact_deleted',
        'scheduled_message_created',
        'scheduled_message_sent',
        'scheduled_message_cancelled',
        'vault_item_created',
        'vault_item_accessed',
        'login',
        'logout',
        'error'
      ];

      // Only warn in development
      if (process.env.NODE_ENV === 'development' && !validEvents.includes(eventType)) {
        console.warn(`Invalid event type: ${eventType}`);
      }

      // Use the valid events only
      const safeEventType = validEvents.includes(eventType) ? eventType : 'page_view';

      await api.recordAnalyticsEvent({
        eventType: safeEventType,
        eventData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to record analytics event:', error);
      // Don't break the app if analytics fails
    }
  }, []);

  // Record voice note events
  const recordVoiceNoteEvent = useCallback(async (eventType, voiceNoteId, additionalData = {}) => {
    await recordEvent(eventType, {
      voiceNoteId,
      ...additionalData
    });
  }, [recordEvent]);

  // Record contact events
  const recordContactEvent = useCallback(async (eventType, contactId, additionalData = {}) => {
    await recordEvent(eventType, {
      contactId,
      ...additionalData
    });
  }, [recordEvent]);

  // Initialize page view on component mount
  useEffect(() => {
    recordPageView();
  }, [recordPageView]);

  return {
    recordEvent,
    recordVoiceNoteEvent,
    recordContactEvent,
    recordPageView
  };
};