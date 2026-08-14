import { cn } from "@/lib/utils";
import { PageContainer } from "./PageContainer";
import { SegmentedTabs, type SegmentedTabItem } from "./SegmentedTabs";

interface PromptDetailTemplateProps<T extends string> {
  banners?: React.ReactNode;
  topBar: React.ReactNode;
  tabs: SegmentedTabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  children: React.ReactNode;
}

export function PromptDetailTemplate<T extends string>({
  banners,
  topBar,
  tabs,
  activeTab,
  onTabChange,
  children,
}: PromptDetailTemplateProps<T>) {
  return (
    <PageContainer variant="wide" className="space-y-8">
      {banners}

      {topBar}

      <SegmentedTabs items={tabs} value={activeTab} onChange={onTabChange} aria-label="Prompt sections" />

      <div className={cn("space-y-8", activeTab === "details" && "pb-4")}>{children}</div>
    </PageContainer>
  );
}
