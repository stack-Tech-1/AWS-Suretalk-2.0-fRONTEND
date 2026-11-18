// Deletes a voice note or will. If a scheduled message is still waiting to send the recording, the customer
// is warned first. Returns true when it was deleted, false when the customer chose to keep it.
export async function deleteWithScheduleCheck(remove, { t, locale }) {
  try {
    await remove(false);
    return true;
  } catch (err) {
    if (err.data?.code !== 'HAS_SCHEDULED_MESSAGES') throw err;
    const list = (err.data.scheduled || []).map(m => {
      const date = new Date(m.scheduledFor).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
      return m.recipient ? `• ${m.recipient}, ${date}` : `• ${date}`;
    }).join('\n');
    if (!window.confirm(t('voice.scheduledWarn', { list }))) return false;
    await remove(true);
    return true;
  }
}
