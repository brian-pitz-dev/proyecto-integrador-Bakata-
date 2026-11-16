import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Círculo para marcar un día como entrenado. */
export function DoneButton({
  isDone,
  disabled,
  onClick,
  inverse = false,
}: {
  isDone: boolean;
  disabled: boolean;
  onClick: () => void;
  inverse?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={isDone ? "Marcar como no completado" : "Marcar como completado"}
      aria-pressed={isDone}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center self-center rounded-full border-2 transition-colors disabled:opacity-40",
        isDone
          ? inverse
            ? "border-primary bg-primary text-primary-foreground dark:border-white dark:bg-white dark:text-primary"
            : "border-accent bg-accent text-accent-foreground"
          : inverse
            ? "border-primary/40 text-transparent hover:border-primary hover:text-primary/40 dark:border-white/50 dark:hover:border-white dark:hover:text-white/40"
            : "border-border text-transparent hover:border-primary/60 hover:text-primary/40",
      )}
    >
      <Check className="size-5" aria-hidden="true" />
    </button>
  );
}
