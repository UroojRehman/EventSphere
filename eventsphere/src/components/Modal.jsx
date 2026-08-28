import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
  closeOnOverlay = true,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (closeOnOverlay && e.target === e.currentTarget) {
              onClose?.();
            }
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            className={`relative my-auto w-full ${sizes[size]} overflow-hidden rounded-[28px] border border-white/10 bg-[#091525] shadow-2xl shadow-black/50`}
          >
            {/* Top Glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-[70px]" />

            {/* Header */}
            {title && (
              <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                <h2 className="text-base font-black text-white">{title}</h2>

                {showClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    aria-label="Close modal"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
            )}

            {!title && showClose && (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-slate-400 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <X size={17} />
              </button>
            )}

            {/* Content */}
            <div className="relative max-h-[80vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Modal;