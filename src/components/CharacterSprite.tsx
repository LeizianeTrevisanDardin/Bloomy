"use client";

import { useEffect, useState } from "react";

type CharacterSpriteProps = {
  src: string;
  frames?: number;
  frameWidth?: number;
  frameHeight?: number;
  displayWidth?: number;
  speed?: number;
  paused?: boolean;
};

export default function CharacterSprite({
  src,
  frames = 4,
  frameWidth = 520,
  frameHeight = 756,
  displayWidth = 75,
  speed = 180,
  paused = false,
}: CharacterSpriteProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setFrame((current) => {
        return (current + 1) % frames;
      });
    }, speed);

    return () => {
      clearInterval(interval);
    };
  }, [frames, speed, paused]);

  const displayHeight =
    (frameHeight / frameWidth) * displayWidth;

  return (
    <div
      style={{
        position: "relative",
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: `${displayWidth * frames}px`,
          height: `${displayHeight}px`,
          maxWidth: "none",
          transform: `translateX(-${
            frame * displayWidth
          }px)`,
          imageRendering: "pixelated",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
    </div>
  );
}