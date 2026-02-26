import { useEffect } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import type { TargetAndTransition } from "framer-motion";
import { interpolate } from "flubber";

const paths = [
  "M 0 0 L 100 0 L 100 100 L 0 100 Z",
  "M 50 0 A 50 50 0 1 1 50 100 A 50 50 0 1 1 50 0",
];

export const Morpher = () => {
  const controls = useAnimation();
  const d = useMotionValue(paths[0]);
  const dShadow = useMotionValue(0);

  useEffect(() => {
    if (!paths.length) return;

    let isPlaying = true;

    const interpolator = interpolate(paths[0], paths[1], {
      maxSegmentLength: 2,
      single: true,
    });

    const pathInterpolator = (number: number) => {
      const wrapped = number % 1;
      return d.set(interpolator(wrapped));
    };

    async function sequence(index = 0) {
      if (!isPlaying) return;

      // framer-motion animates arbitrary data-* attrs to drive bound MotionValues
      controls.set({ "data-d": index } as unknown as TargetAndTransition);
      await controls.start({
        "data-d": index + 1,
        transition: { duration: 0.8, ease: "easeInOut" },
      } as unknown as TargetAndTransition);

      await controls.start({ x: 0, transition: { duration: 1 } });

      if (isPlaying) sequence(index === 0 ? 1 : 0);
    }

    d.set(paths[0]);
    const removeOnChange = dShadow.on("change", pathInterpolator);
    sequence();

    return () => {
      isPlaying = false;
      removeOnChange();
      controls.stop();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox={d.get() === paths[0] ? "0 0 1200 1200" : "0 0 24 24"}
        preserveAspectRatio="xMidYMid meet"
      >
        <motion.path
          d={d}
          data-d={dShadow}
          fill="white"
          animate={controls}
        />
      </svg>
    </div>
  );
};
