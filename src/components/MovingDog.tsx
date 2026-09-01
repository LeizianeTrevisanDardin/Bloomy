"use client";

import { useEffect, useState } from "react";
import CharacterSprite from "./CharacterSprite";

type Direction = "idle" | "left" | "right";

const LEFT_X = 25;
const RIGHT_X = 60;
const Y = 2;

const WALK_SPEED = 0.12;
const IDLE_TIME = 1600;

export default function MovingDog() {
  const [x, setX] = useState(LEFT_X);
  const [direction, setDirection] =
    useState<Direction>("idle");

  useEffect(() => {
    if (direction !== "idle") return;

    const timeout = setTimeout(() => {
      if (x <= LEFT_X) {
        setDirection("right");
      } else {
        setDirection("left");
      }
    }, IDLE_TIME);

    return () => clearTimeout(timeout);
  }, [direction, x]);

  useEffect(() => {
    if (direction === "idle") return;

    const interval = setInterval(() => {
      setX((current) => {
        if (direction === "right") {
          const next = current + WALK_SPEED;

          if (next >= RIGHT_X) {
            setTimeout(() => {
              setDirection("idle");
            }, 0);

            return RIGHT_X;
          }

          return next;
        }

        const next = current - WALK_SPEED;

        if (next <= LEFT_X) {
          setTimeout(() => {
            setDirection("idle");
          }, 0);

          return LEFT_X;
        }

        return next;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [direction]);

  let sprite =
    "/bloomy/characters/dog-idle.png";

  if (direction === "right") {
    sprite =
      "/bloomy/characters/dog-walk-right.png";
  }

  if (direction === "left") {
    sprite =
      "/bloomy/characters/dog-walk-left.png";
  }

  return (
    <div
      className="absolute z-10 -translate-x-1/2"
      style={{
        left: `${x}%`,
        bottom: `${Y}%`,
      }}
    >
      <CharacterSprite
        src={sprite}
        frames={4}
        frameWidth={520}
        frameHeight={756}
        displayWidth={48}
        speed={
          direction === "idle"
            ? 500
            : 180
        }
      />
    </div>
  );
}