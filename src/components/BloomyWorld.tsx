"use client";

import { useEffect, useState } from "react";
import MovingCharacter from "./MovingCharacter";

type Scene =
  | "sunny"
  | "cloudy"
  | "rainy"
  | "snowy"
  | "sunrise"
  | "sunset"
  | "night"
  | "aurora";

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

function getSceneFromTime(): Scene {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 8) {
    return "sunrise";
  }

  if (hour >= 8 && hour < 17) {
    return "sunny";
  }

  if (hour >= 17 && hour < 20) {
    return "sunset";
  }

  return "night";
}

export default function BloomyWorld() {
  const [scene, setScene] = useState<Scene>("sunny");

  // =================================
  // AUTO SCENE BASED ON LOCAL TIME
  // =================================

  useEffect(() => {
    const updateScene = () => {
      const newScene = getSceneFromTime();
      setScene(newScene);
    };

    updateScene();

    const interval = setInterval(() => {
      updateScene();
    }, 60_000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =================================
  // WEATHER / SPECIAL EFFECT
  // =================================

  const getEffect = () => {
    if (scene === "rainy") {
      return "/bloomy/effects/rain.png";
    }

    if (scene === "snowy") {
      return "/bloomy/effects/snow.png";
    }

    if (scene === "aurora") {
      return "/bloomy/effects/aurora.png";
    }

    return null;
  };

  const effect = getEffect();

  return (
    <div>
      {/* ================================= */}
      {/* DEV SCENE SELECTOR */}
      {/* ================================= */}

      <div className="mb-4 flex flex-wrap gap-2">
        {scenes.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setScene(item)}
            className={`rounded-full px-3 py-1.5 text-sm capitalize transition ${
              scene === item
                ? "bg-purple-500 text-white"
                : "bg-white/10 text-zinc-300 hover:bg-white/20"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* ================================= */}
      {/* BLOOMY WORLD */}
      {/* ================================= */}

      <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl bg-black">
        {/* Background */}
        <img
          src={`/bloomy/${scene}.png`}
          alt={`${scene} Bloomy world`}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* ================================= */}
        {/* AURORA  */}
        {/* ================================= */}

       {scene === "aurora" && effect && (
  <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
    <img
      src={effect}
      alt=""
      className="aurora-effect h-full w-[110%] max-w-none object-cover"
    />
  </div>
)}
 

        {/* ================================= */}
        {/* CHARACTER + DOG */}
        {/* ================================= */}

        <MovingCharacter />

        {/* ================================= */}
        {/* RAIN / SNOW */}
        {/* ================================= */}

        {effect && scene !== "aurora" && (
          <img
            src={effect}
            alt=""
            className="pointer-events-none absolute inset-0 z-20 h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  );
}