"use client";

import { useEffect, useState } from "react";
import CharacterSprite from "./CharacterSprite";

type Direction = "idle" | "left" | "right";

// =================================
// CHARACTER MOVEMENT SETTINGS
// =================================

// Horizontal limits for the character
const LEFT_X = 30;
const RIGHT_X = 72;

// Character walking speed
const WALK_SPEED = 0.12;

// Time the character waits before walking again
const IDLE_TIME = 1600;

// =================================
// DOG MOVEMENT SETTINGS
// =================================

// Dog walks slightly faster than the character
const DOG_WALK_SPEED = 0.14;

// Delay before the dog starts following
const DOG_DELAY = 450;

// Distance behind the character when walking right
const DOG_RIGHT_GAP = 5;

// When walking left, the dog stops this distance
// to the left of the character
const DOG_LEFT_GAP = 4;

export default function MovingCharacter() {
  // =================================
  // CHARACTER STATE
  // =================================

  const [x, setX] = useState(LEFT_X);

  const [direction, setDirection] =
    useState<Direction>("idle");

  // =================================
  // DOG STATE
  // =================================

  const [dogX, setDogX] = useState(
    LEFT_X - DOG_LEFT_GAP,
  );

  const [dogDirection, setDogDirection] =
    useState<Direction>("idle");

  // =================================
  // CHARACTER IDLE
  // =================================

  useEffect(() => {
    if (direction !== "idle") {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (x <= LEFT_X) {
        setDirection("right");
      } else {
        setDirection("left");
      }
    }, IDLE_TIME);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [direction, x]);

  // =================================
  // CHARACTER MOVEMENT
  // =================================

  useEffect(() => {
    if (direction === "idle") {
      return;
    }

    const interval = window.setInterval(() => {
      setX((current) => {
        // WALKING RIGHT

        if (direction === "right") {
          const next =
            current + WALK_SPEED;

          if (next >= RIGHT_X) {
            window.setTimeout(() => {
              setDirection("idle");
            }, 0);

            return RIGHT_X;
          }

          return next;
        }

        // WALKING LEFT

        const next =
          current - WALK_SPEED;

        if (next <= LEFT_X) {
          window.setTimeout(() => {
            setDirection("idle");
          }, 0);

          return LEFT_X;
        }

        return next;
      });
    }, 16);

    return () => {
      window.clearInterval(interval);
    };
  }, [direction]);

  // =================================
  // DOG STARTS AFTER A DELAY
  // =================================

  useEffect(() => {
    if (direction === "idle") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setDogDirection(direction);
    }, DOG_DELAY);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [direction]);

  // =================================
  // DOG MOVEMENT
  // =================================

  useEffect(() => {
    if (dogDirection === "idle") {
      return;
    }

    const interval = window.setInterval(() => {
      setDogX((current) => {
        // DOG WALKING RIGHT

        if (dogDirection === "right") {
          const destination =
            RIGHT_X - DOG_RIGHT_GAP;

          const next =
            current + DOG_WALK_SPEED;

          if (next >= destination) {
            window.setTimeout(() => {
              setDogDirection("idle");
            }, 0);

            return destination;
          }

          return next;
        }

        // DOG WALKING LEFT
        // Character stops at 30%.
        // Dog stops at 25%.

        const destination =
          LEFT_X - DOG_LEFT_GAP;

        const next =
          current - DOG_WALK_SPEED;

        if (next <= destination) {
          window.setTimeout(() => {
            setDogDirection("idle");
          }, 0);

          return destination;
        }

        return next;
      });
    }, 16);

    return () => {
      window.clearInterval(interval);
    };
  }, [dogDirection]);

  // =================================
  // CHARACTER SPRITE
  // =================================

  let characterSprite =
    "/bloomy/characters/female-blonde-idle.png";

  if (direction === "right") {
    characterSprite =
      "/bloomy/characters/female-blonde-walk-right.png";
  }

  if (direction === "left") {
    characterSprite =
      "/bloomy/characters/female-blonde-walk-left.png";
  }

  // =================================
  // DOG SPRITE
  // =================================

  let dogSprite =
    "/bloomy/characters/dog-idle.png";

  if (dogDirection === "right") {
    dogSprite =
      "/bloomy/characters/dog-walk-right.png";
  }

  if (dogDirection === "left") {
    dogSprite =
      "/bloomy/characters/dog-walk-left.png";
  }

  return (
    <>
      {/* ================================= */}
      {/* CHARACTER */}
      {/* ================================= */}

      <div
        className="absolute bottom-[12%] z-10 origin-bottom -translate-x-1/2 scale-[0.72] sm:bottom-[10%] sm:scale-[0.85] lg:bottom-[6%] lg:scale-110 2xl:bottom-[4%] 2xl:scale-125"
        style={{
          left: `${x}%`,
        }}
      >
        <CharacterSprite
          src={characterSprite}
          frames={4}
          frameWidth={520}
          frameHeight={756}
          displayWidth={75}
          speed={
            direction === "idle"
              ? 500
              : 180
          }
          paused={false}
        />
      </div>

      {/* ================================= */}
      {/* DOG */}
      {/* ================================= */}

      <div
        className="absolute bottom-[12.5%] z-10 origin-bottom -translate-x-1/2 scale-[0.72] sm:bottom-[10.5%] sm:scale-[0.85] lg:bottom-[6.5%] lg:scale-110 2xl:bottom-[4.5%] 2xl:scale-125"
        style={{
          left: `${dogX}%`,
        }}
      >
        <CharacterSprite
          src={dogSprite}
          frames={4}
          frameWidth={520}
          frameHeight={756}
          displayWidth={48}
          speed={
            dogDirection === "idle"
              ? 500
              : 160
          }
          paused={false}
        />
      </div>
    </>
  );
}