import { supabase } from './supabaseClient';

interface NotificationParams {
  userId: string;
  title: string;
  message: string;
  type:
    | 'application_status'
    | 'new_opportunity'
    | 'interview_scheduled'
    | 'profile_update'
    | 'general';
  relatedId?: string;
}

/**
 * Send a notification to a user
 */
export const sendNotification = async (params: NotificationParams): Promise<void> => {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      related_id: params.relatedId,
      read: false,
    });

    if (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

/**
 * Send notification when application status changes
 */
export const notifyApplicationStatusChange = async (
  studentId: string,
  opportunityTitle: string,
  newStatus: string,
  applicationId: string
): Promise<void> => {
  const statusMessages: Record<string, string> = {
    APPLIED: 'Your application has been submitted successfully',
    SHORTLISTED: 'Congratulations! Your application has been shortlisted',
    INTERVIEW_SCHEDULED: 'An interview has been scheduled for your application',
    REJECTED: 'Your application status has been updated',
    OFFERED: 'Congratulations! You have received an offer',
    ACCEPTED: 'Your acceptance has been confirmed',
    PENDING_APPROVAL: 'Your application is pending mentor approval',
    COMPLETED: 'Your application process has been completed',
  };

  await sendNotification({
    userId: studentId,
    title: `Application Update: ${opportunityTitle}`,
    message: statusMessages[newStatus] || 'Your application status has been updated',
    type: 'application_status',
    relatedId: applicationId,
  });
};

/**
 * Send notification for new opportunities matching student preferences
 */
export const notifyNewOpportunity = async (
  studentId: string,
  opportunityTitle: string,
  opportunityId: string
): Promise<void> => {
  await sendNotification({
    userId: studentId,
    title: 'New Opportunity Available',
    message: `Check out: ${opportunityTitle}`,
    type: 'new_opportunity',
    relatedId: opportunityId,
  });
};

/**
 * Send notification for interview scheduling
 */
export const notifyInterviewScheduled = async (
  studentId: string,
  opportunityTitle: string,
  interviewDate: string,
  applicationId: string
): Promise<void> => {
  await sendNotification({
    userId: studentId,
    title: `Interview Scheduled: ${opportunityTitle}`,
    message: `Your interview is scheduled for ${new Date(interviewDate).toLocaleDateString()} at ${new Date(interviewDate).toLocaleTimeString()}`,
    type: 'interview_scheduled',
    relatedId: applicationId,
  });
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsRead = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
  }
};

/**
 * Delete old notifications (older than 30 days)
 */
export const cleanupOldNotifications = async (userId: string): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (error) throw error;
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
  }
};
