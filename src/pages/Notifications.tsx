import { useState, useEffect } from 'react';
import { notificationService } from '../services';
import './Notifications.css';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = {};
      
      // Filtreye göre bildirimleri getir
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
  };

  const loadUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data?.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
      setUnreadCount(0); // Set 0 on error
    }
  };

  const handleMarkAsRead = async (id) => {
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 0: return '⏰'; // DeadlineApproaching
      case 1: return '💬'; // NewComment
      case 2: return '👨‍🏫'; // AdvisorAssigned
      case 3: return '📄'; // DocumentUploaded
      case 4: return 'OK'; // SubmissionStatusChanged
      case 5: return '📢'; // General
      default: return '📬';
    }
  };

  const getNotificationTypeName = (type) => {
    const types = ['Deadline Approaching', 'New Comment', 'Advisor Assigned', 
                   'Document Uploaded', 'Submission Status Changed', 'General'];
    return types[type] || 'Notification';
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with your activity</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            className="btn-mark-all"
            onClick={handleMarkAllAsRead}
          >
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      <div className="notifications-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
        <button 
          className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Read
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📬</div>
          <h3>No notifications</h3>
          <p>
            {filter === 'unread' 
              ? "You're all caught up!" 
              : 'No notifications to display'}
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
                      Mark as read
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
