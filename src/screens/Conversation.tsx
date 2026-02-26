import {
  DailyAudio,
  useDaily,
  useDailyEvent,
  useLocalSessionId,
  useParticipantIds,
  useVideoTrack,
  useAudioTrack,
} from "@daily-co/daily-react";
import React, { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Video from "@/components/Video";
import { conversationAtom } from "@/store/conversation";
import { useAtom, useAtomValue } from "jotai";
import { screenAtom } from "@/store/screens";
import { Button } from "@/components/ui/button";
import { endConversation } from "@/api/endConversation";
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  PhoneIcon,
} from "lucide-react";
import {
  clearSessionTime,
  getSessionTime,
  setSessionStartTime,
  updateSessionEndTime,
} from "@/utils";
import { Timer } from "@/components/Timer";
import { TIME_LIMIT } from "@/config";
import { apiTokenAtom } from "@/store/tokens";
import { coachingEventsAtom } from "@/store/coaching";
import { CoachingSidebar } from "@/components/CoachingSidebar";
import type { CoachingEvent } from "@/types";
import { quantum } from "ldrs";
import { cn } from "@/lib/utils";

quantum.register();

const timeToGoPhrases = [
  "I'll need to dash off soon—let's make these last moments count.",
  "I'll be heading out soon, but I've got a little more time for you!",
  "I'll be leaving soon, but I'd love to hear one more thing before I go!",
];

const outroPhrases = [
  "It's time for me to go now. Take care, and I'll see you soon!",
  "I've got to get back to work. See you next time!",
  "I must say goodbye for now. Stay well, and I'll see you soon!",
];

/** Convert snake_case / camelCase to Title Case for toast display */
const formatIssueLabel = (issueType: string): string =>
  issueType
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

