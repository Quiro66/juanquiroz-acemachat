
import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function Button({
  children,
  loading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        flex w-full items-center justify-center gap-2
        rounded-xl bg-primary px-4 py-3
        text-sm font-semibold text-white
        shadow-lg shadow-indigo-500/20
        transition-all duration-200
        hover:bg-[#5148e5] hover:shadow-indigo-500/30
        active:scale-[0.98]
        focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-primary
        disabled:cursor-not-allowed disabled:opacity-60
        ${className}
      `}
    >
      {loading && <LoaderCircle size={18} className="animate-spin" />}
      {children}
    </button>
  );
}
