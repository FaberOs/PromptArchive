import { PageContainer } from "./PageContainer";

interface CreatePromptTemplateProps {
  header: React.ReactNode;
  notice?: React.ReactNode;
  identity: React.ReactNode;
  editor: React.ReactNode;
  sidebar: React.ReactNode;
  mobileActions?: React.ReactNode;
}

export function CreatePromptTemplate({
  header,
  notice,
  identity,
  editor,
  sidebar,
  mobileActions,
}: CreatePromptTemplateProps) {
  return (
    <PageContainer className="space-y-6">
      {header}
      {notice}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
        <div className="flex flex-col gap-6">
          {identity}
          {editor}
        </div>

        <div className="flex flex-col gap-6">
          {sidebar}
          <div className="hidden sm:block">{mobileActions}</div>
        </div>
      </div>

      {mobileActions && (
        <div className="sticky bottom-0 z-pa-sticky -mx-4 border-t border-pa-border bg-pa-cream/95 px-4 py-3 backdrop-blur-sm sm:hidden">
          {mobileActions}
        </div>
      )}
    </PageContainer>
  );
}