export const Conversation: React.FC = () => {
  const [conversation, setConversation] = useAtom(conversationAtom);
  const [, setScreenState] = useAtom(screenAtom);
  const [, setCoachingEvents] = useAtom(coachingEventsAtom);
  const token = useAtomValue(apiTokenAtom);

  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  const isCameraEnabled = !localVideo.isOff;
  const isMicEnabled = !localAudio.isOff;
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });
  const [start, setStart] = useState(false);

  /** Listen for Tavus tool-call app-messages */
  useDailyEvent(
    "app-message",
    useCallback(
      (event: { data?: Record<string, unknown> }) => {
        const data = event.data;
        if (
          data?.event_type !== "conversation.tool_call" ||
          (data?.properties as Record<string, unknown>)?.name !==
            "trigger_cultural_coaching"
        ) {
          return;
        }

        const props = data.properties as Record<string, unknown>;
        const rawArgs = props.arguments ?? props.args ?? props.parameters;

        let parsed: { issue_type?: string; explanation?: string } = {};
        if (typeof rawArgs === "string") {
          try {
            parsed = JSON.parse(rawArgs);
          } catch {
            // malformed JSON — fall through with empty defaults
          }
        } else if (rawArgs && typeof rawArgs === "object") {
          parsed = rawArgs as typeof parsed;
        }

        const issueType = parsed.issue_type ?? "Cultural Note";
        const explanation =
          parsed.explanation ?? "A cultural coaching note was detected.";

        const newEvent: CoachingEvent = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          issueType,
          explanation,
          timestamp: getSessionTime(),
        };

        setCoachingEvents((prev) => [...prev, newEvent]);

        toast.custom(
          () => (
            <div className="flex items-start gap-3 rounded-lg border border-[#008C45]/60 bg-black/90 px-4 py-3 shadow-lg backdrop-blur-sm max-w-xs">
              <span className="text-lg shrink-0">🇮🇹</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#008C45] uppercase tracking-wide">
                  {formatIssueLabel(issueType)}
                </p>
                <p className="mt-0.5 text-xs text-white/80 line-clamp-3 leading-relaxed">
                  {explanation}
                </p>
              </div>
            </div>
          ),
          { duration: 6000, position: "bottom-left" },
        );
      },
      [setCoachingEvents],
    ),
  );

  useEffect(() => {
    if (remoteParticipantIds.length && !start) {
      setStart(true);
      setTimeout(() => daily?.setLocalAudio(true), 4000);
    }
  }, [remoteParticipantIds, start]);

  useEffect(() => {
    if (!remoteParticipantIds.length || !start) return;

    setSessionStartTime();
    const interval = setInterval(() => {
      const time = getSessionTime();
      if (time === TIME_LIMIT - 60) {
        daily?.sendAppMessage({
          message_type: "conversation",
          event_type: "conversation.echo",
          conversation_id: conversation?.conversation_id,
          properties: {
            modality: "text",
            text:
              timeToGoPhrases[Math.floor(Math.random() * 3)] ??
              timeToGoPhrases[0],
          },
        });
      }
      if (time === TIME_LIMIT - 10) {
        daily?.sendAppMessage({
          message_type: "conversation",
          event_type: "conversation.echo",
          conversation_id: conversation?.conversation_id,
          properties: {
            modality: "text",
            text:
              outroPhrases[Math.floor(Math.random() * 3)] ?? outroPhrases[0],
          },
        });
      }
      if (time >= TIME_LIMIT) {
        leaveConversation();
        clearInterval(interval);
      } else {
        updateSessionEndTime();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [remoteParticipantIds, start]);

  useEffect(() => {
    if (conversation?.conversation_url) {
      daily
        ?.join({
          url: conversation.conversation_url,
          startVideoOff: false,
          startAudioOff: true,
        })
        .then(() => {
          daily?.setLocalVideo(true);
          daily?.setLocalAudio(false);
        });
    }
  }, [conversation?.conversation_url]);

  const toggleVideo = useCallback(() => {
    daily?.setLocalVideo(!isCameraEnabled);
  }, [daily, isCameraEnabled]);

  const toggleAudio = useCallback(() => {
    daily?.setLocalAudio(!isMicEnabled);
  }, [daily, isMicEnabled]);

  const leaveConversation = useCallback(() => {
    daily?.leave();
    daily?.destroy();
    if (conversation?.conversation_id && token) {
      endConversation(token, conversation.conversation_id);
    }
    setConversation(null);
    clearSessionTime();
    setScreenState({ currentScreen: "summary" });
  }, [daily, token, conversation, setConversation, setScreenState]);

  return (
    <>
      {/* Toast container — positioned bottom-left so it doesn't overlap controls */}
      <Toaster
        position="bottom-left"
        toastOptions={{ style: { background: "transparent", boxShadow: "none", padding: 0 } }}
      />

      {/* Two-panel layout: video (2/3) + coaching sidebar (1/3) */}
      <div className="flex w-full max-w-5xl gap-3 h-full sm:max-h-[680px] lg:max-h-none">
        {/* ── Left panel: video + controls ── */}
        <div
          className={cn(
            "relative flex-[2] overflow-hidden rounded-2.5xl border-2 border-primary bg-wrapper shadow-wrapper-shadow backdrop-blur-sm",
            "min-h-[300px]",
          )}
        >
          <img
            src="/images/dialogBlur.svg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 size-full">
            {remoteParticipantIds?.length > 0 ? (
              <>
                <Timer />
                <Video
                  id={remoteParticipantIds[0]}
                  className="size-full"
                  tileClassName="!object-cover"
                />
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <l-quantum size="45" speed="1.75" color="white" />
              </div>
            )}

            {/* PIP: local camera */}
            {localSessionId && (
              <Video
                id={localSessionId}
                tileClassName="!object-cover"
                className={cn(
                  "absolute bottom-20 right-4 aspect-video h-40 w-24 overflow-hidden rounded-lg border-2 border-[#22C5FE] shadow-[0_0_20px_rgba(34,197,254,0.3)] sm:bottom-12 lg:h-auto lg:w-52",
                )}
              />
            )}

            {/* Media controls */}
            <div className="absolute bottom-8 right-1/2 z-10 flex translate-x-1/2 justify-center gap-4">
              <Button
                size="icon"
                className="border border-[#22C5FE] shadow-[0_0_20px_rgba(34,197,254,0.2)]"
                variant="secondary"
                onClick={toggleAudio}
              >
                {!isMicEnabled ? (
                  <MicOffIcon className="size-6" />
                ) : (
                  <MicIcon className="size-6" />
                )}
              </Button>
              <Button
                size="icon"
                className="border border-[#22C5FE] shadow-[0_0_20px_rgba(34,197,254,0.2)]"
                variant="secondary"
                onClick={toggleVideo}
              >
                {!isCameraEnabled ? (
                  <VideoOffIcon className="size-6" />
                ) : (
                  <VideoIcon className="size-6" />
                )}
              </Button>
              <Button
                size="icon"
                className="bg-[rgba(251,36,71,0.80)] backdrop-blur hover:bg-[rgba(251,36,71,0.60)] border border-[rgba(251,36,71,0.9)] shadow-[0_0_20px_rgba(251,36,71,0.3)]"
                variant="secondary"
                onClick={leaveConversation}
              >
                <PhoneIcon className="size-6 rotate-[135deg]" />
              </Button>
            </div>

            <DailyAudio />
          </div>
        </div>

        {/* ── Right panel: coaching sidebar (desktop only) ── */}
        <CoachingSidebar className="hidden lg:flex lg:flex-[1]" />
      </div>
    </>
  );
};
