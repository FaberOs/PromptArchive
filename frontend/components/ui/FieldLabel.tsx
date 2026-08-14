import { InfoTip } from "./InfoTip";
import { cn } from "@/lib/utils";

interface FieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
  tip?: string;
  className?: string;
  htmlFor?: string;
}

export function FieldLabel({ children, required, tip, className, htmlFor }: FieldLabelProps) {
  return (
    <div className={cn("mb-2 flex items-center gap-0.5", className)}>
      <label htmlFor={htmlFor} className="text-xs font-bold uppercase tracking-[0.06em] text-pa-muted">
        {children}
        {required && <span className="ml-0.5 text-pa-danger">*</span>}
      </label>
      {tip && <InfoTip text={tip} />}
    </div>
  );
}
