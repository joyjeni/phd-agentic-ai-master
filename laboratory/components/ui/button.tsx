import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--gold)] text-[var(--ink)] hover:bg-[#d4b56a]",
        secondary:
          "bg-[var(--panel)] text-[var(--paper)] border border-[var(--line)] hover:border-[var(--gold)]",
        ghost: "text-[var(--muted)] hover:text-[var(--paper)] hover:bg-white/5",
        outline:
          "border border-[var(--line)] text-[var(--paper)] hover:border-[var(--gold)]",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
