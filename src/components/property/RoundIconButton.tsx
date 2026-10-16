import { cn } from "@/lib/utils";

type RoundIconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/** Circular icon button shared by the property actions (favourite, share). */
export function RoundIconButton({ className, children, ...props }: RoundIconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm transition-all hover:scale-105 hover:bg-white disabled:opacity-60",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
