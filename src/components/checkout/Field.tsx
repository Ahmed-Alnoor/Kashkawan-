"use client";

import { useId, type ReactNode } from "react";

type BaseProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optionalLabel?: string;
  children?: ReactNode;
};

const controlClass = (invalid: boolean) =>
  [
    "h-12 w-full rounded-xl border bg-white/80 px-4 text-[0.98rem] text-ink",
    "placeholder:text-ink-faint transition-colors duration-200",
    "focus:outline-none focus:ring-2 focus:ring-heritage/25",
    invalid ? "border-danger focus:border-danger" : "border-paper-edge focus:border-heritage",
  ].join(" ");

export function Field({
  label,
  hint,
  error,
  required,
  optionalLabel,
  name,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
  inputMode,
  dir,
  maxLength,
}: BaseProps & {
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: "text" | "tel" | "email" | "url" | "numeric";
  dir?: "ltr" | "rtl";
  maxLength?: number;
}) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {!required && optionalLabel && (
          <span className="ms-2 font-normal text-ink-faint">({optionalLabel})</span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        dir={dir}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`mt-2 ${controlClass(Boolean(error))}`}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  name,
  value,
  onChange,
  placeholder,
  options,
  autoComplete,
}: BaseProps & {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  autoComplete?: string;
}) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`mt-2 appearance-none bg-[length:1rem] bg-no-repeat ${controlClass(Boolean(error))}`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235C635E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundPosition: "right 1rem center",
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextareaField({
  label,
  hint,
  error,
  optionalLabel,
  required,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
}: BaseProps & {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {!required && optionalLabel && (
          <span className="ms-2 font-normal text-ink-faint">({optionalLabel})</span>
        )}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`mt-2 w-full resize-y rounded-xl border bg-white/80 px-4 py-3 text-[0.98rem] text-ink placeholder:text-ink-faint transition-colors duration-200 focus:ring-2 focus:ring-heritage/25 focus:outline-none ${
          error ? "border-danger" : "border-paper-edge focus:border-heritage"
        }`}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function RadioCards({
  legend,
  name,
  value,
  onChange,
  options,
}: {
  legend: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; description?: string }>;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">{legend}</legend>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition-all duration-200 ${
                checked
                  ? "border-heritage bg-heritage/8"
                  : "border-paper-edge bg-white/70 hover:border-heritage/40"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={`mt-0.5 grid size-5 shrink-0 place-content-center rounded-full border-2 transition-colors duration-200 ${
                  checked ? "border-heritage bg-heritage" : "border-ink-faint/50"
                }`}
              >
                {checked && <span className="size-2 rounded-full bg-paper" />}
              </span>
              <span>
                <span className="block text-[0.95rem] font-medium text-ink">{option.label}</span>
                {option.description && (
                  <span className="mt-0.5 block text-xs text-ink-muted">{option.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
