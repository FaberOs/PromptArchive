import { FieldLabel } from "@/components/ui/FieldLabel";
import { cn } from "@/lib/utils";

interface FieldGroupProps {
  label: string;
  info?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function FieldGroup({ label, info, error, helper, required, htmlFor, className, children }: FieldGroupProps) {
  return (
    <div className={cn("space-y-0", className)}>
      <FieldLabel required={required} tip={info} htmlFor={htmlFor}>
        {label}
      </FieldLabel>
      <div>{children}</div>
      {error ? (
        <p className="mt-1.5 text-[11px] font-medium text-pa-danger" role="alert">
          {error}
        </p>
      ) : helper ? (
        <p className="mt-1.5 text-[11px] text-pa-muted-soft">{helper}</p>
      ) : null}
    </div>
  );
}
