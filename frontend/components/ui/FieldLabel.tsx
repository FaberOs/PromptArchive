import { InfoTip } from './InfoTip';

interface FieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
  tip?: string;
}

export function FieldLabel({ children, required, tip }: FieldLabelProps) {
  return (
    <div className="flex items-center gap-0.5 mb-1.5">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {children}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {tip && <InfoTip text={tip} />}
    </div>
  );
}
