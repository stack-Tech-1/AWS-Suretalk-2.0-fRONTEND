import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, XCircle, Info } from "lucide-react";

export default function Alert({
  type = "info",
  title,
  message,
  onClose,
  className = ""
}) {
  const icons = {
    info: <Info className="w-5 h-5 text-blue-500" />,
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
  };

  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };

  const iconColors = {
    info: "text-blue-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-lg border p-4 ${styles[type]} ${className}`}
    >
      <div className="flex">
        <div className={`flex-shrink-0 ${iconColors[type]}`}>
          {icons[type]}
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${iconColors[type]}`}>
              {title}
            </h3>
          )}
          {message && (
            <div className={`text-sm ${title ? 'mt-1' : ''}`}>
              {message}
            </div>
          )}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 ${iconColors[type]} hover:bg-black/10`}
          >
            <span className="sr-only">Close</span>
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}