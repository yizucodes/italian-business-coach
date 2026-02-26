import { ExternalLink } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="flex w-full items-center justify-center">
      <a
        href="https://tavus.io"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-3xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/50 backdrop-blur-sm transition-colors duration-200 hover:bg-white/10 hover:text-white/70 h-9"
      >
        Powered by Tavus CVI
        <ExternalLink className="size-3" />
      </a>
    </footer>
  );
};
