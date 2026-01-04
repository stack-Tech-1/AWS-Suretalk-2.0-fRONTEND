"use client";
import { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  Users,
  Send,
  AlertCircle
} from 'lucide-react';
import ContactsSelector from '@/components/shared/ContactsSelector';
import { api } from '@/utils/api';
import { useAnalytics } from '@/hooks/useAnalytics.client';

export default function ScheduleModal({ voiceNote, isOpen, onClose, onSuccess }) {
  const analytics = useAnalytics();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [scheduleData, setScheduleData] = useState({
    contactIds: [],
    deliveryMethod: 'both',
    scheduledFor: '',
    customMessage: '',
    sendCopyToMe: true
  });

  if (!isOpen || !voiceNote) return null;

  // Handle date/time input
  const getDefaultDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Default to 30 minutes from now
    now.setSeconds(0, 0);
    
    // Format for datetime-local input
    return now.toISOString().slice(0, 16);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (scheduleData.contactIds.length === 0) {
      setError('Please select at least one contact');
      return;
    }

    if (!scheduleData.scheduledFor) {
      setError('Please select a date and time');
      return;
    }

    // Validate scheduled time is in the future
    const scheduledTime = new Date(scheduleData.scheduledFor);
    const now = new Date();
    if (scheduledTime <= now) {
      setError('Scheduled time must be in the future');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.scheduleMessageWithContacts({
        voiceNoteId: voiceNote.id,
        contactIds: scheduleData.contactIds,
        deliveryMethod: scheduleData.deliveryMethod,
        scheduledFor: scheduleData.scheduledFor,
        message: scheduleData.customMessage,
        sendCopyToMe: scheduleData.sendCopyToMe
      });

      if (response.success) {
        setSuccess(true);
        
        // Record analytics
        analytics.recordEvent('message_scheduled', {
          noteId: voiceNote.id,
          contactCount: scheduleData.contactIds.length,
          scheduledFor: scheduleData.scheduledFor,
          deliveryMethod: scheduleData.deliveryMethod
        });

        if (onSuccess) {
          onSuccess(response.data);
        }

        // Reset form after delay
        setTimeout(() => {
          setStep(1);
          setScheduleData({
            contactIds: [],
            deliveryMethod: 'both',
            scheduledFor: '',
            customMessage: '',
            sendCopyToMe: true
          });
          setSuccess(false);
          onClose();
        }, 3000);

      } else {
        throw new Error(response.error || 'Failed to schedule message');
      }

    } catch (error) {
      console.error('Schedule error:', error);
      setError(error.message || 'Failed to schedule message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle sending test message
  const handleSendTest = async (method) => {
    try {
      const testData = {
        voiceNoteId: voiceNote.id,
        deliveryMethod: method
      };

      // For demo, we'll use the user's own email/phone
      // In production, you'd get this from user profile
      if (method.includes('email')) {
        testData.recipientEmail = 'test@example.com'; // Replace with actual email
      }
      
      if (method.includes('sms')) {
        testData.recipientPhone = '+1234567890'; // Replace with actual phone
      }

      const response = await api.sendTestMessage(testData);
      
      if (response.success) {
        alert(`Test ${method} sent successfully!`);
      } else {
        throw new Error(response.error || 'Test failed');
      }

    } catch (error) {
      console.error('Test send error:', error);
      alert(`Failed to send test ${method}. Please check your configuration.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Schedule Message
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Schedule "{voiceNote.title}" to be sent later
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1 ? 'bg-brand-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${
                step >= 2 ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-800'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2 ? 'bg-brand-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
              }`}>
                2
              </div>
              <div className={`w-16 h-1 ${
                step >= 3 ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-800'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 3 ? 'bg-brand-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300">
                    Message Scheduled Successfully!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Your voice note will be sent at the scheduled time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-300">Error</p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Select Contacts */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Select Contacts
                </h3>
                <ContactsSelector
                  selectedContacts={scheduleData.contactIds.map(id => ({ id }))}
                  onContactsChange={(contacts) => 
                    setScheduleData(prev => ({ 
                      ...prev, 
                      contactIds: contacts.map(c => c.id) 
                    }))
                  }
                  multiple={true}
                  maxSelection={10}
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 
                           text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                           dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (scheduleData.contactIds.length === 0) {
                      setError('Please select at least one contact');
                      return;
                    }
                    setStep(2);
                    setError(null);
                  }}
                  className="px-6 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 
                           transition-colors flex items-center gap-2"
                >
                  Next
                  <Users className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Delivery Options */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Delivery Options
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button
                    onClick={() => setScheduleData(prev => ({ ...prev, deliveryMethod: 'email' }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      scheduleData.deliveryMethod === 'email'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-brand-500'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Mail className={`w-6 h-6 ${
                        scheduleData.deliveryMethod === 'email' ? 'text-brand-500' : 'text-gray-500'
                      }`} />
                      <span className="font-medium">Email Only</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setScheduleData(prev => ({ ...prev, deliveryMethod: 'sms' }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      scheduleData.deliveryMethod === 'sms'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-brand-500'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <MessageSquare className={`w-6 h-6 ${
                        scheduleData.deliveryMethod === 'sms' ? 'text-brand-500' : 'text-gray-500'
                      }`} />
                      <span className="font-medium">SMS Only</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setScheduleData(prev => ({ ...prev, deliveryMethod: 'both' }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      scheduleData.deliveryMethod === 'both'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-brand-500'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex gap-1">
                        <Mail className={`w-5 h-5 ${
                          scheduleData.deliveryMethod === 'both' ? 'text-brand-500' : 'text-gray-500'
                        }`} />
                        <MessageSquare className={`w-5 h-5 ${
                          scheduleData.deliveryMethod === 'both' ? 'text-brand-500' : 'text-gray-500'
                        }`} />
                      </div>
                      <span className="font-medium">Both</span>
                    </div>
                  </button>
                </div>

                {/* Test Buttons */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => handleSendTest('email')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                             rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                             text-sm flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Test Email
                  </button>
                  <button
                    onClick={() => handleSendTest('sms')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                             rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                             text-sm flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Test SMS
                  </button>
                </div>

                {/* Custom Message */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Custom Message (Optional)
                  </label>
                  <textarea
                    value={scheduleData.customMessage}
                    onChange={(e) => setScheduleData(prev => ({ 
                      ...prev, 
                      customMessage: e.target.value 
                    }))}
                    className="w-full h-32 p-3 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Add a personal message to accompany your voice note..."
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 
                           text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                           dark:hover:bg-gray-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    setStep(3);
                    setError(null);
                  }}
                  className="px-6 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 
                           transition-colors flex items-center gap-2"
                >
                  Next
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Schedule Time */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
                  Schedule Delivery
                </h3>

                <div className="space-y-6">
                  {/* Date/Time Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date & Time *
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="datetime-local"
                          value={scheduleData.scheduledFor || getDefaultDateTime()}
                          onChange={(e) => setScheduleData(prev => ({ 
                            ...prev, 
                            scheduledFor: e.target.value 
                          }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                                   bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                      <div className="flex-shrink-0">
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                          <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      Select when you want this message to be sent
                    </p>
                  </div>

                  {/* Quick Schedule Options */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Quick Schedule
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { label: '30 min', minutes: 30 },
                        { label: '1 hour', minutes: 60 },
                        { label: 'Tomorrow', days: 1 },
                        { label: 'Next Week', days: 7 }
                      ].map((option) => (
                        <button
                          key={option.label}
                          onClick={() => {
                            const date = new Date();
                            if (option.minutes) {
                              date.setMinutes(date.getMinutes() + option.minutes);
                            } else if (option.days) {
                              date.setDate(date.getDate() + option.days);
                              date.setHours(9, 0, 0, 0); // Set to 9 AM
                            }
                            setScheduleData(prev => ({
                              ...prev,
                              scheduledFor: date.toISOString().slice(0, 16)
                            }));
                          }}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 
                                   rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                                   text-sm transition-colors"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            Send copy to myself
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            Receive a copy of the sent message
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={scheduleData.sendCopyToMe}
                          onChange={(e) => setScheduleData(prev => ({ 
                            ...prev, 
                            sendCopyToMe: e.target.checked 
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                                     peer-checked:after:translate-x-full peer-checked:after:border-white 
                                     after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                     after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                                     peer-checked:bg-brand-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 
                           text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                           dark:hover:bg-gray-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 
                           text-white rounded-xl hover:shadow-lg transition-all 
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Schedule Message
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}