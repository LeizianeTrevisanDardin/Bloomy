"use client";

import { useEffect, useState } from "react";
import CharacterSprite from "./CharacterSprite";

type Direction = "idle" | "left" | "right";

const LEFT_X = 30;
const RIGHT_X = 65;
const Y = 2;

const WALK_SPEED = 0.12;
const IDLE_TIME = 1600;

// dogs starts a bit delayed after the character starts moving
const DOG_DELAY = 450;

// intially the dog is a bit behind the character
const DOG_START_GAP = 8;

export default function MovingCharacter() {
  // =========================
  // CHARACTER
  // =========================

  const [x, setX] = useState(LEFT_X);

  const [direction, setDirection] =
    useState<Direction>("idle");

  // =========================
  // DOG
  // =========================

  const [dogX, setDogX] =
    useState(LEFT_X - DOG_START_GAP);

  const [dogDirection, setDogDirection] =
    useState<Direction>("idle");

  // =========================
  // CHARACTER IDLE
  // =========================

  useEffect(() => {
    if (direction !== "idle") {
      return;
    }

    const timeout = setTimeout(() => {
      if (x <= LEFT_X) {
        setDirection("right");
      } else {
        setDirection("left");
      }
    }, IDLE_TIME);

    return () => {
      clearTimeout(timeout);
    };
  }, [direction, x]);

  // =========================
  // CHARACTER MOVEMENT
  // =========================

  useEffect(() => {
    if (direction === "idle") {
      return;
    }

    const interval = setInterval(() => {
      setX((current) => {
        // RIGHT
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

        // LEFT
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

    return () => {
      clearInterval(interval);
    };
  }, [direction]);

  // =========================
  // DOG STARTS AFTER DELAY
  // =========================

  useEffect(() => {
    if (direction === "idle") {
      return;
    }

    const timeout = setTimeout(() => {
      setDogDirection(direction);
    }, DOG_DELAY);

    return () => {
      clearTimeout(timeout);
    };
  }, [direction]);

  // =========================
  // DOG MOVEMENT
  // =========================

  useEffect(() => {
    if (dogDirection === "idle") {
      return;
    }

    const interval = setInterval(() => {
      setDogX((current) => {
        // =====================
        // DOG RIGHT
        // =====================

        if (dogDirection === "right") {
          const destination =
            RIGHT_X - DOG_START_GAP;

          const next =
            current + WALK_SPEED;

          if (next >= destination) {
            setTimeout(() => {
              setDogDirection("idle");
            }, 0);

            return destination;
          }

          return next;
        }

        // =====================
        // DOG LEFT
        // =====================

        const destination =
          LEFT_X + DOG_START_GAP;

        const next =
          current - WALK_SPEED;

        if (next <= destination) {
          setTimeout(() => {
            setDogDirection("idle");
          }, 0);

          return destination;
        }

        return next;
      });
    }, 16);

    return () => {
      clearInterval(interval);
    };
  }, [dogDirection]);

  // =========================
  // CHARACTER SPRITE
  // =========================

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

  // =========================
  // DOG SPRITE
  // =========================

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
      {/* CHARACTER */}
      <div
        className="absolute z-10 -translate-x-1/2"
        style={{
          left: `${x}%`,
          bottom: `${Y}%`,
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
        />
      </div>

      {/* DOG */}
      <div
        className="absolute z-10 -translate-x-1/2"
        style={{
          left: `${dogX}%`,
          bottom: `${Y + 0.5}%`,
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
              : 180
          }
        />
      </div>
    </>
  );
}