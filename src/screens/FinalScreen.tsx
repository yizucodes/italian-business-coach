import React from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";

export const FinalScreen: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);

  // Redirect immediately to the summary screen so FinalScreen is never a dead end
  React.useEffect(() => {
    setScreenState({ currentScreen: "summary" });
  }, [setScreenState]);

  return null;
};
