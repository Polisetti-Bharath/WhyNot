import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Calendar, Briefcase, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface Notification {
  id: string;
  user_id: string;
  type:
    | 'application_status'
    | 'new_opportunity'
    | 'interview_scheduled'
    | 'profile_update'
    | 'general';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  related_id?: string;
}

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        payload => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);

          // Show toast for new notification
          showToast('info', newNotification.title);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast('success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Get icon for notification type
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'application_status':
        return <Briefcase size={20} className="text-neon-purple" />;
      case 'new_opportunity':
        return <Briefcase size={20} className="text-green-400" />;
      case 'interview_scheduled':
        return <Calendar size={20} className="text-neon-purple" />;
      case 'profile_update':
        return <Info size={20} className="text-yellow-400" />;
      default:
        return <AlertCircle size={20} className="text-slate-400" />;
    }
  };

  // Format relative time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-96 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 max-h-[500px] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-neon-purple hover:text-neon-purple transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="overflow-y-auto flex-1">
                {loading ? (
                  <div className="p-8 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-purple mx-auto"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Bell size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {notifications.map(notification => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 hover:bg-slate-800 transition-colors ${
                          !notification.read ? 'bg-slate-800/50' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <p className="text-sm text-slate-400 mb-2">{notification.message}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-500">
                                {formatTime(notification.created_at)}
                              </span>
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs text-neon-purple hover:text-neon-purple transition-colors flex items-center gap-1"
                                >
                                  <Check size={12} />
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
