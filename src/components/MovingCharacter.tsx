"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import CharacterSprite from "./CharacterSprite";

type Direction = "idle" | "left" | "right";

const LEFT_X = 39;
const RIGHT_X = 76;

// Percentage of the original world width travelled per millisecond.
const CHARACTER_SPEED = 0.0064;
const DOG_SPEED = 0.0074;

const IDLE_TIME = 1600;
const DOG_DELAY = 460;
const DOG_RIGHT_GAP = 10;
const DOG_LEFT_GAP = 4;

export default function MovingCharacter() {
  const [x, setX] = useState(LEFT_X);
  const xRef = useRef(LEFT_X);
  const [direction, setDirection] =
    useState<Direction>("idle");

  const [dogX, setDogX] = useState(
    LEFT_X - DOG_LEFT_GAP,
  );
  const dogXRef = useRef(
    LEFT_X - DOG_LEFT_GAP,
  );
  const [dogDirection, setDogDirection] =
    useState<Direction>("idle");

  useEffect(() => {
    if (direction !== "idle") return;

    const timeout = window.setTimeout(() => {
      setDirection(
        xRef.current <= LEFT_X
          ? "right"
          : "left",
      );
    }, IDLE_TIME);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [direction]);

  useEffect(() => {
    if (direction === "idle") return;

    let animationFrameId = 0;
    let previousTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = Math.min(
        currentTime - previousTime,
        32,
      );
      previousTime = currentTime;

      const movement =
        CHARACTER_SPEED *
        elapsed *
        (direction === "right" ? 1 : -1);

      const next = xRef.current + movement;
      const reachedEnd =
        direction === "right"
          ? next >= RIGHT_X
          : next <= LEFT_X;

      const position = reachedEnd
        ? direction === "right"
          ? RIGHT_X
          : LEFT_X
        : next;

      xRef.current = position;
      setX(position);

      if (reachedEnd) {
        setDirection("idle");
        return;
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
  }, [direction]);

  useEffect(() => {
    if (direction === "idle") return;

    const timeout = window.setTimeout(() => {
      setDogDirection(direction);
    }, DOG_DELAY);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [direction]);

  useEffect(() => {
    if (dogDirection === "idle") return;

    const destination =
      dogDirection === "right"
        ? RIGHT_X - DOG_RIGHT_GAP
        : LEFT_X - DOG_LEFT_GAP;

    let animationFrameId = 0;
    let previousTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = Math.min(
        currentTime - previousTime,
        32,
      );
      previousTime = currentTime;

      const movement =
        DOG_SPEED *
        elapsed *
        (dogDirection === "right" ? 1 : -1);

      const next =
        dogXRef.current + movement;
      const reachedEnd =
        dogDirection === "right"
          ? next >= destination
          : next <= destination;

      const position = reachedEnd
        ? destination
        : next;

      dogXRef.current = position;
      setDogX(position);

      if (reachedEnd) {
        setDogDirection("idle");
        return;
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
  }, [dogDirection]);

  const characterSprite =
    direction === "right"
      ? "/bloomy/characters/female-blonde-walk-right.png"
      : direction === "left"
        ? "/bloomy/characters/female-blonde-walk-left.png"
        : "/bloomy/characters/female-blonde-idle.png";

  const characterFrameHeight =
    direction === "left" ? 740 : 744;

  const dogSprite =
    dogDirection === "right"
      ? "/bloomy/characters/dog-walk-right.png"
      : dogDirection === "left"
        ? "/bloomy/characters/dog-walk-left.png"
        : "/bloomy/characters/dog-idle.png";

  const dogFrameWidth =
    dogDirection === "idle"
      ? 1881 / 4
      : 512;

  const dogFrameHeight =
    dogDirection === "idle"
      ? 836
      : 682;

  return (
    <>
      <div
        className="absolute bottom-[16%] z-10 origin-bottom -translate-x-1/2 scale-[0.68] sm:scale-[0.82] lg:scale-100 xl:scale-110 2xl:scale-[1.15]"
        style={{ left: `${x}%` }}
      >
        <div
          className={
            direction === "idle"
              ? undefined
              : "bloomy-character-walk"
          }
        >
          <CharacterSprite
            key={characterSprite}
            src={characterSprite}
            frames={4}
            frameWidth={512}
            frameHeight={characterFrameHeight}
            displayWidth={75}
            speed={direction === "idle" ? 480 : 155}
          />
        </div>
      </div>

      <div
        className="absolute bottom-[16%] z-10 origin-bottom -translate-x-1/2 scale-[0.68] sm:scale-[0.82] lg:scale-100 xl:scale-110 2xl:scale-[1.15]"
        style={{ left: `${dogX}%` }}
      >
        <div
          className={
            dogDirection === "idle"
              ? undefined
              : "bloomy-dog-walk"
          }
        >
          <CharacterSprite
            key={dogSprite}
            src={dogSprite}
            frames={4}
            frameWidth={dogFrameWidth}
            frameHeight={dogFrameHeight}
            displayWidth={
                dogDirection === "idle"
                  ? 48
                  : 64
              }
            speed={dogDirection === "idle" ? 510 : 120}
          />
        </div>
      </div>
    </>
  );
}
