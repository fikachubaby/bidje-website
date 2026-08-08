import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  wide?: boolean;
  hint?: string;
  children: React.ReactNode;
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

export function FormInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "mt-2 w-full rounded-xl border border-neutral-400 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-500 focus:border-black focus:ring-2 focus:ring-black/5",
        className
      )}
      {...props}
    />
  );
}

export function FormSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "mt-2 w-full rounded-xl border border-neutral-400 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 hover:border-neutral-500 focus:border-black focus:ring-2 focus:ring-black/5",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function FormTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "mt-2 w-full rounded-xl border border-neutral-400 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-500 focus:border-black focus:ring-2 focus:ring-black/5",
        className
      )}
      {...props}
    />
  );
}