"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useEquippedItems,
} from "@/hooks/useEquippedItems";

import CharacterSprite from "./CharacterSprite";

type Direction =
  | "idle"
  | "left"
  | "right";

const LEFT_X = 39;
const RIGHT_X = 76;

const CHARACTER_SPEED = 0.0064;
const DOG_SPEED = 0.0074;

const IDLE_TIME = 1600;
const DOG_DELAY = 460;

const DOG_RIGHT_GAP = 10;
const DOG_LEFT_GAP = 4;

export default function MovingCharacter() {
  // =================================
  // SHOP EQUIPMENT
  // =================================

  const {
    getEquippedItem,
  } = useEquippedItems();

  const dogAccessory =
    getEquippedItem(
      "dog_accessory",
    );

  const characterOutfit =
    getEquippedItem(
      "character_outfit",
    );

  const hasPinkCollar =
    Boolean(dogAccessory);

  const hasWinterOutfit =
    Boolean(characterOutfit);

  // =================================
  // CHARACTER
  // =================================

  const [x, setX] =
    useState(LEFT_X);

  const xRef =
    useRef(LEFT_X);

  const [
    direction,
    setDirection,
  ] = useState<Direction>(
    "idle",
  );

  // =================================
  // DOG
  // =================================

  const [
    dogX,
    setDogX,
  ] = useState(
    LEFT_X -
      DOG_LEFT_GAP,
  );

  const dogXRef =
    useRef(
      LEFT_X -
        DOG_LEFT_GAP,
    );

  const [
    dogDirection,
    setDogDirection,
  ] = useState<Direction>(
    "idle",
  );

  // =================================
  // PRELOAD SPRITES
  // =================================

  useEffect(() => {
    const sprites = [
      // Character default
      "/bloomy/characters/female-blonde-idle.png",
      "/bloomy/characters/female-blonde-walk-left.png",
      "/bloomy/characters/female-blonde-walk-right.png",

      // Character winter
      "/bloomy/characters/female-winter-idle.png",
      "/bloomy/characters/female-winter-walk-left.png",
      "/bloomy/characters/female-winter-walk-right.png",

      // Dog default
      "/bloomy/characters/dog-idle.png",
      "/bloomy/characters/dog-walk-left.png",
      "/bloomy/characters/dog-walk-right.png",

      // Dog pink collar
      "/bloomy/characters/dog-pink-collar-idle.png",
      "/bloomy/characters/dog-pink-collar-left-walk.png",
      "/bloomy/characters/dog-pink-collar-right-walk.png",
    ];

    sprites.forEach(
      (src) => {
        const image =
          new Image();

        image.src = src;
      },
    );
  }, []);

  // =================================
  // CHARACTER IDLE
  // =================================

  useEffect(() => {
    if (
      direction !== "idle"
    ) {
      return;
    }

    const timeout =
      window.setTimeout(
        () => {
          setDirection(
            xRef.current <=
              LEFT_X
              ? "right"
              : "left",
          );
        },
        IDLE_TIME,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [direction]);

  // =================================
  // CHARACTER MOVEMENT
  // =================================

  useEffect(() => {
    if (
      direction === "idle"
    ) {
      return;
    }

    let animationFrameId =
      0;

    let previousTime =
      performance.now();

    const animate = (
      currentTime: number,
    ) => {
      const elapsed =
        Math.min(
          currentTime -
            previousTime,
          32,
        );

      previousTime =
        currentTime;

      const movement =
        CHARACTER_SPEED *
        elapsed *
        (direction ===
        "right"
          ? 1
          : -1);

      const next =
        xRef.current +
        movement;

      const reachedEnd =
        direction ===
        "right"
          ? next >=
            RIGHT_X
          : next <=
            LEFT_X;

      const position =
        reachedEnd
          ? direction ===
            "right"
            ? RIGHT_X
            : LEFT_X
          : next;

      xRef.current =
        position;

      setX(position);

      if (reachedEnd) {
        setDirection(
          "idle",
        );

        return;
      }

      animationFrameId =
        window.requestAnimationFrame(
          animate,
        );
    };

    animationFrameId =
      window.requestAnimationFrame(
        animate,
      );

    return () => {
      window.cancelAnimationFrame(
        animationFrameId,
      );
    };
  }, [direction]);

  // =================================
  // DOG DELAY
  // =================================

  useEffect(() => {
    if (
      direction === "idle"
    ) {
      return;
    }

    const timeout =
      window.setTimeout(
        () => {
          setDogDirection(
            direction,
          );
        },
        DOG_DELAY,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [direction]);

  // =================================
  // DOG MOVEMENT
  // =================================

  useEffect(() => {
    if (
      dogDirection ===
      "idle"
    ) {
      return;
    }

    const destination =
      dogDirection ===
      "right"
        ? RIGHT_X -
          DOG_RIGHT_GAP
        : LEFT_X -
          DOG_LEFT_GAP;

    let animationFrameId =
      0;

    let previousTime =
      performance.now();

    const animate = (
      currentTime: number,
    ) => {
      const elapsed =
        Math.min(
          currentTime -
            previousTime,
          32,
        );

      previousTime =
        currentTime;

      const movement =
        DOG_SPEED *
        elapsed *
        (dogDirection ===
        "right"
          ? 1
          : -1);

      const next =
        dogXRef.current +
        movement;

      const reachedEnd =
        dogDirection ===
        "right"
          ? next >=
            destination
          : next <=
            destination;

      const position =
        reachedEnd
          ? destination
          : next;

      dogXRef.current =
        position;

      setDogX(position);

      if (reachedEnd) {
        setDogDirection(
          "idle",
        );

        return;
      }

      animationFrameId =
        window.requestAnimationFrame(
          animate,
        );
    };

    animationFrameId =
      window.requestAnimationFrame(
        animate,
      );

    return () => {
      window.cancelAnimationFrame(
        animationFrameId,
      );
    };
  }, [dogDirection]);

  // =================================
  // CHARACTER SPRITE
  // =================================

  const characterSprite =
    hasWinterOutfit
      ? direction ===
        "right"
        ? "/bloomy/characters/female-winter-walk-right.png"
        : direction ===
            "left"
          ? "/bloomy/characters/female-winter-walk-left.png"
          : "/bloomy/characters/female-winter-idle.png"
      : direction ===
          "right"
        ? "/bloomy/characters/female-blonde-walk-right.png"
        : direction ===
            "left"
          ? "/bloomy/characters/female-blonde-walk-left.png"
          : "/bloomy/characters/female-blonde-idle.png";

  const characterFrameWidth =
    512;

  const characterFrameHeight =
    hasWinterOutfit
      ? 768
      : direction ===
          "left"
        ? 740
        : 744;

  const characterDisplayWidth =
    hasWinterOutfit
      ? 78
      : 75;

  // =================================
  // DOG SPRITE
  // =================================

  const dogSprite =
    hasPinkCollar
      ? dogDirection ===
        "right"
        ? "/bloomy/characters/dog-pink-collar-right-walk.png"
        : dogDirection ===
            "left"
          ? "/bloomy/characters/dog-pink-collar-left-walk.png"
          : "/bloomy/characters/dog-pink-collar-idle.png"
      : dogDirection ===
          "right"
        ? "/bloomy/characters/dog-walk-right.png"
        : dogDirection ===
            "left"
          ? "/bloomy/characters/dog-walk-left.png"
          : "/bloomy/characters/dog-idle.png";

  // =================================
  // DOG FRAME SIZE
  // =================================

  const dogFrameWidth =
    hasPinkCollar
      ? dogDirection ===
        "idle"
        ? 460
        : 512
      : dogDirection ===
          "idle"
        ? 1881 / 4
        : 512;

  const dogFrameHeight =
    hasPinkCollar
      ? 768
      : dogDirection ===
          "idle"
        ? 836
        : 682;

  const dogDisplayWidth =
    dogDirection ===
    "idle"
      ? 48
      : 64;

  // =================================
  // RENDER
  // =================================

  return (
    <>
      {/* CHARACTER */}

      <div
        className="
          absolute
          bottom-[16%]
          z-10
          origin-bottom
          -translate-x-1/2
          scale-[0.68]
          sm:scale-[0.82]
          lg:scale-100
          xl:scale-110
          2xl:scale-[1.15]
        "
        style={{
          left: `${x}%`,
        }}
      >
        <div
          className={
            direction ===
            "idle"
              ? undefined
              : "bloomy-character-walk"
          }
        >
          <CharacterSprite
            src={
              characterSprite
            }
            frames={4}
            frameWidth={
              characterFrameWidth
            }
            frameHeight={
              characterFrameHeight
            }
            displayWidth={
              characterDisplayWidth
            }
            speed={
              direction ===
              "idle"
                ? 480
                : 155
            }
            paused={
              direction ===
              "idle"
            }
          />
        </div>
      </div>

      {/* DOG */}

      <div
        className="
          absolute
          bottom-[16%]
          z-10
          origin-bottom
          -translate-x-1/2
          scale-[0.68]
          sm:scale-[0.82]
          lg:scale-100
          xl:scale-110
          2xl:scale-[1.15]
        "
        style={{
          left: `${dogX}%`,
        }}
      >
        <div
          className={
            dogDirection ===
            "idle"
              ? undefined
              : "bloomy-dog-walk"
          }
        >
          <CharacterSprite
            src={dogSprite}
            frames={4}
            frameWidth={
              dogFrameWidth
            }
            frameHeight={
              dogFrameHeight
            }
            displayWidth={
              dogDisplayWidth
            }
            speed={
              dogDirection ===
              "idle"
                ? 510
                : 120
            }
          />
        </div>
      </div>
    </>
  );
}