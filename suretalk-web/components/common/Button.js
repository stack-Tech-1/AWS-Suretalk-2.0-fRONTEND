import { motion } from "framer-motion";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2
    focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-brand-600 text-white hover:bg-brand-700 
      focus:ring-brand-500 active:scale-95
    `,
    secondary: `
      bg-white text-brand-600 border border-brand-300 
      hover:bg-brand-50 focus:ring-brand-500 active:scale-95
    `,
    danger: `
      bg-accent-600 text-white hover:bg-accent-700 
      focus:ring-accent-500 active:scale-95
    `,
    ghost: `
      text-gray-600 hover:text-gray-900 hover:bg-gray-100 
      focus:ring-gray-500 active:scale-95
    `,
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}