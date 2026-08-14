import { PageContainer } from "./PageContainer";

interface LibraryTemplateProps {
  header: React.ReactNode;
  banners?: React.ReactNode;
  folders: React.ReactNode;
  prompts: React.ReactNode;
  toolbar?: React.ReactNode;
}

export function LibraryTemplate({ header, banners, folders, prompts, toolbar }: LibraryTemplateProps) {
  return (
    <PageContainer className="space-y-10">
      {header}

      {banners ? <div className="space-y-4">{banners}</div> : null}

      <section className="space-y-10">
        {folders}
        {prompts}
      </section>

      {toolbar}
    </PageContainer>
  );
}
