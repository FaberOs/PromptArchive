"use client";

import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/templates/PageContainer";
import { EmptyStateBlock } from "@/components/ui/EmptyStateBlock";
import { Button } from "@/components/ui/Button";
import { AppLogo } from "@/components/AppLogo";

export default function NotFound() {
  const router = useRouter();

  return (
    <PageContainer className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-16">
      <EmptyStateBlock
        icon={<AppLogo size={56} className="mx-auto opacity-80" />}
        title="Page not found"
        description="This route is not part of your local prompt archive."
        action={
          <Button type="button" onClick={() => router.push("/")}>
            Back to Library
          </Button>
        }
      />
    </PageContainer>
  );
}
