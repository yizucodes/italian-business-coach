import { memo } from "react";
import { Button } from "./ui/button";
import { Settings, Check } from "lucide-react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { conversationAtom } from "@/store/conversation";
import { settingsSavedAtom } from "@/store/settings";

export const Header = memo(() => {
  const [, setScreenState] = useAtom(screenAtom);
  const [conversation] = useAtom(conversationAtom);
  const [settingsSaved] = useAtom(settingsSavedAtom);

  const handleSettings = () => {
    if (!conversation) {
      setScreenState({ currentScreen: "settings" });
    }
  };

  return (
    <header className="flex w-full items-center justify-between">
      {/* Brand mark */}
      <div className="flex items-center gap-3">
        {/* Italian tricolore flag bar */}
        <div className="flex h-9 w-2 flex-col overflow-hidden rounded-sm shrink-0">
          <div className="flex-1 bg-[var(--italian-green)]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[var(--italian-red)]" />
        </div>

        <div className="flex flex-col leading-none">
          <span className="text-base font-bold text-white sm:text-lg tracking-tight">
            Benvenuto
          </span>
          <span className="text-[10px] text-zinc-400 tracking-wide uppercase mt-0.5">
            Italian Business Coach
          </span>
        </div>
      </div>

      {/* Settings */}
      <div className="relative">
        {settingsSaved && (
          <div className="absolute -top-2 -right-2 z-20 rounded-full bg-green-500 p-1 animate-fade-in">
            <Check className="size-3" />
          </div>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={handleSettings}
          aria-label="Open settings"
          className="relative size-10 sm:size-14 border-0 bg-transparent hover:bg-zinc-800"
        >
          <Settings className="size-4 sm:size-6" />
        </Button>
      </div>
    </header>
  );
});
