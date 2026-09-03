import { cn } from "@/lib/utils";

interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  wide?: boolean;
  hint?: string;
  children?: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  wide = false,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("block text-sm font-bold text-neutral-800", wide && "md:col-span-2", className)}
    >
      {label}
      {children}
      {hint ? <span className="mt-1 block text-xs font-normal text-neutral-500">{hint}</span> : null}
    </label>
  );
}

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function FormInput({
  label,
  hint,
  className,
  id,
  ...props
}: FormInputProps) {
  const inputEl = (
    <input
      id={id}
      className={cn(
        "mt-2 w-full rounded-xl border border-neutral-400 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-500 focus:border-black focus:ring-2 focus:ring-black/5",
        className
      )}
      {...props}
    />
  );

  if (!label) return inputEl;

  return (
    <FormField label={label} htmlFor={id} hint={hint}>
      {inputEl}
    </FormField>
  );
}

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
}

export function FormSelect({
  label,
  hint,
  className,
  children,
  id,
  ...props
}: FormSelectProps) {
  const selectEl = (
    <select
      id={id}
      className={cn(
        "mt-2 w-full rounded-xl border border-neutral-400 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 hover:border-neutral-500 focus:border-black focus:ring-2 focus:ring-black/5",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );

  if (!label) return selectEl;

  return (
    <FormField label={label} htmlFor={id} hint={hint}>
      {selectEl}
    </FormField>
  );
}

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export function FormTextarea({
  label,
  hint,
  className,
  id,
  ...props
}: FormTextareaProps) {
  const textareaEl = (
    <textarea
      id={id}
      className={cn(
        "mt-2 w-full rounded-xl border border-neutral-400 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-500 focus:border-black focus:ring-2 focus:ring-black/5",
        className
      )}
      {...props}
    />
  );

  if (!label) return textareaEl;

  return (
    <FormField label={label} htmlFor={id} hint={hint}>
      {textareaEl}
    </FormField>
  );
}