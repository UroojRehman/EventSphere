import {
  Bell,
  Check,
  CheckCheck,
  CalendarDays,
  Info,
  MessageCircle,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import notificationService from "../../services/notificationService";
import "./Notifications.css";

const initialNotifications = [
  {
    id: 1,
    type: "event",
    title: "Registration confirmed",
    text: "Your registration for Innovation & Technology Summit has been confirmed successfully.",
    time: "10 minutes ago",
    date: "Aug 25, 2026",
    unread: true,
  },
  {
    id: 2,
    type: "update",
    title: "New event added",
    text: "A new Career Development Workshop has been added to the upcoming campus events.",
    time: "2 hours ago",
    date: "Aug 25, 2026",
    unread: true,
  },
  {
    id: 3,
    type: "reminder",
    title: "Event reminder",
    text: "Campus Cultural Night is coming up soon. Make sure you have your registration details ready.",
    time: "Yesterday",
    date: "Aug 24, 2026",
    unread: false,
  },
  {
    id: 4,
    type: "message",
    title: "New campus update",
    text: "Student clubs can now submit their upcoming activities through EventSphere.",
    time: "2 days ago",
    date: "Aug 23, 2026",
    unread: false,
  },
  {
    id: 5,
    type: "info",
    title: "Profile information",
    text: "Keep your EventSphere profile updated to make event registration easier.",
    time: "4 days ago",
    date: "Aug 21, 2026",
    unread: false,
  },
];

const iconMap = {
  event: CalendarDays,
  update: Sparkles,
  reminder: Bell,
  message: MessageCircle,
  info: Info,
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = () => notificationService.getMyNotifications().then((response) => {
      setNotifications((response.notifications || []).map((item) => ({
        id: item._id,
        type: item.type,
        title: item.title || "EventSphere update",
        text: item.message,
        time: new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: new Date(item.createdAt).toLocaleDateString(),
        unread: !item.isRead,
      })));
    });

    loadNotifications();
    const stopRealtime = notificationService.subscribeToRealtime((payload) => {
      if (payload.type !== "notification") return;
      const item = payload.notification;
      setNotifications((current) => [{ id: item._id, type: item.type, title: item.title || "EventSphere update", text: item.message, time: "Just now", date: new Date().toLocaleDateString(), unread: true }, ...current]);
    });
    const refreshTimer = window.setInterval(loadNotifications, 30000);
    return () => { window.clearInterval(refreshTimer); stopRealtime(); };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const markAsRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
    window.dispatchEvent(new Event("eventsphere:notifications-updated"));
  };

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
    window.dispatchEvent(new Event("eventsphere:notifications-updated"));
  };

  const removeNotification = async (id) => {
    await notificationService.deleteNotification(id);
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );
    window.dispatchEvent(new Event("eventsphere:notifications-updated"));
  };

  const clearAll = async () => {
    await notificationService.markAllAsRead();
    await notificationService.deleteReadNotifications();
    setNotifications([]);
    window.dispatchEvent(new Event("eventsphere:notifications-updated"));
  };

  return (
    <div className="notifications-page">
      <div className="notifications-container">

        {/* HEADER */}
        <section className="notifications-header">
          <div>
            <div className="notifications-kicker">
              <Bell size={13} />
              NOTIFICATION CENTER
            </div>

            <h1>
              Stay up to
              <span> date.</span>
            </h1>

            <p>
              Important event updates, registration information and campus
              announcements are collected here for you.
            </p>
          </div>

          <div className="notifications-count">
            <Bell size={20} />

            <div>
              <strong>{unreadCount}</strong>
              <span>Unread notifications</span>
            </div>
          </div>
        </section>

        {/* TOOLBAR */}
        <div className="notifications-toolbar">
          <div className="notifications-toolbar-left">
            <span>
              {notifications.length}{" "}
              {notifications.length === 1
                ? "notification"
                : "notifications"}
            </span>

            {unreadCount > 0 && (
              <b>{unreadCount} new</b>
            )}
          </div>

          <div className="notifications-actions">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
              >
                <CheckCheck size={15} />
                Mark all as read
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                className="notifications-clear"
                onClick={clearAll}
              >
                <Trash2 size={14} />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* NOTIFICATION LIST */}
        {notifications.length > 0 ? (
          <div className="notifications-list">
            {notifications.map((notification) => {
              const Icon =
                iconMap[notification.type] || Info;

              return (
                <article
                  key={notification.id}
                  className={`notification-card ${
                    notification.unread
                      ? "notification-unread"
                      : ""
                  }`}
                >
                  {notification.unread && (
                    <div className="notification-unread-dot" />
                  )}

                  <div className="notification-icon">
                    <Icon size={20} />
                  </div>

                  <div className="notification-content">
                    <div className="notification-top">
                      <span className="notification-type">
                        {notification.type}
                      </span>

                      <time>
                        {notification.date} · {notification.time}
                      </time>
                    </div>

                    <h2>{notification.title}</h2>

                    <p>{notification.text}</p>

                    {notification.unread && (
                      <button
                        type="button"
                        className="notification-read-btn"
                        onClick={() =>
                          markAsRead(notification.id)
                        }
                      >
                        <Check size={14} />
                        Mark as read
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    className="notification-remove"
                    aria-label="Remove notification"
                    onClick={() =>
                      removeNotification(notification.id)
                    }
                  >
                    <X size={16} />
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="notifications-empty">
            <div className="notifications-empty-icon">
              <CheckCheck size={28} />
            </div>

            <h2>You're all caught up.</h2>

            <p>
              There are no notifications waiting for you right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;