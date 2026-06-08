import React from "react";

import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark" | "default";
}

export function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  const variantStyles = {
    default: "bg-gray-200 dark:bg-gray-800",
    light: "bg-gray-100 dark:bg-gray-700",
    dark: "bg-slate-900 dark:bg-slate-950",
  };

  return (
    <div
      className={cn("animate-pulse rounded-md", variantStyles[variant], className)}
      {...props}
    />
  );
}
