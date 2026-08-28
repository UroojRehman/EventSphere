import { useEffect, useState } from "react";
import notificationService from "../services/notificationService";

function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const loadUnreadCount = () => {
      notificationService.getUnreadNotifications()
        .then((response) => {
          if (mounted) setUnreadCount(response.notifications?.length || response.count || 0);
        })
        .catch(() => {});
    };

    loadUnreadCount();
    const refreshTimer = window.setInterval(loadUnreadCount, 30000);
    const stopRealtime = notificationService.subscribeToRealtime((payload) => {
      if (payload.type === "notification" && mounted) setUnreadCount((count) => count + 1);
    });
    const handleNotificationUpdate = () => loadUnreadCount();
    window.addEventListener("eventsphere:notifications-updated", handleNotificationUpdate);

    return () => {
      mounted = false;
      window.clearInterval(refreshTimer);
      window.removeEventListener("eventsphere:notifications-updated", handleNotificationUpdate);
      stopRealtime();
    };
  }, []);

  return unreadCount;
}

export default useUnreadNotifications;
