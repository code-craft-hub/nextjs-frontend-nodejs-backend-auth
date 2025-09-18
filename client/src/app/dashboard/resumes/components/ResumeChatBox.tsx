import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isEmpty } from "lodash";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "motion/react";
import { EachUserT } from "@/types";
import { useRouter } from "next/navigation";

export function ResumeChatBox({
  items,
  setSelectedProfile,
  selectedProfile,
  onSubmit,
  jobDescription,
  setJobDescription,
}: {
  items: EachUserT;
  setSelectedProfile: React.Dispatch<any>;
  selectedProfile: any;
  onSubmit: () => void;
  jobDescription: string;
  setJobDescription: React.Dispatch<React.SetStateAction<string>>;
}) {
  const router = useRouter();
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (jobDescription.trim()) {
        onSubmit();
        setJobDescription("");
        adjustHeight(true);
      }
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-screen-lg flex-col items-center space-y-4  sm:space-y-8">
      <div className="invertinsetphism rounded-xl">
        <img src="/assets/icons/cver.svg" alt="" />
      </div>

      <h1 className="text-foreground text-center text-2xl font-bold sm:text-4xl">
        Craft Your Ideal Resume{" "}
      </h1>

      <div className="w-full">
        <div className="border-border bg-secondary/20 relative rounded-xl border">
          <div className="overflow-y-auto">
            <Textarea
              ref={textareaRef}
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Paste your job description here. Cverai will use the selected profile to generate tailored Resume | CV for you right now!"
              className={cn(
                "w-full px-4 py-3",
                "resize-none",
                "bg-transparent",
                "border-none",
                "text-sm",
                "focus:outline-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-sm",
                "min-h-[60px]"
              )}
              style={{
                overflow: "hidden",
              }}
            />
          </div>

          <div className="flex items-center justify-between p-3">
            <div className="h-14 bg-black/5 dark:bg-white/5 rounded-b-xl flex items-center">
              <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between w-[calc(100%-24px)]">
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedProfile?.key}
                    onValueChange={(value) => {
                      const found = items?.dataSource?.find(
                        (item) => item?.key === value
                      );
                      if (found) setSelectedProfile(found);
                    }}
                  >
                    <SelectTrigger
                      className="flex items-center gap-1 h-8 pl-1 pr-2 text-xs rounded-md 
                   dark:text-white hover:bg-black/10 dark:hover:bg-white/10 
                   focus-visible:ring-1 focus-visible:ring-offset-0 
                   focus-visible:ring-blue-500 capitalize"
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedProfile?.key}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-1"
                        >
                          <SelectValue placeholder="Select profile" />
                        </motion.div>
                      </AnimatePresence>
                    </SelectTrigger>

                    <SelectContent className="min-w-[10rem]">
                      {items?.dataSource?.map((item) => (
                        <SelectItem
                          key={item?.key}
                          value={item?.key}
                          className="flex items-center gap-2"
                        >
                          <span>{item?.key}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <button
                  type="button"
                  className={cn(
                    "rounded-lg p-2 bg-blue-500 ",
                    "hover:bg-blue-300 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
                    jobDescription.trim() ? "opacity-100" : "opacity-30"
                  )}
                  aria-label="Send message"
                  disabled={!jobDescription.trim()}
                  onClick={() => onSubmit()}
                >
                  <ArrowUp
                    className={cn(
                      "w-4 h-4 text-white  transition-opacity duration-200"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
        {!isEmpty(items?.CV) && (
          <div className="-mx-4 mt-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex flex-col flex-wrap items-start gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-3 sm:overflow-x-auto sm:pb-2">
              {items?.CV?.slice(0, 2)?.map((item) => (
                <ActionButton
                  onClick={() => {
                    router.push(`/dashboard/resume/${item.genTableId}`);
                  }}
                  key={item.key}
                  img={item.imgIcon}
                  label={item.key}
                />
              ))}
              <ActionButton
                onClick={() => {
                  router.push(`/dashboard/resume/all_resumes`);
                }}
                label={"View all Resumes | CV"}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon?: React.ReactNode;
  label: string;
  img?: string;
  onClick?: () => void;
}

function ActionButton({ icon, label, img, onClick }: ActionButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      className="border-border bg-secondary/20 flex w-full flex-shrink-0 items-center gap-2 rounded-full border px-3 py-2 whitespace-nowrap transition-colors sm:w-auto sm:px-4"
      onClick={onClick}
    >
      {icon}
      {img && <img src={img} alt="" className="size-5" />}
      <span className="text-xs">{label}</span>
    </Button>
  );
}

export default ResumeChatBox;
