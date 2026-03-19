import { cn } from "@/lib/utils";
import { onBoardingTabs } from "@/lib/utils/constants";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
const OnboardingTabs = ({ activeTab }: { activeTab: string }) => {
  return (
    <div className="grid grid-cols-1">
      <ScrollArea>
        <div className="flex justify-between gap-4 border-b-2">
          {onBoardingTabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <div
                className={cn(
                  "w-full text-center max-sm:text-2xs max-md:text-xs text-nowrap pb-1 lg:text-md font-light relative",
                  isActive && "text-blue-500"
                )}
                key={tab.title}
              >
                {tab.title}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 -mb-0.5" />
                )}
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default OnboardingTabs;
