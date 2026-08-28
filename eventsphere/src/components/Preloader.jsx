import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import "./Preloader.css";

const PRELOADER_KEY = "eventsphere-preloader-seen";
const PRELOADER_DURATION = 1800;

function Preloader({ children }) {
  const [visible, setVisible] = useState(() => {
    try {
      return sessionStorage.getItem(PRELOADER_KEY) !== "true";
    } catch {
      return true;
    }
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) return undefined;

    const startedAt = performance.now();
    let frameId;

    const updateProgress = (now) => {
      const elapsed = now - startedAt;
      const normalized = Math.min(elapsed / PRELOADER_DURATION, 1);
      const eased = 1 - Math.pow(1 - normalized, 3);
      setProgress(Math.round(eased * 100));

      if (normalized < 1) {
        frameId = requestAnimationFrame(updateProgress);
      } else {
        try {
          sessionStorage.setItem(PRELOADER_KEY, "true");
        } catch {
          // Continue normally when storage is unavailable.
        }
        window.setTimeout(() => setVisible(false), 180);
      }
    };

    frameId = requestAnimationFrame(updateProgress);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [visible]);

  return (
    <>
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            className="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            aria-label="Loading EventSphere"
            role="status"
          >
            <motion.div
              className="preloader-flash"
              animate={{ opacity: progress >= 100 ? [0, 0.5, 0] : 0 }}
              transition={{ duration: 0.45 }}
            />

            <div className="preloader-content">
              <motion.div
                className="preloader-logo"
                animate={progress >= 100 ? { scale: [1, 1.12, 1], rotate: [0, 0, 8, 0] } : { scale: [0.96, 1.02, 0.96] }}
                transition={progress >= 100 ? { duration: 0.42, ease: "easeOut" } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="preloader-ring preloader-ring-left" />
                <span className="preloader-ring preloader-ring-right" />
                <span className="preloader-particle preloader-particle-one" />
                <span className="preloader-particle preloader-particle-two" />
                <span className="preloader-particle preloader-particle-three" />
                <span className="preloader-logo-core">
                  <CalendarDays size={30} strokeWidth={2.2} />
                </span>
              </motion.div>

              <motion.div
                className="preloader-brand"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.45 }}
              >
                Event<span>Sphere</span>
              </motion.div>

              <motion.div
                className="preloader-tagline"
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.62, duration: 0.4 }}
              >
                COLLEGE EVENTS, ONE SPHERE
              </motion.div>

              <motion.div
                className="preloader-status"
                animate={{ opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                INITIALIZING EVENTSPHERE<span className="preloader-dots">...</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Preloader;
