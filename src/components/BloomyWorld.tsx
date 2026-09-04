"use client";

import { useState } from "react";

import type {
  Scene,
} from "@/types/weather";

import MovingCharacter from "./MovingCharacter";

type RainSplash = {
  left: string;
  top: string;
  delay: string;
  duration: string;
  size:
    | "small"
    | "medium"
    | "large";
};

type BloomyWorldProps = {
  automaticScene: Scene;
};

const scenes: Scene[] = [
  "sunny",
  "cloudy",
  "rainy",
  "snowy",
  "sunrise",
  "sunset",
  "night",
  "aurora",
];

const rainSplashes: RainSplash[] = [
  {
    left: "6%",
    top: "70%",
    delay: "0s",
    duration: "1.3s",
    size: "medium",
  },
  {
    left: "14%",
    top: "82%",
    delay: "0.4s",
    duration: "1.5s",
    size: "large",
  },
  {
    left: "22%",
    top: "66%",
    delay: "0.8s",
    duration: "1.2s",
    size: "small",
  },
  {
    left: "30%",
    top: "88%",
    delay: "0.2s",
    duration: "1.6s",
    size: "medium",
  },
  {
    left: "38%",
    top: "74%",
    delay: "1s",
    duration: "1.4s",
    size: "large",
  },
  {
    left: "47%",
    top: "84%",
    delay: "0.6s",
    duration: "1.3s",
    size: "small",
  },
  {
    left: "56%",
    top: "68%",
    delay: "1.2s",
    duration: "1.5s",
    size: "medium",
  },
  {
    left: "64%",
    top: "90%",
    delay: "0.3s",
    duration: "1.2s",
    size: "large",
  },
  {
    left: "72%",
    top: "76%",
    delay: "0.9s",
    duration: "1.6s",
    size: "medium",
  },
  {
    left: "80%",
    top: "86%",
    delay: "0.5s",
    duration: "1.3s",
    size: "small",
  },
  {
    left: "88%",
    top: "72%",
    delay: "1.1s",
    duration: "1.4s",
    size: "large",
  },
  {
    left: "95%",
    top: "91%",
    delay: "0.7s",
    duration: "1.5s",
    size: "medium",
  },
];

export default function BloomyWorld({
  automaticScene,
}: BloomyWorldProps) {
  /*
   * When manualScene is null,
   * Bloomy follows the real weather.
   */
  const [
    manualScene,
    setManualScene,
  ] = useState<Scene | null>(
    null,
  );

  const scene =
    manualScene ??
    automaticScene;

  /*
   * Keep true while testing.
   * Change to false to hide the buttons.
   */
  const showSceneSelector = true;

  return (
    <div className="w-full bg-[#151419]">
      {/* ================================= */}
      {/* SCENE SELECTOR */}
      {/* ================================= */}

      {showSceneSelector && (
        <div className="scrollbar-none flex min-h-[54px] w-full items-center gap-2 overflow-x-auto border-b border-white/[0.08] bg-[#151419] px-2 py-2 sm:min-h-[58px] sm:justify-center sm:px-4">
          <span className="mr-2 hidden shrink-0 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 md:block">
            Scene
          </span>

          {/* AUTO */}

          <button
            type="button"
            onClick={() =>
              setManualScene(null)
            }
            className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs transition ${
              manualScene === null
                ? "border-emerald-400/30 bg-emerald-500/20 text-emerald-200"
                : "border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            Auto
          </button>

          {/* MANUAL SCENES */}

          {scenes.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() =>
                setManualScene(
                  item,
                )
              }
              className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs capitalize transition ${
                manualScene === item
                  ? "border-purple-400/30 bg-purple-500/20 text-purple-200"
                  : "border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* ================================= */}
      {/* BLOOMY VIEWPORT */}
      {/* ================================= */}

      <div className="bloomy-viewport relative h-[350px] w-full overflow-hidden bg-black sm:h-[420px] md:h-[470px] lg:h-[clamp(560px,45vw,700px)] 2xl:h-[720px]">
        {/*
         * This stage keeps the original 3:2 scene ratio.
         * Background, effects and characters are cropped together.
         */}
        <div className="bloomy-stage">
          {/* ================================= */}
          {/* BACKGROUND */}
          {/* ================================= */}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={scene}
            src={`/bloomy/${scene}.webp`}
            alt={`${scene} Bloomy world`}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-fill"
          />

          {/* ================================= */}
          {/* DARK GRADIENT */}
          {/* ================================= */}

          <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/35 via-transparent to-black/10" />

          {/* ================================= */}
          {/* AURORA */}
          {/* ================================= */}

          {scene === "aurora" && (
            <>
              {/* SVG WAVE FILTER */}

              <svg
                aria-hidden="true"
                className="pointer-events-none absolute h-0 w-0"
              >
                <defs>
                  <filter
                    id="aurora-wave-filter"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.008 0.018"
                      numOctaves="2"
                      seed="4"
                      result="auroraNoise"
                    >
                      <animate
                        attributeName="baseFrequency"
                        dur="10s"
                        values="
                          0.008 0.018;
                          0.012 0.026;
                          0.006 0.022;
                          0.008 0.018
                        "
                        repeatCount="indefinite"
                      />
                    </feTurbulence>

                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="auroraNoise"
                      scale="24"
                      xChannelSelector="R"
                      yChannelSelector="B"
                    >
                      <animate
                        attributeName="scale"
                        dur="8s"
                        values="
                          16;
                          28;
                          20;
                          16
                        "
                        repeatCount="indefinite"
                      />
                    </feDisplacementMap>
                  </filter>
                </defs>
              </svg>

              {/* SKY AURORA */}

              <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
                <div className="absolute left-1/2 top-0 h-full w-[110%] -translate-x-1/2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/bloomy/effects/aurora.png"
                    alt=""
                    decoding="async"
                    className="aurora-sky-motion absolute inset-0 h-full w-full max-w-none object-cover"
                  />
                </div>
              </div>

              {/* WATER REFLECTION */}

              <div className="pointer-events-none absolute inset-0 z-[6] overflow-hidden">
                <div className="aurora-water-reflection" />
              </div>
            </>
          )}

          {/* ================================= */}
          {/* CHARACTER AND DOG */}
          {/* ================================= */}

          <div className="absolute inset-0 z-10">
            <MovingCharacter />
          </div>

          {/* ================================= */}
          {/* RAIN */}
          {/* ================================= */}

          {scene === "rainy" && (
            <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
              {/* FALLING RAIN */}

              <div className="rain-layer rain-layer-back" />
              <div className="rain-layer rain-layer-front" />

              {/* GROUND SPLASHES */}

              <div className="absolute inset-0 z-30">
                {rainSplashes.map(
                  (
                    splash,
                    index,
                  ) => (
                    <span
                      key={`${splash.left}-${index}`}
                      className={`rain-ground-splash rain-ground-splash-${splash.size}`}
                      style={{
                        left:
                          splash.left,

                        top:
                          splash.top,

                        animationDelay:
                          splash.delay,

                        animationDuration:
                          splash.duration,
                      }}
                    />
                  ),
                )}
              </div>
            </div>
          )}

          {/* ================================= */}
          {/* SNOW */}
          {/* ================================= */}

          {scene === "snowy" && (
            <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
              <div className="snow-layer snow-back" />
              <div className="snow-layer snow-middle" />
              <div className="snow-layer snow-front" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}