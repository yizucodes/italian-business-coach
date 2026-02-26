import { AnimatedWrapper } from "@/components/DialogWrapper";
import React from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import AudioButton from "@/components/AudioButton";
import { apiTokenAtom } from "@/store/tokens";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils";
import gloriaVideo from "@/assets/video/gloria.mp4";

export const Intro: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [token, setToken] = useAtom(apiTokenAtom);

  const handleClick = () => {
    setScreenState({ currentScreen: "instructions" });
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newToken = e.target.value;
    setToken(newToken);
    localStorage.setItem("tavus-token", newToken);
  };

  return (
    <AnimatedWrapper>
      <div className="flex size-full flex-col items-center justify-center">
        <video
          src={gloriaVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Warm Italian overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-[rgba(8,5,2,0.62)]" />

        <div className="relative z-10 flex flex-col items-center w-full max-w-sm rounded-2xl border border-white/15 overflow-hidden bg-[rgba(10,7,4,0.80)]">
          {/* Italian tricolore stripe */}
          <div className="flex w-full h-1.5">
            <div className="flex-1 bg-[#008C45]" />
            <div className="flex-1 bg-[#F4F5F0]" />
            <div className="flex-1 bg-[#CD212A]" />
          </div>

          <div className="flex flex-col items-center gap-4 px-7 pt-5 pb-6 w-full">
            {/* Brand row */}
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="Italian flag">
                🇮🇹
              </span>
              <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#CD212A] font-mono">
                Benvenuto
              </span>
            </div>

            <h1 className="text-[1.15rem] font-bold text-white text-center leading-snug font-mono">
              Italian Business Coach
            </h1>

            {/* Scenario card */}
            <div className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300 leading-relaxed bg-white/[0.04]">
              <p>
                You're an{" "}
                <strong className="text-white">American sales executive</strong>{" "}
                about to meet{" "}
                <strong className="text-white">Matteo Rossi</strong> in Milan —
                VP of Procurement at a major Italian manufacturing firm.
              </p>
              <p className="mt-2 text-[#8FD8A8]">
                Your goal: close a partnership deal while navigating Italian
                business culture.
              </p>
            </div>

            {/* API key input */}
            <div className="flex flex-col gap-1.5 items-center w-full">
              <Input
                type="password"
                value={token || ""}
                onChange={handleTokenChange}
                placeholder="Tavus API Key"
                aria-label="Tavus API Key"
                className="w-full rounded-xl border border-white/20 px-4 py-2.5 text-sm text-white bg-[rgba(255,255,255,0.06)] font-mono transition-all focus:outline-none focus:ring-2 focus:border-transparent"
              />
              <p className="text-xs text-gray-500">
                No key?{" "}
                <a
                  href="https://platform.tavus.io/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline transition-colors hover:text-white text-[#8FD8A8]"
                >
                  Create a free account
                </a>
              </p>
            </div>

            {/* CTA */}
            <AudioButton
              onClick={handleClick}
              disabled={!token}
              aria-label="Connect to Matteo"
              className={cn(
                "relative z-20 flex items-center justify-center gap-2 rounded-xl border px-6 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed w-full h-11",
                token
                  ? "bg-[#008C45] border-[#008C45] shadow-[0_0_20px_rgba(0,140,69,0.35)] hover:bg-[#009e4f] hover:shadow-[0_0_28px_rgba(0,140,69,0.6)]"
                  : "bg-[rgba(0,140,69,0.25)] border-white/15 shadow-none",
              )}
            >
              Connect to Matteo →
            </AudioButton>
          </div>
        </div>
      </div>
    </AnimatedWrapper>
  );
};
