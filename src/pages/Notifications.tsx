import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services';
import './Notifications.css';

type NotificationFilter = 'all' | 'unread' | 'read';

interface NotificationItem {
  id: string;
  isRead: boolean;
  type: number;
  title: string;
  message: string;
  createdAt: string;
}

interface NotificationQueryParams {
  isRead?: boolean;
  limit?: number;
}

function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationFilter>('all'); // 'all', 'unread', 'read'
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data?.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
      setUnreadCount(0); // Set 0 on error
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params: NotificationQueryParams = {};

      // Filtreye gore bildirimleri getir
      if (filter === 'unread') {
        params.isRead = false;
      } else if (filter === 'read') {
        params.isRead = true;
      }

      const data = await notificationService.getNotifications(params);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type: number) => {
    switch (type) {
      case 0: return ''; // DeadlineApproaching
      case 1: return ''; // NewComment
      case 2: return ''; // AdvisorAssigned
      case 3: return ''; // DocumentUploaded
      case 4: return ''; // SubmissionStatusChanged
      case 5: return ''; // General
      default: return '';
    }
  };

  const getNotificationTypeName = (type: number) => {
    const types = ['Son Tarih Yaklaşıyor', 'Yeni Yorum', 'Danışman Atandı',
      'Belge Yüklendi', 'Görev Durumu Değişti', 'Genel'];
    return types[type] || 'Bildirim';
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Bildirimler</h1>
          <p>Aktivitelerinizden haberdar olun</p>
        </div>

        {unreadCount > 0 && (
          <button
            className="btn-mark-all"
            onClick={handleMarkAllAsRead}
          >
            Tümünü Okundu İşaretle ({unreadCount})
          </button>
        )}
      </div>

      <div className="notifications-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tümü
        </button>
        <button
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Okunmamış {unreadCount > 0 && `(${unreadCount})`}
        </button>
        <button
          className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Okunmuş
        </button>
      </div>

      {loading ? (
        <div className="loading">Bildirimler yükleniyor...</div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📬</div>
          <h3>Bildirim yok</h3>
          <p>
            {filter === 'unread'
              ? "Tüm bildirimleriniz okunmuş!"
              : 'Gösterilecek bildirim yok'}
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="notification-content">
                <div className="notification-header-row">
                  <h3>{notification.title}</h3>
                  <span className="notification-type">
                    {getNotificationTypeName(notification.type)}
                  </span>
                </div>

                <p className="notification-message">{notification.message}</p>

                <div className="notification-footer">
                  <span className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>

                  {!notification.isRead && (
                    <button
                      className="btn-mark-read"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Okundu İşaretle
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
