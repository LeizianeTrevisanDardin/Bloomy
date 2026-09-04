"use client";

import {
  useEffect,
  useState,
} from "react";

import CharacterSprite from "./CharacterSprite";

type Direction =
  | "idle"
  | "left"
  | "right";

const LEFT_X = 25;
const RIGHT_X = 60;
const Y = 2;

const WALK_SPEED = 0.12;
const IDLE_TIME = 1600;

export default function MovingDog() {
  const [x, setX] =
    useState(LEFT_X);

  const [
    direction,
    setDirection,
  ] = useState<Direction>(
    "idle",
  );

  // =================================
  // IDLE
  // =================================

  useEffect(() => {
    if (direction !== "idle") {
      return;
    }

    const timeout =
      window.setTimeout(() => {
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
  // MOVEMENT
  // =================================

  useEffect(() => {
    if (direction === "idle") {
      return;
    }

    const interval =
      window.setInterval(() => {
        setX((current) => {
          if (
            direction === "right"
          ) {
            const next =
              current +
              WALK_SPEED;

            if (
              next >= RIGHT_X
            ) {
              window.setTimeout(
                () => {
                  setDirection(
                    "idle",
                  );
                },
                0,
              );

              return RIGHT_X;
            }

            return next;
          }

          const next =
            current -
            WALK_SPEED;

          if (next <= LEFT_X) {
            window.setTimeout(
              () => {
                setDirection(
                  "idle",
                );
              },
              0,
            );

            return LEFT_X;
          }

          return next;
        });
      }, 16);

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [direction]);

  // =================================
  // SPRITE SETTINGS
  // =================================

  let sprite =
    "/bloomy/characters/dog-idle.png";

  let frameWidth = 470.25;
  let frameHeight = 836;
  let displayWidth = 48;

  if (direction === "right") {
    sprite =
      "/bloomy/characters/dog-walk-right.png";

    frameWidth = 512;
    frameHeight = 682;

    /*
     * The walking sprite is shorter,
     * so it needs a larger display width.
     */
    displayWidth = 64;
  }

  if (direction === "left") {
    sprite =
      "/bloomy/characters/dog-walk-left.png";

    frameWidth = 512;
    frameHeight = 682;
    displayWidth = 64;
  }

  // =================================
  // RENDER
  // =================================

  return (
    <div
      className={`absolute z-10 origin-bottom -translate-x-1/2 ${
        direction === "idle"
          ? ""
          : "bloomy-dog-walk"
      }`}
      style={{
        left: `${x}%`,
        bottom: `${Y}%`,
      }}
    >
      <CharacterSprite
        src={sprite}
        frames={4}
        frameWidth={frameWidth}
        frameHeight={frameHeight}
        displayWidth={displayWidth}
        speed={
          direction === "idle"
            ? 500
            : 160
        }
        paused={false}
      />
    </div>
  );
}