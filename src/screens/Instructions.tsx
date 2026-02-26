import {
  DialogWrapper,
  AnimatedTextBlockWrapper,
  StaticTextBlockWrapper,
} from "@/components/DialogWrapper";
import React, { useCallback, useMemo, useState } from "react";
import { AlertTriangle, Mic, Video } from "lucide-react";
import { useDaily, useDailyEvent, useDevices } from "@daily-co/daily-react";
import { ConversationError } from "./ConversationError";
import zoomSound from "@/assets/sounds/zoom.mp3";
import { Button } from "@/components/ui/button";
import { quantum } from "ldrs";
import gloriaVideo from "@/assets/video/gloria.mp4";
import { useCreateConversation } from "@/hooks/useCreateConversation";

quantum.register();

export const Instructions: React.FC = () => {
  const daily = useDaily();
  const { currentMic, setMicrophone, setSpeaker } = useDevices();
  const { createConversationRequest } = useCreateConversation();
  const [getUserMediaError, setGetUserMediaError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [error, setError] = useState(false);

  const audio = useMemo(() => {
    const audioObj = new Audio(zoomSound);
    audioObj.volume = 0.7;
    return audioObj;
  }, []);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  useDailyEvent(
    "camera-error",
    useCallback(() => {
      setGetUserMediaError(true);
    }, []),
  );

  const handleClick = async () => {
    try {
      setIsLoading(true);
      setIsPlayingSound(true);

      audio.currentTime = 0;
      await audio.play();

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsPlayingSound(false);
      setIsLoadingConversation(true);

      let micDeviceId = currentMic?.device?.deviceId;
      if (!micDeviceId) {
        const res = await daily?.startCamera({
          startVideoOff: false,
          startAudioOff: false,
          audioSource: "default",
        });
        // @ts-expect-error deviceId exists in the MediaDeviceInfo
        const isDefaultMic = res?.mic?.deviceId === "default";
        // @ts-expect-error deviceId exists in the MediaDeviceInfo
        const isDefaultSpeaker = res?.speaker?.deviceId === "default";
        // @ts-expect-error deviceId exists in the MediaDeviceInfo
        micDeviceId = res?.mic?.deviceId;

        if (isDefaultMic) {
          if (!isDefaultMic) {
            setMicrophone("default");
          }
          if (!isDefaultSpeaker) {
            setSpeaker("default");
          }
        }
      }
      if (micDeviceId) {
        await createConversationRequest();
      } else {
        setGetUserMediaError(true);
      }
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
      setIsLoadingConversation(false);
    }
  };

  if (isPlayingSound || isLoadingConversation) {
    return (
      <DialogWrapper>
        <video
          src={gloriaVideo}
          autoPlay
          muted
          loop
          playsInline
          className="fixed inset-0 h-full w-full object-cover"
        />
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <AnimatedTextBlockWrapper>
          <div className="flex flex-col items-center justify-center gap-4">
            <l-quantum size="45" speed="1.75" color="white"></l-quantum>
          </div>
        </AnimatedTextBlockWrapper>
      </DialogWrapper>
    );
  }

  if (error) {
    return <ConversationError onClick={handleClick} />;
  }

  return (
    <DialogWrapper>
      <video
        src={gloriaVideo}
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 h-full w-full object-cover"
      />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <AnimatedTextBlockWrapper>
        {/* Heading */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl" role="img" aria-label="Italian flag">
            🇮🇹
          </span>
          <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#CD212A] font-mono">
            Benvenuto
          </span>
        </div>
        <h1 className="mb-4 pt-1 text-center text-3xl sm:text-4xl lg:text-5xl font-semibold font-mono">
          <span className="text-white">Meet </span>
          <span className="text-[#8FD8A8]">Matteo Rossi.</span>
        </h1>
        <p className="max-w-[600px] text-center text-base sm:text-lg text-gray-300 mb-3">
          Matteo is VP of Procurement at a Milan-based manufacturing firm. He's
          old-school Italian — formal, relationship-driven, and quick to notice
          when you skip the pleasantries.
        </p>
        <p className="max-w-[580px] text-center text-sm text-gray-400 mb-10">
          During your call, Matteo will{" "}
          <strong className="text-white">pause and coach you</strong> whenever
          you breach Italian business etiquette — from rushed introductions to
          skipping the <em>bella figura</em>.
        </p>
        <Button
          onClick={handleClick}
          aria-label="Start coaching call"
          className="relative z-20 flex items-center justify-center gap-2 rounded-3xl border px-8 text-sm font-semibold text-white transition-all duration-200 mb-10 disabled:opacity-50 h-12 bg-[#008C45] border-[#008C45] shadow-[0_0_20px_rgba(0,140,69,0.35)] hover:bg-[#009e4f] hover:shadow-[0_0_28px_rgba(0,140,69,0.6)]"
          disabled={isLoading}
        >
          <Video className="size-5" />
          Start Coaching Call
          {getUserMediaError && (
            <div className="absolute -top-1 left-0 right-0 flex items-center gap-1 text-wrap rounded-lg border bg-red-500 p-2 text-white backdrop-blur-sm">
              <AlertTriangle className="text-red size-4" />
              <p>
                To chat with Matteo, please allow microphone access. Check your
                browser settings.
              </p>
            </div>
          )}
        </Button>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:gap-8 text-gray-400 justify-center">
          <div className="flex items-center gap-3 bg-[rgba(0,0,0,0.2)] px-4 py-2 rounded-full">
            <Mic className="size-5 text-primary" />
            Mic access is required
          </div>
          <div className="flex items-center gap-3 bg-[rgba(0,0,0,0.2)] px-4 py-2 rounded-full">
            <Video className="size-5 text-primary" />
            Camera access is required
          </div>
        </div>
        <span className="absolute bottom-6 px-4 text-sm text-gray-500 sm:bottom-8 sm:px-8 text-center">
          By starting a conversation, I accept the{" "}
          <a href="#" className="text-primary hover:underline">
            Terms of Use
          </a>{" "}
          and acknowledge the{" "}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </span>
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};

export const PositiveFeedback: React.FC = () => {
  return (
    <DialogWrapper>
      <AnimatedTextBlockWrapper>
        <StaticTextBlockWrapper
          imgSrc="/images/positive.png"
          title="Great Conversation!"
          titleClassName="sm:max-w-full bg-[linear-gradient(91deg,_#43BF8F_16.63%,_#FFF_86.96%)]"
          description="Thanks for the engaging discussion. Feel free to come back anytime for another chat!"
        />
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};
