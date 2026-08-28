import { AlertTriangle, ArrowLeft, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ErrorMessage({
  title = "Something went wrong",
  message = "We couldn't load this section right now. Please try again.",
  onRetry,
  showBack = false,
}) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[320px] w-full items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[28px] border border-red-400/10 bg-[#0a1525] p-7 text-center shadow-2xl shadow-black/20">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-400/10 text-red-400">
          <AlertTriangle size={24} />
        </div>

        <h2 className="mt-5 text-lg font-black text-white">{title}</h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-xs font-black text-white transition hover:brightness-110"
            >
              <RefreshCcw size={14} />
              Try Again
            </button>
          )}

          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={14} />
              Go Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorMessage;