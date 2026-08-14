import { Button } from "@/components/ui/Button";
import PinModal from "@/components/PinModal";
import { PageContainer } from "./PageContainer";
import { AppLogo } from "@/components/AppLogo";
import { Lock } from "lucide-react";

interface PrivateLibraryLockedTemplateProps {
  onBack: () => void;
  onUnlockSuccess: () => void;
  onClose: () => void;
}

export function PrivateLibraryLockedTemplate({ onBack, onUnlockSuccess, onClose }: PrivateLibraryLockedTemplateProps) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-pa-ink/70 backdrop-blur-xl" />
        <div className="absolute inset-0 opacity-30">
          <div className="grid h-full grid-cols-3 gap-3 p-8 pt-24 blur-2xl grayscale">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-pa-xl bg-pa-private-soft/40" />
            ))}
          </div>
        </div>
      </div>

      <PageContainer className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pa-private-soft ring-4 ring-pa-private/10">
          <Lock className="h-7 w-7 text-pa-private" strokeWidth={1.8} />
        </div>
        <div className="mt-5 flex items-center justify-center">
          <AppLogo size={40} className="opacity-40" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-pa-text">Private Library Locked</h2>
        <p className="mt-2 max-w-sm text-sm text-pa-muted">Enter your 4-digit PIN to access this local vault.</p>
        <Button onClick={onBack} variant="secondary" className="mt-6">
          Back to Library
        </Button>
        <PinModal isOpen onClose={onClose} onSuccess={onUnlockSuccess} />
      </PageContainer>
    </div>
  );
}
