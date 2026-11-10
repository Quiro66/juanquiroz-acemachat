import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";

import { AlertCircle } from "lucide-react";

interface InputFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField(
    { label, error, id, className = "", ...props },
    ref,
  ) {
    const inputId = id ?? props.name;

    return (
      <div className="w-full space-y-2">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>

        <input
          {...props}
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`
            w-full rounded-xl border bg-white px-4 py-3
            text-sm text-gray-900 outline-none
            placeholder:text-gray-400
            transition-all duration-200
            focus:border-primary focus:ring-4 focus:ring-indigo-500/10
            ${error ? "border-red-400" : "border-gray-200"}
            ${className}
          `}
        />

        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="flex items-center gap-1 text-xs text-red-600"
          >
            <AlertCircle size={14} />
            {error}
          </p>
        )}
      </div>
    );
  },
);

InputField.displayName = "InputField";
