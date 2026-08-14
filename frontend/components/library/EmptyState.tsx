import type { ReactNode } from "react";
import { EmptyStateBlock } from "@/components/ui/EmptyStateBlock";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  iconClassName?: string;
  className?: string;
}

export function EmptyState({ icon, title, description, action, iconClassName, className }: EmptyStateProps) {
  return (
    <EmptyStateBlock
      icon={icon}
      title={title}
      description={description}
      action={action}
      iconClassName={iconClassName}
      className={className}
    />
  );
}
