/**
 * Local notification scheduling — integrate `expo-notifications` when added.
 */
export async function scheduleReminder(_deadlineId: string, _fireDate: Date): Promise<string | null> {
  return null;
}

export async function cancelReminder(_notificationId: string): Promise<void> {
  void _notificationId;
}
