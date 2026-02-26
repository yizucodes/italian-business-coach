import { AnimatedWrapper } from "@/components/DialogWrapper";
import React from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import AudioButton from "@/components/AudioButton";
import { apiTokenAtom } from "@/store/tokens";
import { Input } from "@/components/ui/input";
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
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ background: "rgba(8, 5, 2, 0.62)" }}
        />

        <div
          className="relative z-10 flex flex-col items-center w-full max-w-sm rounded-2xl border border-white/15 overflow-hidden"
          style={{ background: "rgba(10, 7, 4, 0.80)" }}
        >
          {/* Italian tricolore stripe */}
          <div className="flex w-full h-1.5">
            <div className="flex-1" style={{ background: "#008C45" }} />
            <div className="flex-1" style={{ background: "#F4F5F0" }} />
            <div className="flex-1" style={{ background: "#CD212A" }} />
          </div>

          <div className="flex flex-col items-center gap-4 px-7 pt-5 pb-6 w-full">
            {/* Brand row */}
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="Italian flag">
                🇮🇹
              </span>
              <span
                className="text-xs font-bold tracking-[0.18em] uppercase"
                style={{
                  color: "#CD212A",
                  fontFamily: "Source Code Pro, monospace",
                }}
              >
                Benvenuto
              </span>
            </div>

            <h1
              className="text-[1.15rem] font-bold text-white text-center leading-snug"
              style={{ fontFamily: "Source Code Pro, monospace" }}
            >
              Italian Business Coach
            </h1>

            {/* Scenario card */}
            <div
              className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300 leading-relaxed"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <p>
                You're an{" "}
                <strong className="text-white">American sales executive</strong>{" "}
                about to meet{" "}
                <strong className="text-white">Matteo Rossi</strong> in Milan —
                VP of Procurement at a major Italian manufacturing firm.
              </p>
              <p className="mt-2" style={{ color: "#8FD8A8" }}>
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
                className="w-full rounded-xl border border-white/20 px-4 py-2.5 text-sm text-white bg-white/8 transition-all focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  fontFamily: "Source Code Pro, monospace",
                  color: "white",
                  background: "rgba(255,255,255,0.06)",
                  // ring colour handled via CSS variable override below
                }}
              />
              <p className="text-xs text-gray-500">
                No key?{" "}
                <a
                  href="https://platform.tavus.io/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline transition-colors hover:text-white"
                  style={{ color: "#8FD8A8" }}
                >
                  Create a free account
                </a>
              </p>
            </div>

            {/* CTA */}
            <AudioButton
              onClick={handleClick}
              disabled={!token}
              className="relative z-20 flex items-center justify-center gap-2 rounded-xl border px-6 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed w-full"
              style={{
                height: "44px",
                backgroundColor: token ? "#008C45" : "rgba(0,140,69,0.25)",
                borderColor: token ? "#008C45" : "rgba(255,255,255,0.15)",
                boxShadow: token
                  ? "0 0 20px rgba(0,140,69,0.35)"
                  : "none",
                transition: "all 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                if (!token) return;
                e.currentTarget.style.boxShadow =
                  "0 0 28px rgba(0,140,69,0.6)";
                e.currentTarget.style.backgroundColor = "#009e4f";
              }}
              onMouseLeave={(e) => {
                if (!token) return;
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(0,140,69,0.35)";
                e.currentTarget.style.backgroundColor = "#008C45";
              }}
            >
              Connect to Matteo →
            </AudioButton>
          </div>
        </div>
      </div>
    </AnimatedWrapper>
  );
};
