import { api } from '@/utils/api';
import { toast } from '@/components/ui/Toast';

const ERROR_KEYS = {
  NO_RECORDING: 'sched.testNoRecording',
  NO_TEST_DESTINATION: 'sched.testNoDestination',
  TOO_MANY_TESTS: 'sched.testTooMany',
};

// Sends a test of a scheduled message to the signed-in customer only. Returns true when it was sent.
export async function sendTestToMyself(messageId, t) {
  try {
    const response = await api.sendScheduledTest(messageId);
    const sentTo = response.data?.sentTo || [];
    const key = sentTo.length > 1 ? 'sched.testSentBoth' : sentTo[0] === 'email' ? 'sched.testSentEmail' : 'sched.testSentPhone';
    toast.success(t(key));
    return true;
  } catch (error) {
    console.error('Failed to send test:', error);
    toast.error(t(ERROR_KEYS[error.data?.code] || 'sched.testError'));
    return false;
  }
}
