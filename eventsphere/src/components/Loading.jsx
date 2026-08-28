import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";

function Loading({
  fullScreen = false,
  text = "Preparing your experience...",
}) {
  const content = (
    <div className="flex min-h-[260px] w-full flex-col items-center justify-center">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 rounded-full border border-transparent border-t-cyan-400 border-r-blue-500"
        />

        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
          className="absolute h-12 w-12 rounded-full bg-cyan-400/10 blur-md"
        />

        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#0b1728]">
          <CalendarDays size={20} className="text-cyan-400" />
        </div>
      </div>

      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
        }}
        className="mt-5 text-xs font-semibold tracking-wide text-slate-500"
      >
        {text}
      </motion.p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020812]/95 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
}

export default Loading;