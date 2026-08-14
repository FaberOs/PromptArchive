import { PageHeader } from "@/components/PageHeader";
import { PageContainer } from "./PageContainer";
import { SegmentedTabs, type SegmentedTabItem } from "./SegmentedTabs";

interface CategoriesTemplateProps<T extends string> {
  tabs: SegmentedTabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  children: React.ReactNode;
  modals?: React.ReactNode;
}

export function CategoriesTemplate<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  children,
  modals,
}: CategoriesTemplateProps<T>) {
  return (
    <PageContainer className="space-y-6 sm:space-y-8">
      <div className="space-y-4">
        <PageHeader title="Categories" subtitle="Organize and explore your prompt library." />
        <SegmentedTabs
          items={tabs}
          value={activeTab}
          onChange={onTabChange}
          className="w-full sm:max-w-md"
          aria-label="Category sections"
        />
      </div>

      {children}
      {modals}
    </PageContainer>
  );
}
