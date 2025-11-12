import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = {
  default:
    "inline-flex items-center rounded-full border border-transparent bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  secondary:
    "inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  outline:
    "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  muted:
    "inline-flex items-center rounded-full border border-transparent bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
};

export type BadgeProps = HTMLAttributes<HTMLParagraphElement> & {
  variant?: keyof typeof badgeVariants;
};

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => {
  return <p className={cn(badgeVariants[variant], className)} {...props} />;
};
