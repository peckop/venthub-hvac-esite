import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark';
}

export function Skeleton({
  className,
  variant = 'light',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md',
        variant === 'dark' ? 'bg-slate-950/80' : 'bg-slate-200',
        className
      )}
      {...props}
    />
  );
}

export default Skeleton;
