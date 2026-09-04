"use client";

import { useEffect, useState } from "react";

type CharacterSpriteProps = {
  src: string;
  frames?: number;
  frameWidth: number;
  frameHeight: number;
  displayWidth?: number;
  speed?: number;
  paused?: boolean;
};

export default function CharacterSprite({
  src,
  frames = 4,
  frameWidth,
  frameHeight,
  displayWidth = 75,
  speed = 150,
  paused = false,
}: CharacterSpriteProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (paused || frames <= 1) return;

    let animationFrameId = 0;
    let previousTime = performance.now();
    let accumulatedTime = 0;

    const animate = (currentTime: number) => {
      const elapsed = Math.min(
        currentTime - previousTime,
        100,
      );

      previousTime = currentTime;
      accumulatedTime += elapsed;

      if (accumulatedTime >= speed) {
        const framesToAdvance = Math.floor(
          accumulatedTime / speed,
        );

        accumulatedTime %= speed;

        setFrame(
          (current) =>
            (current + framesToAdvance) % frames,
        );
      }

      animationFrameId =
        window.requestAnimationFrame(animate);
    };

    animationFrameId =
      window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(
        animationFrameId,
      );
    };
  }, [frames, paused, speed]);

  const displayHeight =
    (frameHeight / frameWidth) *
    displayWidth;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Sprite sheets should remain unoptimized to preserve exact frames. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        decoding="async"
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: `${displayWidth * frames}px`,
          height: `${displayHeight}px`,
          maxWidth: "none",
          transform: `translate3d(-${frame * displayWidth}px, 0, 0)`,
          willChange: "transform",
          imageRendering: "pixelated",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
    </div>
  );
}
