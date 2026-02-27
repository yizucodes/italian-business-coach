import { memo } from "react";

export const Header = memo(() => {
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
    </header>
  );
});
